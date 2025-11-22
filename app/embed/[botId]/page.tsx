"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/dashboard/chat-interface"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function EmbedPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const botId = params.botId as string
  const apiKey = searchParams.get("apiKey") 

  const [botName, setBotName] = useState("Chatbot")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // --- DELETE OR COMMENT OUT THIS BLOCK ---
    /* if (!apiKey) {
      setError("API Key is missing. This chatbot cannot be loaded.")
      setIsLoading(false)
      return
    }
    */
    // ----------------------------------------

    if (botId) {
      const fetchBotInfo = async () => {
        try {
          // Note: Ensure you use the public endpoint that doesn't require Auth headers
          // if this page is meant to be public.
          const botInfo = await api.get(`/bots/public/${botId}`);
          setBotName(botInfo.name);
        } catch (err: any) {
          console.error(err);
          setError("Could not load bot information.")
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
        // botName={botName} // Note: Your ChatInterface component doesn't seem to accept botName prop anymore, you might want to check that.
        apiKey={apiKey}
        initialMessage={`Hello! I am ${botName}, an AI assistant. How can I help?`}
      />
    </div>
  )
}