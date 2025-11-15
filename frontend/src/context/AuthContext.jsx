import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const { data } = await authService.getMe()
        setUser(data.data)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    toast.success('Login successful!')
    return data
  }

  const register = async (userData) => {
    const { data } = await authService.register(userData)
    toast.success('Registration successful! Check your email for verification code.')
    return data
  }

  const verifyEmail = async (verificationData) => {
    const { data } = await authService.verifyEmail(verificationData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    toast.success('Email verified successfully!')
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


