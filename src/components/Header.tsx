import { motion } from 'framer-motion'
import { Trophy, User, LogOut, Settings, Home } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { GlassCard } from './GlassCard'

interface HeaderProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, profile, signOut } = useAuth()

  const navItems = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'leaderboard', label: 'Reyting', icon: Trophy },
    ...(profile?.is_admin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
  ]

  return (
    <header className="sticky top-0 z-50 p-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">QuizMaster</h1>
              <p className="text-xs text-white/70">Universal Test Platform</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              )
            })}
          </nav>

          {/* User Menu */}
          {user && profile ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium text-sm">{profile.full_name || profile.email}</p>
                <p className="text-white/70 text-xs">{profile.total_score} ball</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
                
                <motion.button
                  onClick={signOut}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex justify-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </GlassCard>
    </header>
  )
}