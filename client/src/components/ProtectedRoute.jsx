// Wrapper component for handling route protection and authorization
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protects routes from unauthorized access by checking user authentication and roles
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
