"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

interface Candidate {
  _id: string;
  name: string;
}

interface Props {
  botId: string;
}

export default function InterviewComponent({ botId }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  // Agora Client Ref (initialized only on client)
  const clientRef = React.useRef<IAgoraRTCClient | null>(null);
  const localTracks = React.useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);

  // State
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCamOn, setIsCamOn] = React.useState(false);
  const selfViewRef = React.useRef<HTMLDivElement>(null);
  
  const [callState, setCallState] = React.useState<"lobby" | "joining" | "in_call" | "leaving" | "error">("lobby");
  const [callStatusText, setCallStatusText] = React.useState("Connecting...");
  const [remoteUser, setRemoteUser] = React.useState<IAgoraRTCRemoteUser | null>(null);

  // --- 1. INITIALIZE & FETCH ---
  React.useEffect(() => {
    // Initialize Agora Client
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const fetchBotInfo = async () => {
      try {
        const botData = await api.get(`/bots/public/${botId}`);
        setCandidate(botData);
      } catch (err) {
        console.error("Failed to fetch bot info", err);
        setError("Could not find the candidate.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotInfo();

    // Cleanup on unmount
    return () => {
      if (clientRef.current && clientRef.current.connectionState === "CONNECTED") {
        leaveCall();
      }
    };
  }, [botId]);

  // --- 2. JOIN CALL & SUMMON AI ---
  const handleJoinCall = async () => {
    if (!clientRef.current) return;
    setCallState("joining");
    
    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!AGORA_APP_ID) {
        setError("Agora App ID missing.");
        setCallState("error");
        return;
    }

    try {
      // A. Get Token for YOU
      const tokenResponse = await api.post("/agora/token", { channel_name: botId });
      const { token, uid } = tokenResponse;

      // B. Join Agora
      await clientRef.current.join(AGORA_APP_ID, botId, token, uid);

      // C. Setup Listeners
      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        setRemoteUser(user);
        
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setCallStatusText("Speaking..."); 
          user.audioTrack?.on("track-ended", () => setCallStatusText("Listening..."));
        }
      });
      
      clientRef.current.on("user-unpublished", () => {
         setCallStatusText("AI is processing...");
      });

      // D. Publish Local Tracks
      const tracks: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      tracks.push(mic);
      
      if (isCamOn) {
        const cam = await AgoraRTC.createCameraVideoTrack();
        tracks.push(cam);
        if (selfViewRef.current) cam.play(selfViewRef.current);
      }
      
      localTracks.current = tracks as [IMicrophoneAudioTrack, ICameraVideoTrack];
      await clientRef.current.publish(tracks);
      
      // E. SUMMON THE AI (The Magic Step)
      console.log("Summoning AI Agent...");
      await api.post("/agora/start-call", { channel_name: botId });

      setCallState("in_call");
      setCallStatusText("Listening...");

    } catch (err: any) {
      console.error("Join error:", err);
      setError(`Failed to join: ${err.message}`);
      setCallState("error");
    }
  };

  // --- 3. LEAVE CALL ---
  const leaveCall = async () => {
    try {
      if (localTracks.current) {
        localTracks.current.forEach(track => { track.stop(); track.close(); });
        localTracks.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (err) {
      console.error("Error leaving:", err);
    } finally {
      setCallState("lobby");
      router.push("/recruiter");
    }
  };
  
  const toggleMic = async () => {
    if (localTracks.current) {
       const micTrack = localTracks.current[0];
       await micTrack.setMuted(isMicOn); // Logic inverted: setMuted(true) mutes
       setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = async () => {
    // Simplified Cam Toggle Logic
    setIsCamOn(!isCamOn);
  };

  // --- RENDER HELPERS ---
  const renderLobby = () => (
    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-center">Ready to join?</h1>
      <p className="text-center text-muted-foreground mt-2">
        Interview with {candidate?.name || "AI Candidate"}
      </p>
      <div className="w-full aspect-video bg-muted rounded-lg my-6 flex items-center justify-center">
         {isCamOn ? "Camera Preview Active" : "Camera Off"}
      </div>
      <div className="flex justify-center gap-4 mb-6">
         <Button size="icon" variant={isMicOn ? "default" : "secondary"} onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? <Mic /> : <MicOff />}
         </Button>
         <Button size="icon" variant={isCamOn ? "default" : "secondary"} onClick={() => setIsCamOn(!isCamOn)}>
            {isCamOn ? <Video /> : <VideoOff />}
         </Button>
      </div>
      <Button className="w-full" size="lg" onClick={handleJoinCall} disabled={callState === "joining"}>
        {callState === "joining" ? <Loader2 className="animate-spin mr-2" /> : null} Join Now
      </Button>
    </div>
  );

  const renderInCall = () => (
    <div className="w-full h-full max-w-5xl bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center relative">
       <Avatar className="h-48 w-48 border-4 border-primary/20 mb-6">
         <AvatarFallback className="text-7xl">{candidate?.name?.[0] || "A"}</AvatarFallback>
       </Avatar>
       <h2 className="text-4xl font-bold">{candidate?.name}</h2>
       <p className="text-xl mt-2 text-green-500 animate-pulse">{callStatusText}</p>
       
       <div ref={selfViewRef} className="absolute bottom-8 right-8 w-48 h-36 bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg">
          {!isCamOn && <div className="w-full h-full flex items-center justify-center text-xs text-white">Camera Off</div>}
       </div>
       
       <div className="mt-12 flex gap-4">
          <Button size="icon" variant={isMicOn ? "default" : "secondary"} onClick={toggleMic}>
             {isMicOn ? <Mic /> : <MicOff />}
          </Button>
          <Button size="icon" variant="destructive" onClick={leaveCall}>
             <PhoneOff />
          </Button>
       </div>
    </div>
  );

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
       {callState === "in_call" || callState === "joining" ? renderInCall() : renderLobby()}
    </div>
  );
}