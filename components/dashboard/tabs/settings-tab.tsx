"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bot, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface SettingsTabProps {
  activeBot: { id: string; name: string; status: string } | null
  setActiveBot: (bot: { id: string; name: string; status: string } | null) => void;
  bots: Array<{ id: string; name: string; status: string }>;
  setBots: (bots: Array<{ id: string; name: string; status: string }>) => void;
  onTabChange: (tab: string) => void
}

export function SettingsTab({ activeBot, setActiveBot, bots, setBots, onTabChange }: SettingsTabProps) {
  const [botName, setBotName] = useState(activeBot?.name || "")
  const [initialMessage, setInitialMessage] = useState("Hello! Ask me anything about my resume.")
  const [customPrompt, setCustomPrompt] = useState("You are a professional AI assistant. Answer questions based on the provided resume context.")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (activeBot) {
      setBotName(activeBot.name)
      // In a real application, you would fetch and set the initialMessage and customPrompt from your backend here.
    }
  }, [activeBot])

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBot) return;

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      // This would be extended to save all settings fields to the backend
      const updatedBot = await api.patch(`/bots/${activeBot.id}`, { name: botName }, token || undefined)

      setActiveBot({ ...activeBot, name: updatedBot.name })
      setBots(bots.map(bot => bot.id === updatedBot._id ? { ...bot, name: updatedBot.name } : bot))

      toast({
        title: "Success!",
        description: "Your bot settings have been saved.",
      })
    } catch (error: any) {
      toast({
        title: "Error Saving Changes",
        description: error.message || "Could not save settings.",
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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings for "{activeBot.name}"</h1>
      
      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your bot's public-facing name.</CardDescription>
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bot Persona</CardTitle>
            <CardDescription>Customize how your bot interacts with users. (Note: Requires backend implementation to use these values).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initial-message">Initial Message</Label>
              <Textarea 
                id="initial-message" 
                value={initialMessage} 
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="e.g., Hello, I am an AI assistant for [Your Name]. How can I help?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">System Prompt</Label>
              <Textarea 
                id="custom-prompt" 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[120px]"
                placeholder="Define the bot's personality, rules, and objectives."
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSaving} className="mt-6 bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </form>
      
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
           <p className="text-sm font-medium">Delete this bot and all its data.</p>
           <Button variant="destructive" onClick={() => alert('Delete functionality to be implemented!')}>
             <Trash2 className="mr-2 h-4 w-4" />
             Delete Bot
           </Button>
        </CardContent>
      </Card>
    </div>
  )
}