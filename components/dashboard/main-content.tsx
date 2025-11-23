"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Settings, 
  Users, 
  BarChart3, 
  Cpu, 
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import your existing tab components
// Ensure these files export the components exactly as named here
import { MyBotsTab } from "./tabs/my-bots-tab";
import { RecruiterSearchTab } from "./tabs/recruiter-search-tab";
import { ResumeTab } from "./tabs/resume-tab";
import { UsageTab } from "./tabs/usage-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { ApiKeysTab } from "./tabs/api-keys-tab";

export function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-bots");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotContext, setNewBotContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simplified stats configuration to avoid runtime errors
  const stats = [
    { 
      title: "Active Twins", 
      value: "4", 
      icon: Bot, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10",
      gradient: "to-blue-500/10"
    },
    { 
      title: "Interviews", 
      value: "28", 
      icon: Users, 
      color: "text-purple-400", 
      bg: "bg-purple-500/10",
      gradient: "to-purple-500/10" 
    },
    { 
      title: "Efficiency", 
      value: "94%", 
      icon: Zap, 
      color: "text-green-400", 
      bg: "bg-green-500/10",
      gradient: "to-green-500/10" 
    },
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
            <p className="text-slate-400 mt-1">
              Welcome back, <span className="text-blue-400 font-medium">{user?.full_name || "Recruiter"}</span>
            </p>
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
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent ${stat.gradient}`} />
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg w-full md:w-auto overflow-x-auto flex justify-start md:inline-flex">
            
            <TabsTrigger 
                value="my-bots"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <Bot className="h-4 w-4" /> My Twins
            </TabsTrigger>

            <TabsTrigger 
                value="recruiter-search"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <Search className="h-4 w-4" /> Search
            </TabsTrigger>

            <TabsTrigger 
                value="resume"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <FileText className="h-4 w-4" /> Resumes
            </TabsTrigger>

            <TabsTrigger 
                value="usage"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <BarChart3 className="h-4 w-4" /> Usage
            </TabsTrigger>

            <TabsTrigger 
                value="api-keys"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <Key className="h-4 w-4" /> API Keys
            </TabsTrigger>

            <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white transition-all px-4 py-2 rounded-md flex items-center gap-2"
            >
                <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>

          </TabsList>

          <div className="min-h-[400px] mt-6">
            <TabsContent value="my-bots" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <MyBotsTab />
            </TabsContent>
            
            <TabsContent value="recruiter-search" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
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