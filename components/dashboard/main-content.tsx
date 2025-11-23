"use client";

import { 
  Plus, 
  Search, 
  Settings, 
  Users, 
  BarChart3, 
  Key, 
  FileText, 
  Zap,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// Import your existing tab components
import { MyBotsTab } from "./tabs/my-bots-tab";
import { RecruiterSearchTab } from "./tabs/recruiter-search-tab";
import { ResumeTab } from "./tabs/resume-tab";
import { UsageTab } from "./tabs/usage-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { ApiKeysTab } from "./tabs/api-keys-tab";

// --- ADDED INTERFACE TO MATCH DASHBOARD LAYOUT ---
interface MainContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentTier: string;
  setCurrentTier: (tier: string) => void;
  bots: any[];
  setBots: (bots: any[]) => void;
  activeBot: any;
  setActiveBot: (bot: any) => void;
  isLoadingBots: boolean;
}

export function MainContent({
  activeTab,
  onTabChange,
  currentTier,
  bots,
  setBots,
  activeBot,
  setActiveBot
}: MainContentProps) {
  
  const { user } = useAuth();
  // REMOVED local 'activeTab' state to use the one from props
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotContext, setNewBotContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Mock Stats for Premium Feel ---
  const stats = [
    { title: "Active Twins", value: "4", icon: Bot, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Interviews", value: "28", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Efficiency", value: "94%", icon: Zap, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  const handleCreateBot = async () => {
    setIsLoading(true);
    try {
      await api.post("/bots", { name: newBotName, context: newBotContext });
      setIsCreateDialogOpen(false);
      setNewBotName("");
      setNewBotContext("");
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to create bot", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 min-h-screen text-slate-100 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, <span className="text-blue-400 font-medium">{user?.full_name || "User"}</span></p>
          </div>
          
          <div className="flex items-center gap-3">
             <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Create Twin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Create New AI Twin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Candidate Name</Label>
                    <Input 
                        placeholder="e.g. John Doe" 
                        className="bg-slate-950 border-white/10 focus:border-blue-500"
                        value={newBotName}
                        onChange={(e) => setNewBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Context / Role</Label>
                    <Textarea 
                        placeholder="e.g. Senior React Developer with 5 years experience..." 
                        className="bg-slate-950 border-white/10 focus:border-blue-500 resize-none h-32"
                        value={newBotContext}
                        onChange={(e) => setNewBotContext(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="hover:bg-white/5">Cancel</Button>
                  <Button onClick={handleCreateBot} disabled={isLoading} className="bg-blue-600">
                    {isLoading ? "Creating..." : "Create Twin"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden group">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-${stat.color.split('-')[1]}-500/10`} />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                        <div className="text-3xl font-bold text-white mt-1">{stat.value}</div>
                    </div>
                    <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        {/* Use onTabChange from props instead of local state */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg w-full md:w-auto overflow-x-auto flex justify-start md:inline-flex">
            <PremiumTabTrigger value="my-bots" icon={Bot} label="My Twins" />
            {/* MATCH VALUE WITH SIDEBAR (search-talent) */}
            <PremiumTabTrigger value="search-talent" icon={Search} label="Search" />
            <PremiumTabTrigger value="resume" icon={FileText} label="Resumes" />
            <PremiumTabTrigger value="usage" icon={BarChart3} label="Usage" />
            <PremiumTabTrigger value="api-keys" icon={Key} label="API Keys" />
            <PremiumTabTrigger value="settings" icon={Settings} label="Settings" />
          </TabsList>

          <div className="min-h-[400px] mt-6">
            <TabsContent value="my-bots" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              {/* PASS REQUIRED PROPS TO MYBOTSTAB */}
              <MyBotsTab 
                currentTier={currentTier}
                bots={bots}
                setBots={setBots}
                activeBot={activeBot}
                setActiveBot={setActiveBot}
                onTabChange={onTabChange}
              />
            </TabsContent>
            
            <TabsContent value="search-talent" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <RecruiterSearchTab />
            </TabsContent>

            <TabsContent value="resume" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <ResumeTab />
            </TabsContent>
            
            <TabsContent value="usage" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <UsageTab />
            </TabsContent>

            <TabsContent value="api-keys" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <ApiKeysTab />
            </TabsContent>

            <TabsContent value="settings" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function PremiumTabTrigger({ value, icon: Icon, label }: { value: string, icon: any, label: string }) {
    return (
        <TabsTrigger 
            value={value}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
        >
            <Icon className="h-4 w-4" />
            {label}
        </TabsTrigger>
    );
}