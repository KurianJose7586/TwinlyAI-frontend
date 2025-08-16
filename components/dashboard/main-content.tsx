import { ChatTab } from "./tabs/chat-tab"
import { ResumeTab } from "./tabs/resume-tab"
import { ApiKeysTab } from "./tabs/api-keys-tab"
import { EmbedTab } from "./tabs/embed-tab"
import { UsageTab } from "./tabs/usage-tab"
import { SettingsTab } from "./tabs/settings-tab"

interface MainContentProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasUploadedResume: boolean
  setHasUploadedResume: (uploaded: boolean) => void
}

export function MainContent({ activeTab, onTabChange, hasUploadedResume, setHasUploadedResume }: MainContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatTab onTabChange={onTabChange} hasUploadedResume={hasUploadedResume} />
      case "resume":
        return <ResumeTab setHasUploadedResume={setHasUploadedResume} />
      case "api-keys":
        return <ApiKeysTab />
      case "embed":
        return <EmbedTab />
      case "usage":
        return <UsageTab />
      case "settings":
        return <SettingsTab />
      default:
        return <ChatTab onTabChange={onTabChange} hasUploadedResume={hasUploadedResume} />
    }
  }

  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full p-6">{renderTabContent()}</div>
    </main>
  )
}
