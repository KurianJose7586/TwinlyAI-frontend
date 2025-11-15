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
  ICameraVideoTrack,
} from "agora-rtc-sdk-ng";

// --- AGORA CLIENT SETUP ---
const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localMicTrack: IMicrophoneAudioTrack | null = null;
let localCamTrack: ICameraVideoTrack | null = null;
// --------------------------

// Define the Bot (Candidate) type
interface Candidate {
  _id: string;
  name: string;
}

export default function InterviewPage() {
  const { user } = useAuth(); // <-- Fix 1 (Syntax)
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
  const selfViewRef = React.useRef<HTMLDivElement>(null);
  
  // Call State
  const [callState, setCallState] = React.useState<"lobby" | "joining" | "in_call" | "leaving" | "error">(
    "lobby"
  );
  const [callStatusText, setCallStatusText] = React.useState("Connecting...");
  const [remoteUser, setRemoteUser] = React.useState<IAgoraRTCRemoteUser | null>(null);

  // --- 1. FETCH CANDIDATE INFO ---
  React.useEffect(() => {
    if (!botId) return;
    const fetchBotInfo = async () => {
      setIsLoading(true);
      try {
        const botData = await api.get(`/bots/public/${botId}`);
        setCandidate(botData);
      } catch (err) { // <-- Fix 2 (Typo)
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
    
    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!AGORA_APP_ID) {
        setError("Agora App ID is not configured. Please contact support.");
        setCallState("error");
        return;
    }

    try {
      // 1. Fetch the Agora token
      const tokenResponse = await api.post("/agora/token", {
        channel_name: botId,
      });
      const { token, channel_name, uid } = tokenResponse;

      // 2. Join the Agora channel
      await agoraClient.join(AGORA_APP_ID, channel_name, token, uid);

      // 3. Subscribe to remote users (the AI)
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        console.log("Subscribed to remote user:", user);
        setRemoteUser(user);
        
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setCallStatusText("Speaking..."); // AI is talking
        }
        
        if(user.audioTrack) {
            user.audioTrack.on("track-ended", () => {
                setCallStatusText("Listening...");
            });
        }
      });

      agoraClient.on("user-left", (user) => {
        console.log("Remote user left:", user);
        setRemoteUser(null);
        setCallStatusText("AI has left the call.");
      });

      // 4. Create and publish local tracks (Mic and optional Camera)
      const tracksToPublish = [];
      if (isMicOn) {
        localMicTrack = await AgoraRTC.createMicrophoneAudioTrack();
        tracksToPublish.push(localMicTrack);
      }
      if (isCamOn && selfViewRef.current) {
        localCamTrack = await AgoraRTC.createCameraVideoTrack();
        tracksToPublish.push(localCamTrack);
        localCamTrack.play(selfViewRef.current);
      }
      
      if (tracksToPublish.length > 0) {
        await agoraClient.publish(tracksToPublish);
      }
      
      setCallState("in_call");
      setCallStatusText("Listening...");
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
      if (localCamTrack) {
        localCamTrack.stop();
        localCamTrack.close();
        localCamTrack = null;
      }
      agoraClient.removeAllListeners();
      await agoraClient.leave();
    } catch (err) {
      console.error("Error leaving call:", err);
    } finally {
      console.log("Left call.");
      setCallState("lobby");
      router.push("/recruiter");
    }
  };
  
  // --- 4. HANDLE MIC/CAM TOGGLE ---
  const toggleMic = async () => {
     const newMicState = !isMicOn;
     setIsMicOn(newMicState);
     if (localMicTrack) {
        await localMicTrack.setMuted(!newMicState);
     }
  };

  const toggleCam = async () => {
    const newCamState = !isCamOn;
    setIsCamOn(newCamState);
    if (callState === "in_call") {
        if (newCamState && !localCamTrack) {
            localCamTrack = await AgoraRTC.createCameraVideoTrack();
            await agoraClient.publish(localCamTrack);
            if(selfViewRef.current) localCamTrack.play(selfViewRef.current);
        } else if (!newCamState && localCamTrack) {
            await agoraClient.unpublish(localCamTrack);
            localCamTrack.stop();
            localCamTrack.close();
            localCamTrack = null;
        }
    }
  };
  
  // --- 5. CLEANUP EFFECT ---
  React.useEffect(() => {
    const beforeUnload = () => {
      if (callState === "in_call") {
        handleLeaveCall();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      if (agoraClient.connectionState === "CONNECTED" || agoraClient.connectionState === "CONNECTING") {
          handleLeaveCall();
      }
    };
  }, []); // <-- Fix 3 (Empty dependency array)
  
  
  // --- RENDER FUNCTIONS ---
  // --- FIX 4: Corrected renderLobby function ---
  const renderLobby = () => (
    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center">Ready to join?</h1>
      <p className="text-center text-muted-foreground mt-2">
        You are about to start a live voice interview with {candidate?.name || "the AI candidate"}.
      </p>

      {/* "Self-View" Placeholder / Video feed */}
      <div 
        ref={selfViewRef} 
        className="w-full aspect-video bg-muted rounded-lg my-6 flex items-center justify-center overflow-hidden"
      >
        {!isCamOn && <p className="text-muted-foreground">Camera is off</p>}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          size="icon"
          className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          size="icon"
          className={cn("rounded-full h-12 w-12", isCamOn ? "bg-primary" : "bg-muted text-muted-foreground")}
          onClick={toggleCam}
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
  
  // --- FIX 4: Corrected renderInCall function ---
  const renderInCall = () => {
    const candidateName = candidate?.name || "AI"; // <-- Fix 5 (Null check)
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
            <p className={cn(
                "text-xl mt-2 transition-colors",
                callStatusText === "Speaking..." ? "text-green-500" : "text-primary"
            )}>
                {callStatusText}
            </p>
        </div>
        
        {/* Recruiter's "Self-View" Placeholder */}
        <div 
            ref={selfViewRef} 
            className="w-48 h-28 bg-muted rounded-lg absolute bottom-24 right-12 border border-border flex items-center justify-center text-sm text-muted-foreground overflow-hidden"
        >
            {!isCamOn && "Cam Off"}
        </div>
        
        {/* Call Controls */}
        <div className="flex justify-center gap-4 mt-8">
            <Button
              size="icon"
              className={cn("rounded-full h-12 w-12", isMicOn ? "bg-primary" : "bg-muted text-muted-foreground")}
              onClick={toggleMic}
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
    if (isLoading || !user) {
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