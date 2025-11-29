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
  { id: "interviews", label: "Interviews", icon: Mic }, 
  { id: "settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  user: any;
  activeTab: string
  onTabChange: (tab: string) => void
  hasActiveBot: boolean
}

export function Sidebar({ user, activeTab, onTabChange, hasActiveBot }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth();

  const items = user?.role === "recruiter" ? recruiterItems : candidateItems;

  return (
    <nav
      className={cn(
        "flex flex-col h-full transition-all duration-300 z-20",
        // UPDATED: Glassmorphic styles
        "bg-black/20 backdrop-blur-xl border-r border-white/5", 
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 h-[80px]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">TwinlyAI</h1>
            {user?.role === "recruiter" && <Badge variant="outline" className="ml-1 text-[10px] h-5 border-blue-500/30 text-blue-300">Hiring</Badge>}
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-400 hover:text-white hover:bg-white/5">
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {items.map((item) => {
            const Icon = item.icon
            return (
                <Button
                key={item.id}
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-4 font-medium transition-all duration-200 h-12 rounded-xl",
                    activeTab === item.id 
                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5" 
                        : "text-gray-400 hover:text-white hover:bg-white/5",
                    isCollapsed && "justify-center px-0",
                )}
                onClick={() => onTabChange(item.id)}
                >
                <Icon className={cn("h-5 w-5", activeTab === item.id ? "text-blue-400" : "text-gray-500 group-hover:text-white")} />
                {!isCollapsed && <span>{item.label}</span>}
                </Button>
            )
        })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-10 w-10 border-2 border-white/10 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "Candidate"}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-4 text-gray-400 hover:text-red-400 hover:bg-red-500/10",
            isCollapsed ? "justify-center px-0" : "justify-start gap-3",
          )}
          onClick={() => { logout(); window.location.href = "/auth"; }}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </nav>
  )
}