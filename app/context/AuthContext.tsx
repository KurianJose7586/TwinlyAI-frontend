"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getUser, User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Handle OAuth token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get("token")

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl)
      // Clean the URL by removing the token, then redirect to dashboard
      window.history.replaceState({}, document.title, "/dashboard")
    }

    const initializeUser = async () => {
      const token = localStorage.getItem("token")
      const isAuthPage = pathname === "/auth"
      const isEmbedPage = pathname.startsWith("/embed")
      const isPricingPage = pathname === "/pricing"
      const isHomePage = pathname === "/"

      if (isEmbedPage) {
        setLoading(false)
        return
      }

      if (token) {
        try {
          const userData = await getUser()
          setUser(userData)
          if (isAuthPage || isHomePage) {
            router.push("/dashboard")
          }
        } catch (error) {
          console.error("Failed to fetch user", error)
          localStorage.removeItem("token")
          if (!isHomePage && !isPricingPage) {
            router.push("/auth")
          }
        }
      } else {
        if (!isAuthPage && !isHomePage && !isPricingPage) {
          router.push("/auth")
        }
      }
      setLoading(false)
    }
    initializeUser()
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/auth")
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}