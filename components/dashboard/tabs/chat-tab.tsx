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

interface ChatTabProps {
  onTabChange: (tab: string) => void
  activeBot: { id: string; name: string; status: string } | null
}

export function ChatTab({ onTabChange, activeBot }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Clear messages when activeBot changes
  useEffect(() => {
    if (activeBot) {
      setMessages([]) // Start with a clean slate
    }
  }, [activeBot])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeBot || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    }

    // Create a snapshot of the current messages to send to the backend
    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication token not found.")

      // --- CHANGE: Send the conversation history (excluding the latest user message) ---
      const historyToSend = currentMessages.slice(0, -1).map(({ id, ...rest }) => rest);

      const response = await api.post(
        `/bots/${activeBot.id}/chat`,
        {
          message: userMessage.content,
          chat_history: historyToSend,
        },
        token
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
        <>
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4">
            {messages.length === 0 && !isLoading && (
                 <div className="flex justify-start">
                    <div className="rounded-lg p-3 max-w-[80%] bg-muted text-muted-foreground">
                        <p>Hello! I'm {activeBot.name}. Ask me anything about the loaded resume.</p>
                    </div>
                </div>
            )}
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

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask ${activeBot.name} something...`}
              className="flex-1"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading} data-testid="send-message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  )
}