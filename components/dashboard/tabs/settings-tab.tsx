"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export function SettingsTab() {
  const handleDeleteBot = () => {
    if (
      confirm(
        "Are you sure you want to delete your bot and all associated data? This action cannot be undone and will permanently remove all your resume data, chat history, and API keys.",
      )
    ) {
      // Simulate deletion
      alert("Bot and all data would be deleted. Redirecting to homepage...")
      window.location.href = "/"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and bot settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Additional account settings and preferences will be available here.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that will permanently delete your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Delete Bot and All Associated Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete your bot, resume data, chat history, API keys, and all associated
                information. This action cannot be undone.
              </p>
            </div>
            <Button onClick={handleDeleteBot} variant="destructive" data-testid="delete-bot-button">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Bot and All Associated Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
