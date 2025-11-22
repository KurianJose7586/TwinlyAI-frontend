"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User as UserIcon, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Define Message Interface
interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  botId: string
  initialMessage?: string
  apiKey?: string | null // apiKey is now optional
}

export function ChatInterface({ botId, initialMessage, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 1. REMOVED THE BLOCKING CHECK:
  // Previously: if (!apiKey) return <Error ... />
  // Now: We proceed. The backend will block us if we really aren't auth'd.

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ role: "assistant", content: initialMessage }])
    }
  }, [initialMessage])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    setError(null)

    try {
      // 2. CONSTRUCT HEADERS DYNAMICALLY
      // If apiKey exists, use it. If not, standard 'api.post' uses the Bearer token automatically.
      const authOptions = apiKey ? { apiKey } : {};

      // 3. SEND REQUEST
      // We use api.post from lib/api.ts which handles the 'ngrok' header and 'Authorization'
      const response = await api.post(
        `/bots/${botId}/chat`,
        {
          message: userMessage,
          chat_history: messages, // Send history for context
        },
        authOptions
      );

      const botResponse = response.response || response.message;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botResponse },
      ])
    } catch (err: any) {
      console.error("Chat Error:", err)
      setError(err.message || "Failed to send message")
      toast({
        title: "Error",
        description: err.message || "Could not connect to the chatbot.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-background shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Chat with TwinlyAI
        </h3>
        {/* Optional: Show status indicator */}
        <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 pr-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {messages.length === 0 && !error && (
             <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-center opacity-50">
                <Bot className="w-12 h-12 mb-2" />
                <p>Start the conversation...</p>
             </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8 border">
                  {msg.role === "user" ? (
                    <>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/placeholder-logo.png" />
                      <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted border p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}