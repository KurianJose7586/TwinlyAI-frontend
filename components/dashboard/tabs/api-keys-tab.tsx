"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ApiKeysTab() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-muted-foreground">Manage your API keys for programmatic access to your chatbot.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Key</CardTitle>
          <CardDescription>Use this key to access your chatbot programmatically</CardDescription>
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
