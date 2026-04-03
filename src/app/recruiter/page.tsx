"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Search,
    Bell,
    Settings,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    GraduationCap,
    Mail,
    FileText,
    ExternalLink,
    Linkedin,
    Github,
    Globe,
    Sparkles,
    Code2,
    Zap,
    Brain,
    Target,
    Rocket,
    Lightbulb,
    Coffee,
    Terminal,
    Cpu,
    Network,
    Database,
    LogOut,
    User,
    Shield,
    CheckCircle2,
    Clock,
    Loader2,
    Sun,
    Moon,
    LayoutDashboard,
    Users,
    Megaphone,
    MessageSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { useUserProfile } from "@/hooks/useUser";
import { useSearchCandidates, useCandidates } from "@/hooks/useCandidates";
import { Candidate, BotResponse } from "@/types";

const AVATARS = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=fef08a",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=bfdbfe",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=fbcfe8",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=bbf7d0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=fca5a5"
];


// Helper to generate deterministic but varied doodles based on candidate property
const DOODLE_ICONS = [Sparkles, Code2, Zap, Brain, Target, Rocket, Lightbulb, Coffee, Terminal, Cpu, Database, Network];

const generateDoodles = (seedString: string) => {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const pseudoRandom = (min: number, max: number, offset: number) => {
        const val = ((seed + offset) * 9301 + 49297) % 233280;
        return min + (val / 233280) * (max - min);
    };

    const numIcons = Math.floor(pseudoRandom(6, 12, 0));
    const icons = [];

    for (let i = 0; i < numIcons; i++) {
        const Icon = DOODLE_ICONS[Math.floor(pseudoRandom(0, DOODLE_ICONS.length, i * 10 + 1))];
        const size = pseudoRandom(18, 36, i * 10 + 2);
        const top = pseudoRandom(-10, 80, i * 10 + 3);
        const left = pseudoRandom(0, 95, i * 10 + 4);
        const rotation = pseudoRandom(-30, 30, i * 10 + 5);
        const opacity = pseudoRandom(0.1, 0.25, i * 10 + 6);

        icons.push(
            <Icon
                key={i}
                className="absolute text-white"
                style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: size,
                    height: size,
                    transform: `rotate(${rotation}deg)`,
                    opacity
                }}
            />
        );
    }

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-t-3xl border-t border-white/10">
            {icons}
        </div>
    );
};

