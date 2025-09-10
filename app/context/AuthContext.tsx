"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (token: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userData = await api.get("/users/me", token)
          setUser({ id: userData._id, email: userData.email })
        } catch (error) {
          console.error("Failed to fetch user on initial load", error)
          localStorage.removeItem("token") // Clear invalid token
        }
      }
      setIsLoading(false)
    }
    initializeUser()
  }, [])

  const login = async (token: string) => {
    localStorage.setItem("token", token)
    try {
      const userData = await api.get("/users/me", token)
      setUser({ id: userData._id, email: userData.email })
    } catch (error) {
      console.error("Failed to fetch user after login", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}