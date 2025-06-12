import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface PrivateRouteProps {
  children: React.ReactNode
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
} 