"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare, Bot, KeyRound, Code, BarChart, Settings, LogOut,
  ChevronLeft, ChevronRight, FileText, Search, Mic
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/context/AuthContext"

// Define role-based Navigation Items
const candidateItems = [
  { id: "my-bots", label: "My Bots", icon: Bot },
  { id: "resume", label: "Resume", icon: FileText },
  { id: "playground", label: "Playground", icon: MessageSquare },
  { id: "embed", label: "Embed Widget", icon: Code },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "usage", label: "Usage", icon: BarChart },
  { id: "settings", label: "Settings", icon: Settings },
]

const recruiterItems = [
  { id: "search-talent", label: "Search Talent", icon: Search },
  // Future features can go here
  { id: "interviews", label: "Interviews", icon: Mic }, 
  { id: "settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  user: any; // Using any for simplicity, or import User type
  activeTab: string
  onTabChange: (tab: string) => void
  hasActiveBot: boolean
}

export function Sidebar({ user, activeTab, onTabChange, hasActiveBot }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth();

  // Decide which items to show
  const items = user?.role === "recruiter" ? recruiterItems : candidateItems;

  return (
    <nav
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 z-20 shadow-sm",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-[65px]">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">TwinlyAI</h1>
            {user?.role === "recruiter" && <Badge variant="outline" className="ml-1 text-[10px] h-5">Hiring</Badge>}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
            const Icon = item.icon
            return (
                <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                    "w-full justify-start gap-3 font-medium transition-all duration-200",
                    activeTab === item.id ? "bg-blue-50 text-blue-700 shadow-sm" : "text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center px-2",
                )}
                onClick={() => onTabChange(item.id)}
                >
                <Icon className={cn("h-4 w-4", activeTab === item.id ? "text-blue-600" : "text-muted-foreground")} />
                {!isCollapsed && <span>{item.label}</span>}
                </Button>
            )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || "Candidate"}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-3 text-muted-foreground hover:text-red-500 hover:bg-red-50",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3",
          )}
          onClick={() => { logout(); window.location.href = "/auth"; }}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </nav>
  )
}