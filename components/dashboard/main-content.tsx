"use client"

import { ChatTab } from "./tabs/chat-tab"
import { MyBotsTab } from "./tabs/my-bots-tab"
import { ApiKeysTab } from "./tabs/api-keys-tab"
import { EmbedTab } from "./tabs/embed-tab"
import { UsageTab } from "./tabs/usage-tab"
import { SettingsTab } from "./tabs/settings-tab"
import { ResumeTab } from "./tabs/resume-tab" // <-- Import the new tab

interface Bot {
  id: string
  name: string
  status: string
}

interface MainContentProps {
  activeTab: string
  onTabChange: (tab: string) => void
  currentTier: string
  setCurrentTier: (tier: string) => void
  bots: Bot[]
  setBots: (bots: Bot[]) => void
  activeBot: Bot | null
  setActiveBot: (bot: Bot | null) => void
  isLoadingBots: boolean
}

export function MainContent({
  activeTab,
  onTabChange,
  currentTier,
  setCurrentTier,
  bots,
  setBots,
  activeBot,
  setActiveBot,
  isLoadingBots,
}: MainContentProps) {
  const renderTabContent = () => {
    if (isLoadingBots && activeTab !== "my-bots") {
        return <div className="text-center p-10">Loading Bots...</div>;
    }
    
    switch (activeTab) {
      case "playground":
        return <ChatTab onTabChange={onTabChange} activeBot={activeBot} />
      case "my-bots":
        return (
          <MyBotsTab
            currentTier={currentTier}
            bots={bots}
            setBots={setBots}
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            onTabChange={onTabChange}
          />
        )
      // Add the new case for 'resume'
      case "resume":
        return <ResumeTab activeBot={activeBot} onTabChange={onTabChange} />
      case "api-keys":
        return <ApiKeysTab activeBot={activeBot} onTabChange={onTabChange} />
      case "embed":
        return <EmbedTab activeBot={activeBot} onTabChange={onTabChange} />
      case "usage":
        return <UsageTab activeBot={activeBot} onTabChange={onTabChange} />
      case "settings":
        return <SettingsTab activeBot={activeBot} onTabChange={onTabChange} />
      default:
        return (
          <MyBotsTab
            currentTier={currentTier}
            bots={bots}
            setBots={setBots}
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            onTabChange={onTabChange}
          />
        )
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Development Tier Switcher:</span>
          {["Free", "Plus", "Pro"].map((tier) => (
            <button
              key={tier}
              onClick={() => setCurrentTier(tier)}
              className={`px-3 py-1 text-xs rounded-md border ${
                currentTier === tier
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-background text-foreground border-border hover:bg-accent"
              }`}
            >
              Set to {tier}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">Current: {currentTier}</span>
        </div>
      </div>
      <div className="h-[calc(100vh-65px)] p-6">{renderTabContent()}</div>
    </main>
  )
}