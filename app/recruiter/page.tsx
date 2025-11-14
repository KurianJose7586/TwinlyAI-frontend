"use client";

import * as React from "react";
import {
  Search,
  Users,
  Briefcase,
  Code,
  Star,
  Mic,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- MOCK DATA ---
// When the backend is fixed, we will replace this with an API call.
const MOCK_CANDIDATES = [
  {
    id: "1",
    name: "Dr. Evelyn Reed",
    summary:
      "Ph.D. in Computer Science with 12+ years experience in large-scale distributed systems and real-time data pipelines. Proven leader in ML infrastructure.",
    skills: [
      "Python",
      "Go",
      "Kafka",
      "Kubernetes",
      "TensorFlow",
      "GCP",
      "Distributed Systems",
    ],
    experience_years: 12.5,
    avatar: "/professional-female-product-manager-avatar.png",
  },
  {
    id: "2",
    name: "Marcus Chen",
    summary:
      "Full-stack engineer with a passion for building beautiful, user-centric interfaces. 5 years at a high-growth fintech startup.",
    skills: ["React", "TypeScript", "Node.js", "FastAPI", "PostgreSQL", "AWS"],
    experience_years: 5.0,
    avatar: "/professional-male-developer-avatar.png",
  },
  {
    id: "3",
    name: "Jasmine Al-Farsi",
    summary:
      "Open-source contributor and Python developer. Specialized in building and maintaining backend APIs for financial services. Strong background in data validation.",
    skills: ["Python", "FastAPI", "SQLAlchemy", "MongoDB", "Pytest", "Docker"],
    experience_years: 3.0,
    avatar: "https://placehold.co/128x128/7F56D9/FFFFFF?text=JA",
  },
  {
    id: "4",
    name: "Kenji Tanaka",
    summary:
      "DevOps and Cloud Infrastructure expert. Manages CI/CD pipelines and production environments for over 50 microservices. Certified Kubernetes Administrator.",
    skills: ["Kubernetes", "Terraform", "Ansible", "AWS", "Prometheus", "Grafana"],
    experience_years: 7.0,
    avatar: "https://placehold.co/128x128/027A48/FFFFFF?text=KT",
  },
];

type Candidate = (typeof MOCK_CANDIDATES)[0];
// --- END MOCK DATA ---

/**
 * CandidateCard Component: Displays a single candidate's profile.
 * All components are in this file for a single-file drop-in.
 */
function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary/20">
        <AvatarImage src={candidate.avatar} alt={candidate.name} />
        <AvatarFallback>
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
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
        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20">
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredCandidates, setFilteredCandidates] =
    React.useState(MOCK_CANDIDATES);

  // A simple mock search.
  // This will be replaced by an API call.
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setFilteredCandidates(MOCK_CANDIDATES);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const results = MOCK_CANDIDATES.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.summary.toLowerCase().includes(lowerQuery) ||
        c.skills.some((s) => s.toLowerCase().includes(lowerQuery))
    );
    setFilteredCandidates(results);
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Page Header */}
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
            <Button variant="outline">Sign Out</Button>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 pr-28 rounded-full text-base"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 px-6"
          >
            Search
          </Button>
        </form>

        {/* Candidate List */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Showing {filteredCandidates.length} results
          </h2>
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="text-center py-20 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No candidates found.</p>
              <p className="text-sm text-muted-foreground/80">
                Try a different search query.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}