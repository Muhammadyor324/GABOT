import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Subject {
  id: string
  name: string
  description: string
  icon: string
  color: string
  created_at: string
}

export interface Test {
  id: string
  subject_id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit: number
  questions_count: number
  created_at: string
  subject?: Subject
}

export interface Question {
  id: string
  test_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  created_at: string
}

export interface TestResult {
  id: string
  user_id: string
  test_id: string
  score: number
  total_questions: number
  time_taken: number
  answers: Record<string, number>
  created_at: string
  test?: Test
  user_email?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  total_score: number
  tests_taken: number
  is_admin: boolean
  created_at: string
}