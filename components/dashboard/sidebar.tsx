"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Bot,
  KeyRound,
  Code,
  BarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText, // <-- Import FileText icon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasActiveBot: boolean // <-- Add this prop to receive the active bot status
}

const navigationItems = [
  { id: "my-bots", label: "My Bots", icon: Bot, requiresBot: false },
  { id: "resume", label: "Resume", icon: FileText, requiresBot: true }, // <-- Add Resume tab
  { id: "playground", label: "Playground", icon: MessageSquare, requiresBot: true },
  { id: "embed", label: "Embed Widget", icon: Code, requiresBot: true },
  { id: "api-keys", label: "API Keys", icon: KeyRound, requiresBot: true },
  { id: "usage", label: "Usage", icon: BarChart, requiresBot: true },
  { id: "settings", label: "Settings", icon: Settings, requiresBot: true },
]

export function Sidebar({ activeTab, onTabChange, hasActiveBot }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/auth"
  }

  return (
    <nav
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && <h1 className="text-xl font-bold text-sidebar-foreground">TwinlyAI</h1>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          data-testid="sidebar-toggle"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isDisabled = item.requiresBot && !hasActiveBot

          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-2",
              )}
              onClick={() => onTabChange(item.id)}
              disabled={isDisabled}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">U</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">user@example.com</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed ? "justify-center px-2" : "justify-start gap-3",
          )}
          onClick={handleLogout}
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </nav>
  )
}