"use client";

import { Suspense, useState, useRef, useEffect, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronLeft, Search, MoreVertical, Phone, Video, Send, Smile, Loader2
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { getAvatarUrl } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { HistoryService } from "@/services/history.service";
import { Skeleton } from 'boneyard-js/react';


type ChatSession = {
    id: string;
    name: string;
    role: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    active: boolean;
    botId: string | null;
};

type ChatMsg = { role: "user" | "assistant"; text: string };

// Strip <think> tags from streaming LLM output
const stripThink = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

function RecruiterChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [mounted, setMounted] = useState(false);
    const [activeChatId, setActiveChatId] = useState("");
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [liveBotId, setLiveBotId] = useState<string | null>(null);
    const [botError, setBotError] = useState<string | null>(null);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatScrollContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setMounted(true);
        // Priority 1: Current candidate selected from dashboard
        const urlCandidateId = searchParams.get("candidate");
        
        try {
            const rawSessions = localStorage.getItem("recruiter_chat_sessions");
            let sessions: any[] = [];
            if (rawSessions) {
                sessions = JSON.parse(rawSessions);
            }

            // Ensure our sessions have the right fields for the UI
            const formattedSessions: ChatSession[] = sessions.map(s => ({
                id: s.id,
                name: s.name || "Candidate",
                role: s.role || "AI Professional",
                avatar: s.avatar || getAvatarUrl(s.id),
                lastMessage: s.lastMessage || "Start a conversation...",
                time: s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                unread: 0,
                active: false,
                botId: s.id // In this app, candidate ID is the Bot ID
            }));

            setChatSessions(formattedSessions);

            // Set active chat: URL param > Last stored botId > first session
            const activeId = urlCandidateId || localStorage.getItem("recruiter_chat_botId") || (formattedSessions[0]?.id);
            if (activeId) {
                setActiveChatId(activeId);
                const activeSession = formattedSessions.find(s => s.id === activeId);
                if (activeSession) {
                    setLiveBotId(activeSession.botId);
                }
            }
        } catch (e) {
            console.error("Error loading chat sessions:", e);
        }
    }, [searchParams]);

    // Smart auto-scroll logic
    useEffect(() => {
        const container = chatScrollContainerRef.current;
        if (!container) return;

        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isStreaming]);

    const activeChat = chatSessions.find((c: ChatSession) => c.id === activeChatId) || chatSessions[0] || {
        id: "", name: "Select a Candidate", role: "", avatar: getAvatarUrl(null), lastMessage: "", time: "", unread: 0, active: false, botId: null
    };
    const currentBotId = activeChat.botId || liveBotId;

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg || isStreaming) return;

        let currentStartedAt = startedAt;
        if (!currentStartedAt) {
            currentStartedAt = new Date().toISOString();
            setStartedAt(currentStartedAt);
        }

        setInput("");
        const currentMessages = messages;
        const newMessages: ChatMsg[] = [...currentMessages, { role: "user", text: msg }];
        setMessages(newMessages);
        setIsStreaming(true);

        let currentAssistantText = "";

        try {
            const token = getToken();
            const chatHistory = currentMessages.map((m: ChatMsg) => ({
                role: m.role,
                content: m.text,
            }));

            if (!currentBotId) throw new Error("No bot selected. Click Chat on a candidate first.");

            const isProd = process.env.NODE_ENV === "production";
            const apiBase = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://k632cnxhg3.ap-south-1.awsapprunner.com" : "http://localhost:8000");
            const res = await fetch(
                `${apiBase}/api/v1/bots/${currentBotId}/chat/stream`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ message: msg, chat_history: chatHistory }),
                }
            );

            if (!res.ok || !res.body) {
                if (res.status === 404) {
                    localStorage.removeItem("recruiter_chat_botId");
                    localStorage.removeItem("recruiter_chat_botName");
                    setLiveBotId(null);
                    setBotError("Bot not found. Please select a candidate.");
                    throw new Error("Bot not found.");
                }
                throw new Error(`Server error: ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            setMessages((prev: ChatMsg[]) => [...prev, { role: "assistant", text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                currentAssistantText = stripThink(fullText);
                startTransition(() => {
                    setMessages((prev: ChatMsg[]) => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { role: "assistant", text: currentAssistantText };
                        return newMsgs;
                    });
                });
            }

            // Sync with backend
            try {
                const finalHistory = [...newMessages, { role: "assistant", text: currentAssistantText }];
                const saveRes = await HistoryService.saveConversation(currentBotId, {
                    id: activeConvId || undefined,
                    messages: finalHistory.map(m => ({
                        role: m.role,
                        content: m.text,
                        timestamp: new Date().toISOString()
                    })),
                    started_at: currentStartedAt,
                    duration_seconds: Math.floor((Date.now() - new Date(currentStartedAt).getTime()) / 1000)
                });
                
                if (saveRes.id && !activeConvId) {
                    setActiveConvId(saveRes.id);
                }
            } catch (saveErr) {
                console.error("Failed to sync:", saveErr);
            }

        } catch (err: unknown) {
            setMessages((prev: ChatMsg[]) => [...prev, {
                role: "assistant",
                text: (err as Error).message || "Something went wrong.",
            }]);
        }
        setIsStreaming(false);
    };

    const isLoadingSessions = !mounted || chatSessions.length === 0;

    return (
        <Skeleton name="recruiter-chat" loading={!mounted || searchParams.get('demo') === 'skeleton'} fixture={
            <div className="flex h-screen bg-slate-50 dark:bg-[#0B0E14] overflow-hidden">
                <div className="w-80 border-r border-slate-200 dark:border-white/10 hidden md:block bg-white dark:bg-[#111318]">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10">
                        <div className="h-8 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
                    </div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                                    <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0B0E14]">
                    <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] px-6 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 mr-3" />
                        <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                    </div>
                    <div className="flex-1 p-6 space-y-6">
                        <div className="h-12 w-2/3 bg-white dark:bg-[#1C2128] rounded-2xl border border-slate-200 dark:border-white/10" />
                        <div className="h-12 w-1/2 bg-blue-600/10 dark:bg-purple-600/10 rounded-2xl ml-auto" />
                    </div>
                </div>
            </div>
        }>
            <div className="flex h-screen bg-slate-50 dark:bg-[#0B0E14] overflow-hidden font-sans">
                {/* Conversations List */}
                <aside className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/10 flex-col bg-white dark:bg-[#111318]`}>
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                        <Link href="/recruiter" className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500">
                            <ChevronLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-slate-100 dark:bg-[#0B0E14] border border-transparent dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            {chatSessions.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-slate-500">No active chats.</p>
                                </div>
                            ) : chatSessions.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => { 
                                        setActiveChatId(chat.id); 
                                        setMessages([]); 
                                        setLiveBotId(chat.botId); 
                                        localStorage.setItem("recruiter_chat_botId", chat.botId || ""); 
                                        setActiveConvId(null);
                                        setStartedAt(null);
                                    }}
                                    className={`flex items-start gap-4 p-4 cursor-pointer transition-colors rounded-2xl ${chat.id === activeChatId ? 'bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B0E14]">
                                            <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{chat.name}</h3>
                                            <span className="text-[11px] text-slate-500">{chat.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Chat Window */}
                <main className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative`}>
                    <header className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-[#111318]/80 backdrop-blur-md sticky top-0 z-40">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveChatId("")} className="md:hidden p-2 -ml-2 text-slate-500 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                                <Image src={activeChat.avatar} alt={activeChat.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{activeChat.name}</h2>
                                <p className="text-[11px] text-green-500 font-medium">AI Twin • Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><Phone size={18} /></button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><Video size={18} /></button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><MoreVertical size={18} /></button>
                        </div>
                    </header>

                    <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-[#0B0E14] scroll-smooth">
                        {messages.length === 0 && !isStreaming ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-purple-900/20 flex items-center justify-center text-blue-600 dark:text-purple-400">
                                    <Send size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Start a Conversation</h3>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-[20px] px-5 py-3 text-[15px] leading-relaxed ${msg.role === "user" ? "bg-blue-600 dark:bg-purple-600 text-white rounded-br-sm" : "bg-white dark:bg-[#1C2128] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-bl-sm shadow-sm"}`}>
                                        {msg.role === "assistant" && msg.text ? (
                                            <div className="prose dark:prose-invert prose-sm">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : msg.text || (
                                            <span className="flex gap-1 py-1"><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" /><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" /><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-300" /></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white/80 dark:bg-[#111318]/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10">
                        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/5 rounded-[24px] p-2 shadow-inner">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none min-h-[44px] py-3 px-4 text-[15px] outline-none text-slate-900 dark:text-white"
                                rows={1}
                                disabled={!currentBotId || isStreaming}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!currentBotId || isStreaming || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 dark:bg-purple-600 text-white disabled:opacity-40"
                            >
                                {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </Skeleton>
    );
}

export default function RecruiterChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14]"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <RecruiterChatContent />
        </Suspense>
    );
}

