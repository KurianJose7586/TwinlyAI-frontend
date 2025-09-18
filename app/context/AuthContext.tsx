"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  email: string
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
      // --- THIS IS THE FIX ---
      // First, check for a token in the URL from the OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        // If a token is found, save it and clean the URL
        localStorage.setItem("token", tokenFromUrl);
        // We use router.replace to clean the URL without a page reload
        router.replace(pathname); 
      }
      // --- END OF FIX ---

      // Now, proceed with checking for a token in localStorage
      const token = localStorage.getItem("token");
      const isAuthPage = pathname === "/auth";
      const isPublicPage = isAuthPage || pathname === "/" || pathname === "/pricing";

      if (token) {
        try {
          // If there's a token, fetch the user
          const userData = await api.get("/users/me");
          // The API returns _id, so we map it to id
          setUser({ id: userData._id, email: userData.email });
          // If the user is on an auth page but is logged in, send to dashboard
          if (isAuthPage) {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Token validation failed", error);
          localStorage.removeItem("token");
          // If token is invalid, redirect to login unless on a public page
          if (!isPublicPage) {
            router.push("/auth");
          }
        }
      } else {
         // If there's no token, redirect to login unless on a public page
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