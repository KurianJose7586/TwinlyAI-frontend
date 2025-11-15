"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils"; // <-- Import cn

// Define the Bot (Candidate) type
interface Candidate {
  _id: string;
  name: string;
}

export default function InterviewPage() {
  // --- THIS IS THE FIX ---
  // Removed the extra "}"
  const { user } = useAuth();
  // --- END OF FIX ---
  
  const router = useRouter();
  const params = useParams();
  const botId = params.botId as string;

  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCamOn, setIsCamOn] = React.useState(false); // Default to cam off
  
  // Call State
  const [callState, setCallState] = React.useState<"lobby" | "joining" | "in_call" | "leaving" | "error">(
    "lobby"
  );

  // Fetch candidate info (bot name) on page load
  React.useEffect(() => {
    if (!botId) return;

    const fetchBotInfo = async () => {
      setIsLoading(true);
      try {
        // We use the public bot info endpoint
        const botData = await api.get(`/bots/public/${botId}`);
        setCandidate(botData);
      } catch (err) { // This fix is also included
        console.error("Failed to fetch bot info", err);
        setError("Could not find the candidate you are trying to call.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotInfo();
  }, [botId]);

  const handleJoinCall = async () => {
    setCallState("joining");
    // --- In the next step, we will add logic here to ---
    // 1. Fetch the Agora token from our backend
    // 2. Initialize the Agora client
    // 3. Join the channel
    
    // Simulate joining for now
    setTimeout(() => {
      console.log("Joining call with bot:", botId);
      setCallState("in_call");
    }, 2000);
  };
  
  const handleLeaveCall = () => {
    setCallState("leaving");
    // In the next step, we'll add logic to leave the Agora channel
    console.log("Leaving call...");
    setTimeout(() => {
      router.push("/recruiter"); // Go back to recruiter dashboard
    }, 1000);
  };
  
  // --- Render Functions ---

  const renderLobby = () => (
    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center">Ready to join?</h1>
      <p className="text-center text-muted-foreground mt-2">
        You are about to start a live voice interview with {candidate?.name || "the AI candidate"}.
      </p>

      {/* "Self-View" Placeholder */}
      <div className="w-full aspect-video bg-muted rounded-lg my-6 flex items-center justify-center">
        <p className="text-muted-foreground">Camera is {isCamOn ? "on" : "off"}</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          size="icon"
          className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
          onClick={() => setIsMicOn(!isMicOn)}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          size="icon"
          className={cn("rounded-full h-12 w-12", isCamOn ? "bg-primary" : "bg-muted text-muted-foreground")}
          onClick={() => setIsCamOn(!isCamOn)}
        >
          {isCamOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
      </div>

      <Button
        size="lg"
        className="w-full mt-8"
        onClick={handleJoinCall}
        disabled={callState === "joining"}
      >
        {callState === "joining" ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : null}
        Join Now
      </Button>
    </div>
  );
  
  const renderInCall = () => {
    // This fix for the 'split' error is also included
    const candidateName = candidate?.name || "AI";
    const avatarFallback = candidateName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
    
    return (
     <div className="w-full h-full max-w-5xl bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col">
        {/* Main Call View - The AI Bot */}
        <div className="flex-1 flex flex-col items-center justify-center">
            <Avatar className="h-48 w-48 border-4 border-primary/20">
                <AvatarFallback className="text-7xl">
                    {avatarFallback}
                </AvatarFallback>
            </Avatar>
            <h2 className="text-4xl font-bold mt-6">{candidateName} (AI)</h2>
            <p className="text-xl text-primary mt-2">Listening...</p>
        </div>
        
        {/* Recruiter's "Self-View" Placeholder */}
        <div className="w-48 h-28 bg-muted rounded-lg absolute bottom-24 right-12 border border-border flex items-center justify-center text-sm text-muted-foreground">
            {isCamOn ? "Your Camera" : "Cam Off"}
        </div>
        
        {/* Call Controls */}
        <div className="flex justify-center gap-4 mt-8">
            <Button
              size="icon"
              className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="rounded-full h-12 w-12"
              onClick={handleLeaveCall}
              disabled={callState === "leaving"}
            >
              {callState === "leaving" ? <Loader2 className="h-6 w-6 animate-spin" /> : <PhoneOff className="h-6 w-6" />}
            </Button>
        </div>
     </div>
    );
  };

  // Main render logic
  const renderContent = () => {
    if (isLoading) {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    }
    
    if (error) {
       return (
         <div className="w-full max-w-lg bg-card border-destructive/50 border rounded-2xl shadow-xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground mt-2 mb-6">{error}</p>
            <Button variant="outline" onClick={() => router.push("/recruiter")}>
                Back to Dashboard
            </Button>
         </div>
       );
    }
    
    if (callState === "in_call" || callState === "leaving") {
        return renderInCall();
    }
    
    return renderLobby();
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}