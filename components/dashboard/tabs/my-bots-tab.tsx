"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Bot, Plus, Play, Settings, Trash2, Fingerprint } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { GradientButton } from "@/components/ui/gradient-button" // Reuse the landing page button!

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
      const token = localStorage.getItem("token")
      const newBotData = await api.post("/bots/create", { name: newBotName }, { token })
      
      const newBot = {
        id: newBotData._id,
        name: newBotData.name,
        status: "Ready",
      }

      setBots([...bots, newBot]);
      setActiveBot(newBot);
      onTabChange("resume");

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

  const deleteBot = async (botId: string) => {
    if (confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/bots/${botId}`, token || undefined);

        setBots(bots.filter((bot) => bot.id !== botId));
        if (activeBot?.id === botId) {
          setActiveBot(null);
        }
        toast({
          title: "Bot Deleted",
          description: "The bot and its data have been successfully deleted.",
        });
      } catch (error: any) {
        toast({
          title: "Error Deleting Bot",
          description: error.message || "Could not delete the bot.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePlayground = (bot: { id: string; name: string; status: string }) => {
    setActiveBot(bot)
    onTabChange("playground")
  }

  const handleSettings = (bot: { id: string; name: string; status: string }) => {
    setActiveBot(bot)
    onTabChange("settings")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Digital Twins</h2>
          <p className="text-gray-400 mt-1">Manage and train your AI personas.</p>
        </div>
        <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-gray-300 px-3 py-1">
          {bots.length} / {currentLimit} Active
        </Badge>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-black hover:bg-gray-200 rounded-full font-medium"
                    disabled={isAtLimit}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Bot
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Bot</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Give your new AI assistant a name to get started. You can upload its knowledge base in the next step.
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
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button onClick={handleCreateBot} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? "Creating..." : "Create Bot"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </TooltipTrigger>
          {isAtLimit && (
            <TooltipContent className="bg-gray-800 text-white border-gray-700">
              <p>Upgrade your plan to create more bots</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Grid of Identity Cards */}
      {bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Bot className="h-12 w-12 text-gray-500 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No bots created yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first AI chatbot to get started.
            </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <div 
                key={bot.id} 
                className="group relative bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                 <Fingerprint className="h-24 w-24 text-white/5 absolute -top-4 -right-4 rotate-12" />
              </div>

              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                        {bot.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-medium text-green-400 uppercase tracking-wide">Live</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 truncate">{bot.name}</h3>
                <p className="text-sm text-gray-500 mb-6 font-mono text-xs">ID: {bot.id.substring(0, 12)}...</p>

                <div className="flex gap-3">
                  <GradientButton 
                    variant="variant" 
                    className="flex-1 h-10 px-4 text-sm rounded-lg min-w-0"
                    onClick={() => handlePlayground(bot)}
                  >
                    <Play className="mr-2 h-3.5 w-3.5" /> Launch
                  </GradientButton>
                  
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                    onClick={() => handleSettings(bot)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteBot(bot.id)}
                    className="h-10 w-10 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}