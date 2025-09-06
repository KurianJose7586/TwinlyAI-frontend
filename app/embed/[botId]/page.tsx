"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/dashboard/chat-interface"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function EmbedPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const botId = params.botId as string
  const apiKey = searchParams.get("apiKey") // <-- Read apiKey from URL

  const [botName, setBotName] = useState("Chatbot")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!apiKey) {
      setError("API Key is missing. This chatbot cannot be loaded.")
      setIsLoading(false)
      return
    }
    if (botId) {
      const fetchBotInfo = async () => {
        try {
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
  }, [botId, apiKey])

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
        apiKey={apiKey} // <-- Pass the apiKey to the chat interface
        initialMessage={`Hello! I am ${botName}, an AI assistant. How can I help?`}
      />
    </div>
  )
}