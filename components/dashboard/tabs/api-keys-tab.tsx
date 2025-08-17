"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKeysTabProps {
  activeBot: { id: number; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function ApiKeysTab({ activeBot, onTabChange }: ApiKeysTabProps) {
  const [apiKey] = useState("sk-1234567890abcdef••••••••••••••••")
  const { toast } = useToast()

  const handleCopyKey = () => {
    navigator.clipboard.writeText("sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890")
    toast({
      title: "API Key Copied",
      description: "Your API key has been copied to the clipboard.",
    })
  }

  const handleRegenerateKey = () => {
    if (confirm("Are you sure you want to regenerate your API key? This will invalidate the current key.")) {
      toast({
        title: "API Key Regenerated",
        description: "Your new API key has been generated.",
      })
    }
  }

  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          Please select a bot from the 'My Bots' page to continue
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          You need to select a bot before you can manage its API keys.
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
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Managing API Keys for: {activeBot.name}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-muted-foreground">Manage API keys for programmatic access to "{activeBot.name}".</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Key for {activeBot.name}</CardTitle>
          <CardDescription>Use this key to access "{activeBot.name}" programmatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={apiKey} readOnly className="font-mono text-sm" data-testid="api-key-display" />
            <Button onClick={handleCopyKey} variant="outline" data-testid="copy-key-button">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleRegenerateKey} variant="destructive" data-testid="regenerate-key-button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Key
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
