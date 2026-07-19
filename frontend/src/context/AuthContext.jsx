import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/apiService'
import { setStoredToken, clearStoredToken } from '../services/api'
import { useToast } from '../components/Toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const restore = async () => {
      try {
        const res = await authService.getMe()
        if (active && res?.success) setUser(res.data.user)
      } catch {
        clearStoredToken()
      } finally {
        if (active) setLoading(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  const errorMessage = (err, fallback) => {
    if (err?.errors?.length) {
      return err.errors.map((e) => e.message).join(' ')
    }
    return err?.message || fallback
  }

  const login = useCallback(async (email, password) => {
    try {
      const res = await authService.login({ email, password })
      if (res?.success) {
        if (res.data?.token) setStoredToken(res.data.token)
        setUser(res.data.user)
        return { success: true, role: res.data.user.role }
      }
      return { success: false, message: res?.message || 'Login failed' }
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Login failed') }
    }
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    try {
      const res = await authService.adminLogin({ email, password })
      if (res?.success) {
        if (res.data?.token) setStoredToken(res.data.token)
        setUser(res.data.user)
        return { success: true, role: res.data.user.role }
      }
      return { success: false, message: res?.message || 'Login failed' }
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Login failed') }
    }
  }, [])

  const register = useCallback(async (data) => {
    try {
      const res = await authService.register(data)
      if (res?.success) {
        if (res.data?.token) setStoredToken(res.data.token)
        setUser(res.data.user)
        return { success: true, role: res.data.user.role }
      }
      return { success: false, message: res?.message || 'Registration failed' }
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Registration failed') }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Even if the request fails, clear local state.
    }
    clearStoredToken()
    setUser(null)
    toast.success('Logged out successfully')
  }, [toast])

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authService.updateProfile(data)
      if (res?.success) {
        setUser(res.data.user)
        toast.success('Profile updated successfully')
        return { success: true, user: res.data.user }
      }
      toast.error(res?.message || 'Failed to update profile')
      return { success: false, message: res?.message || 'Update failed' }
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update profile'))
      return { success: false, message: errorMessage(err, 'Update failed') }
    }
  }, [toast])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPatient: user?.role === 'patient',
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
