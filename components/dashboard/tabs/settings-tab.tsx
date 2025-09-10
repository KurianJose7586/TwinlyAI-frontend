"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface SettingsTabProps {
  activeBot: { id: string; name: string; status: string } | null
  // We need access to the global state setters to update the UI in real-time
  setActiveBot: (bot: { id: string; name: string; status: string } | null) => void;
  bots: Array<{ id: string; name: string; status: string }>;
  setBots: (bots: Array<{ id: string; name: string; status: string }>) => void;
  onTabChange: (tab: string) => void
}

export function SettingsTab({ activeBot, setActiveBot, bots, setBots, onTabChange }: SettingsTabProps) {
  const [botName, setBotName] = useState(activeBot?.name || "")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // When the activeBot prop changes, update the local state
  useEffect(() => {
    if (activeBot) {
      setBotName(activeBot.name)
    }
  }, [activeBot])

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBot || !botName.trim()) {
      toast({ title: "Bot name cannot be empty.", variant: "destructive" })
      return
    }
    if (botName.trim() === activeBot.name) {
      toast({ title: "No changes to save."})
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const updatedBot = await api.patch(`/bots/${activeBot.id}`, { name: botName }, token || undefined)

      // Update the global state to reflect the name change instantly
      setActiveBot({ ...activeBot, name: updatedBot.name })
      setBots(bots.map(bot => bot.id === updatedBot._id ? { ...bot, name: updatedBot.name } : bot))

      toast({
        title: "Success!",
        description: "Your bot has been renamed.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving changes",
        description: error.message || "Could not rename the bot.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoToBots = () => {
    onTabChange("my-bots")
  }
  
  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Please select a bot to manage its settings</h2>
        <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700">Go to My Bots</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings for "{activeBot.name}"</h1>
      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your bot's name and other general settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-name">Bot Name</Label>
              <Input
                id="bot-name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter a name for your bot"
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isSaving} className="mt-4 bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}