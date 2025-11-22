"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, Briefcase, Award, MessageSquare, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import Link from "next/link"

// Define the shape of a Candidate (Bot)
interface Candidate {
  id: string
  name: string
  summary?: string
  skills?: string[]
  experience_years?: number
  // Add other fields if your bot model has them
}

export function RecruiterSearchTab() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Candidate[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    setResults([])

    try {
      // --- THE FIX: Match the new backend "SearchRequest" model ---
      const data = await api.post("/recruiter/search", { 
        query: query 
      })
      
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search failed",
        description: "Could not fetch candidates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recruiter Search</h2>
        <p className="text-muted-foreground">
          Find the perfect candidate using AI-powered semantic search.
        </p>
      </div>

      {/* Search Input Section */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Describe your ideal candidate (e.g., 'Product Manager who has led agile teams and knows SQL')..." 
                className="pl-10 h-10 bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Find Talent"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Scanning candidate profiles...</p>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No candidates found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your query to be more descriptive about the skills or experience you need.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {results.map((candidate) => (
            <Card key={candidate.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={`/placeholder-user.jpg`} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                      {candidate.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-primary">{candidate.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {candidate.experience_years !== undefined && (
                             <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-medium">
                               <Briefcase className="h-3 w-3" />
                               {candidate.experience_years} Years Exp.
                             </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/embed/${candidate.id}`} target="_blank">
                           <MessageSquare className="h-4 w-4 mr-2" />
                           Chat
                         </Link>
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {candidate.summary || "No summary available."}
                    </p>

                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {candidate.skills.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 6 && (
                           <Badge variant="outline" className="text-xs text-muted-foreground">
                             +{candidate.skills.length - 6} more
                           </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}