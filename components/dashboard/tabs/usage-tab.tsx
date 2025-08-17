"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

interface UsageTabProps {
  activeBot: { id: number; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function UsageTab({ activeBot, onTabChange }: UsageTabProps) {
  const usageData = {
    queriesThisMonth: 247,
    tokensUsed: 15420,
    currentPlan: "Free Tier",
    monthlyQueryLimit: 1000,
  }

  const usagePercentage = (usageData.queriesThisMonth / usageData.monthlyQueryLimit) * 100

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
          You need to select a bot before you can view its usage metrics.
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
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Usage Metrics for: {activeBot.name}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Usage Metrics</h1>
        <p className="text-muted-foreground">Monitor usage and plan limits for "{activeBot.name}".</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics for {activeBot.name}</CardTitle>
          <CardDescription>Current usage statistics for this bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Queries This Month</p>
              <p className="text-2xl font-bold">{usageData.queriesThisMonth.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tokens Used</p>
              <p className="text-2xl font-bold">{usageData.tokensUsed.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <Badge variant="secondary" className="text-sm">
                {usageData.currentPlan}
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Query Usage</span>
              <span>
                {usageData.queriesThisMonth} / {usageData.monthlyQueryLimit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(usagePercentage)}% of monthly limit used</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
