"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmbedTabProps {
  activeBot: { id: number; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function EmbedTab({ activeBot, onTabChange }: EmbedTabProps) {
  const { toast } = useToast()

  const embedCode = activeBot
    ? `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://twinlyai.com/embed.js';
    script.setAttribute('data-api-key', 'your-api-key');
    script.setAttribute('data-bot-id', '${activeBot.id}');
    script.setAttribute('data-bot-name', '${activeBot.name}');
    document.head.appendChild(script);
  })();
</script>`
    : ""

  const handleCopyCode = () => {
    if (!activeBot) return
    navigator.clipboard.writeText(embedCode)
    toast({
      title: "Code Copied",
      description: "The embed code has been copied to your clipboard.",
    })
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
          You need to select a bot before you can generate its embed code.
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
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Embed Code for: {activeBot.name}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Embed Widget</h1>
        <p className="text-muted-foreground">Add "{activeBot.name}" to any website with this simple code snippet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Embed "{activeBot.name}" on Your Website</CardTitle>
          <CardDescription>Copy and paste this code into your website's HTML</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
          </div>
          <Button onClick={handleCopyCode} data-testid="copy-embed-code">
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
