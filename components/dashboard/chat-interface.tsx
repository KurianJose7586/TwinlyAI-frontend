"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
}

interface ChatInterfaceProps {
  botId: string
  botName: string
  initialMessage?: string
}

export function ChatInterface({ botId, botName, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ id: "init", type: "bot", content: initialMessage }])
    }
  }, [initialMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token") // This will be null for public embeds
      
      const historyToSend = currentMessages.slice(0, -1).map(({ id, ...rest }) => rest)

      // We'll need a public API endpoint later, but for now, we can test with the existing one
      // if you are logged in on the same browser.
      const response = await api.post(
        `/bots/${botId}/chat`,
        {
          message: userMessage.content,
          chat_history: historyToSend,
        },
        token || undefined 
      )

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.reply,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get a response from the bot.",
        variant: "destructive",
      })
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background p-4 rounded-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg p-3 max-w-[80%] bg-muted text-muted-foreground">
              <p className="animate-pulse">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask ${botName} something...`}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}