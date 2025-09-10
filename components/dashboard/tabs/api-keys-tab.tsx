"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Trash2, Copy, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  id: string
  prefix: string
}

interface ApiKeysTabProps {
  activeBot: { id: string; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function ApiKeysTab({ activeBot, onTabChange }: ApiKeysTabProps) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null)
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchKeys = async () => {
      setIsLoading(true)
      try {
        const fetchedKeys = await api.get("/api-keys/")
        setKeys(fetchedKeys)
      } catch (error: any) {
        toast({
          title: "Error fetching keys",
          description: error.message || "Could not retrieve your API keys.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchKeys()
  }, [toast])

  const handleGenerateKey = async () => {
    try {
      const response = await api.post("/api-keys/", {})
      setNewlyGeneratedKey(response.api_key)
      setIsKeyModalOpen(true)
      const fetchedKeys = await api.get("/api-keys/")
      setKeys(fetchedKeys)
    } catch (error: any) {
      toast({
        title: "Error generating key",
        description: error.message || "Could not create a new API key.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (confirm("Are you sure you want to delete this API key? This action is irreversible.")) {
      try {
        await api.delete(`/api-keys/${keyId}`)
        setKeys(keys.filter((key) => key.id !== keyId))
        toast({
          title: "API Key Deleted",
          description: "The key has been successfully revoked.",
        })
      } catch (error: any) {
        toast({
          title: "Error deleting key",
          description: error.message || "Could not delete the API key.",
          variant: "destructive",
        })
      }
    }
  }

  // --- THIS FUNCTION MAKES THE COPY BUTTON WORK ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard!" })
  }
  
  const handleGoToBots = () => {
    onTabChange("my-bots")
  }
  
  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Please select a bot to manage its API keys</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Choose a bot from the 'My Bots' page to manage its API keys.
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
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys to use the TwinlyAI API and embed your bots securely.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              These keys allow access to your bots. Do not share them publicly.
            </CardDescription>
          </div>
          <Button onClick={handleGenerateKey} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Generate New Key
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">Loading keys...</TableCell>
                </TableRow>
              ) : keys.length > 0 ? (
                keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {key.prefix}...
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteKey(key.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No API keys found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key Generated</DialogTitle>
            <DialogDescription>
              Please copy and save this key in a secure location. You will not be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md flex items-center justify-between">
            <pre className="text-sm overflow-x-auto">
              <code>{newlyGeneratedKey}</code>
            </pre>
            {/* THIS IS THE COPY BUTTON */}
            <Button variant="ghost" size="sm" onClick={() => newlyGeneratedKey && copyToClipboard(newlyGeneratedKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              For security reasons, this is the only time you will see the full API key. If you lose it, you will need to generate a new one.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}