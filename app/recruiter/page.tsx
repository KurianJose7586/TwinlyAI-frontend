"use client";

import * as React from "react";
import {
  Search,
  Users,
  Mic,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Define the Bot (Candidate) type ---
interface Candidate {
  _id: string;
  name: string;
  user_id: string;
  summary: string;
  skills: string[];
  experience_years: number;
}
// ---

/**
 * Helper Function: De-duplicate candidates
 */
const deDuplicateCandidates = (candidates: Candidate[]): Candidate[] => {
  const uniqueCandidates = new Map<string, Candidate>();
  
  for (const candidate of candidates) {
    if (!uniqueCandidates.has(candidate.name)) {
      uniqueCandidates.set(candidate.name, candidate);
    }
  }
  
  return Array.from(uniqueCandidates.values());
};

/**
 * CandidateCard Component: Displays a single candidate's profile.
 */
function CandidateCard({ candidate }: { candidate: Candidate }) {
  const router = useRouter(); 
  
  const avatarFallback = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleStartInterview = () => {
    router.push(`/interview/${candidate._id}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary/20">
        {/* Note: Using AvatarFallback as the primary display */}
        <AvatarFallback className="text-3xl">{avatarFallback}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            {candidate.name}
          </h2>
          <Badge
            variant="outline"
            className="mt-1 sm:mt-0 text-primary-foreground bg-primary border-primary"
          >
            {candidate.experience_years} Years Experience
          </Badge>
        </div>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          {candidate.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.skills.slice(0, 7).map((skill) => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 7 && (
            <Badge variant="outline" className="font-normal">
              +{candidate.skills.length - 7} more
            </Badge>
          )}
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 self-stretch justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
        <Button 
          className="w-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={handleStartInterview} 
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Voice Interview
        </Button>
        <Button variant="outline" className="w-full">
          View Profile
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

/**
 * RecruiterPage Component: The main search dashboard.
 */
export default function RecruiterPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setCandidates([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results: Candidate[] = await api.post("/recruiter/search", {
        query: searchQuery,
      });
      const uniqueResults = deDuplicateCandidates(results);
      setCandidates(uniqueResults);
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "An unknown error occurred during search.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Recruiter Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Find your next perfect candidate.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Back to My Bots</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative mb-8 w-full max-w-3xl mx-auto"
        >
          <Input
            type="search"
            placeholder="e.g., 'Python engineer with fintech experience'"
            value={searchQuery}
            // --- THIS IS THE FIX ---
            onChange={(e) => setSearchQuery(e.target.value)} // Changed "e.g." to "e"
            // --- END OF FIX ---
            className="h-14 pl-12 pr-28 rounded-full text-base"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 px-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Search Failed</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Candidate List */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {isLoading ? "Searching..." : `Showing ${candidates.length} results`}
          </h2>
          
          {!isLoading && candidates.length > 0 && (
            candidates.map((candidate) => (
              <CandidateCard key={candidate._id} candidate={candidate} />
            ))
          )}
          
          {!isLoading && candidates.length === 0 && (
            <div className="text-center py-20 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No candidates found.</p>
              <p className="text-sm text-muted-foreground/80">
                Try a different search query or upload more resumes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}