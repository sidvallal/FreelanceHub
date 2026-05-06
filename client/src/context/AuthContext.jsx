// Context provider for user authentication state
import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Restore user on mount if token exists
  useEffect(() => {
    const restoreUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me')
          setUser(data)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    restoreUser()
  }, [token])

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(data.token)
    setUser(data)
    return data
  }

  const register = async (name, email, password, role, phone) => {
    const { data } = await API.post('/auth/register', { name, email, password, role, phone })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData)
    setUser(prev => ({ ...prev, ...data }))
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }))
    return data
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
