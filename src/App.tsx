import { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { SubjectPage } from './pages/SubjectPage'
import { TestPage } from './pages/TestPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { AdminPage } from './pages/AdminPage'
import { Subject, Test } from './lib/supabase'

type Page = 'home' | 'subject' | 'test' | 'leaderboard' | 'admin'

function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [pageData, setPageData] = useState<any>(null)
  const [pageHistory, setPageHistory] = useState<Array<{ page: Page; data?: any }>>([])

  const navigate = (page: Page, data?: any) => {
    setPageHistory(prev => [...prev, { page: currentPage, data: pageData }])
    setCurrentPage(page)
    setPageData(data)
  }

  const goBack = () => {
    if (pageHistory.length > 0) {
      const previous = pageHistory[pageHistory.length - 1]
      setPageHistory(prev => prev.slice(0, -1))
      setCurrentPage(previous.page)
      setPageData(previous.data)
    } else {
      setCurrentPage('home')
      setPageData(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <AuthForm />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Header currentPage={currentPage} onNavigate={navigate} />
        
        <main className="container mx-auto px-4 pb-8">
          {currentPage === 'home' && (
            <HomePage onNavigate={navigate} />
          )}
          
          {currentPage === 'subject' && pageData && (
            <SubjectPage 
              subject={pageData as Subject}
              onNavigate={navigate}
              onBack={goBack}
            />
          )}
          
          {currentPage === 'test' && pageData && (
            <TestPage 
              test={pageData as Test}
              onBack={goBack}
            />
          )}
          
          {currentPage === 'leaderboard' && (
            <LeaderboardPage />
          )}
          
          {currentPage === 'admin' && (
            <AdminPage />
          )}
        </main>
      </div>
    </Router>
  )
}

export default App