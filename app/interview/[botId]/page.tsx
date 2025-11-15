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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

// Define the Bot (Candidate) type
interface Candidate {
  _id: string;
  name: string;
}

// --- AGORA CLIENT SETUP ---
// Use a ref to hold the Agora client and tracks, as they are not serializable
// and should not be in React state.
const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localMicTrack: IMicrophoneAudioTrack | null = null;
// --------------------------

export default function InterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const botId = params.botId as string;

  // App State
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Lobby State
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCamOn, setIsCamOn] = React.useState(false);
  
  // Call State
  const [callState, setCallState] = React.useState<"lobby" | "joining" | "in_call" | "leaving" | "error">(
    "lobby"
  );
  const [callStatusText, setCallStatusText] = React.useState("Listening...");

  // --- 1. FETCH CANDIDATE INFO ---
  React.useEffect(() => {
    if (!botId) return;

    const fetchBotInfo = async () => {
      setIsLoading(true);
      try {
        const botData = await api.get(`/bots/public/${botId}`);
        setCandidate(botData);
      } catch (err) {
        console.error("Failed to fetch bot info", err);
        setError("Could not find the candidate you are trying to call.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBotInfo();
  }, [botId]);

  // --- 2. JOIN CALL LOGIC ---
  const handleJoinCall = async () => {
    setCallState("joining");
    
    // Check for App ID
    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!AGORA_APP_ID) {
        setError("Agora App ID is not configured. Please contact support.");
        setCallState("error");
        return;
    }

    try {
      // 1. Fetch the Agora token from our backend
      const tokenResponse = await api.post("/agora/token", {
        channel_name: botId, // Use the botId as the channel name
      });
      
      const { token, channel_name, uid } = tokenResponse;

      // 2. Join the Agora channel
      await agoraClient.join(AGORA_APP_ID, channel_name, token, uid);

      // 3. Create and publish the microphone track
      if (isMicOn) {
        localMicTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await agoraClient.publish(localMicTrack);
      }
      
      // 4. Set "in_call" state
      setCallState("in_call");

    } catch (err: any) {
      console.error("Failed to join Agora channel", err);
      setError(`Failed to join call: ${err.message}`);
      setCallState("error");
    }
  };
  
  // --- 3. LEAVE CALL LOGIC ---
  const handleLeaveCall = async () => {
    setCallState("leaving");
    try {
      if (localMicTrack) {
        localMicTrack.stop();
        localMicTrack.close();
        localMicTrack = null;
      }
      await agoraClient.leave();
    } catch (err) {
      console.error("Error leaving call:", err);
    } finally {
      console.log("Left call.");
      router.push("/recruiter"); // Go back to recruiter dashboard
    }
  };
  
  // --- 4. HANDLE MIC TOGGLE ---
  const toggleMic = async () => {
     if (localMicTrack) {
        // We're in a call, so mute/unmute the track
        await localMicTrack.setMuted(!isMicOn);
        setIsMicOn(!isMicOn);
     } else {
        // We're in the lobby, just toggle the state
        setIsMicOn(!isMicOn);
     }
  };
  
  // --- 5. CLEANUP EFFECT ---
  // Ensure we leave the call if the component is unmounted (e.g., tab close)
  React.useEffect(() => {
    return () => {
      if (callState === "in_call") {
        handleLeaveCall();
      }
    };
  }, [callState]);
  
  
  // --- RENDER FUNCTIONS ---
  const renderLobby = () => (
    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center">Ready to join?</h1>
      <p className="text-center text-muted-foreground mt-2">
        You are about to start a live voice interview with {candidate?.name || "the AI candidate"}.
      </p>

      <div className="w-full aspect-video bg-muted rounded-lg my-6 flex items-center justify-center">
        <p className="text-muted-foreground">Camera is {isCamOn ? "on" : "off"}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="icon"
          className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
          onClick={toggleMic} // Use new toggle function
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
    const candidateName = candidate?.name || "AI";
    const avatarFallback = candidateName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
    
    return (
     <div className="w-full h-full max-w-5xl bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
            <Avatar className="h-48 w-48 border-4 border-primary/20">
                <AvatarFallback className="text-7xl">
                    {avatarFallback}
                </AvatarFallback>
            </Avatar>
            <h2 className="text-4xl font-bold mt-6">{candidateName} (AI)</h2>
            <p className="text-xl text-primary mt-2">{callStatusText}</p>
        </div>
        
        <div className="w-48 h-28 bg-muted rounded-lg absolute bottom-24 right-12 border border-border flex items-center justify-center text-sm text-muted-foreground">
            {isCamOn ? "Your Camera" : "Cam Off"}
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
            <Button
              size="icon"
              className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
              onClick={toggleMic} // Use new toggle function
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

  // --- Main render logic ---
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