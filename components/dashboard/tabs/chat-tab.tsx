"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Upload } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
}

interface ChatTabProps {
  onTabChange: (tab: string) => void
  hasUploadedResume: boolean
}

export function ChatTab({ onTabChange, hasUploadedResume }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: hasUploadedResume
        ? "Hello! I'm your personal AI assistant trained on your resume. Ask me anything about your experience, skills, or career history."
        : "Hello! I'm ready to help you with your resume. Please upload your resume first to get started.",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !hasUploadedResume) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content:
        "I'd be happy to help you with that! Based on your resume, I can provide detailed information about your experience and qualifications.",
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setInputValue("")
  }

  const handleGoToResume = () => {
    onTabChange("resume")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Chat with Your Resume</h1>
        <p className="text-muted-foreground">Ask questions about your experience, skills, and career history.</p>
      </div>

      {!hasUploadedResume && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Start by uploading a resume</h2>
            <p className="text-muted-foreground max-w-md">
              Upload your resume to start chatting with your AI assistant about your experience and skills.
            </p>
            <Button
              onClick={handleGoToResume}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="go-to-resume-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </div>
      )}

      {hasUploadedResume && (
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
              placeholder="Ask your resume anything..."
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
