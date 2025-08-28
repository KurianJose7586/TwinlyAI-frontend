"use client"

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { ChatInterface } from "../chat-interface" // Import the new component

interface ChatTabProps {
  onTabChange: (tab: string) => void
  activeBot: { id: string; name: string; status: string } | null
}

export function ChatTab({ onTabChange, activeBot }: ChatTabProps) {
  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        {activeBot && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Active Bot: {activeBot.name}
              </span>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground">Playground</h1>
        <p className="text-muted-foreground">
          Experiment with your personal chatbot to see how it thinks and responds.
        </p>
      </div>

      {!activeBot ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Please select a bot to continue</h2>
            <p className="text-muted-foreground max-w-md">
              Choose a bot from the 'My Bots' page to start chatting.
            </p>
            <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700" data-testid="go-to-bots-button">
              <Bot className="h-4 w-4 mr-2" />
              Go to My Bots
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100%-120px)]">
            <ChatInterface
                botId={activeBot.id}
                botName={activeBot.name}
                initialMessage={`Hello! I am ${activeBot.name}. Ask me anything about the loaded resume.`}
            />
        </div>
      )}
    </div>
  )
}