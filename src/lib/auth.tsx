"use client"

import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: Date
  lastLogin: Date
  preferences?: {
    theme: 'light' | 'dark'
    language: 'en' | 'el'
    notifications: boolean
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

// Mock users database
const MOCK_USERS: (Omit<User, 'lastLogin'> & { password: string })[] = [
  {
    id: 'superadmin-1',
    email: 'superadmin@tradingpro.com',
    password: 'SuperAdmin2025!',
    name: '🔥 Super Administrator',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'jdgod-superadmin',
    email: 'JDGod',
    password: 'Kiki1999@',
    name: '👑 JDGod - Master Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'admin-demo',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Γιάννης Demo Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'user-demo',
    email: 'trader@example.com',
    password: 'trader123',
    name: 'Νίκος Demo Trader',
    role: 'user',
    createdAt: new Date('2024-02-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  }
]

class AuthService {
  private currentUser: User | null = null
  private listeners: Set<(state: AuthState) => void> = new Set()

  constructor() {
    // No auto-loading of session for testing purposes
    this.currentUser = null
  }

  private clearAllStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_session')
        localStorage.removeItem('user_preferences')
        localStorage.removeItem('trading_data')
        localStorage.removeItem('watchlist')
        // Clear everything related to our app
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('auth_') || key.startsWith('user_') || key.startsWith('trading_'))) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        console.error('Error clearing storage:', error)
      }
    }
  }

  private loadSession() {
    if (typeof window === 'undefined') return

    try {
      const sessionData = localStorage.getItem('auth_session')
      if (sessionData) {
        const { user, timestamp } = JSON.parse(sessionData)
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
        if (!isExpired && user) {
          this.currentUser = {
            ...user,
            lastLogin: new Date(user.lastLogin)
          }
          this.notifyListeners()
        } else {
          this.clearSession()
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
      this.clearSession()
    }
  }

  private saveSession(user: User) {
    if (typeof window === 'undefined') return

    try {
      const sessionData = { user, timestamp: Date.now() }
      localStorage.setItem('auth_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  private clearSession() {
    this.clearAllStorage()
  }

  private notifyListeners() {
    const state: AuthState = {
      user: this.currentUser,
      isLoading: false,
      isAuthenticated: !!this.currentUser,
      isAdmin: this.currentUser?.role === 'admin'
    }

    // Force update all listeners
    this.listeners.forEach(listener => {
      try {
        setTimeout(() => listener(state), 0) // Ensure async update
      } catch (error) {
        console.error('Error in auth listener:', error)
      }
    })
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password)

      if (!foundUser) {
        return { success: false, error: 'Λανθασμένα στοιχεία σύνδεσης' }
      }

      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt,
        lastLogin: new Date(),
        preferences: foundUser.preferences
      }

      this.currentUser = user
      this.saveSession(user)
      this.notifyListeners()

      console.log('✅ Login successful:', user.name, user.role)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: 'Σφάλμα κατά τη σύνδεση' }
    }
  }

  async register(email: string, password: string, name: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if email already exists
      const existingUser = MOCK_USERS.find(u => u.email === email)
      if (existingUser) {
        return { success: false, error: 'Το email υπάρχει ήδη' }
      }

      // Create new user
      const newUser: Omit<User, 'lastLogin'> & { password: string } = {
        id: `${role}-${Date.now()}`,
        email: email,
        password: password,
        name: name,
        role: role,
        createdAt: new Date(),
        preferences: {
          theme: 'dark',
          language: 'el',
          notifications: true
        }
      }

      // Add to mock users (in real app, this would be API call)
      MOCK_USERS.push(newUser)

      // Create user object for session
      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
        lastLogin: new Date(),
        preferences: newUser.preferences
      }

      this.currentUser = user
      this.saveSession(user)
      this.notifyListeners()

      console.log('✅ Registration successful:', user.name, user.role)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: 'Σφάλμα κατά την εγγραφή' }
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logout initiated...')
    this.currentUser = null
    this.clearSession()
    this.notifyListeners()

    // Force page reload to ensure clean state
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  forceLogout(): void {
    console.log('🔥 Force logout initiated...')
    try {
      this.currentUser = null
      this.clearAllStorage()
      this.notifyListeners()

      // Force immediate page reload
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('Force logout error:', error)
      // Even if there's an error, try to reload
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isLoading: false,
      isAuthenticated: !!this.currentUser,
      isAdmin: this.currentUser?.role === 'admin'
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener(this.getAuthState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  getDemoCredentials() {
    return {
      admins: MOCK_USERS.filter(u => u.role === 'admin').map(u => ({
        email: u.email,
        password: u.password,
        name: u.name
      })),
      users: MOCK_USERS.filter(u => u.role === 'user').map(u => ({
        email: u.email,
        password: u.password,
        name: u.name
      }))
    }
  }

  // Add init method to load session when needed
  init() {
    this.loadSession()
  }

  // Super Admin functions
  isSuperAdmin(): boolean {
    return this.currentUser?.id === 'superadmin-1' || this.currentUser?.id === 'jdgod-superadmin'
  }

  getAllUsers(): User[] {
    return MOCK_USERS.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: new Date(), // Mock last login
      preferences: u.preferences
    }))
  }

  promoteToAdmin(userId: string): { success: boolean; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να κάνει promote users' }
    }

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return { success: false, message: 'Χρήστης δεν βρέθηκε' }
    }

    if (MOCK_USERS[userIndex].role === 'admin') {
      return { success: false, message: 'Ο χρήστης είναι ήδη administrator' }
    }

    MOCK_USERS[userIndex].role = 'admin'
    console.log(`✅ User ${MOCK_USERS[userIndex].name} promoted to admin by Super Admin`)
    return { success: true, message: `Ο χρήστης ${MOCK_USERS[userIndex].name} έγινε Administrator` }
  }

  demoteFromAdmin(userId: string): { success: boolean; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να κάνει demote admins' }
    }

    if (userId === 'superadmin-1' || userId === 'jdgod-superadmin') {
      return { success: false, message: 'Δεν μπορείς να κάνεις demote τον Super Administrator' }
    }

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return { success: false, message: 'Χρήστης δεν βρέθηκε' }
    }

    if (MOCK_USERS[userIndex].role === 'user') {
      return { success: false, message: 'Ο χρήστης είναι ήδη user' }
    }

    MOCK_USERS[userIndex].role = 'user'
    console.log(`✅ Admin ${MOCK_USERS[userIndex].name} demoted to user by Super Admin`)
    return { success: true, message: `Ο χρήστης ${MOCK_USERS[userIndex].name} έγινε User` }
  }
}

export const authService = new AuthService()

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState())

  useEffect(() => {
    // Load session on mount
    authService.init()

    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  return React.createElement(AuthContext.Provider, { value: authState }, children)
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
