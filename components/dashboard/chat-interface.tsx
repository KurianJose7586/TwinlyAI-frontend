"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown" // <-- IMPORT THE LIBRARY
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils" // Import cn for utility classes

interface Message {
  id: string
  type: "user" | "bot"
  content: string
}

interface ChatInterfaceProps {
  botId: string
  botName: string
  initialMessage?: string
  apiKey?: string | null;
}

export function ChatInterface({ botId, botName, initialMessage, apiKey }: ChatInterfaceProps) {
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

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const historyToSend = currentMessages.slice(0, -1).map(({ id, ...rest }) => rest);
      const response = await api.post(
        `/bots/${botId}/chat`,
        {
          message: userMessage.content,
          chat_history: historyToSend,
        },
        { apiKey, token: localStorage.getItem("token") }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get a response from the bot.",
        variant: "destructive",
      });
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      <div className="p-4 border-b flex items-center gap-4">
        <Avatar>
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{botName}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "rounded-lg p-3 max-w-[80%] prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-2 prose-ul:my-2",
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {/* --- THIS IS THE FIX --- */}
              {/* Use ReactMarkdown for bot messages to render HTML */}
              {message.type === "bot" ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <p>{message.content}</p>
              )}
              {/* --- END OF FIX --- */}
            </div>
          </div>
        ))}

        {messages.length <= 1 && !isLoading && (
          <div className="p-4 bg-muted/40 rounded-lg border border-dashed">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Try asking a question or select a suggestion</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSuggestedQuestion('What are their key skills?')}>
                What are their key skills?
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSuggestedQuestion('Summarize their professional experience.')}>
                Summarize their experience
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg p-3 max-w-[80%] bg-muted text-muted-foreground">
              <p className="animate-pulse">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
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
        <div className="text-center mt-2">
          <a href="https://twinly-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Powered by TwinlyAI
          </a>
        </div>
      </div>
    </div>
  );
}