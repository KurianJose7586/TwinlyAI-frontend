"use client"

import { ChatTab } from "./tabs/chat-tab"
import { MyBotsTab } from "./tabs/my-bots-tab"
import { ApiKeysTab } from "./tabs/api-keys-tab"
import { EmbedTab } from "./tabs/embed-tab"
import { UsageTab } from "./tabs/usage-tab"
import { SettingsTab } from "./tabs/settings-tab"
import { ResumeTab } from "./tabs/resume-tab"
// Import the new Recruiter Tab
import { RecruiterSearchTab } from "./tabs/recruiter-search-tab"

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
    // --- 1. RECRUITER VIEWS ---
    if (activeTab === "search-talent") {
        return <RecruiterSearchTab />
    }
    if (activeTab === "interviews") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <p className="text-lg font-medium">Interview History</p>
                <p className="text-sm">This feature is coming in the next update.</p>
            </div>
        )
    }

    // --- 2. CANDIDATE LOADING STATE ---
    // Only show loading if we are NOT on a recruiter tab and bots are loading
    if (isLoadingBots && activeTab === "my-bots") {
        return <div className="text-center p-10 text-muted-foreground">Loading your AI Twins...</div>;
    }
    
    // --- 3. CANDIDATE VIEWS ---
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
      case "resume":
        return <ResumeTab activeBot={activeBot} onTabChange={onTabChange} />
      case "api-keys":
        return <ApiKeysTab activeBot={activeBot} onTabChange={onTabChange} />
      case "embed":
        return <EmbedTab activeBot={activeBot} onTabChange={onTabChange} />
      case "usage":
        return <UsageTab activeBot={activeBot} onTabChange={onTabChange} />
      case "settings":
        return (
          <SettingsTab
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            bots={bots}
            setBots={setBots}
            onTabChange={onTabChange}
          />
        )
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
    <main className="flex-1 overflow-y-auto bg-muted/10 relative h-full">
      {/* UI POLISH: Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
      
      {/* Header Bar */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-6 py-3 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold capitalize text-foreground/80 tracking-wide">
                {activeTab.replace("-", " ")}
            </h2>
        </div>

        {/* Only show Tier Switcher for non-search tabs (optional UX choice) */}
        {activeTab !== "search-talent" && (
            <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-muted-foreground">Dev Mode:</span>
            {["Free", "Plus", "Pro"].map((tier) => (
                <button
                key={tier}
                onClick={() => setCurrentTier(tier)}
                className={`px-2 py-0.5 text-[10px] rounded-md border ${
                    currentTier === tier
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
                >
                {tier}
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-65px)]">
        {renderTabContent()}
      </div>
    </main>
  )
}