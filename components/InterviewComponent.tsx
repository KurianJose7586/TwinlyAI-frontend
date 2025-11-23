"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2, Signal, Radio } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

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

  // Agora Refs
  const clientRef = React.useRef<IAgoraRTCClient | null>(null);
  const localTracks = React.useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const selfViewRef = React.useRef<HTMLDivElement>(null);

  // State
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [callState, setCallState] = React.useState<"lobby" | "joining" | "in_call" | "leaving">("lobby");
  const [callStatusText, setCallStatusText] = React.useState("Ready to connect");
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCamOn, setIsCamOn] = React.useState(true);

  // --- 1. SETUP ---
  React.useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const fetchBotInfo = async () => {
      try {
        const botData = await api.get(`/bots/public/${botId}`);
        setCandidate(botData);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchBotInfo();

    return () => {
      leaveCall();
    };
  }, [botId]);

  // --- 2. JOIN LOGIC ---
  const handleJoinCall = async () => {
    if (!clientRef.current) return;
    setCallState("joining");
    setCallStatusText("Establishing secure connection...");
    
    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!AGORA_APP_ID) {
        alert("Missing Agora App ID"); 
        setCallState("lobby");
        return;
    }

    try {
      // A. Get Token
      const { token, uid } = await api.post("/agora/token", { channel_name: botId });

      // B. Join Channel
      await clientRef.current.join(AGORA_APP_ID, botId, token, uid);

      // C. Publish Local Tracks (Mic + Cam)
      const tracks: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      tracks.push(mic);
      
      if (isCamOn) {
        const cam = await AgoraRTC.createCameraVideoTrack();
        tracks.push(cam);
        // We play the camera immediately in the specialized container
        // Note: We'll attach it in the DOM via useEffect or Callback below
        setTimeout(() => {
            if (selfViewRef.current) cam.play(selfViewRef.current);
        }, 100);
      }
      
      localTracks.current = tracks as [IMicrophoneAudioTrack, ICameraVideoTrack];
      await clientRef.current.publish(tracks);
      
      // D. "Summon" AI (Mock)
      await api.post("/agora/start-call", { channel_name: botId });

      // E. Transition to Call UI
      setCallState("in_call");
      setCallStatusText("Connected • Session Recording");

    } catch (err: any) {
      console.error("Join error:", err);
      alert("Connection failed. Please try again.");
      setCallState("lobby");
    }
  };

  const leaveCall = async () => {
    localTracks.current?.forEach(track => { track.stop(); track.close(); });
    localTracks.current = null;
    await clientRef.current?.leave();
    router.push("/dashboard");
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        
      {/* PROTOTYPE BADGE */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.2)]">
        <Radio className="h-3 w-3 animate-pulse" />
        PROTOTYPE v0.9
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {callState === "lobby" || callState === "joining" ? (
        // --- LOBBY UI ---
        <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-blue-500/20 mb-6 shadow-xl">
              <AvatarFallback className="bg-blue-600 text-2xl font-bold">
                {candidate?.name?.[0] || "AI"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white mb-1">
              {candidate?.name || "AI Assistant"}
            </h2>
            <p className="text-slate-400 text-sm mb-8">Ready for your interview?</p>
            
            <Button 
                onClick={handleJoinCall} 
                disabled={callState === "joining"}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl text-lg font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
                {callState === "joining" ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Connecting...</>
                ) : "Start Interview"}
            </Button>
            
            <div className="mt-6 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Signal className="h-3 w-3"/> Low Latency</span>
                <span className="flex items-center gap-1"><Radio className="h-3 w-3"/> HD Audio</span>
            </div>
          </div>
        </div>
      ) : (
        // --- IN-CALL UI ---
        <div className="relative z-10 w-full max-w-6xl aspect-video bg-black/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* MAIN AREA: AI AVATAR (Since AI has no video) */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-12">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50" />
                
                {/* Pulsing Aura */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                    <Avatar className="h-48 w-48 border-4 border-white/10 shadow-2xl relative z-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-6xl text-white">
                            {candidate?.name?.[0] || "AI"}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="mt-8 text-center relative z-10">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{candidate?.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-green-400 font-medium text-sm tracking-wide uppercase">{callStatusText}</p>
                    </div>
                </div>
            </div>

            {/* SIDE AREA: CONTROLS & SELF VIEW */}
            <div className="w-full md:w-80 bg-slate-900/80 border-l border-white/5 p-6 flex flex-col gap-6">
                
                {/* Self View Container */}
                <div className="aspect-[3/4] bg-black rounded-2xl overflow-hidden relative shadow-lg border border-white/10 group">
                    <div ref={selfViewRef} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white">
                        You
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col justify-end gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 h-12" onClick={() => setIsMicOn(!isMicOn)}>
                            {isMicOn ? <Mic className="h-5 w-5"/> : <MicOff className="h-5 w-5 text-red-400"/>}
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 h-12" onClick={() => setIsCamOn(!isCamOn)}>
                            {isCamOn ? <Video className="h-5 w-5"/> : <VideoOff className="h-5 w-5 text-red-400"/>}
                        </Button>
                    </div>
                    
                    <Button 
                        variant="destructive" 
                        className="w-full h-14 text-lg font-semibold shadow-lg shadow-red-500/20"
                        onClick={leaveCall}
                    >
                        <PhoneOff className="mr-2 h-5 w-5" /> End Call
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}