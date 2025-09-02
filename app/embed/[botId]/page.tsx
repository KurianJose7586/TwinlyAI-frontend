"use client"

import { useParams } from "next/navigation"
import { ChatInterface } from "@/components/dashboard/chat-interface"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

// This page will be publicly accessible and host the chat for embedding.
export default function EmbedPage() {
  const params = useParams()
  const botId = params.botId as string

  const [botName, setBotName] = useState("Chatbot")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (botId) {
      const fetchBotInfo = async () => {
        try {
          // Call the new public endpoint we just created
          const botInfo = await api.get(`/bots/public/${botId}`);
          setBotName(botInfo.name);
        } catch (err: any) {
          setError("Could not load bot information. Please check the bot ID.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchBotInfo()
    }
  }, [botId])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading Chatbot...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="h-screen w-screen bg-transparent">
      <ChatInterface
        botId={botId}
        botName={botName}
        initialMessage={`Hello! I am ${botName}, an AI assistant. How can I help you today?`}
      />
    </div>
  )
}