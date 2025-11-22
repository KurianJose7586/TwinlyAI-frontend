"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  AlertCircle, 
  Loader2, 
  Phone, 
  Sparkles,
  MoreVertical
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion" // Ensure framer-motion is installed

// Define Message Interface
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatInterfaceProps {
  botId: string
  botName?: string // Added prop for display
  initialMessage?: string
  apiKey?: string | null
}

export function ChatInterface({ botId, botName = "TwinlyAI", initialMessage, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ 
        role: "assistant", 
        content: initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
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
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp }])
    setIsLoading(true)
    setError(null)

    try {
      const authOptions = apiKey ? { apiKey } : {};

      const response = await api.post(
        `/bots/${botId}/chat`,
        {
          message: userMessage,
          chat_history: messages,
        },
        authOptions
      );

      // --- CRITICAL FIX: Handle 'reply' from backend ---
      const botResponse = response.reply || response.response || response.message;
      // ------------------------------------------------

      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: botResponse, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        },
      ])
    } catch (err: any) {
      console.error("Chat Error:", err)
      setError(err.message || "Failed to send message")
      toast({
        title: "Connection Error",
        description: "Could not reach the candidate profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartVoiceCall = () => {
    // Navigate to the interview page
    router.push(`/interview/${botId}`)
  }

  return (
    <div className="flex flex-col h-[650px] w-full max-w-4xl mx-auto border border-border/60 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm shadow-2xl">
      
      {/* --- PROFESSIONAL HEADER --- */}
      <div className="px-6 py-4 border-b bg-background/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
               <AvatarImage src="/placeholder-logo.png" />
               <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">AI</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              {botName}
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium border border-blue-500/20">
                AI Candidate
              </span>
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Powered by Twinly RAG
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             className="hidden sm:flex border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/30 dark:text-blue-400 transition-all"
             onClick={handleStartVoiceCall}
           >
             <Phone className="w-4 h-4 mr-2" />
             Voice Interview
           </Button>
           
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartVoiceCall}>
                   <Phone className="w-4 h-4 mr-2" /> Start Voice Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMessages([])}>
                   Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      {/* --- MESSAGE AREA --- */}
      <ScrollArea className="flex-1 p-6 bg-muted/5" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {messages.length === 0 && !error && (
             <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-center space-y-4 opacity-60">
                <div className="p-4 bg-muted rounded-full">
                    <Bot className="w-8 h-8" />
                </div>
                <div>
                    <p className="font-medium text-foreground">No messages yet</p>
                    <p className="text-sm">Start the interview by asking a question.</p>
                </div>
             </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="w-8 h-8 mt-1 border shadow-sm">
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
                  
                  <div className="flex flex-col gap-1">
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === "user"
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white dark:bg-card border border-border text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.timestamp && (
                          <span className={`text-[10px] text-muted-foreground opacity-70 ${
                              msg.role === "user" ? "text-right" : "text-left"
                          }`}>
                              {msg.timestamp}
                          </span>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%]">
                <Avatar className="w-8 h-8 mt-1 border">
                  <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  </span>
                  <span className="text-xs text-muted-foreground font-medium ml-1">Analyzing resume...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-background border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2 max-w-3xl mx-auto relative"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, experience, or projects..."
            disabled={isLoading}
            className="flex-1 h-12 pl-4 pr-12 rounded-full border-muted-foreground/20 focus-visible:ring-blue-500/20 shadow-sm bg-muted/20"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
                AI can make mistakes. Review generated information.
            </p>
        </div>
      </div>
    </div>
  )
}