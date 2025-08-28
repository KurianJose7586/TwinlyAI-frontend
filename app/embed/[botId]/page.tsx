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
      // In the future, this will be a public endpoint.
      // For now, we'll create a placeholder or assume it exists.
      // Let's create a temporary public endpoint for this.
      const fetchBotInfo = async () => {
        try {
          // This endpoint doesn't exist yet, we will create it in the backend next.
          // const botInfo = await api.get(`/bots/public/${botId}`);
          // setBotName(botInfo.name);

          // For now, let's use a placeholder name.
          setBotName("My Assistant") // Placeholder
        } catch (err: any) {
          setError("Could not load bot information.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchBotInfo()
    }
  }, [botId])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="h-screen w-screen bg-transparent">
      <ChatInterface
        botId={botId}
        botName={botName}
        initialMessage={`Hello! I am an AI assistant. How can I help you today?`}
      />
    </div>
  )
}