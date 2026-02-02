import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react'
import { supabase, UserProfile } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { GlassCard } from '../components/GlassCard'

export function LeaderboardPage() {
  const { profile } = useAuth()
  const [topUsers, setTopUsers] = useState<UserProfile[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(50)

      if (error) throw error
      
      setTopUsers(data || [])
      
      // Find current user's rank
      if (profile) {
        const userIndex = data?.findIndex(user => user.id === profile.id)
        setUserRank(userIndex !== undefined && userIndex !== -1 ? userIndex + 1 : null)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-400" size={24} />
      case 2: return <Medal className="text-gray-300" size={24} />
      case 3: return <Award className="text-orange-400" size={24} />
      default: return <span className="text-white/60 font-bold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30'
      case 3: return 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
      default: return 'from-white/5 to-white/10 border-white/10'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="text-yellow-400" size={32} />
          <h1 className="text-4xl font-bold text-white">Reyting Jadvali</h1>
        </div>
        <p className="text-xl text-white/80">
          Eng yaxshi natijalar va sizning o'rningiz
        </p>
      </motion.div>

      {/* User's Current Position */}
      {profile && userRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sizning o'rningiz</h3>
                  <p className="text-white/70">Umumiy reytingda</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">#{userRank}</div>
                <div className="text-white/60">{profile.total_score} ball</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {topUsers.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Top 3 Foydalanuvchi</h2>
            <div className="flex items-end justify-center space-x-4">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                  {topUsers[1].avatar_url ? (
                    <img src={topUsers[1].avatar_url} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-xl">2</span>
                  )}
                </div>
                <div className="bg-gradient-to-t from-gray-400/20 to-gray-500/20 border border-gray-400/30 rounded-xl p-4 h-32 flex flex-col justify-end">
                  <Medal className="text-gray-300 mx-auto mb-2" size={24} />
                  <h3 className="text-white font-bold text-sm">{topUsers[1].full_name || topUsers[1].email}</h3>
                  <p className="text-gray-300 text-xs">{topUsers[1].total_score} ball</p>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                  {topUsers[0].avatar_url ? (
                    <img src={topUsers[0].avatar_url} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    <Crown className="text-white" size={32} />
                  )}
                </div>
                <div className="bg-gradient-to-t from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 h-40 flex flex-col justify-end">
                  <Crown className="text-yellow-400 mx-auto mb-2" size={28} />
                  <h3 className="text-white font-bold">{topUsers[0].full_name || topUsers[0].email}</h3>
                  <p className="text-yellow-400 text-sm">{topUsers[0].total_score} ball</p>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                  {topUsers[2].avatar_url ? (
                    <img src={topUsers[2].avatar_url} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-xl">3</span>
                  )}
                </div>
                <div className="bg-gradient-to-t from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4 h-28 flex flex-col justify-end">
                  <Award className="text-orange-400 mx-auto mb-2" size={24} />
                  <h3 className="text-white font-bold text-sm">{topUsers[2].full_name || topUsers[2].email}</h3>
                  <p className="text-orange-400 text-xs">{topUsers[2].total_score} ball</p>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">To'liq Reyting</h2>
          <div className="space-y-3">
            {topUsers.map((user, index) => {
              const rank = index + 1
              const isCurrentUser = profile?.id === user.id
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/50' 
                      : `bg-gradient-to-r ${getRankColor(rank)} hover:bg-white/10`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {(user.full_name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-white font-semibold">
                            {user.full_name || user.email}
                            {isCurrentUser && (
                              <span className="ml-2 text-blue-400 text-sm">(Siz)</span>
                            )}
                          </h3>
                          <p className="text-white/60 text-sm">{user.tests_taken} ta test topshirgan</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{user.total_score}</div>
                      <div className="text-white/60 text-sm">ball</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          {topUsers.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Hozircha reyting bo'sh</h3>
              <p className="text-white/70">Birinchi bo'lib test topshiring va reytingni boshlang!</p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}