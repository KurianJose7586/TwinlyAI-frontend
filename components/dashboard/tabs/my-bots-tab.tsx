"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, Plus, Play, Settings, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MyBotsTabProps {
  currentTier: string
  bots: Array<{ id: string; name: string; status: string }>
  setBots: (bots: Array<{ id: string; name: string; status: string }>) => void
  activeBot: { id: string; name: string; status: string } | null
  setActiveBot: (bot: { id: string; name: string; status: string } | null) => void
  onTabChange: (tab: string) => void
}

export function MyBotsTab({ currentTier, bots, setBots, activeBot, setActiveBot, onTabChange }: MyBotsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newBotName, setNewBotName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const tierLimits = {
    Free: 1,
    Plus: 2,
    Pro: 10,
  }

  const currentLimit = tierLimits[currentTier as keyof typeof tierLimits] || 1
  const isAtLimit = bots.length >= currentLimit

  const handleCreateBot = async () => {
    if (!newBotName.trim()) {
      toast({
        title: "Error",
        description: "Bot name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // The API call remains the same
      const newBotData = await api.post("/bots/create", { name: newBotName })
      
      const newBot = {
        id: newBotData._id,
        name: newBotData.name,
        status: "Ready",
      }

      setBots([...bots, newBot])
      
      // --- THIS IS THE FIX ---
      // After creating the bot, immediately set it as the active one
      // and switch to the "Resume" tab for the next step.
      setActiveBot(newBot);
      onTabChange("resume");
      // --- END OF FIX ---

      setIsCreateModalOpen(false)
      setNewBotName("")
      toast({
        title: "Success!",
        description: `Bot "${newBot.name}" created. Now, let's train it!`,
      })
    } catch (error: any) {
      toast({
        title: "Error creating bot",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBot = (botId: string) => {
    if (confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
      // **TODO**: Implement backend API call for deletion
      setBots(bots.filter((bot) => bot.id !== botId))
      if (activeBot?.id === botId) {
        setActiveBot(null)
      }
      toast({
        title: "Bot Deleted",
        description: "The bot has been successfully deleted.",
      })
    }
  }

  const handlePlayground = (bot: { id: string; name: string; status: string }) => {
    setActiveBot(bot)
    onTabChange("playground")
  }

  const handleSettings = (bot: { id: string; name: string; status: string }) => {
    setActiveBot(bot)
    onTabChange("settings")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bots</h1>
          <p className="text-muted-foreground">Manage your AI chatbots and their configurations.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {bots.length} / {currentLimit} Bots Used
        </Badge>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isAtLimit}
                    data-testid="create-bot-button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Bot
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Bot</DialogTitle>
                    <DialogDescription>
                      Give your new AI assistant a name to get started. You can upload its knowledge base in the next
                      step.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <label htmlFor="bot-name" className="text-sm font-medium">
                      Bot Name
                    </label>
                    <Input
                      id="bot-name"
                      type="text"
                      placeholder="e.g., 'My Portfolio Assistant'"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      data-testid="bot-name-input"
                    />
                  </div>
                  <Button onClick={handleCreateBot} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isLoading ? "Creating..." : "Create Bot"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </TooltipTrigger>
          {isAtLimit && (
            <TooltipContent>
              <p>Upgrade your plan to create more bots</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {bots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No bots created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first AI chatbot to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card key={bot.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bot.name}</CardTitle>
                  <Badge variant="default">{bot.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePlayground(bot)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid={`playground-button-${bot.id}`}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Playground
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSettings(bot)}
                    data-testid={`settings-button-${bot.id}`}
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteBot(bot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-button-${bot.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}