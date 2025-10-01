"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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

const API_URL = "https://joserman-twinlyaibackend.hf.space/api/v1";

// --- FIX START ---
// Helper function to strip <think> tags from a string.
const stripThinkTags = (text: string): string => {
  return text.replace(/<think>.*?<\/think>/gs, "").trim();
};
// --- FIX END ---

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
      id: `user-${Date.now()}`,
      type: "user",
      content: messageContent,
    };

    const botMessageId = `bot-${Date.now()}`;
    // Add user message and an empty bot message placeholder
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: botMessageId, type: "bot", content: "" },
    ]);

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      } else if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const chatHistory = messages.map(m => ({ type: m.type, content: m.content }));

      const response = await fetch(`${API_URL}/bots/${botId}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: messageContent, chat_history: chatHistory }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to get a response from the server.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        // --- FIX START ---
        // We will accumulate the raw response here to properly clean it.
        let rawBotContent = "";
        // --- FIX END ---
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // --- FIX START ---
          // Append the raw chunk to our accumulator
          rawBotContent += chunk;

          // Clean the accumulated content
          const cleanedContent = stripThinkTags(rawBotContent);

          // Update the bot message with the cleaned content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, content: cleanedContent }
                : msg
            )
          );
          // --- FIX END ---
        }
      }
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get a response from the bot.",
        variant: "destructive",
      });
      // Remove the failed bot message placeholder
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== botMessageId)
      );
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
                message.type === "user" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {message.type === "bot" ? (
                <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
              ) : (
                <p>{message.content}</p>
              )}
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