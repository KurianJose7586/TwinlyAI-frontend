"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
}

interface ChatTabProps {
  onTabChange: (tab: string) => void
  activeBot: { id: number; name: string; status: string } | null
}

export function ChatTab({ onTabChange, activeBot }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: activeBot
        ? `Hello! I'm your AI assistant trained on "${activeBot.name}". Try asking me different questions to see how I think and respond!`
        : "Please select a bot from the 'My Bots' page to continue.",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeBot) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: `Based on the data from "${activeBot.name}", I can provide detailed information about the experience and qualifications. Let me help you with that!`,
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setInputValue("")
  }

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
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Bot: {activeBot.name}</span>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground">Discover What Your AI Can Do</h1>
        <p className="text-muted-foreground">
          Experiment with different questions to see how your personal chatbot thinks and responds.
        </p>
      </div>

      {!activeBot && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Please select a bot to continue</h2>
            <p className="text-muted-foreground max-w-md">
              Choose a bot from the 'My Bots' page to start experimenting with your AI assistant.
            </p>
            <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700" data-testid="go-to-bots-button">
              <Bot className="h-4 w-4 mr-2" />
              Go to My Bots
            </Button>
          </div>
        </div>
      )}

      {activeBot && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask ${activeBot.name} something...`}
              className="flex-1"
              data-testid="chat-input"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="send-message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
