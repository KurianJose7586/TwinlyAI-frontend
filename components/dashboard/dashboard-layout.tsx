"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { api } from "@/lib/api"
import { useAuth } from "@/app/context/AuthContext" // <-- Import useAuth

interface Bot {
  id: string
  name: string
  status: string 
}

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("my-bots")
  const [currentTier, setCurrentTier] = useState("Free")
  const [bots, setBots] = useState<Bot[]>([])
  const [activeBot, setActiveBot] = useState<Bot | null>(null)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth() // <-- Get user from context

  useEffect(() => {
    const fetchBots = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth")
        return
      }
      try {
        const fetchedBots = await api.get("/bots/", token)
        const formattedBots = fetchedBots.map((bot: any) => ({
          id: bot._id,
          name: bot.name,
          status: "Ready",
        }));
        setBots(formattedBots)
      } catch (error: any) {
        console.error("Failed to fetch bots:", error)
        if (error.message.includes("Could not validate credentials")) {
            localStorage.removeItem("token");
            router.push("/auth");
        }
      } finally {
        setIsLoadingBots(false)
      }
    }

    // Only fetch bots if authentication is resolved and a user exists
    if (!isAuthLoading && user) {
      fetchBots()
    } else if (!isAuthLoading && !user) {
      // If auth is resolved and there's no user, redirect to login
      router.push("/auth");
    }
  }, [router, user, isAuthLoading])

  if (isAuthLoading) {
    return <div>Loading...</div> // Or a proper loading spinner component
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        user={user} // <-- Pass user object to Sidebar
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        hasActiveBot={!!activeBot}
      />
      <MainContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTier={currentTier}
        setCurrentTier={setCurrentTier}
        bots={bots}
        setBots={setBots}
        activeBot={activeBot}
        setActiveBot={setActiveBot}
        isLoadingBots={isLoadingBots}
      />
    </div>
  )
}