"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsageTabProps {
  activeBot: { id: string; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function UsageTab({ activeBot, onTabChange }: UsageTabProps) {

  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  // A check to ensure a bot is selected, for consistency with other tabs.
  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Please select a bot to view usage details</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Choose a bot from the 'My Bots' page to see its usage information.
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
        <h1 className="text-2xl font-bold text-foreground">Usage</h1>
        <p className="text-muted-foreground">
          Track your bot's interactions and resource consumption.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Construction className="h-16 w-16 text-yellow-500 mb-6" />
          <h3 className="text-xl font-bold text-foreground mb-2">This Tab is a Work in Progress</h3>
          <p className="text-muted-foreground max-w-md">
            Usage tracking and plan limits will be available here soon.
          </p>
          <p className="text-sm font-semibold text-foreground mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            For now, TwinlyAI is free for all beta users. Enjoy full access!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}