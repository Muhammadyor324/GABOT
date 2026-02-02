import { motion } from 'framer-motion'
import { Clock, BookOpen, Star, ChevronRight } from 'lucide-react'
import { Test } from '../lib/supabase'
import { GlassCard } from './GlassCard'

interface TestCardProps {
  test: Test
  onClick: () => void
}

export function TestCard({ test, onClick }: TestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Oson'
      case 'medium': return 'O\'rta'
      case 'hard': return 'Qiyin'
      default: return difficulty
    }
  }

  return (
    <GlassCard hover onClick={onClick} className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Star className={getDifficultyColor(test.difficulty)} size={16} />
            <span className={`text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
              {getDifficultyText(test.difficulty)}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">{test.title}</h3>
          <p className="text-white/70 text-sm mb-4">{test.description}</p>
          
          <div className="flex items-center space-x-6 text-xs text-white/60">
            <div className="flex items-center space-x-1">
              <BookOpen size={14} />
              <span>{test.questions_count} savol</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{test.time_limit} daqiqa</span>
            </div>
          </div>
        </div>
        
        <motion.div
          className="text-white/60 ml-4"
          whileHover={{ x: 5 }}
        >
          <ChevronRight size={24} />
        </motion.div>
      </div>
    </GlassCard>
  )
}