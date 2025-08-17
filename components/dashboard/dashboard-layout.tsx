"use client"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("my-bots")
  const [currentTier, setCurrentTier] = useState("Free")
  const [bots, setBots] = useState([])
  const [activeBot, setActiveBot] = useState(null)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <MainContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTier={currentTier}
        setCurrentTier={setCurrentTier}
        bots={bots}
        setBots={setBots}
        activeBot={activeBot}
        setActiveBot={setActiveBot}
      />
    </div>
  )
}