const CandidateSkeleton = ({ index = 0 }: { index?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-[#1C2128] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col relative h-[400px] shadow-sm"
    >
        <div className="animate-pulse flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"></div>
                <div className="w-20 h-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"></div>
            </div>
            <div className="flex-1 space-y-5">
                <div className="space-y-3">
                    <div className="h-5 bg-slate-100 dark:bg-white/5 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-1/2"></div>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-1/3"></div>
                <div className="h-20 bg-slate-50 dark:bg-[#0B0E14] rounded-xl border border-slate-200/50 dark:border-white/5 mt-4"></div>
                <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                    <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                    <div className="h-6 w-14 bg-slate-100 dark:bg-white/5 rounded-md"></div>
                </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="h-10 flex-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5"></div>
                <div className="h-10 flex-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5"></div>
            </div>
        </div>
    </motion.div>
);

function RecruiterDashboardContent() {
    const { logout } = useAuth();
    const { comingSoon } = useToast();
    const { setTheme, resolvedTheme } = useTheme();
    const { data: userProfile } = useUserProfile();
    const { data: allCandidates } = useCandidates();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [mounted, setMounted] = useState(false);
    const [initialSearchDone, setInitialSearchDone] = useState(false);
    const [activeTab, setActiveTab] = useState('candidates'); // 'overview' | 'candidates' | 'campaigns' | 'chat' | 'profile'

    const { mutateAsync: searchCandidates, isPending: isSearching } = useSearchCandidates();

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Candidate[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Header dropdown states
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        const timeout = setTimeout(() => {
            setMounted(true);
            const keywords = localStorage.getItem("recruiter_keywords");
            if (keywords && !initialSearchDone) {
                setSearchQuery(keywords);
                searchCandidates(keywords)
                    .then(rawData => {
                        const mapped = formatCandidates(rawData);
                        setSearchResults(mapped.length > 0 ? mapped : []);
                    })
                    .catch(() => {
                        setSearchError("Search failed.");
                        setSearchResults([]);
                    })
                    .finally(() => {
                        setInitialSearchDone(true);
                    });
            } else if (!initialSearchDone) {
                setInitialSearchDone(true);
            }
        }, 0);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSearchDone]);

    // Format backend data into Candidate UI interface
    const formatCandidates = (rawData: BotResponse[]): Candidate[] => {
        if (!rawData) return [];
        return rawData.map((r: BotResponse, i: number) => {
            const charCode = r.id ? String(r.id).charCodeAt(String(r.id).length - 1) : i;
            return {
                id: r.id,
                name: r.name,
                role: r.summary?.split('.')[0] || "AI Professional",
                email: "", // Not returned yet by backend
                linkedin: "",
                quote: r.summary || "No summary available.",
                match: r.match_score > 0 ? r.match_score : Math.max(70, 99 - i * 3),
                matchStyle: i === 0
                    ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                    : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
                avatar: r.avatar_url || AVATARS[charCode % AVATARS.length],
                skills: r.skills,
                resume_url: r.resume_url,
                thumbnail_url: r.thumbnail_url
            };
        });
    };

    // Use search results if available, otherwise it's empty
    const displayCandidates = useMemo(() => {
        if (searchResults !== null) return searchResults;
        if (allCandidates) {
            return (allCandidates as {id:string;name:string;role?:string;email?:string;linkedin?:string;quote?:string;match:number;matchStyle?:string;avatar?:string;skills:string[];resume_url?:string;thumbnail_url?:string;experience_years?:number;projects?:{name:string;description:string;link?:string}[]}[]).map((r, i) => ({
                id: r.id,
                name: r.name,
                role: r.role || "AI Professional",
                email: r.email || "",
                linkedin: r.linkedin || "",
                quote: r.quote || "No summary available.",
                match: 0,
                matchStyle: "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10",
                avatar: r.avatar || AVATARS[i % AVATARS.length],
                skills: Array.isArray(r.skills) ? r.skills : [],
                resume_url: r.resume_url,
                thumbnail_url: r.thumbnail_url,
                experience_years: r.experience_years || 0,
                projects: (r.projects || []).map(p => ({ name: p.name, description: p.description, link: p.link || "" }))
            }));
        }
        return [];
    }, [searchResults, allCandidates]);

    const candidateIdParam = searchParams?.get('candidate');

    useEffect(() => {
        if (!mounted || !initialSearchDone) return;
        if (candidateIdParam && displayCandidates.length > 0) {
            const candidate = displayCandidates.find(c => c.id === candidateIdParam);
            if (candidate) {
                setSelectedCandidate(candidate);
            }
        } else if (!candidateIdParam) {
            setSelectedCandidate(null);
        }
    }, [candidateIdParam, displayCandidates, initialSearchDone, mounted]);

    const openCandidateModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        // Persist session to local storage for the sidebar
        if (typeof window !== "undefined") {
            const sessionsRaw = localStorage.getItem("recruiter_chat_sessions");
            let sessions = [];
            try {
                sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
            } catch (e) {
                sessions = [];
            }
            
            // Avoid duplicates
            if (!sessions.some((s: any) => s.id === candidate.id)) {
                sessions.push({
                    id: candidate.id,
                    name: candidate.name,
                    role: candidate.role,
                    lastMessage: "Started a new conversation",
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem("recruiter_chat_sessions", JSON.stringify(sessions));
            }
        }
        router.push(`/recruiter?candidate=${candidate.id}`, { scroll: false });
    };

    const closeCandidateModal = () => {
        setSelectedCandidate(null);
        router.push('/recruiter', { scroll: false });
    };

    const totalPages = Math.ceil(displayCandidates.length / ITEMS_PER_PAGE);
    const indexOfLastCandidate = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstCandidate = indexOfLastCandidate - ITEMS_PER_PAGE;
    const currentCandidates = displayCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }
        setSearchError(null);
        setCurrentPage(1);
        try {
            const rawData = await searchCandidates(query);
            const mapped = formatCandidates(rawData);
            setSearchResults(mapped.length > 0 ? mapped : []);
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            if ((err as { response?: { status?: number } })?.response?.status === 403) {
                setSearchError("Recruiter account required to perform searches.");
                setSearchResults([]);
            } else {
                setSearchError(detail || "Search failed.");
                setSearchResults([]);
            }
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        await performSearch(searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
        setSearchError(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#111318] text-slate-900 dark:text-white font-sans antialiased">


            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-8 py-4 bg-white dark:bg-[#111318] sticky top-0 z-50">
                <div className="flex items-center gap-6 overflow-hidden">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <Image
                            src="/butterfly.svg"
                            alt="TwinlyAI Logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        <h2 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                            Twinly<span className="font-light">AI</span>
                        </h2>
                    </Link>
                    <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide pr-4 min-w-0 hidden md:flex">
                        <button
                            className={`text-[14px] font-medium transition-colors py-2 ${activeTab === 'overview' ? 'text-slate-900 dark:text-white relative after:content-[""] after:absolute after:-bottom-[19px] after:left-0 after:w-full after:h-[2px] after:bg-blue-600 dark:after:bg-purple-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            onClick={() => { setActiveTab('overview'); comingSoon("Overview dashboard"); }}
                        >
                            Overview
                        </button>
                        <button
                            className={`text-[14px] font-medium transition-colors py-2 ${activeTab === 'candidates' ? 'text-slate-900 dark:text-white relative after:content-[""] after:absolute after:-bottom-[19px] after:left-0 after:w-full after:h-[2px] after:bg-blue-600 dark:after:bg-purple-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            onClick={() => setActiveTab('candidates')}
                        >
                            Candidates
                        </button>
                        <button
                            className={`text-[14px] font-medium transition-colors py-2 ${activeTab === 'campaigns' ? 'text-slate-900 dark:text-white relative after:content-[""] after:absolute after:-bottom-[19px] after:left-0 after:w-full after:h-[2px] after:bg-blue-600 dark:after:bg-purple-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            onClick={() => { setActiveTab('campaigns'); comingSoon("Campaign management"); }}
                        >
                            Campaigns
                        </button>
                        <Link
                            href="/recruiter/chat"
                            className={`text-[14px] font-medium transition-colors py-2 ${activeTab === 'chat' ? 'text-slate-900 dark:text-white relative after:content-[""] after:absolute after:-bottom-[19px] after:left-0 after:w-full after:h-[2px] after:bg-blue-600 dark:after:bg-purple-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            Chats
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 relative">
                    <div className="flex items-center bg-slate-200/50 dark:bg-[#1C2128]/50 rounded-full px-3 py-1 gap-3 border border-transparent dark:border-white/5">

                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsSettingsOpen(false); setIsProfileMenuOpen(false); }}
                                className={`flex items-center justify-center transition-colors relative ${isNotificationsOpen ? 'text-blue-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-[#0B0E14]"></span>
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                                        <button className="text-xs text-blue-600 dark:text-purple-400 font-semibold hover:underline">Mark all read</button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <div className="p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-purple-500/20 text-blue-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                <Target size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-900 dark:text-white font-medium mb-1"><span className="font-bold">Alex Rivera</span> matches your Python req!</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock size={12} /> 2h ago</p>
                                            </div>
                                        </div>
                                        <div className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3 opacity-60">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-900 dark:text-white font-medium mb-1">Interview with <span className="font-bold">Sarah Jenkins</span> complete.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock size={12} /> 1d ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsNotificationsOpen(false); setIsProfileMenuOpen(false); }}
                                className={`flex items-center justify-center transition-colors ${isSettingsOpen ? 'text-blue-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                <Settings size={20} />
                            </button>

                            {isSettingsOpen && (
                                <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2">Preferences</h3>
                                    <button onClick={() => comingSoon("Security settings")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <Shield size={16} className="text-slate-400" /> Account Security
                                    </button>
                                    <button onClick={() => comingSoon("Notification preferences")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <Bell size={16} className="text-slate-400" /> Alert Preferences
                                    </button>
                                    <button
                                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg flex items-center justify-between transition-colors mt-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            {resolvedTheme === 'dark' ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-slate-400" />}
                                            Dark Mode
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative shadow-inner transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-purple-500' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${resolvedTheme === 'dark' ? 'left-4' : 'left-0.5'}`}></div>
                                        </div>
                                    </button>
                                    <div className="h-px bg-slate-200 dark:bg-white/10 my-2 mx-1"></div>
                                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationsOpen(false); setIsSettingsOpen(false); }}
                            className={`h-8 w-8 rounded-full overflow-hidden border transition-all ${isProfileMenuOpen ? 'border-blue-500 dark:border-purple-500 ring-2 ring-blue-500/20 dark:ring-purple-500/20' : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40'} bg-slate-200 dark:bg-[#1C2128] cursor-pointer`}
                        >
                            <Image src={AVATARS[0]} alt="Recruiter Avatar" width={32} height={32} className="w-full h-full object-cover" />
                        </button>

                        {isProfileMenuOpen && (
                            <div className="absolute top-full right-0 mt-4 w-60 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-slate-50 dark:bg-white/5">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/20">
                                        <Image src={AVATARS[0]} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{userProfile?.email?.split('@')[0] || "Recruiter"}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{userProfile?.email || "recruiter@twinly.ai"}</p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button onClick={() => comingSoon("Profile management")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <User size={16} className="text-slate-400" /> My Profile
                                    </button>
                                    <button onClick={() => comingSoon("Active roles")} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <Briefcase size={16} className="text-slate-400" /> Active Roles
                                    </button>
                                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-1"></div>
                                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-colors">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-8 sm:py-12 relative z-10 pb-24 md:pb-12">
                <div className="mb-6">
                    <h1 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight">Candidates</h1>
                    <p className="text-[14px] text-slate-400 dark:text-slate-500 mt-1">Search the talent pool by skill, role, or keyword.</p>
                </div>

                <div className="max-w-3xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            {isSearching
                                ? <Loader2 className="text-slate-400 w-5 h-5 animate-spin" />
                                : <Search className="text-slate-400 w-5 h-5" />}
                        </div>
                        <input
                            className="w-full h-11 pl-10 pr-28 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-lg focus:border-slate-400 dark:focus:border-white/30 focus:outline-none text-[15px] font-normal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            placeholder="Frontend dev, ML engineer..."
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-3 top-3 bottom-3 flex items-center gap-1">
                            {searchQuery && (
                                <button type="button" onClick={clearSearch} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                            <button type="submit" disabled={isSearching} className="h-full px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md font-medium text-[13px] hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50">
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {searchError && (
                        <p className="mt-3 text-center text-sm text-amber-600 dark:text-amber-400">{searchError}</p>
                    )}
                    {searchResults !== null && (
                        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                            {searchResults.length === 0
                                ? "No candidates found for that query."
                                : `Found ${searchResults.length} candidate${searchResults.length !== 1 ? 's' : ''} matching your search.`}
                        </p>
                    )}

                    <div className="flex gap-2 mt-6 justify-center overflow-x-auto pb-2 scrollbar-none">
                        {["Python", "Machine Learning", "Remote", "Senior Level"].map(chip => (
                            <button
                                key={chip}
                                onClick={() => {
                                    setSearchQuery(chip);
                                    performSearch(chip);
                                }}
                                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${searchQuery.toLowerCase() === chip.toLowerCase()
                                    ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900"
                                    : "bg-white dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                    }`}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isSearching || !initialSearchDone ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <CandidateSkeleton key={i} index={i} />
                        ))
                    ) : searchError ? (
                        <p className="col-span-full text-center text-red-500">{searchError}</p>
                    ) : (
                        currentCandidates.map((candidate) => (
                            <div key={candidate.id} onClick={() => openCandidateModal(candidate)} className="bg-white dark:bg-[#161B22] rounded-xl border border-slate-100 dark:border-white/[0.07] p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer flex flex-col">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-100 dark:bg-white/5 shrink-0">
                                        <Image src={candidate.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=fallback"} alt={candidate.name} width={40} height={40} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">{candidate.name}</h3>
                                        <p className="text-[13px] text-slate-400 dark:text-slate-500 truncate">{candidate.role}</p>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">{candidate.experience_years}y</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                                        {candidate.quote}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {candidate.skills.slice(0,4).map((_: string, index: number) => (
                                            <span key={index} className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[11px] rounded border border-slate-100 dark:border-white/[0.07]">
                                                {candidate.skills[index]}
                                            </span>
                                        ))}
                                        {candidate.skills.length > 4 && (
                                            <span className="px-2 py-0.5 text-slate-400 dark:text-slate-500 text-[11px]">+{candidate.skills.length-4}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <Link
                                        href="/recruiter/chat"
                                        className="flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Pass bot ID to the chat page via localStorage
                                            if (candidate.id) {
                                                localStorage.setItem("recruiter_chat_botId", candidate.id);
                                                localStorage.setItem("recruiter_chat_botName", candidate.name);
                                            }
                                        }}
                                    >
                                        <button className="w-full py-1.5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[12px] font-medium hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/[0.07] transition-colors">
                                            Chat
                                        </button>
                                    </Link>
                                    <button
                                        className="flex-1 w-full py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (candidate.id) {
                                                localStorage.setItem("recruiter_chat_botId", candidate.id);
                                                localStorage.setItem("recruiter_chat_botName", candidate.name);
                                            }
                                            router.push("/recruiter/call");
                                        }}
                                    >
                                        Call
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!isSearching && initialSearchDone && displayCandidates.length === 0 && searchResults !== null && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matches found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            We couldn&apos;t find any candidates matching &quot;{searchQuery}&quot;. Try adjusting your filters or use different keywords.
                        </p>
                        <button onClick={clearSearch} className="px-6 py-2.5 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                            Clear Search
                        </button>
                    </div>
                )}

                {!isSearching && initialSearchDone && displayCandidates.length === 0 && searchResults === null && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-400">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start your search</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            Use the search bar above to look for the perfect candidates based on skills, roles, or keywords.
                        </p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md flex items-center justify-center bg-transparent border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-white/30 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors shadow-sm ${currentPage === number
                                        ? "bg-blue-600 dark:bg-purple-600 text-white border-transparent"
                                        : "bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md flex items-center justify-center bg-transparent border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-white/30 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

            </main>

            {/* Candidate Profile Modal */}
            {mounted && selectedCandidate && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeCandidateModal}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#161B22] rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-white/[0.07] flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                        {/* Header Image / Pattern - Fixed at top */}
                        <div className="h-20 shrink-0 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/[0.06] relative sm:rounded-t-2xl overflow-hidden">
                            <button
                                onClick={closeCandidateModal}
                                className="absolute top-3 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-50 flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content Scrollable Area */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 sm:px-8 pb-6 relative pt-0">
                            <div className="flex justify-between items-end -mt-12 mb-6 pointer-events-none">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#1C2128] bg-slate-100 dark:bg-[#0B0E14] relative z-10 pointer-events-auto">
                                    <Image src={selectedCandidate.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=fallback"} alt={selectedCandidate.name} width={96} height={96} className="w-full h-full object-cover" />
                                </div>
                                <div className={`px-4 py-1.5 text-xs font-bold rounded-full border pointer-events-auto shadow-sm ${selectedCandidate.matchStyle}`}>
                                    {selectedCandidate.match}% MATCH SCORE
                                </div>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{selectedCandidate.name}</h2>
                            <p className="text-blue-600 dark:text-purple-400 text-base sm:text-lg font-semibold mb-6">{selectedCandidate.role}</p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                <a href={selectedCandidate.resume_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-10 px-4 rounded-full bg-blue-600 dark:bg-purple-600 text-white hover:bg-blue-700 dark:hover:bg-purple-700 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-blue-600/30 gap-2" title="View Resume">
                                    <FileText size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Resume</span>
                                </a>
                                <a href={`mailto:${selectedCandidate.email}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-white/10 shadow-sm outline-none focus:ring-2 focus:ring-blue-600/30" title={selectedCandidate.email}>
                                    <Mail size={18} />
                                </a>
                                <a href={selectedCandidate.linkedin || "#"} onClick={(e) => { if (!selectedCandidate.linkedin) { e.preventDefault(); alert("LinkedIn profile not provided."); } }} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-[#0a66c2]/10 hover:text-[#0a66c2] transition-colors border border-slate-200 dark:border-white/10 shadow-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30" title="LinkedIn Profile">
                                    <Linkedin size={18} />
                                </a>
                                {selectedCandidate.github_url && (
                                    <a href={selectedCandidate.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10 shadow-sm outline-none focus:ring-2 focus:ring-slate-500/30" title="GitHub Profile">
                                        <Github size={18} />
                                    </a>
                                )}
                            </div>

                            <div className="space-y-8 pb-12">
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <Briefcase size={14} className="text-blue-600/50 dark:text-purple-500/50" /> Executive Summary
                                    </h3>
                                    <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-[#0B0E14]/30 p-5 rounded-2xl border border-slate-100 dark:border-white/5 italic">
                                        &quot;{selectedCandidate.quote}&quot;
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <FileText size={14} className="text-blue-600/50 dark:text-purple-500/50" /> Core Competencies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.skills.map((_: string, index: number) => (
                                            <span key={index} className="px-3 py-1.5 bg-blue-50/50 dark:bg-purple-500/5 text-blue-700/80 dark:text-purple-300/80 text-[11px] font-bold rounded-lg border border-blue-100/50 dark:border-purple-500/10 shadow-sm uppercase tracking-wide">
                                                {selectedCandidate.skills[index]}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
                                        <Code2 size={14} className="text-blue-600/50 dark:text-purple-500/50" /> Featured Work
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedCandidate.projects && selectedCandidate.projects.length > 0 ? (
                                            selectedCandidate.projects.map((project: { name: string; description: string; link?: string }, idx: number) => (
                                                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-blue-200/50 dark:hover:border-purple-500/20 transition-all group/proj shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{project.name}</h4>
                                                        {project.link && (
                                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 dark:hover:text-purple-400 transition-colors">
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{project.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-2 opacity-50">No projects manually added.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
                                        <GraduationCap size={14} className="text-blue-600/50 dark:text-purple-500/50" /> Career Profile
                                    </h3>
                                    <div className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-8">
                                        <div className="relative">
                                            <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-blue-100 dark:bg-purple-900/50 border-[3px] border-white dark:border-[#1C2128]"></div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">Senior AI Engineer</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-2">2021 - Present</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Leading large-scale RAG deployments and LLM fine-tuning initiatives for talent acquisition pipelines.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-slate-100 dark:bg-white/10 border-[3px] border-white dark:border-[#1C2128]"></div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">Software Architect</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-2">2018 - 2021</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Designed and implemented cloud-native microservices with a focus on high-availability and security.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions - Sticky bottom on any screen for reachability */}
                        <div className="p-6 shrink-0 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-xl flex flex-col sm:flex-row gap-3 z-[70]">
                            <button
                                onClick={async () => {
                                    if (selectedCandidate) {
                                        localStorage.setItem("recruiter_chat_botId", selectedCandidate.id);
                                        localStorage.setItem("recruiter_chat_botName", selectedCandidate.name);

                                        try {
                                            const newChat = {
                                                id: selectedCandidate.id,
                                                name: selectedCandidate.name,
                                                role: selectedCandidate.role || "AI Professional",
                                                avatar: selectedCandidate.avatar,
                                                lastMessage: "Start a conversation...",
                                                time: "Just now",
                                                unread: 0,
                                                botId: selectedCandidate.id,
                                                timestamp: Date.now()
                                            };
                                            const existingRaw = localStorage.getItem("recruiter_chat_sessions");
                                            let existing = existingRaw ? JSON.parse(existingRaw) : [];
                                            existing = existing.filter((c: { id: string }) => c.id !== newChat.id);
                                            existing.unshift(newChat);
                                            localStorage.setItem("recruiter_chat_sessions", JSON.stringify(existing));
                                        } catch (e) {
                                            console.error("Could not save chat session", e);
                                        }

                                        router.push("/recruiter/chat", { scroll: false });
                                    }
                                }}
                                className="flex-1 py-3 px-5 rounded-lg bg-white dark:bg-white/5 text-slate-700 dark:text-white text-[13px] font-medium hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all text-center"
                            >
                                Message Digital Twin
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedCandidate) {
                                        localStorage.setItem("recruiter_chat_botId", selectedCandidate.id);
                                        localStorage.setItem("recruiter_chat_botName", selectedCandidate.name);
                                    }
                                    router.push("/recruiter/call");
                                }}
                                className="flex-1 py-3 px-5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-all text-center"
                            >
                                Voice Interview
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Mobile Bottom Tab Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex md:hidden items-center justify-around px-6 z-[60] safe-area-bottom">
                {[
                    { id: 'overview', label: 'Home', icon: LayoutDashboard },
                    { id: 'candidates', label: 'Search', icon: Users },
                    { id: 'chat', label: 'Chats', icon: MessageSquare },
                    { id: 'campaigns', label: 'Ads', icon: Megaphone },
                    { id: 'profile', label: 'Profile', icon: User }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.id === 'chat') {
                                setActiveTab('chat');
                                router.push('/recruiter/chat');
                                return;
                            }
                            setActiveTab(tab.id);
                            if (tab.id === 'overview' || tab.id === 'campaigns') {
                                comingSoon(tab.label);
                            }
                            if (tab.id === 'profile') {
                                setIsProfileMenuOpen(true);
                            } else {
                                setIsProfileMenuOpen(false);
                            }
                        }}
                        className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all"
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-lg shadow-blue-500/20 dark:shadow-purple-500/20 scale-110'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}>
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold tracking-tight uppercase ${activeTab === tab.id ? 'text-blue-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

import { Suspense } from "react";
export default function RecruiterDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14]"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <RecruiterDashboardContent />
        </Suspense>
    );
}
