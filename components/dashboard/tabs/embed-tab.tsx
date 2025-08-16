"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmbedTab() {
  const { toast } = useToast()

  const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://twinlyai.com/embed.js';
    script.setAttribute('data-api-key', 'your-api-key');
    script.setAttribute('data-bot-id', 'your-bot-id');
    document.head.appendChild(script);
  })();
</script>`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast({
      title: "Code Copied",
      description: "The embed code has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Embed Widget</h1>
        <p className="text-muted-foreground">Add your AI chatbot to any website with this simple code snippet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Embed on Your Website</CardTitle>
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
