"use client";

import { 
  Plus, 
  Search, 
  Settings, 
  Users, 
  BarChart3, 
  Key, 
  FileText, 
  Bot,
  MessageSquare, 
  Code 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

import { MyBotsTab } from "./tabs/my-bots-tab";
import { RecruiterSearchTab } from "./tabs/recruiter-search-tab";
import { ResumeTab } from "./tabs/resume-tab";
import { UsageTab } from "./tabs/usage-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { ApiKeysTab } from "./tabs/api-keys-tab";
import { ChatTab } from "./tabs/chat-tab"; 
import { EmbedTab } from "./tabs/embed-tab"; 

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotContext, setNewBotContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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
    <div className="flex-1 p-8 overflow-y-auto min-h-screen relative">
      
      {/* Ambient Glow Behind Content */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">{greeting}, <span className="text-blue-400">{user?.full_name?.split(' ')[0] || "User"}</span></h1>
            <p className="text-slate-400 mt-2 text-lg">Here's what's happening with your AI twins today.</p>
          </div>
          
          <div className="flex items-center gap-3"> 
             <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-6 shadow-lg shadow-white/10 transition-all hover:scale-105">
                  <Plus className="mr-2 h-4 w-4" /> Create Twin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0A0A] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Create New AI Twin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Candidate Name</Label>
                    <Input 
                        placeholder="e.g. John Doe" 
                        className="bg-white/5 border-white/10 focus:border-blue-500"
                        value={newBotName}
                        onChange={(e) => setNewBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Context / Role</Label>
                    <Textarea 
                        placeholder="e.g. Senior React Developer with 5 years experience..." 
                        className="bg-white/5 border-white/10 focus:border-blue-500 resize-none h-32"
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

        {/* Removed Stats Section entirely as requested */}

        {/* Main Content Tabs - No Tab List, Controlled by Sidebar */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          {/* Hidden Tab List for structure compatibility */}
          <div className="hidden">
             {/* ... triggers ... */}
          </div>

          <div className="min-h-[400px]">
            <TabsContent value="my-bots" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <MyBotsTab 
                currentTier={currentTier}
                bots={bots}
                setBots={setBots}
                activeBot={activeBot}
                setActiveBot={setActiveBot}
                onTabChange={onTabChange}
              />
            </TabsContent>
            
            <TabsContent value="search-talent" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <RecruiterSearchTab />
            </TabsContent>

            <TabsContent value="resume" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <ResumeTab 
                activeBot={activeBot}
                onTabChange={onTabChange}
              />
            </TabsContent>
            
            <TabsContent value="playground" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <ChatTab 
                activeBot={activeBot}
                onTabChange={onTabChange}
              />
            </TabsContent>

            <TabsContent value="embed" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <EmbedTab 
                activeBot={activeBot}
                onTabChange={onTabChange}
              />
            </TabsContent>

            <TabsContent value="usage" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <UsageTab 
                activeBot={activeBot}
                onTabChange={onTabChange}
              />
            </TabsContent>

            <TabsContent value="api-keys" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <ApiKeysTab 
                activeBot={activeBot}
                onTabChange={onTabChange}
              />
            </TabsContent>

            <TabsContent value="settings" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 outline-none">
              <SettingsTab 
                activeBot={activeBot}
                setActiveBot={setActiveBot}
                bots={bots}
                setBots={setBots}
                onTabChange={onTabChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}