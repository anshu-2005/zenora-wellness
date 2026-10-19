import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { Menu, X, Shield, Activity } from 'lucide-react'

const NavBar = () => {
  const { isAuthenticated, logout, user } = useAuthStore()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <motion.nav 
      className="w-full bg-white/80 backdrop-blur-md py-3.5 px-4 sm:px-8 fixed top-0 left-0 right-0 z-50 border-b border-border/40 shadow-2xs"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="flex justify-between items-center zenora-container max-w-7xl mx-auto">
        <motion.div variants={itemVariants}>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ZENORA
            </span>
            <span className="hidden sm:inline-block text-3xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Wellness AI
            </span>
          </Link>
        </motion.div>

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Navigation">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {isMenuOpen && (
              <motion.div 
                className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg py-4 px-6 border-b border-border"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col space-y-3 text-sm font-medium">
                  <Link to="/" className="py-1 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/dashboard" className="py-1 hover:text-primary text-primary font-semibold" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link to="/mood" className="py-1 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Mood Tracker</Link>
                  <Link to="/journal" className="py-1 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Journal & NLP</Link>
                  <Link to="/assessment" className="py-1 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Assessments</Link>
                  <Link to="/chat" className="py-1 hover:text-primary" onClick={() => setIsMenuOpen(false)}>AI Companion</Link>
                  <Link to="/admin" className="py-1 hover:text-purple-600 font-semibold flex items-center gap-1.5" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="w-3.5 h-3.5 text-purple-600" /> Admin Portal
                  </Link>
                  
                  <div className="pt-2 border-t border-border flex flex-col gap-2">
                    {isAuthenticated ? (
                      <Button onClick={handleLogout} variant="outline" size="sm">Logout ({user?.name || 'Account'})</Button>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
                        <Link to="/signup" onClick={() => setIsMenuOpen(false)}><Button className="zenora-button-primary w-full" size="sm">Sign Up</Button></Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div className="flex items-center space-x-5 text-sm" variants={itemVariants}>
            <Link to="/" className="font-medium text-gray-700 hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Activity className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/mood" className="font-medium text-gray-700 hover:text-primary transition-colors">Mood Tracker</Link>
            <Link to="/journal" className="font-medium text-gray-700 hover:text-primary transition-colors">Journal</Link>
            <Link to="/assessment" className="font-medium text-gray-700 hover:text-primary transition-colors">Assessment</Link>
            <Link to="/chat" className="font-medium text-gray-700 hover:text-primary transition-colors">AI Companion</Link>
            <Link to="/admin" className="font-semibold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>

            <div className="pl-3 border-l border-border/80 flex items-center gap-2">
              {isAuthenticated ? (
                <Button onClick={logout} variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-gray-900">
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-xs">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="zenora-button-primary text-xs px-4">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default NavBar
