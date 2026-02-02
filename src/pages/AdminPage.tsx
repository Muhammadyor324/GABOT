import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, BookOpen, FileText, Users, BarChart3, Save, X } from 'lucide-react'
import { supabase, Subject, Test, Question } from '../lib/supabase'
import { GlassCard } from '../components/GlassCard'

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'tests' | 'questions' | 'stats'>('subjects')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedTest, setSelectedTest] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'subject' | 'test' | 'question'>('subject')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: '#3B82F6'
  })

  const [testForm, setTestForm] = useState({
    subject_id: '',
    title: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    time_limit: 30
  })

  const [questionForm, setQuestionForm] = useState({
    test_id: '',
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: ''
  })

  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTests: 0,
    totalQuestions: 0,
    totalUsers: 0
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSubjects(),
        fetchTests(),
        fetchQuestions(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')
    if (!error) setSubjects(data || [])
  }

  const fetchTests = async () => {
    const { data, error } = await supabase
      .from('tests')
      .select(`
        *,
        subject:subjects(name)
      `)
      .order('created_at', { ascending: false })
    if (!error) setTests(data || [])
  }

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        test:tests(title)
      `)
      .order('created_at', { ascending: false })
    if (!error) setQuestions(data || [])
  }

  const fetchStats = async () => {
    const [subjectsResult, testsResult, questionsResult, usersResult] = await Promise.all([
      supabase.from('subjects').select('id', { count: 'exact' }),
      supabase.from('tests').select('id', { count: 'exact' }),
      supabase.from('questions').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' })
    ])

    setStats({
      totalSubjects: subjectsResult.count || 0,
      totalTests: testsResult.count || 0,
      totalQuestions: questionsResult.count || 0,
      totalUsers: usersResult.count || 0
    })
  }

  const openModal = (type: 'subject' | 'test' | 'question', item?: any) => {
    setModalType(type)
    setEditingItem(item)
    
    if (type === 'subject') {
      setSubjectForm(item || {
        name: '',
        description: '',
        icon: '📚',
        color: '#3B82F6'
      })
    } else if (type === 'test') {
      setTestForm(item || {
        subject_id: selectedSubject,
        title: '',
        description: '',
        difficulty: 'medium',
        time_limit: 30
      })
    } else if (type === 'question') {
      setQuestionForm(item || {
        test_id: selectedTest,
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      })
    }
    
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const saveSubject = async () => {
    try {
      if (editingItem) {
        await supabase
          .from('subjects')
          .update(subjectForm)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('subjects')
          .insert([subjectForm])
      }
      
      await fetchSubjects()
      closeModal()
    } catch (error) {
      console.error('Error saving subject:', error)
    }
  }

  const saveTest = async () => {
    try {
      const testData = {
        ...testForm,
        questions_count: 0 // Will be updated when questions are added
      }
      
      if (editingItem) {
        await supabase
          .from('tests')
          .update(testData)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('tests')
          .insert([testData])
      }
      
      await fetchTests()
      closeModal()
    } catch (error) {
      console.error('Error saving test:', error)
    }
  }

  const saveQuestion = async () => {
    try {
      if (editingItem) {
        await supabase
          .from('questions')
          .update(questionForm)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('questions')
          .insert([questionForm])
        
        // Update test questions count
        const { count } = await supabase
          .from('questions')
          .select('id', { count: 'exact' })
          .eq('test_id', questionForm.test_id)
        
        await supabase
          .from('tests')
          .update({ questions_count: count || 0 })
          .eq('id', questionForm.test_id)
      }
      
      await fetchQuestions()
      await fetchTests()
      closeModal()
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  const deleteItem = async (type: 'subject' | 'test' | 'question', id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return
    
    try {
      await supabase.from(type === 'subject' ? 'subjects' : type === 'test' ? 'tests' : 'questions').delete().eq('id', id)
      await fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const tabs = [
    { id: 'subjects', label: 'Fanlar', icon: BookOpen },
    { id: 'tests', label: 'Testlar', icon: FileText },
    { id: 'questions', label: 'Savollar', icon: Edit },
    { id: 'stats', label: 'Statistika', icon: BarChart3 }
  ]

  const filteredTests = selectedSubject 
    ? tests.filter(test => test.subject_id === selectedSubject)
    : tests

  const filteredQuestions = selectedTest
    ? questions.filter(question => question.test_id === selectedTest)
    : questions

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
        <p className="text-xl text-white/80">Testlar va fanlarni boshqaring</p>
      </motion.div>

      {/* Tabs */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </GlassCard>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'subjects' && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Fanlar</h2>
              <motion.button
                onClick={() => openModal('subject')}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                <span>Fan qo'shish</span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <GlassCard key={subject.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}40)` }}
                      >
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{subject.name}</h3>
                        <p className="text-white/70 text-sm">{subject.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('subject', subject)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem('subject', subject.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'tests' && (
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Testlar</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                >
                  <option value="">Barcha fanlar</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id} className="text-black">
                      {subject.name}
                    </option>
                  ))}
                </select>
                <motion.button
                  onClick={() => openModal('test')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  <span>Test qo'shish</span>
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTests.map((test) => (
                <GlassCard key={test.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-400 text-sm">{test.subject?.name}</span>
                        <span className="text-white/60">•</span>
                        <span className={`text-sm ${
                          test.difficulty === 'easy' ? 'text-green-400' :
                          test.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {test.difficulty === 'easy' ? 'Oson' : test.difficulty === 'medium' ? 'O\'rta' : 'Qiyin'}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{test.title}</h3>
                      <p className="text-white/70 text-sm mb-2">{test.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-white/60">
                        <span>{test.questions_count} savol</span>
                        <span>{test.time_limit} daqiqa</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('test', test)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem('test', test.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Savollar</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                >
                  <option value="">Barcha testlar</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id} className="text-black">
                      {test.title}
                    </option>
                  ))}
                </select>
                <motion.button
                  onClick={() => openModal('question')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  <span>Savol qo'shish</span>
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((question, index) => (
                <GlassCard key={question.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-400 text-sm">{question.test?.title}</span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/60 text-sm">Savol #{index + 1}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{question.question}</h3>
                      <div className="space-y-1 text-sm">
                        {question.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg ${
                              idx === question.correct_answer
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-white/70'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className="text-white/60 text-sm mt-2">
                          <strong>Tushuntirish:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openModal('question', question)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem('question', question.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Statistika</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Fanlar', value: stats.totalSubjects, color: 'from-blue-500 to-cyan-500', icon: BookOpen },
                { label: 'Testlar', value: stats.totalTests, color: 'from-green-500 to-emerald-500', icon: FileText },
                { label: 'Savollar', value: stats.totalQuestions, color: 'from-purple-500 to-pink-500', icon: Edit },
                { label: 'Foydalanuvchilar', value: stats.totalUsers, color: 'from-orange-500 to-red-500', icon: Users }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <GlassCard key={index} className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </GlassCard>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {editingItem ? 'Tahrirlash' : 'Qo\'shish'} - {
                      modalType === 'subject' ? 'Fan' :
                      modalType === 'test' ? 'Test' : 'Savol'
                    }
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {modalType === 'subject' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Fan nomi</label>
                      <input
                        type="text"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                        placeholder="Masalan: Matematika"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Tavsif</label>
                      <textarea
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 h-24 resize-none"
                        placeholder="Fan haqida qisqacha ma'lumot"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Emoji</label>
                        <input
                          type="text"
                          value={subjectForm.icon}
                          onChange={(e) => setSubjectForm({...subjectForm, icon: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl"
                          placeholder="📚"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Rang</label>
                        <input
                          type="color"
                          value={subjectForm.color}
                          onChange={(e) => setSubjectForm({...subjectForm, color: e.target.value})}
                          className="w-full h-12 bg-white/10 border border-white/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'test' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Fan</label>
                      <select
                        value={testForm.subject_id}
                        onChange={(e) => setTestForm({...testForm, subject_id: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      >
                        <option value="" className="text-black">Fan tanlang</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id} className="text-black">
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Test nomi</label>
                      <input
                        type="text"
                        value={testForm.title}
                        onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                        placeholder="Masalan: Algebra asoslari"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Tavsif</label>
                      <textarea
                        value={testForm.description}
                        onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 h-24 resize-none"
                        placeholder="Test haqida qisqacha ma'lumot"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Qiyinlik darajasi</label>
                        <select
                          value={testForm.difficulty}
                          onChange={(e) => setTestForm({...testForm, difficulty: e.target.value as any})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                        >
                          <option value="easy" className="text-black">Oson</option>
                          <option value="medium" className="text-black">O'rta</option>
                          <option value="hard" className="text-black">Qiyin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Vaqt (daqiqa)</label>
                        <input
                          type="number"
                          value={testForm.time_limit}
                          onChange={(e) => setTestForm({...testForm, time_limit: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                          min="1"
                          max="180"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'question' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Test</label>
                      <select
                        value={questionForm.test_id}
                        onChange={(e) => setQuestionForm({...questionForm, test_id: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                      >
                        <option value="" className="text-black">Test tanlang</option>
                        {tests.map((test) => (
                          <option key={test.id} value={test.id} className="text-black">
                            {test.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Savol</label>
                      <textarea
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 h-24 resize-none"
                        placeholder="Savolni kiriting..."
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Javob variantlari</label>
                      <div className="space-y-2">
                        {questionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={questionForm.correct_answer === index}
                              onChange={() => setQuestionForm({...questionForm, correct_answer: index})}
                              className="text-blue-500"
                            />
                            <span className="text-white/70 w-6">{String.fromCharCode(65 + index)}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options]
                                newOptions[index] = e.target.value
                                setQuestionForm({...questionForm, options: newOptions})
                              }}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                              placeholder={`${index + 1}-variant`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Tushuntirish (ixtiyoriy)</label>
                      <textarea
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 h-20 resize-none"
                        placeholder="To'g'ri javob uchun tushuntirish..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <motion.button
                    onClick={closeModal}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    onClick={modalType === 'subject' ? saveSubject : modalType === 'test' ? saveTest : saveQuestion}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save size={18} />
                    <span>Saqlash</span>
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}