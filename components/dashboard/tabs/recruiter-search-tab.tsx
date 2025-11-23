"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, Ghost, Loader2, PhoneCall } from "lucide-react"; // Imported PhoneCall for the contact button
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Imported useRouter for navigation

export function RecruiterSearchTab() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // FIX: CHANGED FROM GET TO POST TO MATCH BACKEND
      const data = await api.post("/recruiter/search", { 
        query: query 
      });
      
      setResults(data || []); 
    } catch (error) {
      console.error("Search failed", error);
      toast({
        title: "Search failed",
        description: "Could not fetch candidates. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewProfile = (botId: string) => {
      // Navigate to the interview page for the specific bot (used as profile view)
      router.push(`/interview/${botId}`);
  }

  // NOTE: The Contact button is a placeholder action.
  const handleContact = (candidateName: string) => {
      toast({
          title: "Contact initiated",
          description: `Contacting ${candidateName} via TwinlyAI messaging service.`,
          variant: "default",
      });
  }

  return (
    <div className="space-y-6">
      {/* --- Search Bar --- */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by role, skill (e.g. 'React Developer', 'Python')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 h-12"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 h-12 px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Find Talent"
          )}
        </Button>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {/* 1. INITIAL STATE (No search yet) */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/5 rounded-xl border border-white/10 border-dashed animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center ring-1 ring-blue-500/20">
            <Search className="h-10 w-10" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-semibold text-white">Find Your Perfect Candidate</h3>
            <p className="text-slate-400">
              Enter skills, job titles, or keywords above to search through our database of AI-verified talent.
            </p>
          </div>
        </div>
      )}

      {/* 2. NO RESULTS STATE */}
      {hasSearched && !isLoading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
            <Ghost className="h-8 w-8" />
          </div>
          <p className="text-slate-400">No candidates found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* 3. RESULTS GRID */}
      {hasSearched && results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.map((candidate, index) => (
            <Card key={candidate.id || index} className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all hover:bg-white/[0.07] overflow-hidden group">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar className="h-12 w-12 border border-white/10">
                  <AvatarImage src={candidate.avatar_url || "/public/placeholder-user.jpg"} />
                  <AvatarFallback className="bg-slate-800 text-blue-400">
                    {candidate.name?.substring(0, 2).toUpperCase() || "CN"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-white truncate">
                    {candidate.name || "Unknown Candidate"}
                  </CardTitle>
                  <div className="flex items-center text-sm text-slate-400 mt-1">
                    <Briefcase className="mr-1 h-3 w-3" />
                    <span className="truncate">{candidate.role || "Open to work"}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-slate-400">
                  <MapPin className="mr-2 h-3 w-3 text-slate-500" />
                  {candidate.location || "Remote"}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills || []).slice(0, 3).map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-0">
                      {skill}
                    </Badge>
                  ))}
                  {(candidate.skills || []).length > 3 && (
                    <Badge variant="outline" className="text-slate-500 border-slate-700">
                      +{candidate.skills.length - 3}
                    </Badge>
                  )}
                </div>

                {/* UI FIX APPLIED: Button visibility improved */}
                <div className="pt-2 flex gap-2">
                   {/* FUNCTIONALITY ADDED: View Profile navigates to the interview page */}
                   <Button 
                        onClick={() => handleViewProfile(candidate.id)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
                   >
                      View Profile
                   </Button>
                   
                   {/* UI FIX: Added PhoneCall icon to the Contact button */}
                   <Button 
                        onClick={() => handleContact(candidate.name)}
                        className="w-full bg-blue-600 hover:bg-blue-500"
                   >
                       <PhoneCall className="h-4 w-4 mr-1.5" />
                      Contact
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}