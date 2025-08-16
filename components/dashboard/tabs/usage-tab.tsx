import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function UsageTab() {
  const usageData = {
    queriesThisMonth: 247,
    tokensUsed: 15420,
    currentPlan: "Free Tier",
    monthlyQueryLimit: 1000,
  }

  const usagePercentage = (usageData.queriesThisMonth / usageData.monthlyQueryLimit) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usage Metrics</h1>
        <p className="text-muted-foreground">Monitor your chatbot usage and plan limits.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics</CardTitle>
          <CardDescription>Your current usage statistics</CardDescription>
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
