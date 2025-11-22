"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  email: string
  role: "candidate" | "recruiter"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        router.replace(pathname); 
      }

      const token = localStorage.getItem("token");
      const isAuthPage = pathname === "/auth";
      const isPublicPage = isAuthPage || pathname === "/" || pathname === "/pricing";

      if (token) {
        try {
          // Fetch user data
          const userData = await api.get("/users/me");
          
          // --- FIX: Handle both 'id' and '_id' ---
          const currentUser: User = { 
            id: userData.id || userData._id, 
            email: userData.email, 
            role: userData.role || "candidate"
          };
          
          setUser(currentUser);

          // --- UNIFIED REDIRECT ---
          // Simply send logged-in users to dashboard. The dashboard will handle the rest.
          if (isAuthPage) {
            router.push("/dashboard");
          }
          // ------------------------

        } catch (error) {
          console.error("Token validation failed", error);
          localStorage.removeItem("token");
          if (!isPublicPage) {
            router.push("/auth");
          }
        }
      } else {
        if (!isPublicPage) {
            router.push("/auth");
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}