import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        'backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl',
        'relative overflow-hidden',
        hover && 'cursor-pointer transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-2xl hover:scale-105',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -5 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}