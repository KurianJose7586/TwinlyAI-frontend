"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Copy, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmbedTabProps {
  activeBot: { id: string; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function EmbedTab({ activeBot, onTabChange }: EmbedTabProps) {
  const [initialMessage, setInitialMessage] = useState("Hello! How can I help you today?")
  const [embedCode, setEmbedCode] = useState("")
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (activeBot && apiKey) {
      const code = `<iframe
  src="${window.location.origin}/embed/${activeBot.id}?apiKey=${apiKey}"
  width="400"
  height="500"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
</iframe>`
      setEmbedCode(code)
    } else {
      setEmbedCode("Please select a bot and provide an API key to generate the embed code.")
    }
  }, [activeBot, apiKey, initialMessage])

  // --- THIS FUNCTION MAKES THE COPY BUTTON WORK ---
  const handleCopyToClipboard = () => {
    if (!embedCode || !apiKey) {
      toast({ title: "Please provide an API key first", variant: "destructive" })
      return
    }
    navigator.clipboard.writeText(embedCode)
    toast({ title: "Copied to clipboard!" })
  }

  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  const handleGoToApiKeys = () => {
    onTabChange("api-keys")
  }

  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Please select a bot to get its embed code</h2>
        <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700">Go to My Bots</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Embed Widget for "{activeBot.name}"</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-input">API Key</Label>
                <p className="text-xs text-muted-foreground">
                  Generate a key from the 'API Keys' tab and paste it here.
                </p>
                <Input
                  id="api-key-input"
                  type="password"
                  placeholder="Paste your API key (e.g., ta_...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                 <Button variant="outline" size="sm" onClick={handleGoToApiKeys} className="mt-2">
                    <KeyRound className="mr-2 h-4 w-4"/>
                    Manage API Keys
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-message">Initial Message</Label>
                <Textarea id="initial-message" value={initialMessage} onChange={(e) => setInitialMessage(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Embed Code</CardTitle></CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto"><code>{embedCode}</code></pre>
              {/* THIS IS THE COPY BUTTON */}
              <Button onClick={handleCopyToClipboard} className="w-full mt-4 bg-blue-600 hover:bg-blue-700"><Copy className="mr-2 h-4 w-4" />Copy Code</Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <Label>Live Preview</Label>
          <div className="h-[600px] w-full rounded-xl border shadow-md overflow-hidden bg-background">
            {apiKey ? (
              <iframe
                src={`/embed/${activeBot.id}?apiKey=${apiKey}`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Chatbot Preview"
                key={`${activeBot.id}-${apiKey}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
                <p>Please paste an API key in the configuration panel to activate the preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}