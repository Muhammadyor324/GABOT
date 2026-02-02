import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Subject } from '../lib/supabase'
import { GlassCard } from './GlassCard'

interface SubjectCardProps {
  subject: Subject
  testsCount: number
  onClick: () => void
}

export function SubjectCard({ subject, testsCount, onClick }: SubjectCardProps) {
  return (
    <GlassCard hover onClick={onClick} className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}40)` }}
          >
            {subject.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{subject.name}</h3>
            <p className="text-white/70 text-sm mb-2">{subject.description}</p>
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-white/60">{testsCount} ta test</span>
              <span className="text-white/60">•</span>
              <span className="text-green-400">Mavjud</span>
            </div>
          </div>
        </div>
        
        <motion.div
          className="text-white/60"
          whileHover={{ x: 5 }}
        >
          <ChevronRight size={24} />
        </motion.div>
      </div>
    </GlassCard>
  )
}