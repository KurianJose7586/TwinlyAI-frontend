"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Bot } from "lucide-react"

interface SettingsTabProps {
  activeBot: { id: number; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function SettingsTab({ activeBot, onTabChange }: SettingsTabProps) {
  const handleDeleteBot = () => {
    if (!activeBot) return

    if (
      confirm(
        `Are you sure you want to delete "${activeBot.name}" and all associated data? This action cannot be undone and will permanently remove all resume data, chat history, and API keys for this bot.`,
      )
    ) {
      // Simulate deletion
      alert(`"${activeBot.name}" and all data would be deleted. Returning to My Bots...`)
      onTabChange("my-bots")
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
          You need to select a bot before you can manage its settings.
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
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Settings for: {activeBot.name}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage settings for "{activeBot.name}".</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bot Settings</CardTitle>
          <CardDescription>Manage preferences and configuration for "{activeBot.name}"</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Bot-specific settings and preferences will be available here.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that will permanently delete this bot's data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Delete "{activeBot.name}" and All Associated Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete "{activeBot.name}", its resume data, chat history, API keys, and all
                associated information. This action cannot be undone.
              </p>
            </div>
            <Button onClick={handleDeleteBot} variant="destructive" data-testid="delete-bot-button">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete "{activeBot.name}" and All Associated Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
