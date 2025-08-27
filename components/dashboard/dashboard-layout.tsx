"use client"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { api } from "@/lib/api"

// Define the Bot type
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

  useEffect(() => {
    const fetchBots = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        // Handle case where user is not logged in, maybe redirect
        setIsLoadingBots(false)
        return
      }
      try {
        const fetchedBots = await api.get("/bots/", token)
        const formattedBots = fetchedBots.map((bot: any) => ({
          id: bot._id,
          name: bot.name,
          status: "Ready", // Or derive from backend if available
        }));
        setBots(formattedBots)
      } catch (error) {
        console.error("Failed to fetch bots:", error)
        // Optionally, show a toast notification
      } finally {
        setIsLoadingBots(false)
      }
    }

    fetchBots()
  }, [])

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