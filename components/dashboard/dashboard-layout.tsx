"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { api } from "@/lib/api"
import { useAuth } from "@/app/context/AuthContext"
import { CommandPalette } from "../command-palette"
import LightRays from "@/components/light-rays"

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("") 
  const [currentTier, setCurrentTier] = useState("Free")
  const [bots, setBots] = useState<any[]>([])
  const [activeBot, setActiveBot] = useState<any | null>(null)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (user && !activeTab) {
        if (user.role === "recruiter") {
            setActiveTab("search-talent");
        } else {
            setActiveTab("my-bots");
        }
    }
  }, [user, activeTab]);

  useEffect(() => {
    const fetchBots = async () => {
      if (user?.role === "recruiter") {
          setIsLoadingBots(false);
          return;
      }
      
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

  if (isAuthLoading || !activeTab) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-muted-foreground">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden relative selection:bg-blue-500/30 text-white">
      
      {/* --- GLOBAL BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                              linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' 
          }}
        />
        
        {/* Top Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />

        {/* Light Rays */}
        <div className="absolute inset-0 mix-blend-screen opacity-30">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.2}
            lightSpread={10}
            rayLength={0.8}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.02}
            distortion={0.02}
            pulsating={false}
            className="custom-rays"
          />
        </div>
      </div>

      <CommandPalette 
        open={isCommandPaletteOpen} 
        setOpen={setCommandPaletteOpen} 
        onTabChange={setActiveTab}
        hasActiveBot={!!activeBot}
      />
      
      {/* Sidebar & Content Wrapper */}
      <div className="relative z-10 flex w-full h-full">
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
    </div>
  )
}