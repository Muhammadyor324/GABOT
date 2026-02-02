import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react'
import { supabase, Test, Question, TestResult } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { GlassCard } from '../components/GlassCard'

interface TestPageProps {
  test: Test
  onBack: () => void
}

export function TestPage({ test, onBack }: TestPageProps) {
  const { user, profile } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(test.time_limit * 60) // Convert to seconds
  const [isFinished, setIsFinished] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [test.id])

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isFinished) {
      finishTest()
    }
  }, [timeLeft, isFinished])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', test.id)
        .order('created_at')

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowExplanation(false)
    }
  }

  const finishTest = async () => {
    if (!user || !profile) return

    const correctAnswers = questions.filter(q => 
      answers[q.id] === q.correct_answer
    ).length

    const score = Math.round((correctAnswers / questions.length) * 100)
    const timeTaken = (test.time_limit * 60) - timeLeft

    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert([{
          user_id: user.id,
          test_id: test.id,
          score,
          total_questions: questions.length,
          time_taken: timeTaken,
          answers
        }])
        .select()
        .single()

      if (error) throw error

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          total_score: profile.total_score + score,
          tests_taken: profile.tests_taken + 1
        })
        .eq('id', user.id)

      setResult(data)
      setIsFinished(true)
    } catch (error) {
      console.error('Error saving test result:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'A\'lo! Siz ajoyib natija ko\'rsatdingiz! 🎉'
    if (score >= 80) return 'Yaxshi! Siz yaxshi natija ko\'rsatdingiz! 👏'
    if (score >= 60) return 'Qoniqarli. Yana harakat qiling! 💪'
    return 'Yomon emas. Ko\'proq mashq qiling! 📚'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Orqaga</span>
        </button>
        
        <GlassCard className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Savollar topilmadi</h3>
          <p className="text-white/70">Bu test uchun hozircha savollar qo'shilmagan</p>
        </GlassCard>
      </div>
    )
  }

  if (isFinished && result) {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correct_answer).length
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Orqaga</span>
        </button>

        <GlassCard className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="text-white" size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Test yakunlandi!</h2>
          <p className="text-white/70 mb-6">{getScoreMessage(result.score)}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.score)} mb-1`}>
                {result.score}%
              </div>
              <div className="text-white/60 text-sm">Ball</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{correctAnswers}</div>
              <div className="text-white/60 text-sm">To'g'ri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">{questions.length - correctAnswers}</div>
              <div className="text-white/60 text-sm">Noto'g'ri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{formatTime(result.time_taken)}</div>
              <div className="text-white/60 text-sm">Vaqt</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={onBack}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bosh sahifaga qaytish
            </motion.button>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              <span>Qayta urinish</span>
            </motion.button>
          </div>
        </GlassCard>

        {/* Detailed Results */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Batafsil natijalar</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id]
              const isCorrect = userAnswer === question.correct_answer
              
              return (
                <div key={question.id} className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-green-400">
                          To'g'ri javob: {question.options[question.correct_answer]}
                        </div>
                        {userAnswer !== undefined && userAnswer !== question.correct_answer && (
                          <div className="text-red-400">
                            Sizning javobingiz: {question.options[userAnswer]}
                          </div>
                        )}
                        {question.explanation && (
                          <div className="text-white/70 mt-2">
                            <strong>Tushuntirish:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

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

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{test.title}</h1>
              <p className="text-white/70 text-sm">
                Savol {currentQuestion + 1} / {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Clock size={18} />
                <span className={`font-mono ${timeLeft < 300 ? 'text-red-400' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQ.question}
            </h2>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(currentQ.id, index)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    answers[currentQ.id] === index
                      ? 'bg-blue-500/30 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  } border`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQ.id] === index
                        ? 'border-blue-400 bg-blue-500'
                        : 'border-white/30'
                    }`}>
                      {answers[currentQ.id] === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && currentQ.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
              >
                <h4 className="text-blue-400 font-medium mb-2">Tushuntirish:</h4>
                <p className="text-white/80">{currentQ.explanation}</p>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            whileHover={{ scale: currentQuestion === 0 ? 1 : 1.05 }}
            whileTap={{ scale: currentQuestion === 0 ? 1 : 0.95 }}
          >
            Oldingi
          </motion.button>

          <div className="flex items-center space-x-2">
            {currentQ.explanation && (
              <motion.button
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showExplanation ? 'Yashirish' : 'Tushuntirish'}
              </motion.button>
            )}
            
            {currentQuestion === questions.length - 1 ? (
              <motion.button
                onClick={finishTest}
                className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Yakunlash
              </motion.button>
            ) : (
              <motion.button
                onClick={nextQuestion}
                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Keyingi
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}