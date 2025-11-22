"use client";

import * as React from "react";
import { Search, Mic, ChevronRight, Loader2, Sparkles, MapPin, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Candidate {
  _id: string;
  name: string;
  summary: string;
  skills: string[];
  experience_years: number;
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const router = useRouter(); 
  const avatarFallback = candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-bold">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                {candidate.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{candidate.experience_years} Years Exp.</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {candidate.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {candidate.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="secondary" className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 5 && (
             <span className="text-xs text-muted-foreground self-center ml-1">+{candidate.skills.length - 5} more</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-muted/30 border-t border-border/50 flex gap-3">
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => router.push(`/interview/${candidate._id}`)}
        >
          <Mic className="h-4 w-4 mr-2" />
          Interview
        </Button>
        <Button variant="outline" className="px-3 border-input hover:bg-accent">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function RecruiterSearchTab() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await api.post("/recruiter/search", { query: searchQuery });
      // Deduplicate
      const unique = Array.from(new Map(results.map((c: any) => [c.name, c])).values());
      setCandidates(unique as Candidate[]);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Find Your Perfect <span className="text-blue-600">Twin</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe your ideal candidate in natural language. Our AI understands intent, not just keywords.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full -z-10" />
        <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="e.g. 'Senior React developer who knows financial modeling'" 
                className="h-14 pl-12 pr-32 rounded-full border-2 border-border/50 shadow-xl bg-background/80 backdrop-blur-xl focus-visible:ring-blue-500/30 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
                type="submit" 
                disabled={isLoading}
                className="absolute right-2 h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
        </form>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {isLoading ? (
             // Skeleton Loading
             Array.from({length:3}).map((_, i) => (
                <div key={i} className="h-[300px] rounded-xl bg-muted/20 animate-pulse" />
             ))
        ) : candidates.length > 0 ? (
            candidates.map((candidate) => (
                <CandidateCard key={candidate._id} candidate={candidate} />
            ))
        ) : hasSearched ? (
            <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No candidates found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search query to be more specific.</p>
            </div>
        ) : null}
      </div>
      
      {!hasSearched && (
         <div className="text-center mt-20 opacity-50">
            <Sparkles className="h-12 w-12 mx-auto text-blue-300 mb-4" />
            <p className="text-sm text-muted-foreground">Powered by TwinlyAI Semantic Search Engine</p>
         </div>
      )}
    </div>
  );
}