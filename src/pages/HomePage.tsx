import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, Users, Award } from 'lucide-react'
import { supabase, Subject } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SubjectCard } from '../components/SubjectCard'
import { GlassCard } from '../components/GlassCard'

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { profile } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [stats, setStats] = useState({
    totalTests: 0,
    totalUsers: 0,
    totalQuestions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
    fetchStats()
  }, [])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [testsResult, usersResult, questionsResult] = await Promise.all([
        supabase.from('tests').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' })
      ])

      setStats({
        totalTests: testsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalQuestions: questionsResult.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getTestsCount = async (subjectId: string) => {
    const { count } = await supabase
      .from('tests')
      .select('id', { count: 'exact' })
      .eq('subject_id', subjectId)
    return count || 0
  }

  const statsCards = [
    {
      icon: BookOpen,
      title: 'Jami Testlar',
      value: stats.totalTests,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Foydalanuvchilar',
      value: stats.totalUsers,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      title: 'Savollar',
      value: stats.totalQuestions,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Sizning Ballaringiz',
      value: profile?.total_score || 0,
      color: 'from-orange-500 to-red-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Xush kelibsiz, {profile?.full_name?.split(' ')[0] || 'Foydalanuvchi'}! 👋
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Bilimingizni sinab ko'ring va yangi narsalarni o'rganing
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-white/70 text-sm">{stat.title}</p>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Subjects Section */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold text-white">Fanlar</h2>
          <span className="text-white/60">{subjects.length} ta fan mavjud</span>
        </motion.div>

        {subjects.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Hozircha fanlar yo'q</h3>
            <p className="text-white/70">
              Admin tomonidan fanlar qo'shilishini kuting yoki admin bilan bog'laning
            </p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <SubjectCard
                  subject={subject}
                  testsCount={0} // Will be loaded dynamically
                  onClick={() => onNavigate('subject', subject)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Tezkor harakatlar</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard hover onClick={() => onNavigate('leaderboard')} className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reyting ko'rish</h3>
                <p className="text-white/70 text-sm">Eng yaxshi natijalar va o'rningizni ko'ring</p>
              </div>
            </div>
          </GlassCard>

          {profile?.is_admin && (
            <GlassCard hover onClick={() => onNavigate('admin')} className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Admin Panel</h3>
                  <p className="text-white/70 text-sm">Testlar va fanlarni boshqaring</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </motion.div>
    </div>
  )
}