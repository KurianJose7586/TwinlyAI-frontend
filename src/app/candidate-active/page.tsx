"use client";

import React from "react";
import Image from "next/image";
import {
    LayoutDashboard,
    BarChart3,
    History,
    Settings,
    User,
    Terminal,
    Key,
    Copy,
    Trash2,
    ArrowUp,
    ChevronDown,
    Loader2,
    LogOut,
    Plus,
    Check,
    Sun,
    Moon,
    X,
    Sparkles
} from "lucide-react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ResumeUploadZone } from "@/components/ui/resume-upload-zone";
import { useBots, useUpdateBot } from "@/hooks/useBots";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/useApiKeys";

type APIKey = { id: string; prefix: string };

export default function CandidateActiveDashboard() {
    const { user, logout } = useAuth();
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

    // --- Profile data ---
    const [userName, setUserName] = React.useState("Your AI Twin");
    const [userAvatar, setUserAvatar] = React.useState(
        "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
    );
    const [botId, setBotId] = React.useState<string | null>(null);

    // --- Dashboard form state ---
    const [agentName, setAgentName] = React.useState("");
    const [agentBio, setAgentBio] = React.useState("");
    const [githubUrl, setGithubUrl] = React.useState("");
    const [twitterUrl, setTwitterUrl] = React.useState("");
    const [websiteUrl, setWebsiteUrl] = React.useState("");
    const [linkedinUrl, setLinkedinUrl] = React.useState("");
    const [projects, setProjects] = React.useState<any[]>([]);
    const originalAgentState = React.useRef({ name: "", bio: "", githubUrl: "", twitterUrl: "", websiteUrl: "", linkedinUrl: "", projects: [] as any[] });
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    const hasUnsavedChanges = () => {
        return agentName !== originalAgentState.current.name ||
            agentBio !== originalAgentState.current.bio ||
            githubUrl !== originalAgentState.current.githubUrl ||
            twitterUrl !== originalAgentState.current.twitterUrl ||
            websiteUrl !== originalAgentState.current.websiteUrl ||
            linkedinUrl !== originalAgentState.current.linkedinUrl ||
            JSON.stringify(projects) !== JSON.stringify(originalAgentState.current.projects);
    };

    const safeTabChange = (newTab: string) => {
        if (activeTab === 'dashboard' && hasUnsavedChanges()) {
            if (!window.confirm("You have unsaved changes to your Agent Context. Are you sure you want to navigate away and discard them?")) {
                return;
            }
            // Revert changes if discarded
            setAgentName(originalAgentState.current.name);
            setAgentBio(originalAgentState.current.bio);
            setGithubUrl(originalAgentState.current.githubUrl);
            setTwitterUrl(originalAgentState.current.twitterUrl);
            setWebsiteUrl(originalAgentState.current.websiteUrl);
            setLinkedinUrl(originalAgentState.current.linkedinUrl);
            setProjects(originalAgentState.current.projects || []);
        }
        setActiveTab(newTab);
    };

    // --- API Keys state ---
    const { data: fetchedApiKeys } = useApiKeys();
    const apiKeys: APIKey[] = fetchedApiKeys || [];
    const { mutateAsync: createKeyMutation, isPending: isCreatingKey } = useCreateApiKey();
    const { mutateAsync: deleteKeyMutation } = useDeleteApiKey();

    const [newKeyValue, setNewKeyValue] = React.useState<string | null>(null);
    const [copiedKeyId, setCopiedKeyId] = React.useState<string | null>(null);

    const { data: fetchedBots } = useBots();
    const { mutateAsync: updateBotMutation } = useUpdateBot();

    React.useEffect(() => {
        setMounted(true);
        // Load profile from localStorage (set during onboarding / login)
        const name = localStorage.getItem("twinly_userName") ||
            localStorage.getItem("userName") || "Your AI Twin";
        const avatar = localStorage.getItem("userAvatar") ||
            "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0";
        const id = localStorage.getItem("twinly_botId");

        setUserName(name);
        setUserAvatar(avatar);
        setBotId(id);
        setAgentName(`${name} AI`);
        const initialBio = `I'm ${name.split(' ')[0]}'s AI twin. I represent their skills and career achievements. I should be articulate, helpful, and maintain professional ethics.`;
        setAgentBio(initialBio);
        originalAgentState.current = {
            name: `${name} AI`,
            bio: initialBio,
            githubUrl: "",
            twitterUrl: "",
            websiteUrl: "",
            linkedinUrl: "",
            projects: []
        };
    }, []);

    // Sync bot data from React Query
    React.useEffect(() => {
        if (fetchedBots) {
            if (fetchedBots.length > 0) {
                const bot = fetchedBots[0];
                const realId = bot.id || bot._id;

                if (botId !== realId) {
                    localStorage.setItem("twinly_botId", realId);
                    localStorage.setItem("twinly_userName", bot.name);
                    setBotId(realId);
                }

                setUserName(bot.name);
                setAgentName(`${bot.name} AI`);
                setAgentBio(bot.summary || `I'm ${bot.name.split(' ')[0]}'s AI twin.`);
                setGithubUrl(bot.github_url || "");
                setTwitterUrl(bot.twitter_url || "");
                setWebsiteUrl(bot.website_url || "");
                setLinkedinUrl(bot.linkedin_url || "");
                setProjects(bot.projects || []);

                originalAgentState.current = {
                    name: `${bot.name} AI`,
                    bio: bot.summary || `I'm ${bot.name.split(' ')[0]}'s AI twin.`,
                    githubUrl: bot.github_url || "",
                    twitterUrl: bot.twitter_url || "",
                    websiteUrl: bot.website_url || "",
                    linkedinUrl: bot.linkedin_url || "",
                    projects: bot.projects || []
                };
            } else {
                localStorage.removeItem("twinly_botId");
                localStorage.removeItem("twinly_userName");
                if (botId !== null) setBotId(null);
            }
        }
    }, [fetchedBots, botId]);

    const handlePublishChanges = async () => {
        if (!botId) return;
        setIsSaving(true);
        try {
            await updateBotMutation({
                botId,
                data: {
                    name: agentName.replace(" AI", ""),
                    summary: agentBio,
                    github_url: githubUrl,
                    twitter_url: twitterUrl,
                    website_url: websiteUrl,
                    linkedin_url: linkedinUrl,
                    projects: projects
                }
            });
            originalAgentState.current = {
                name: agentName,
                bio: agentBio,
                githubUrl: githubUrl,
                twitterUrl: twitterUrl,
                websiteUrl: websiteUrl,
                linkedinUrl: linkedinUrl,
                projects: projects
            };
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e) {
            console.error("Failed to save bot:", e);
        }
        setIsSaving(false);
    };

    const handleCreateApiKey = async () => {
        try {
            const res = await createKeyMutation();
            setNewKeyValue(res.api_key);
        } catch (e) {
            console.error("Failed to create API key:", e);
        }
    };

    const handleDeleteApiKey = async (keyId: string) => {
        if (!window.confirm("Are you sure you want to delete this API Key? Any applications using it will lose access immediately.")) {
            return;
        }
        try {
            await deleteKeyMutation(keyId);
        } catch (e) {
            console.error("Failed to delete API key:", e);
        }
    };

    const handleCopyKey = (val: string, id: string) => {
        navigator.clipboard.writeText(val);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    // --- Chat state ---
    type ChatMsg = { role: 'user' | 'assistant'; text: string };
    const [chatMessages, setChatMessages] = React.useState<ChatMsg[]>([
        { role: 'user', text: `Hi ${userName.split(' ')[0] || 'there'}! What makes you stand out?` },
    ]);
    const [chatInput, setChatInput] = React.useState("");
    const [isStreaming, setIsStreaming] = React.useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);
    const chatScrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Smart auto-scroll logic
    React.useEffect(() => {
        const container = chatScrollContainerRef.current;
        if (!container) return;

        // Is user already near the bottom? Expand to 150px to combat jumping
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        if (isNearBottom) {
            // Apply instant, direct scroll assignment to bypass browser css animation curve bugs during stream
            container.scrollTop = container.scrollHeight;
        }
    }, [chatMessages, isStreaming]);

    // Strip <think> tags from LLM responses (same logic as backend strip_think_tags)
    const strip = (text: string) => text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    const handleChatSend = async () => {
        const msg = chatInput.trim();
        if (!msg || isStreaming || !botId) return;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
        setIsStreaming(true);

        try {
            const token = localStorage.getItem("twinly_token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/bots/${botId}/chat/stream`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ message: msg }),
                }
            );
            if (!res.ok || !res.body) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            setChatMessages(prev => [...prev, { role: 'assistant', text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // Backend streams raw text chunks (not SSE data: lines)
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                const finalText = strip(fullText);
                React.startTransition(() => {
                    setChatMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'assistant', text: finalText };
                        return updated;
                    });
                });
            }
        } catch (err: any) {
            console.error("Chat Error:", err);
            setChatMessages(prev => [...prev, { role: 'assistant', text: `Failed to connect to AI Twin: ${err.message}` }]);
        }
        setIsStreaming(false);
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#0B0E14] text-slate-900 dark:text-white font-sans antialiased relative">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse shadow-[0_0_100px_rgba(59,130,246,0.3)]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[150px] mix-blend-screen animate-pulse shadow-[0_0_120px_rgba(168,85,247,0.3)]" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Sidebar — hidden on mobile, visible from md upward */}
            <aside className="hidden md:flex w-20 lg:w-64 border-r border-slate-200 dark:border-white/10 flex-col bg-white/70 dark:bg-[#0B0E14]/80 backdrop-blur-xl z-10 relative">
                <div className="p-8 flex items-center gap-3">
                    <Image src="/butterfly.svg" alt="TwinlyAI" width={32} height={32} className="dark:invert drop-shadow-md" />
                    <h2 className="hidden lg:block text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">TwinlyAI</h2>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => safeTabChange('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard'
                            ? 'bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={22} />
                        <span className="hidden lg:block">Dashboard</span>
                    </button>
                    <button
                        onClick={() => safeTabChange('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'analytics'
                            ? 'bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <BarChart3 size={22} />
                        <span className="hidden lg:block">Analytics</span>
                    </button>
                    <button
                        onClick={() => safeTabChange('history')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'history'
                            ? 'bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <History size={22} />
                        <span className="hidden lg:block">History</span>
                    </button>
                    <button
                        onClick={() => safeTabChange('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings'
                            ? 'bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Settings size={22} />
                        <span className="hidden lg:block">Settings</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-200 dark:border-white/10 relative">
                    {/* Collapsible Profile Popover */}
                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-6 mb-2 w-52 bg-white/90 dark:bg-[#1C2128]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                            <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Account</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 px-2 mt-0.5 truncate">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={() => alert("Candidate profile view is coming soon.")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    View Profile
                                </button>
                                <button onClick={() => alert("Subscription and billing management coming soon.")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    Billing &amp; Plans
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}

                    <div
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-white/10"
                            style={{ backgroundImage: `url("${userAvatar}")` }}
                        ></div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-[13px] font-semibold truncate">{userName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Premium Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent z-10 relative pb-20 md:pb-0">
                <header className="h-16 md:h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 md:px-10 bg-white/70 dark:bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
                            {activeTab === 'dashboard' ? 'Agent Profile' : activeTab}
                        </h1>
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">Live</span>
                        </div>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="flex items-center gap-3">
                            <button onClick={() => alert("Public preview page coming soon.")} className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                Preview Page
                            </button>
                            <button
                                onClick={handlePublishChanges}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : null}
                                {saveSuccess ? "Saved!" : "Publish Changes"}
                            </button>
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto">

                        {/* Tab: Dashboard or Mirror */}
                        {(activeTab === 'dashboard' || activeTab === 'mirror') && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 items-start">
                                {/* Left Column: Settings */}
                                <div className={`col-span-12 lg:col-span-7 space-y-10 ${activeTab === 'mirror' ? 'hidden lg:block' : 'block'}`}>
                                    {/* Identity Config */}
                                    <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                        <div className="flex items-center gap-3 mb-8">
                                            <User className="text-[#007AFF]" size={24} />
                                            <h3 className="text-lg font-semibold">Identity Configuration</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="flex flex-col">
                                                    <label htmlFor="agent-name" className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Agent Display Name</label>
                                                    <input
                                                        id="agent-name"
                                                        type="text"
                                                        value={agentName}
                                                        onChange={e => setAgentName(e.target.value)}
                                                        className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label htmlFor="agent-role" className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Professional Title</label>
                                                    <input
                                                        id="agent-role"
                                                        type="text"
                                                        defaultValue="Senior Product Designer"
                                                        className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="agent-bio" className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Personality &amp; Context</label>
                                                <textarea
                                                    id="agent-bio"
                                                    rows={4}
                                                    value={agentBio}
                                                    onChange={e => setAgentBio(e.target.value)}
                                                    className="resize-none bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm transition-all duration-200 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none text-slate-900 dark:text-white"
                                                />
                                            </div>

                                            {/* --- Social Links --- */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                                <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">Professional Presence</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] font-bold text-slate-400 mb-1 ml-1">LinkedIn URL</label>
                                                        <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                                                            className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] font-bold text-slate-400 mb-1 ml-1">GitHub URL</label>
                                                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                                                            className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] font-bold text-slate-400 mb-1 ml-1">Twitter (X) URL</label>
                                                        <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)}
                                                            className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] font-bold text-slate-400 mb-1 ml-1">Personal Website</label>
                                                        <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                                                            className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Projects Management */}
                                    <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <Terminal className="text-[#007AFF]" size={24} />
                                                <h3 className="text-lg font-semibold">Featured Projects</h3>
                                            </div>
                                            <button
                                                onClick={() => setProjects([...projects, { name: "", description: "", link: "" }])}
                                                className="text-[#007AFF] hover:bg-[#007AFF]/10 p-2 rounded-full transition-colors"
                                                title="Add Project"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {projects.length === 0 ? (
                                                <p className="text-sm text-slate-400 text-center py-4 italic">No projects added yet.</p>
                                            ) : projects.map((proj, idx) => (
                                                <div key={idx} className="relative bg-slate-50 dark:bg-[#0B0E14]/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 group/proj">
                                                    <button
                                                        onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/proj:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <div className="space-y-4">
                                                        <input
                                                            placeholder="Project Name"
                                                            value={proj.name}
                                                            onChange={e => {
                                                                const newProjs = [...projects];
                                                                newProjs[idx].name = e.target.value;
                                                                setProjects(newProjs);
                                                            }}
                                                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-1 font-bold text-sm focus:border-[#007AFF] outline-none" />
                                                        <input
                                                            placeholder="Link (github.com/...)"
                                                            value={proj.link}
                                                            onChange={e => {
                                                                const newProjs = [...projects];
                                                                newProjs[idx].link = e.target.value;
                                                                setProjects(newProjs);
                                                            }}
                                                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-1 text-xs focus:border-[#007AFF] outline-none" />
                                                        <textarea
                                                            placeholder="Description"
                                                            rows={2}
                                                            value={proj.description}
                                                            onChange={e => {
                                                                const newProjs = [...projects];
                                                                newProjs[idx].description = e.target.value;
                                                                setProjects(newProjs);
                                                            }}
                                                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-1 text-xs focus:border-[#007AFF] outline-none resize-none" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Resume Upload */}
                                    <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#007AFF]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                            <h3 className="text-lg font-semibold">Resume &amp; Knowledge Base</h3>
                                        </div>
                                        <ResumeUploadZone botId={botId} onSuccess={(name) => {
                                            if (name) {
                                                setUserName(name);
                                                setAgentName(`${name} AI`);
                                                localStorage.setItem("twinly_userName", name);
                                            }
                                        }} />
                                    </section>


                                    <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden">
                                        <button className="w-full flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Terminal className="text-[#007AFF]" size={24} />
                                                <h3 className="text-lg font-semibold">System Directives</h3>
                                            </div>
                                            <ChevronDown className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white rotate-180" size={24} />
                                        </button>
                                        <div className="px-8 pb-8">
                                            <div className="bg-slate-100 dark:bg-[#0B0E14] rounded-2xl p-6 font-mono text-[13px] text-slate-800 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-white/5 shadow-inner">
                                                <p className="mb-3 text-slate-500 dark:text-slate-500">{`// CORE INSTRUCTIONS`}</p>
                                                <p className="mb-2">1. Prioritize user-centric design data</p>
                                                <p className="mb-2">2. Reference Figma, React, and Swift workflows</p>
                                                <p className="mb-2">3. Keep responses under 150 words</p>
                                                <p className="text-[#007AFF]/80 mt-4 mb-2">{`# Experience Context`}</p>
                                                <p>- 8 years in Apple ecosystem design</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* API Connectivity */}
                                    <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Key className="text-[#007AFF]" size={24} />
                                            <h3 className="text-lg font-semibold">API Connectivity</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {/* New key reveal */}
                                            {newKeyValue && (
                                                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-4">
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">🔑 Save this key — it won&apos;t be shown again!</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-xs font-mono text-green-800 dark:text-green-300 flex-1 truncate">{newKeyValue}</code>
                                                        <button onClick={() => { navigator.clipboard.writeText(newKeyValue); }} className="text-green-700 dark:text-green-400 hover:text-green-900">
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Existing keys */}
                                            {apiKeys.length === 0 ? (
                                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No API keys yet.</p>
                                            ) : apiKeys.map(k => (
                                                <div key={k.id} className="bg-slate-100 dark:bg-[#0B0E14] p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-inner space-x-4">
                                                    <div className="min-w-0">
                                                        <label className="mb-0 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold block">Key Prefix</label>
                                                        <p className="font-mono text-sm mt-1 text-slate-800 dark:text-slate-300">{k.prefix}••••••••••••</p>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button onClick={() => handleCopyKey(k.prefix, k.id)} className="p-2 rounded-full hover:bg-white dark:hover:bg-[#1C2128] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm">
                                                            {copiedKeyId === k.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                        </button>
                                                        <button onClick={() => handleDeleteApiKey(k.id)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20 shadow-sm">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Generate new key */}
                                            <button
                                                onClick={handleCreateApiKey}
                                                disabled={isCreatingKey}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:border-[#007AFF] hover:text-[#007AFF] dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all disabled:opacity-50"
                                            >
                                                {isCreatingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                Generate New Key
                                            </button>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: The Mirror Chat UI */}
                                <div className={`col-span-12 lg:col-span-5 ${activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}`}>
                                    <div className="bg-white/90 dark:bg-[#1C2128]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[32px] h-[calc(100vh-160px)] md:h-[calc(100vh-160px)] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden sticky top-28">
                                        <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-transparent flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                <div>
                                                    <h4 className="font-semibold text-[16px] text-slate-900 dark:text-white">The Mirror</h4>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">REAL-TIME PREVIEW</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setChatMessages([])} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div
                                            ref={chatScrollContainerRef}
                                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent bg-slate-50/50 dark:bg-[#0B0E14]/40"
                                            style={{ overflowAnchor: "auto" }}
                                        >
                                            {chatMessages.length === 0 && (
                                                <div className="h-full flex items-center justify-center text-center">
                                                    <p className="text-slate-400 dark:text-slate-500 text-sm">Start a conversation to preview your AI twin&apos;s responses.</p>
                                                </div>
                                            )}
                                            {chatMessages.map((msg, i) => (
                                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start gap-1'}`}>
                                                    {msg.role === 'user' ? (
                                                        <>
                                                            <div className="bg-[#007AFF] text-white rounded-[22px] rounded-br-[6px] px-4 py-2.5 text-[15px] leading-relaxed max-w-[85%] shadow-sm">
                                                                {msg.text}
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium mr-1 uppercase">You • Now</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-end gap-2 w-full">
                                                                <div className="bg-white dark:bg-[#2A303C] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-[22px] rounded-bl-[6px] px-5 py-3 text-[15px] leading-relaxed max-w-[90%] shadow-sm">
                                                                    {msg.text ? (
                                                                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
                                                                            <ReactMarkdown>
                                                                                {msg.text}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="flex items-center gap-2 py-1 text-slate-500 dark:text-slate-400 italic text-sm">
                                                                            <span className="flex gap-1">
                                                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                                                            </span>
                                                                            {userName.split(' ')[0]}&apos;s twin is thinking...
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium ml-1 uppercase">{userName.split(' ')[0]} AI • Now</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <div className="p-6 bg-transparent border-t border-slate-200 dark:border-white/10 backdrop-blur-md">
                                            <div className="relative flex items-center gap-2">
                                                <input
                                                    className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-full px-5 py-3.5 pr-14 text-[15px] focus:ring-2 focus:ring-[#007AFF] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-inner text-slate-900 dark:text-white"
                                                    placeholder={botId ? "Test your agent..." : "Save a bot first to chat..."}
                                                    type="text"
                                                    value={chatInput}
                                                    onChange={e => setChatInput(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
                                                    disabled={!botId || isStreaming}
                                                />
                                                <button
                                                    onClick={handleChatSend}
                                                    disabled={!botId || isStreaming || !chatInput.trim()}
                                                    className="absolute right-2 w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-40"
                                                >
                                                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
                                                </button>
                                            </div>
                                            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-5 font-semibold uppercase tracking-[0.2em]">Twinly AI resume engine v2.0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Analytics */}
                        {activeTab === 'analytics' && (
                            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8 min-h-[160px] flex flex-col justify-between">
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Total Profile Views</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] bg-clip-text text-transparent">3,492</h3>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">+12% <span className="text-slate-400 text-xs">from last week</span></p>
                                    </div>
                                    <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8 min-h-[160px] flex flex-col justify-between">
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Agent Inquiries</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">128</h3>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">+4% <span className="text-slate-400 text-xs">from last week</span></p>
                                    </div>
                                    <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8 min-h-[160px] flex flex-col justify-between">
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Avg. Match Score</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">94%</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">High compatibility rating</p>
                                    </div>
                                </div>
                                <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-10 h-96 flex items-center justify-center flex-col text-center">
                                    <BarChart3 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed analytics arriving soon</h4>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">We are compiling deeper insights regarding your agent&apos;s interactions with prospective recruiters.</p>
                                </div>
                            </div>
                        )}

                        {/* Tab: History */}
                        {activeTab === 'history' && (
                            <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden animate-in fade-in duration-300">
                                <div className="p-8 border-b border-slate-200 dark:border-white/10">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Interactions</h3>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {[
                                        { company: 'Tech Innovators Inc.', time: '2 hours ago', action: 'Chatted with your twin regarding UI scale architecture.' },
                                        { company: 'Global Solutions', time: 'Yesterday', action: 'Viewed your system directives and connection keys.' },
                                        { company: 'Alpha Startups', time: '3 days ago', action: 'Downloaded resume extraction summary.' },
                                        { company: 'Meta Design Team', time: '1 week ago', action: 'Chatted with your twin for 15 minutes.' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                                                <History size={18} className="text-[#007AFF]" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[15px] text-slate-900 dark:text-white">{item.company}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.action}</p>
                                            </div>
                                            <div className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                {item.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab: Settings */}
                        {activeTab === 'settings' && (
                            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300 pb-12">
                                <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Account</h3>
                                    <div className="space-y-4">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1C2128] flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 shadow-sm">
                                                    <LogOut size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">Sign Out</h4>
                                                    <p className="text-xs text-red-600/60 dark:text-red-400/60 mt-0.5">Logout from your account securely.</p>
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-full bg-white dark:bg-[#1C2128] border border-red-100 dark:border-red-500/10 shadow-sm">
                                                <LogOut size={14} className="text-red-400 rotate-180" />
                                            </div>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Appearance</h3>
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B0E14] rounded-2xl border border-slate-200 dark:border-white/5 cursor-pointer hover:border-blue-200 dark:hover:border-purple-500/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1C2128] flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-sm">
                                                    {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Theme Preference</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark mode.</p>
                                                </div>
                                            </div>
                                            <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-blue-500 dark:bg-purple-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${resolvedTheme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B0E14] rounded-2xl border border-slate-200 dark:border-white/5">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Email Alerts</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive an email when a recruiter interacts securely.</p>
                                            </div>
                                            <div onClick={() => alert("Email alerts configuration coming soon.")} className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer shadow-inner">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B0E14] rounded-2xl border border-slate-200 dark:border-white/5">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Weekly Digest</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Summary report of profile analytics.</p>
                                            </div>
                                            <div onClick={() => alert("Weekly digest configuration coming soon.")} className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full relative cursor-pointer shadow-inner">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Danger Zone</h3>
                                    <div className="p-5 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 rounded-2xl">
                                        <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">Deactivate Agent</h4>
                                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 mb-4">This will immediately pull your TwinlyAI profile offline. Recruiters will no longer be able to chat.</p>
                                        <button
                                            onClick={() => {
                                                const confirmation = window.prompt("This will permanently delete your AI Twin and all associated data. To confirm, type 'DELETE'.");
                                                if (confirmation === 'DELETE') {
                                                    // Trigger deactivation logic
                                                    alert("Agent deactivated. You can recreate your twin at any time.");
                                                    window.location.href = "/role-selection";
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                        >
                                            Take Offline
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Tab Bar — md:hidden so it only shows on small screens */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-[#0B0E14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 safe-area-inset-bottom">
                <button
                    onClick={() => safeTabChange('dashboard')}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
                    aria-label="Dashboard"
                >
                    <LayoutDashboard size={22} />
                    <span className="text-[10px] font-semibold">Profile</span>
                </button>
                <button
                    onClick={() => safeTabChange('mirror')}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${activeTab === 'mirror' ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
                    aria-label="Mirror"
                >
                    <Sparkles size={22} />
                    <span className="text-[10px] font-semibold">Mirror</span>
                </button>
                <button
                    onClick={() => safeTabChange('analytics')}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${activeTab === 'analytics' ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
                    aria-label="Analytics"
                >
                    <BarChart3 size={22} />
                    <span className="text-[10px] font-semibold">Analytics</span>
                </button>
                <button
                    onClick={() => safeTabChange('history')}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${activeTab === 'history' ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
                    aria-label="History"
                >
                    <History size={22} />
                    <span className="text-[10px] font-semibold">History</span>
                </button>
                <button
                    onClick={() => safeTabChange('settings')}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px] ${activeTab === 'settings' ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
                    aria-label="Settings"
                >
                    <Settings size={22} />
                    <span className="text-[10px] font-semibold">Settings</span>
                </button>
            </nav>
        </div>
    );
}
