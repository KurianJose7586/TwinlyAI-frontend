"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // <-- Import useRouter
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { api } from "@/lib/api"

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
  const router = useRouter() // <-- Initialize the router

  useEffect(() => {
    const fetchBots = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth") // Redirect if no token
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
        // --- THIS IS THE FIX ---
        // If credentials fail, clear the token and redirect to login
        if (error.message.includes("Could not validate credentials")) {
            localStorage.removeItem("token");
            router.push("/auth");
        }
        // --- END OF FIX ---
      } finally {
        setIsLoadingBots(false)
      }
    }

    fetchBots()
  }, [router]) // <-- Add router to dependency array

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
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