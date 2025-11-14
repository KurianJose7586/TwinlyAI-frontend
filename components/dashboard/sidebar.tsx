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
  FileText,
  Users, // <-- ADD THIS IMPORT
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/context/AuthContext"
import { Separator } from "@/components/ui/separator" // <-- ADD THIS IMPORT

// Define a type for the user object
interface User {
  id: string;
  email: string;
}

interface SidebarProps {
  user: User | null; // <-- Accept the user object as a prop
  activeTab: string
  onTabChange: (tab: string) => void
  hasActiveBot: boolean
}

const navigationItems = [
  { id: "my-bots", label: "My Bots", icon: Bot, requiresBot: false },
  { id: "resume", label: "Resume", icon: FileText, requiresBot: true },
  { id: "playground", label: "Playground", icon: MessageSquare, requiresBot: true },
  { id: "embed", label: "Embed Widget", icon: Code, requiresBot: true },
  { id: "api-keys", label: "API Keys", icon: KeyRound, requiresBot: true },
  { id: "usage", label: "Usage", icon: BarChart, requiresBot: true },
  { id: "settings", label: "Settings", icon: Settings, requiresBot: true },
]

export function Sidebar({ user, activeTab, onTabChange, hasActiveBot }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth(); // Get logout function from context

  const handleLogout = () => {
    logout();
    window.location.href = "/auth" // Redirect after logout
  }

  return (
    <nav
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sidebar-foreground">TwinlyAI</h1>
            <Badge variant="secondary">v0.1 Beta</Badge>
          </div>
        )}
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

        {/* --- NEW RECRUITER SECTION --- */}
        <Separator className="my-2 bg-sidebar-border" />
        <Button
          variant={activeTab === "recruiter" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3",
            activeTab === "recruiter"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-2",
          )}
          onClick={() => window.location.href = "/recruiter"} // Use a full page navigation
          data-testid="nav-recruiter"
        >
          <Users className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Recruiter</span>}
        </Button>
        {/* --- END OF NEW SECTION --- */}

      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            {/* Display the first letter of the user's email */}
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              {/* Display the full user email, or a loading state */}
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email || "Loading..."}
              </p>
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