"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { api } from "@/lib/api"
import { useAuth } from "@/app/context/AuthContext"
import { CommandPalette } from "../command-palette"

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
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

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
        if (formattedBots.length > 0 && !activeBot) {
            setActiveBot(formattedBots[0]);
        }
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

    if (!isAuthLoading && user) {
      fetchBots()
    } else if (!isAuthLoading && !user) {
      router.push("/auth");
    }
  }, [router, user, isAuthLoading, activeBot])
  
  // Keyboard listener for the Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (isAuthLoading || isLoadingBots) {
    // You can add a more sophisticated loading screen here
    return <div>Loading Dashboard...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <CommandPalette 
        open={isCommandPaletteOpen} 
        setOpen={setCommandPaletteOpen} 
        onTabChange={setActiveTab}
        hasActiveBot={!!activeBot}
      />
      <Sidebar 
        user={user}
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