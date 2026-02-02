import { motion } from 'framer-motion'
import { Chromium as Chrome, BookOpen, Trophy, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { GlassCard } from './GlassCard'

export function AuthForm() {
  const { signInWithGoogle } = useAuth()

  const features = [
    {
      icon: BookOpen,
      title: 'Barcha Fanlar',
      description: 'Matematika, Fizika, Kimyo va boshqa fanlardan testlar'
    },
    {
      icon: Trophy,
      title: 'Reyting Tizimi',
      description: 'Boshqalar bilan raqobatlashing va yuqori o\'rinlarga chiqing'
    },
    {
      icon: Users,
      title: 'Jamoa',
      description: 'Minglab foydalanuvchi bilan birga o\'rganing'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Welcome */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Quiz
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Master
                </span>
              </h1>
              <p className="text-xl text-white/80 mb-6">
                Bilimingizni sinab ko'ring va yangi narsalarni o'rganing
              </p>
              <p className="text-white/60">
                Barcha fanlardan testlar, reyting tizimi va ko'plab imkoniyatlar
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{feature.title}</h3>
                      <p className="text-white/60 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Right side - Auth */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-white" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Xush kelibsiz!
                </h2>
                <p className="text-white/70 mb-8">
                  Testlarni boshlash uchun Google hisobingiz bilan kiring
                </p>

                <motion.button
                  onClick={signInWithGoogle}
                  className="w-full bg-white text-gray-900 font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Chrome size={24} />
                  <span>Google bilan kirish</span>
                </motion.button>

                <div className="mt-6 text-center">
                  <p className="text-white/50 text-sm">
                    Ro'yxatdan o'tish orqali siz{' '}
                    <a href="#" className="text-blue-400 hover:underline">
                      Foydalanish shartlari
                    </a>{' '}
                    va{' '}
                    <a href="#" className="text-blue-400 hover:underline">
                      Maxfiylik siyosati
                    </a>
                    ga rozilik bildirasiz
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}