
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        variant: 'destructive',
      })
    }
  }, [isAuthenticated, toast])

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </motion.div>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
