import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, Star } from 'lucide-react'
import { supabase, Subject, Test } from '../lib/supabase'
import { TestCard } from '../components/TestCard'
import { GlassCard } from '../components/GlassCard'

interface SubjectPageProps {
  subject: Subject
  onNavigate: (page: string, data?: any) => void
  onBack: () => void
}

export function SubjectPage({ subject, onNavigate, onBack }: SubjectPageProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  useEffect(() => {
    fetchTests()
  }, [subject.id])

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTests(data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTests = tests.filter(test => 
    filter === 'all' || test.difficulty === filter
  )

  const getDifficultyCount = (difficulty: string) => {
    return tests.filter(test => test.difficulty === difficulty).length
  }

  const filterButtons = [
    { id: 'all', label: 'Barchasi', count: tests.length },
    { id: 'easy', label: 'Oson', count: getDifficultyCount('easy') },
    { id: 'medium', label: 'O\'rta', count: getDifficultyCount('medium') },
    { id: 'hard', label: 'Qiyin', count: getDifficultyCount('hard') }
  ]

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
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Orqaga</span>
        </button>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}40)` }}
            >
              {subject.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{subject.name}</h1>
              <p className="text-white/70 mb-4">{subject.description}</p>
              <div className="flex items-center space-x-6 text-sm text-white/60">
                <div className="flex items-center space-x-1">
                  <BookOpen size={16} />
                  <span>{tests.length} ta test</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>Turli qiyinlik darajalari</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={16} />
                  <span>Professional testlar</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-3">
          {filterButtons.map((button) => (
            <motion.button
              key={button.id}
              onClick={() => setFilter(button.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                filter === button.id
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-medium">{button.label}</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-xs">
                {button.count}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tests */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {filteredTests.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? 'Testlar topilmadi' : `${filterButtons.find(b => b.id === filter)?.label} testlar topilmadi`}
            </h3>
            <p className="text-white/70">
              {filter === 'all' 
                ? 'Bu fan uchun hozircha testlar qo\'shilmagan'
                : 'Bu qiyinlik darajasida testlar mavjud emas'
              }
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <TestCard
                  test={test}
                  onClick={() => onNavigate('test', test)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}