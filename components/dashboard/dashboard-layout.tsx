"use client"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("chat")
  const [hasUploadedResume, setHasUploadedResume] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <MainContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUploadedResume={hasUploadedResume}
        setHasUploadedResume={setHasUploadedResume}
      />
    </div>
  )
}
