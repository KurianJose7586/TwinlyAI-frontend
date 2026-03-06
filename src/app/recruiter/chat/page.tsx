"use client";

import { Suspense, useState, useRef, useEffect, startTransition } from "react";
import Link from "next/link";
import {
    ChevronLeft, Search, MoreVertical, Phone, Video, Edit, Send, Smile, Loader2
} from "lucide-react";
import { getToken } from "@/lib/auth";
import ReactMarkdown from "react-markdown";

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

export default function RecruiterChatPage() {
    const router = import("next/navigation").then(mod => mod.useRouter).then(useRouter => useRouter()); // wait actually need to import it properly.

    const [activeChatId, setActiveChatId] = useState("");
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [liveBotId, setLiveBotId] = useState<string | null>(null);
    const [botError, setBotError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const storedBotId = localStorage.getItem("recruiter_chat_botId");
        if (storedBotId) setLiveBotId(storedBotId);

        try {
            const rawSessions = localStorage.getItem("recruiter_chat_sessions");
            if (rawSessions) {
                const parsed = JSON.parse(rawSessions);
                setChatSessions(parsed);
                const active = parsed.find((p: any) => p.botId === storedBotId) || parsed[0];
                if (active) setActiveChatId(active.id);
            } else if (storedBotId) {
                const storedBotName = localStorage.getItem("recruiter_chat_botName") || "Candidate";
                const fallbackSession = {
                    id: storedBotId,
                    name: storedBotName,
                    role: "AI Professional",
                    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=fallback",
                    lastMessage: "Start a conversation...",
                    time: "Just now",
                    unread: 0,
                    active: true,
                    botId: storedBotId
                };
                setChatSessions([fallbackSession]);
                setActiveChatId(storedBotId);
            }
        } catch (e) { console.error(e); }
    }, []);

    const chatScrollContainerRef = useRef<HTMLDivElement>(null);

    // Smart auto-scroll logic
    useEffect(() => {
        const container = chatScrollContainerRef.current;
        if (!container) return;

        // Determine if we are near the bottom of the container. 
        // A threshold of 150px allows for some leniency for fast incoming streams.
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        if (isNearBottom) {
            // Apply instant, direct scroll assignment to bypass browser css animation curve bugs during stream
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isStreaming]);

    const activeChat = chatSessions.find(c => c.id === activeChatId) || chatSessions[0] || {
        id: "", name: "Select a Candidate", role: "", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=fallback", lastMessage: "", time: "", unread: 0, active: false, botId: null
    };
    const currentBotId = activeChat.botId || liveBotId;

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg || isStreaming) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: msg }]);
        setIsStreaming(true);

        try {
            const token = getToken();
            const chatHistory = messages.map(m => ({
                role: m.role,
                content: m.text,
            }));

            if (!currentBotId) throw new Error("No bot selected. Click Chat on a candidate first.");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/bots/${currentBotId}/chat/stream`,
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
                    setChatSessions(prev => prev.map(s => s.botId === currentBotId ? { ...s, botId: null } : s));
                    setBotError("Bot not found. Please go back and click Chat on a candidate.");
                    throw new Error("Bot not found. Please go back and select a candidate.");
                }
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Authentication error. Please log out and log back in.");
                }
                throw new Error(`Server error: ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            setMessages(prev => [...prev, { role: "assistant", text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                const finalText = stripThink(fullText);
                startTransition(() => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { role: "assistant", text: finalText };
                        return newMsgs;
                    });
                });
            }
        } catch (err: unknown) {
            setMessages(prev => [...prev, {
                role: "assistant",
                text: (err as Error).message || "Something went wrong. Please try again.",
            }]);
        }

        setIsStreaming(false);
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-[#0B0E14] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar List — hidden on mobile when a chat is active */}
            <aside className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/10 flex-col bg-white dark:bg-[#1C2128]`}>
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                    <Link href="/recruiter" className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-slate-100 dark:bg-[#0B0E14] border border-transparent dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20">
                    {chatSessions.length === 0 ? (
                        <div className="p-8 justify-center text-center">
                            <p className="text-sm text-slate-500">No active chats.</p>
                            <Link href="/recruiter"><button className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 py-2 px-4 rounded-full min-h-[44px]">Find Candidates</button></Link>
                        </div>
                    ) : chatSessions.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => { setActiveChatId(chat.id); setMessages([]); setLiveBotId(chat.botId); localStorage.setItem("recruiter_chat_botId", chat.botId || ""); }}
                            className={`flex items-start gap-4 p-4 cursor-pointer transition-colors border-l-4 ${chat.id === activeChatId ? 'bg-blue-50/50 dark:bg-white/5 border-blue-600 dark:border-purple-500' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B0E14]">
                                    <img src={chat.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=fallback"} alt={chat.name} className="w-full h-full object-cover" />
                                </div>
                                {chat.botId === liveBotId && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1C2128] rounded-full"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{chat.name}</h3>
                                    <span className={`text-[11px] font-medium shrink-0 ml-2 ${chat.unread > 0 ? 'text-blue-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className={`text-xs truncate ${chat.unread > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {chat.lastMessage}
                                    </p>
                                    {chat.unread > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area — hidden on mobile when no chat is selected */}
            <main className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#0B0E14] relative`}>
                {/* Bot Error Banner */}
                {botError && (
                    <div className="bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 px-6 py-3 flex items-center justify-between gap-4">
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">{botError}</p>
                        <Link href="/recruiter" className="shrink-0 text-xs font-bold text-red-700 dark:text-red-400 underline hover:no-underline">
                            Go back to Candidates
                        </Link>
                    </div>
                )}
                {/* Chat Header */}
                <header className="h-16 sm:h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Mobile-only Back button — returns to conversation list */}
                        <button
                            onClick={() => setActiveChatId("")}
                            className="md:hidden p-2 -ml-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                            aria-label="Back to messages"
                        >
                            <ChevronLeft size={22} className="text-slate-500 dark:text-slate-400" />
                        </button>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B0E14] shrink-0">
                            <img src={activeChat.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=fallback"} alt={activeChat.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-[15px]">{activeChat.name} AI</h2>
                                {currentBotId && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                                        LIVE BOT
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 tracking-wide">{activeChat.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentBotId) {
                                    localStorage.setItem("recruiter_chat_botId", currentBotId);
                                    localStorage.setItem("recruiter_chat_botName", activeChat.name);
                                }
                                window.location.href = "/recruiter/call"; // Using window.location to ensure fresh mount of the call page state
                            }}
                        >
                            <Phone size={20} />
                        </button>
                        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors">
                            <Video size={20} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>
                        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div
                    ref={chatScrollContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20"
                    style={{ overflowAnchor: "auto" }}
                >
                    <div className="flex justify-center mb-8">
                        <span className="px-3 py-1 bg-slate-200/50 dark:bg-white/5 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {currentBotId ? "Live session — responses powered by AI" : "Demo — click Chat on a candidate to start a real session"}
                        </span>
                    </div>

                    {messages.length === 0 && (
                        <div className="flex justify-center">
                            <p className="text-sm text-slate-400 dark:text-slate-500">Send a message to start the conversation.</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        msg.role === "user" ? (
                            <div key={i} className="flex flex-col items-end">
                                <div className="bg-blue-600 dark:bg-purple-600 text-white rounded-[20px] rounded-br-sm px-5 py-3 text-[15px] leading-relaxed max-w-[80%] shadow-sm">
                                    {msg.text}
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 mr-1 font-medium tracking-wide">You • Now</span>
                            </div>
                        ) : (
                            <div key={i} className="flex flex-col items-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 mt-auto hidden sm:block">
                                        <img src={activeChat.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=fallback"} alt={activeChat.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="bg-white dark:bg-[#1C2128] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-[20px] rounded-bl-sm px-5 py-3 text-[15px] leading-relaxed shadow-sm">
                                            {msg.text ? (
                                                <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
                                                    <ReactMarkdown>
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span className="flex gap-1.5 py-1">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 ml-1 font-medium tracking-wide">{activeChat.name} AI • Now</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10">
                    <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/5 rounded-[24px] p-2 shadow-inner">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder={currentBotId ? `Message ${activeChat.name}'s AI Twin...` : "Select a candidate with an active bot to chat..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-[15px] outline-none text-slate-900 dark:text-white placeholder:text-slate-400 scrollbar-none"
                            rows={1}
                            disabled={!currentBotId || isStreaming}
                        />
                        <div className="flex items-center gap-1 pb-1 shrink-0">
                            <button className="p-2.5 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hidden sm:block">
                                <Smile size={20} />
                            </button>
                            <button
                                onClick={sendMessage}
                                disabled={!currentBotId || isStreaming || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 dark:bg-purple-600 hover:bg-blue-700 dark:hover:bg-purple-700 text-white transition-all shadow-md ml-1 shrink-0 disabled:opacity-40"
                            >
                                {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} className="translate-x-[1px] translate-y-[1px]" />}
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-semibold uppercase tracking-[0.2em]">
                        {currentBotId ? "LIVE AI CONNECTION SECURED" : "TWINLYAI — SELECT A CANDIDATE TO START"}
                    </p>
                </div>
            </main>
        </div>
    );
}
