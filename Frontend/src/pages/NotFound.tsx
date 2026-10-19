
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import FloatingBackground from '@/components/FloatingBackground'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    )
  }, [location.pathname])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <FloatingBackground />
      
      <motion.div 
        className="text-center max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="zenora-button-primary">
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
