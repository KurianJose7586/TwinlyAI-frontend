"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mic,
    MessageSquare,
    PhoneOff,
    X,
    History,
    Sparkles,
    ChevronLeft
} from "lucide-react";

type ChatMsg = { role: "user" | "ai"; text: string };

// A bank of context-aware AI suggestions the interviewer can use
const SUGGESTION_BANK = [
    "Ask about their most challenging technical project.",
    "Dig deeper into their team collaboration style.",
    "Ask how they handle disagreements with managers.",
    "Explore their experience with system design at scale.",
    "Ask about a time they had to learn something new quickly.",
    "Probe their motivations for leaving their current role.",
    "Ask for a concrete example of their leadership experience.",
    "Explore their experience with remote or async teams.",
    "Ask about their biggest professional failure and how they recovered.",
    "Clarify the tools and processes they use day-to-day.",
];

function pickSuggestions(messages: ChatMsg[]): string[] {
    // Deterministically pick 3 suggestions based on conversation progress
    const seed = messages.length;
    const suggestions: string[] = [];
    for (let i = 0; i < 3; i++) {
        suggestions.push(SUGGESTION_BANK[(seed + i * 3) % SUGGESTION_BANK.length]);
    }
    return suggestions;
}

export default function VoiceInterviewPage() {
    const router = useRouter();
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const [botId, setBotId] = useState<string | null>(null);
    const [botName, setBotName] = useState<string>("Candidate");
    const [recruiterName, setRecruiterName] = useState<string>("You");

    // Voice Engine State
    const [status, setStatus] = useState<string>("Initializing...");
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [lastTranscript, setLastTranscript] = useState<string>("Connection established. Hold the microphone button to speak.");
    const [currentSpeaker, setCurrentSpeaker] = useState<"ai" | "user" | "system">("system");

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedBotId = localStorage.getItem("recruiter_chat_botId");
        const storedBotName = localStorage.getItem("recruiter_chat_botName");
        const storedRecruiterEmail = localStorage.getItem("recruiter_email") || "";
        const storedRecruiterName = localStorage.getItem("recruiter_name") || storedRecruiterEmail.split("@")[0] || "You";

        setRecruiterName(storedRecruiterName);

        if (!storedBotId) {
            setStatus("No candidate selected.");
            setLastTranscript("Missing Candidate ID. Please return to the recruiter dashboard and select a candidate to call.");
            return;
        }

        setBotId(storedBotId);
        if (storedBotName) setBotName(storedBotName);

        connectWebSocket(storedBotId);

        return () => {
            if (wsRef.current) wsRef.current.close();
            if (audioContextRef.current) audioContextRef.current.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const connectWebSocket = (id: string) => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '')
            : "localhost:8000";

        const wsUrl = `${protocol}//${wsHost}/api/v1/bots/ws/${id}/voice`;

        const ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
            setIsConnected(true);
            setStatus("Ready");
            setLastTranscript("Connection established. Hold the microphone button to speak.");
        };

        ws.onmessage = async (event) => {
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);

                if (data.event === "ready") {
                    setStatus("Ready");
                } else if (data.event === "status") {
                    setStatus(data.message);
                } else if (data.event === "user_msg") {
                    setCurrentSpeaker("user");
                    setLastTranscript(data.text);
                    setMessages(prev => [...prev, { role: "user", text: data.text }]);
                } else if (data.event === "ai_msg") {
                    setCurrentSpeaker("ai");
                    setLastTranscript(data.text);
                    setMessages(prev => [...prev, { role: "ai", text: data.text }]);
                } else if (data.event === "audio") {
                    playAudioBase64(data.data);
                } else if (data.event === "error") {
                    setStatus("Error");
                    setLastTranscript(`System Error: ${data.message}`);
                    setCurrentSpeaker("system");
                } else if (data.event === "speech_done") {
                    setStatus("Ready");
                    setCurrentSpeaker("system");
                }
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setStatus("Disconnected");
        };

        wsRef.current = ws;
    };

    const initAudioContext = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }
    };

    const playAudioBase64 = async (base64String: string) => {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/mpeg" });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
    };

    const setupRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(audioBlob);
                }
                audioChunksRef.current = [];
            };

            mediaRecorderRef.current = mediaRecorder;
        } catch (e) {
            setStatus("Mic error");
            setLastTranscript("Microphone access denied. Please grant permissions.");
            console.error(e);
        }
    };

    const handleMicToggle = async () => {
        if (!isConnected) return;

        if (isRecording) {
            // Tap again to stop — send the recorded audio
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            setStatus("Thinking...");
        } else {
            // Tap to start recording
            if (!mediaRecorderRef.current) {
                await setupRecording();
            }
            if (!mediaRecorderRef.current) return;

            await initAudioContext();
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setStatus("Listening...");
            setCurrentSpeaker("user");
            setLastTranscript("...");
        }
    };

    const aiSuggestions = pickSuggestions(messages);

    const speakerLabel =
        currentSpeaker === "user" ? recruiterName :
            currentSpeaker === "ai" ? `${botName} AI` :
                "System";

    return (
        <div className="bg-[#1c1c1e] text-white font-sans h-[100dvh] w-full flex flex-col overflow-hidden relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fluid-wave {
                    0% { transform: scale(1) rotate(0deg); opacity: 0.6; }
                    50% { transform: scale(1.1) rotate(180deg); opacity: 0.8; }
                    100% { transform: scale(1) rotate(360deg); opacity: 0.6; }
                }
                .fluid-blob {
                    background: linear-gradient(45deg, #a259ff, #00d1ff, #ff4d94, #00d1ff);
                    background-size: 200% 200%;
                    animation: fluid-wave 15s ease-in-out infinite;
                    filter: blur(60px);
                }
                .glass-footer {
                    background: rgba(44, 44, 46, 0.4);
                    backdrop-filter: saturate(180%) blur(20px);
                    border: 0.5px solid rgba(255, 255, 255, 0.1);
                }
                .transcription-panel {
                    background: linear-gradient(to top, #1c1c1e 0%, rgba(28, 28, 30, 0.8) 50%, rgba(28, 28, 30, 0) 100%);
                }
                .glass-sidebar {
                    background: rgba(28, 28, 30, 0.9);
                    backdrop-filter: saturate(150%) blur(20px);
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}} />

            {/* Background Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#a259ff]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00d1ff]/10 rounded-full blur-[120px]" />
            </div>

            {/* Main Content — always full width, copilot overlays on top */}
            <div className="flex-1 flex flex-col items-center justify-between py-8 px-6 min-h-0 z-10">

                {/* Header */}
                <header className="w-full max-w-5xl flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <Link href="/recruiter" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium w-fit mb-1">
                            <ChevronLeft size={16} />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                            <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                                {isConnected ? "Live Interview" : "Connecting..."}
                            </span>
                        </div>
                        <h1 className="text-2xl font-light text-white/90">{botName}</h1>
                    </div>

                    {/* Recruiter card — wired to stored recruiter name */}
                    <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all px-4 py-2 rounded-2xl border border-white/10">
                        <div className="text-right">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Interviewer</p>
                            <p className="text-sm font-medium capitalize">{recruiterName}</p>
                        </div>
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center border border-white/20"
                            style={{ backgroundImage: `url("https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(recruiterName)}&backgroundColor=bbf7d0")` }}
                        />
                    </div>
                </header>

                {/* Central Animation */}
                <main className="relative flex-1 flex items-center justify-center w-full max-w-4xl min-h-0">
                    <div className={`relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 transition-all duration-700 ${isRecording ? 'scale-110' : 'scale-100'}`}>
                        <div className={`absolute inset-0 fluid-blob rounded-full transition-opacity duration-300 ${isConnected ? 'opacity-100' : 'opacity-20'}`} />
                        <div className="absolute inset-4 fluid-blob rounded-full opacity-50" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-transform duration-300 ${isRecording ? 'scale-[2.5]' : 'scale-100'}`} />
                        </div>
                    </div>
                    <div className="absolute bottom-8 flex flex-col items-center gap-1">
                        <p className="text-lg font-light text-white/90 tracking-tight">{status}</p>
                    </div>
                </main>

                {/* Transcription */}
                <div className="w-full max-w-2xl pb-2">
                    {lastTranscript && (
                        <div className="transcription-panel pt-10 pb-3 px-4 rounded-3xl">
                            <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${currentSpeaker === "user" ? "text-white/40" : "text-[#00d1ff]/80"}`}>
                                {speakerLabel}
                            </span>
                            <p className="text-white/80 text-base font-light leading-relaxed">
                                {lastTranscript}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <footer className="flex justify-center z-20 pb-2">
                    <div className="glass-footer px-2 py-2 rounded-[28px] flex items-center gap-1">
                        <button
                            onClick={handleMicToggle}
                            disabled={!isConnected}
                            title={isRecording ? "Click to stop & send" : "Click to speak"}
                            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all cursor-pointer select-none ${isRecording
                                    ? 'bg-white text-black ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            <Mic size={24} />
                        </button>

                        <button
                            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all cursor-pointer ${isCopilotOpen ? 'bg-white/20 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
                            title="Interview Copilot"
                        >
                            <MessageSquare size={24} />
                        </button>

                        <div className="w-[1px] h-6 bg-white/10 mx-2" />

                        <Link href="/recruiter">
                            <button
                                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all ml-1"
                                title="End Call"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </Link>
                    </div>
                </footer>
            </div>

            {/* Copilot Sidebar — TRUE OVERLAY (does not push main content) */}
            {isCopilotOpen && (
                <div className="fixed inset-0 z-40 pointer-events-none">
                    <aside className="absolute top-0 right-0 h-full w-80 glass-sidebar flex flex-col pointer-events-auto">
                        <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Interview Copilot</h2>
                            <button
                                className="p-2 -mr-2 cursor-pointer hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
                                onClick={() => setIsCopilotOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 min-h-0">
                            {/* Conversation History */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <History size={16} className="text-[#00d1ff]" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Conversation History</h3>
                                </div>
                                <div className="space-y-5">
                                    {messages.length === 0 ? (
                                        <p className="text-xs text-white/30 italic">Waiting for interview to begin...</p>
                                    ) : (
                                        messages.map((m, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <span className={`text-[10px] font-bold uppercase ${m.role === 'ai' ? 'text-[#00d1ff]/80' : 'text-white/40'}`}>
                                                    {m.role === 'ai' ? `${botName} AI` : recruiterName}
                                                </span>
                                                <p className={`text-sm leading-relaxed ${m.role === 'ai' ? 'text-white/70 font-light' : 'text-white/90 font-medium'}`}>
                                                    {m.text}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </section>

                            {/* AI Suggestions — dynamic based on conversation */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-[#a259ff]" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">AI Suggestions</h3>
                                </div>
                                <div className="space-y-3">
                                    {aiSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                        >
                                            <p className="text-xs text-white/70 group-hover:text-white leading-snug">{suggestion}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Thinking indicator */}
                        {status === "Thinking..." && (
                            <div className="p-5 border-t border-white/10 bg-white/5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#ff4d94] rounded-full animate-pulse" />
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Analyzing response...</span>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
