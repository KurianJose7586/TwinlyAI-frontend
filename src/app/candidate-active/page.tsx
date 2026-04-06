"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    Sparkles,
    Plug
} from "lucide-react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import { ResumeUploadZone } from "@/components/ui/resume-upload-zone";
import { IntegrationHub } from "@/components/ui/integration-hub";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/useApiKeys";
import { useBots, useUpdateBot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/toast";
import { Project } from "@/types";
import { AvatarCustomizer, AvatarConfig, buildAvatarUrl, DEFAULT_AVATAR_CONFIG } from "@/components/ui/avatar-customizer";
import { HistoryTab } from "@/components/history/HistoryTab";
import { Skeleton } from 'boneyard-js/react';

type APIKey = { id: string; prefix: string };

function CandidateActiveDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout } = useAuth();
    const { comingSoon } = useToast();
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

    // --- Profile data ---
    const [userName, setUserName] = React.useState("Your AI Twin");
    const [userAvatar, setUserAvatar] = React.useState(
        buildAvatarUrl(DEFAULT_AVATAR_CONFIG)
    );
    const [botId, setBotId] = React.useState<string | null>(null);
    const [avatarConfig, setAvatarConfig] = React.useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
    const [showAvatarEditor, setShowAvatarEditor] = React.useState(false);

    // --- Dashboard form state ---
    const [agentName, setAgentName] = React.useState("");
    const [agentBio, setAgentBio] = React.useState("");
    const [githubUrl, setGithubUrl] = React.useState("");
    const [twitterUrl, setTwitterUrl] = React.useState("");
    const [websiteUrl, setWebsiteUrl] = React.useState("");
    const [linkedinUrl, setLinkedinUrl] = React.useState("");
    const [projects, setProjects] = React.useState<Project[]>([]);
    const originalAgentState = React.useRef({ name: "", bio: "", githubUrl: "", twitterUrl: "", websiteUrl: "", linkedinUrl: "", projects: [] as Project[] });
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
            buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
        const id = localStorage.getItem("twinly_botId");

        setUserName(name);
        setUserAvatar(avatar);
        setBotId(id);
        setAgentName(`${name} AI`);
        const displayNameFallback = name && name.trim().length > 0 ? name : "Your";
        const initialBio = `I'm ${displayNameFallback.split(' ')[0]}'s AI twin. I represent their skills and career achievements. I should be articulate, helpful, and maintain professional ethics.`;
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
                    localStorage.setItem("twinly_userName", bot.name || "Your");
                    setBotId(realId);
                }

                const displayName = bot.name && bot.name.trim().length > 0 ? bot.name : "Your";
                setUserName(displayName);
                setAgentName(`${displayName} AI`);
                setAgentBio(bot.summary || `I'm ${displayName.split(' ')[0]}'s AI twin.`);
                setGithubUrl(bot.github_url || "");
                setTwitterUrl(bot.twitter_url || "");
                setWebsiteUrl(bot.website_url || "");
                setLinkedinUrl(bot.linkedin_url || "");
                setProjects(bot.projects || []);

                originalAgentState.current = {
                    name: `${displayName} AI`,
                    bio: bot.summary || `I'm ${displayName.split(' ')[0]}'s AI twin.`,
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
    const [chatMessages, setChatMessages] = React.useState<ChatMsg[]>([]);
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
        setChatMessages((prev: ChatMsg[]) => [...prev, { role: 'user', text: msg }]);
        setIsStreaming(true);

        try {
            const token = localStorage.getItem("twinly_token");
            const isProd = process.env.NODE_ENV === "production";
            const apiBase = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://k632cnxhg3.ap-south-1.awsapprunner.com" : "http://localhost:8000");
            const res = await fetch(
                `${apiBase}/api/v1/bots/${botId}/chat/stream`,
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
            setChatMessages((prev: ChatMsg[]) => [...prev, { role: 'assistant', text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // Backend streams raw text chunks (not SSE data: lines)
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                const finalText = strip(fullText);
                React.startTransition(() => {
                    setChatMessages((prev: ChatMsg[]) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'assistant', text: finalText };
                        return updated;
                    });
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Chat Error:", err);
            setChatMessages((prev: ChatMsg[]) => [...prev, { role: 'assistant', text: `Failed to connect to AI Twin: ${message}` }]);
        }
        setIsStreaming(false);
    };

    // Handle avatar save from modal
    const handleSaveAvatar = async () => {
        const newUrl = buildAvatarUrl(avatarConfig);
        setUserAvatar(newUrl);
        localStorage.setItem("userAvatar", newUrl);
        setShowAvatarEditor(false);
        // Persist to backend if botId exists
        if (botId) {
            try {
                await updateBotMutation({ botId, data: { avatar_url: newUrl } });
            } catch (e) {
                console.error("Failed to save avatar:", e);
            }
        }
    };

    return (
        <Skeleton name="candidate-dashboard" loading={!mounted || searchParams.get('demo') === 'skeleton'} fixture={
            <div className="flex h-screen bg-white dark:bg-[#111318]">
                <aside className="w-64 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111318]" />
                <div className="flex-1 p-10 space-y-10">
                    <div className="h-10 w-48 bg-slate-100 dark:bg-white/5 rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-64 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5" />
                        <div className="h-64 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5" />
                    </div>
                </div>
            </div>
        }>
            <div className="flex h-screen overflow-hidden bg-white dark:bg-[#111318] text-slate-900 dark:text-white font-sans antialiased">

            {/* ── Avatar Editor Modal ── */}
            {showAvatarEditor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAvatarEditor(false)}
                    />
                    {/* Panel */}
                    <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#161B22] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.07]">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Customize your avatar</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open Peeps · hand-drawn illustration style</p>
                            </div>
                            <button
                                onClick={() => setShowAvatarEditor(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-6">
                            <AvatarCustomizer value={avatarConfig} onChange={setAvatarConfig} />
                        </div>
                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-black/10">
                            <button
                                onClick={() => setShowAvatarEditor(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAvatar}
                                className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors shadow-sm"
                            >
                                Save avatar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar — hidden on mobile, visible from md upward */}
            <aside className="hidden md:flex w-20 lg:w-64 border-r border-slate-100 dark:border-white/[0.06] flex-col bg-white dark:bg-[#111318] z-10">
                <div className="px-5 py-6 flex items-center gap-3">
                    <Image src="/butterfly.svg" alt="TwinlyAI" width={28} height={28} className="dark:invert" />
                    <h2 className="hidden lg:block text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">TwinlyAI</h2>
                </div>

                <nav className="flex-1 px-3 py-2 space-y-0.5">
                    {([
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                        { id: 'history', icon: History, label: 'History' },
                        { id: 'connectors', icon: Plug, label: 'Connectors' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ] as { id: string; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => safeTabChange(id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-colors relative rounded-md ${
                                activeTab === id
                                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/8'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4'
                            }`}
                        >
                            {activeTab === id && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-900 dark:bg-white rounded-full" />}
                            <Icon size={17} />
                            <span className="hidden lg:block">{label}</span>
                        </button>
                    ))}
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
                                <button onClick={() => comingSoon("Profile management")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    View Profile
                                </button>
                                <button onClick={() => comingSoon("Billing & plans")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
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
                <header className="h-14 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between px-6 md:px-10 bg-white dark:bg-[#111318] sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
                            {activeTab === 'dashboard' ? 'Agent Profile' : activeTab}
                        </h1>
                        <span className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 inline-block"></span>Active</span>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="flex items-center gap-3">
                            <button onClick={() => comingSoon("Public preview page")} className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                Preview Page
                            </button>
                            <button
                                onClick={handlePublishChanges}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-40"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : null}
                                {saveSuccess ? "Saved!" : "Publish Changes"}
                            </button>
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto">

                        {/* Tab: Dashboard or Mirror */}
                        {(activeTab === 'dashboard' || activeTab === 'mirror') && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 items-start">
                                {/* Left Column: Settings */}
                                <div className={`col-span-12 lg:col-span-7 space-y-10 ${activeTab === 'mirror' ? 'hidden lg:block' : 'block'}`}>
                                    {/* Identity Config */}
                                    <section className="pb-8 border-b border-slate-100 dark:border-white/[0.06] mb-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <User className="text-slate-400 dark:text-slate-500" size={16} />
                                            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Identity</h3>
                                        </div>

                                        {/* Avatar Editor */}
                                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group cursor-pointer" onClick={() => setShowAvatarEditor(true)}>
                                                    <div
                                                        className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-white/10 shadow-md overflow-hidden"
                                                        style={{ backgroundImage: `url("${userAvatar}")` }}
                                                    />
                                                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">EDIT</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                                                    <button
                                                        onClick={() => setShowAvatarEditor(true)}
                                                        className="text-xs text-blue-600 dark:text-purple-400 hover:underline font-medium mt-0.5"
                                                    >
                                                        Customize avatar →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="flex flex-col">
                                                    <label htmlFor="agent-name" className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">Display Name</label>
                                                    <input
                                                        id="agent-name"
                                                        type="text"
                                                        value={agentName}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value)}
                                                        className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-2 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white transition-colors"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label htmlFor="agent-role" className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">Professional Title</label>
                                                    <input
                                                        id="agent-role"
                                                        type="text"
                                                        placeholder="e.g. Senior Software Engineer"
                                                        className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-2 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="agent-bio" className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">Personality &amp; Context</label>
                                                <textarea
                                                    id="agent-bio"
                                                    rows={4}
                                                    value={agentBio}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgentBio(e.target.value)}
                                                    className="resize-none w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-2.5 text-sm focus:border-slate-300 dark:focus:border-white/20 outline-none text-slate-900 dark:text-white transition-colors mt-1"
                                                />
                                            </div>

                                            {/* --- Social Links --- */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Links</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">LinkedIn</label>
                                                        <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                                                            className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-1.5 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">GitHub</label>
                                                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                                                            className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-1.5 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">Twitter / X</label>
                                                        <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)}
                                                            className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-1.5 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">Website</label>
                                                        <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                                                            className="bg-transparent border-0 border-b border-slate-200 dark:border-white/10 px-0 py-1.5 text-sm focus:border-slate-800 dark:focus:border-white outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Projects Management */}
                                    <section className="pb-8 border-b border-slate-100 dark:border-white/[0.06] mb-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="text-slate-400 dark:text-slate-500" size={16} />
                                                <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Projects</h3>
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
                                            ) : projects.map((proj: Project, idx: number) => (
                                                <div key={idx} className="relative bg-slate-50 dark:bg-[#0B0E14]/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 group/proj">
                                                    <button
                                                        onClick={() => setProjects(projects.filter((_: Project, i: number) => i !== idx))}
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
                                    <section className="pb-8 border-b border-slate-100 dark:border-white/[0.06] mb-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Resume</h3>
                                        </div>
                                        <ResumeUploadZone botId={botId} onSuccess={(name) => {
                                            if (name) {
                                                setUserName(name);
                                                setAgentName(`${name} AI`);
                                                localStorage.setItem("twinly_userName", name);
                                            }
                                        }} />
                                    </section>


                                    <section className="pb-8 border-b border-slate-100 dark:border-white/[0.06] mb-6">
                                        <button className="w-full flex items-center justify-between mb-4 group">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="text-slate-400 dark:text-slate-500" size={16} />
                                                <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">System Directives</h3>
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
                                    <section className="pb-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Key className="text-slate-400 dark:text-slate-500" size={16} />
                                            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">API Keys</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {/* New key reveal */}
                                            {newKeyValue && (
                                                <div className="space-y-3">
                                                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-4">
                                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">🔑 Save this key — it won&apos;t be shown again!</p>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs font-mono text-green-800 dark:text-green-300 flex-1 truncate">{newKeyValue}</code>
                                                            <button onClick={() => { navigator.clipboard.writeText(newKeyValue); }} className="text-green-700 dark:text-green-400 hover:text-green-900">
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Embed snippet for this key & bot */}
                                                    {botId && (
                                                        <div className="bg-slate-900 text-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-700">
                                                            <p className="font-semibold text-[11px] uppercase tracking-widest text-slate-400">Embeddable widget snippet</p>
                                                            <p className="text-[11px] text-slate-400">
                                                                Paste this snippet into your website. It renders a floating chat widget and authenticates via this API key, so visitors do not need a Twinly account.
                                                            </p>
                                                            <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-[11px] whitespace-pre-wrap break-all">
{`<div id="twinlyai-widget"></div>
<script>
  (function() {
    var botId = "${botId}";
    var apiKey = "${newKeyValue}";
    var backendBase = "${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://k632cnxhg3.ap-south-1.awsapprunner.com' : 'http://localhost:8000')}";

    if (!botId || !apiKey || !backendBase) return;

    var container = document.getElementById('twinlyai-widget');
    if (!container) {
      container = document.createElement('div');
      container.id = 'twinlyai-widget';
      document.body.appendChild(container);
    }

    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';

    var button = document.createElement('button');
    button.textContent = 'Chat with my Twin';
    button.style.background = '#0f172a';
    button.style.color = '#f9fafb';
    button.style.borderRadius = '999px';
    button.style.padding = '10px 16px';
    button.style.fontSize = '13px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 10px 30px rgba(15,23,42,0.5)';

    var box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.bottom = '70px';
    box.style.right = '20px';
    box.style.width = '320px';
    box.style.maxHeight = '520px';
    box.style.background = '#0b1120';
    box.style.color = '#e5e7eb';
    box.style.borderRadius = '18px';
    box.style.boxShadow = '0 18px 45px rgba(15,23,42,0.85)';
    box.style.display = 'none';
    box.style.overflow = 'hidden';
    box.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    var header = document.createElement('div');
    header.textContent = 'AI Twin';
    header.style.padding = '10px 14px';
    header.style.fontSize = '13px';
    header.style.fontWeight = '600';
    header.style.background = 'rgba(15,23,42,0.95)';
    header.style.borderBottom = '1px solid rgba(148,163,184,0.3)';

    var messages = document.createElement('div');
    messages.style.padding = '10px 12px';
    messages.style.height = '360px';
    messages.style.overflowY = 'auto';
    messages.style.fontSize = '13px';
    messages.style.background = 'rgba(15,23,42,0.9)';

    var inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.alignItems = 'center';
    inputRow.style.gap = '6px';
    inputRow.style.padding = '8px 10px';
    inputRow.style.background = 'rgba(15,23,42,0.95)';
    inputRow.style.borderTop = '1px solid rgba(148,163,184,0.3)';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask this twin a question...';
    input.style.flex = '1';
    input.style.fontSize = '12px';
    input.style.padding = '8px 10px';
    input.style.borderRadius = '999px';
    input.style.border = '1px solid rgba(148,163,184,0.6)';
    input.style.background = 'transparent';
    input.style.color = 'inherit';

    var sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.fontSize = '12px';
    sendBtn.style.padding = '8px 10px';
    sendBtn.style.borderRadius = '999px';
    sendBtn.style.border = 'none';
    sendBtn.style.background = '#38bdf8';
    sendBtn.style.color = '#0f172a';
    sendBtn.style.cursor = 'pointer';

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    box.appendChild(header);
    box.appendChild(messages);
    box.appendChild(inputRow);

    container.appendChild(button);
    container.appendChild(box);

    function appendMessage(role, text) {
      var bubble = document.createElement('div');
      bubble.style.margin = '6px 0';
      bubble.style.padding = '8px 10px';
      bubble.style.borderRadius = '14px';
      bubble.style.maxWidth = '85%';
      bubble.style.whiteSpace = 'pre-wrap';

      if (role === 'user') {
        bubble.style.marginLeft = 'auto';
        bubble.style.background = '#38bdf8';
        bubble.style.color = '#0f172a';
      } else {
        bubble.style.background = 'rgba(15,23,42,0.9)';
        bubble.style.border = '1px solid rgba(148,163,184,0.6)';
      }

      bubble.textContent = text;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }

    var history = [];

    async function sendMessage() {
      var text = input.value.trim();
      if (!text) return;
      appendMessage('user', text);
      input.value = '';

      try {
        var res = await fetch(backendBase + '/api/v1/bots/' + botId + '/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ message: text, chat_history: history })
        });

        var data = await res.json().catch(function() { return {}; });
        if (!res.ok) {
          var detail = data && (data.detail || data.message);
          throw new Error(detail || ('HTTP ' + res.status));
        }

        var reply = data.reply || data.message || 'No response.';
        appendMessage('assistant', reply);
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: reply });
      } catch (e) {
        appendMessage('assistant', 'Error talking to this twin. Please try again later.');
        if (window && window.console && console.error) console.error('Twinly widget error:', e);
      }
    }

    button.addEventListener('click', function() {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter') sendMessage();
    });
  })();
</script>`}
                                                            </pre>
                                                            <p className="text-[11px] text-amber-300/90">
                                                                Anyone with this snippet can talk to your twin. Rotate/delete the API key if it is ever exposed or misused.
                                                            </p>
                                                        </div>
                                                    )}
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
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-[13px] font-medium text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-700 dark:hover:text-slate-300 transition-all disabled:opacity-50"
                                            >
                                                {isCreatingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                Generate New Key
                                            </button>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: The Mirror Chat UI */}
                                <div className={`col-span-12 lg:col-span-5 ${activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}`}>
                                    <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-white/[0.06] rounded-2xl h-[calc(100vh-160px)] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden sticky top-20">
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
                                            {chatMessages.map((msg: { role: 'user' | 'assistant'; text: string | null; }, i: number) => (
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
                                                    className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 py-3 pr-12 text-[14px] focus:border-slate-400 dark:focus:border-white/20 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none text-slate-900 dark:text-white transition-colors"
                                                    placeholder={botId ? "Test your agent..." : "Save a bot first to chat..."}
                                                    type="text"
                                                    value={chatInput}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleChatSend(); }}
                                                    disabled={!botId || isStreaming}
                                                />
                                                <button
                                                    onClick={handleChatSend}
                                                    disabled={!botId || isStreaming || !chatInput.trim()}
                                                    className="absolute right-2 w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-40"
                                                >
                                                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
                                                </button>
                                            </div>
                                            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-3">Twinly AI · v2.0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Analytics */}
                        {activeTab === 'analytics' && (
                            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="border border-slate-100 dark:border-white/[0.06] rounded-xl p-6 flex flex-col justify-between">
                                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Total Profile Views</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] bg-clip-text text-transparent">3,492</h3>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">+12% <span className="text-slate-400 text-xs">from last week</span></p>
                                    </div>
                                    <div className="border border-slate-100 dark:border-white/[0.06] rounded-xl p-6 flex flex-col justify-between">
                                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Agent Inquiries</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">128</h3>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">+4% <span className="text-slate-400 text-xs">from last week</span></p>
                                    </div>
                                    <div className="border border-slate-100 dark:border-white/[0.06] rounded-xl p-6 flex flex-col justify-between">
                                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Avg. Match Score</p>
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">94%</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">High compatibility rating</p>
                                    </div>
                                </div>
                                <div className="border border-slate-100 dark:border-white/[0.06] rounded-xl p-10 h-96 flex items-center justify-center flex-col text-center">
                                    <BarChart3 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Detailed analytics arriving soon</h4>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">We are compiling deeper insights regarding your agent&apos;s interactions with prospective recruiters.</p>
                                </div>
                            </div>
                        )}

                        {/* Tab: Connectors */}
                        {activeTab === 'connectors' && (
                            <div className="flex flex-col gap-6 animate-in fade-in duration-300">

                                <IntegrationHub />
                            </div>
                        )}

                        {/* Tab: History */}
                        {activeTab === 'history' && (
                            <HistoryTab botId={botId} />
                        )}

                        {/* Tab: Settings */}
                        {activeTab === 'settings' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300 pb-12">
                                <section>
                                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">Account</h3>
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

                                <section>
                                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">Appearance</h3>
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
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

                                <section>
                                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">Notifications</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Email Alerts</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive an email when a recruiter interacts securely.</p>
                                            </div>
                                            <div onClick={() => comingSoon("Email alerts")} className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer shadow-inner">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/[0.06]">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Weekly Digest</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Summary report of profile analytics.</p>
                                            </div>
                                            <div onClick={() => comingSoon("Weekly digest")} className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full relative cursor-pointer shadow-inner">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-red-400 mb-5">Danger Zone</h3>
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
        </Skeleton>
    );
}

export default function CandidateActiveDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111318]"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <CandidateActiveDashboardContent />
        </Suspense>
    );
}
