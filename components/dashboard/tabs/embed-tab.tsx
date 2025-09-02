"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmbedTabProps {
  activeBot: { id: string; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function EmbedTab({ activeBot, onTabChange }: EmbedTabProps) {
  // State for customization options
  const [botName, setBotName] = useState(activeBot?.name || "My Assistant")
  const [initialMessage, setInitialMessage] = useState("Hello! How can I help you today?")
  const [embedCode, setEmbedCode] = useState("")
  const { toast } = useToast()

  // Update bot name when the active bot changes
  useEffect(() => {
    setBotName(activeBot?.name || "My Assistant")
  }, [activeBot])

  // Generate the iframe embed code whenever customizations change
  useEffect(() => {
    if (activeBot) {
      // Note: We are creating a simplified URL for the iframe source.
      // Customizations like initial message would require passing them as URL params.
      // For now, we will keep the code generation simple.
      const code = `<iframe
  src="${window.location.origin}/embed/${activeBot.id}"
  width="400"
  height="500"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
</iframe>`
      setEmbedCode(code)
    }
  }, [activeBot, botName, initialMessage])

  const handleCopyToClipboard = () => {
    if (!embedCode) return
    navigator.clipboard.writeText(embedCode)
    toast({
      title: "Copied to clipboard!",
      description: "You can now paste the embed code into your website's HTML.",
    })
  }
  
  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Please select a bot to get its embed code</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Choose a bot from the 'My Bots' page to generate an embeddable widget.
        </p>
        <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700">
          <Bot className="h-4 w-4 mr-2" />
          Go to My Bots
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Embed Widget</h1>
        <p className="text-muted-foreground">
          Copy and paste the code snippet to add the chatbot to your website.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Customization & Code */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Customize the appearance and behavior of your chatbot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Bot Name</Label>
                <Input
                  id="bot-name"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g., Portfolio Assistant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-message">Initial Message</Label>
                <Textarea
                  id="initial-message"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="e.g., Hello! Ask me anything about my portfolio."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy this code into your website's HTML.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <Button onClick={handleCopyToClipboard} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live Preview */}
        <div className="space-y-2">
          <Label>Live Preview</Label>
          <div className="h-[600px] w-full rounded-xl border shadow-md overflow-hidden">
            {/* The Live Preview using an iframe */}
            <iframe
              src={`/embed/${activeBot.id}`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Chatbot Preview"
              key={activeBot.id} // Add a key to force re-render when bot changes
            />
          </div>
        </div>
      </div>
    </div>
  )
}