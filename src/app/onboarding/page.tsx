"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check, Sparkles, Plus, X, Upload, AlertCircle, Target, Briefcase } from "lucide-react";
import api from "@/lib/api";
import { setToken, setStoredUser } from "@/lib/auth";

const INITIAL_AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=fef08a",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=bfdbfe",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=fbcfe8",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=bbf7d0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=fca5a5",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=fde047",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=c4b5fd"
];

const PRESET_GOALS = {
    candidate: [
        "Finding a Senior AI Engineering role",
        "Transitioning to Product Management",
        "Discovering remote opportunities",
        "Showcasing my open-source contributions",
    ],
    recruiter: [
        "Hiring Senior Machine Learning Engineers",
        "Building a founding engineering team",
        "Sourcing top-tier frontend talent",
        "Automating my recruitment pipeline",
    ]
};

const HOBBY_SUGGESTIONS = [
    "Coding", "Reading", "Gaming", "Hiking", "Photography", "Music", "Cooking", "Travel"
];

type Project = {
    name: string;
    description: string;
    link: string;
};

type FormData = {
    // Shared
    firstName: string;
    lastName: string;
    avatarUrl: string;
    aspirations: string;
    email: string;

    // Candidate Specific
    phone: string;
    contactPreference: string[];
    projects: Project[];
    favoriteQuote: string;
    hobbies: string[];

    // Recruiter Specific
    companyName: string;
    companyWebsite: string;
    companySize: string;
    hiringRoles: string[];
    techStackFocus: string[];
    hiringVelocity: string;
    // Shared links (added to shared or role-specific as needed)
    github_url: string;
    twitter_url: string;
    website_url: string;
    linkedin_url: string; // Renaming from linkedIn for backend consistency or just adding it
    linkedIn: string; // Keeping for now to avoid breaking existing refs if any
    outreachPreference: string[];
};

export default function OnboardingWizard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14]"><Sparkles className="animate-pulse w-8 h-8 text-blue-600 dark:text-purple-500" /></div>}>
            <OnboardingWizardForm />
        </Suspense>
    );
}

function OnboardingWizardForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "candidate";

    const totalSteps = 6;
    const STORAGE_KEY = `twinlyai_onboarding_${role}`;

    const defaultFormData: FormData = {
        firstName: "",
        lastName: "",
        avatarUrl: INITIAL_AVATAR_OPTIONS[0],
        aspirations: "",
        email: "",
        phone: "",
        contactPreference: ["Email"],
        projects: [],
        favoriteQuote: "",
        hobbies: [],
        companyName: "",
        companyWebsite: "",
        companySize: "",
        hiringRoles: [],
        techStackFocus: [],
        hiringVelocity: "",
        linkedIn: "",
        github_url: "",
        twitter_url: "",
        website_url: "",
        linkedin_url: "",
        outreachPreference: [],
    };

    const [isMounted, setIsMounted] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [avatarOptions, setAvatarOptions] = useState(INITIAL_AVATAR_OPTIONS);
    const [showMoreContact, setShowMoreContact] = useState(false);

    // For custom inputs
    const [customHobby, setCustomHobby] = useState("");
    const [customTechStack, setCustomTechStack] = useState("");

    // Load from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.formData) setFormData(parsed.formData);
                if (parsed.step && parsed.step <= totalSteps) setStep(parsed.step);
            } catch (e) {
                console.error("Failed to parse saved onboarding data", e);
            }
        }
        setIsMounted(true);
    }, [STORAGE_KEY, totalSteps]);

    // Auto-save whenever step or data changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
        }
    }, [step, formData, STORAGE_KEY, isMounted]);

    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    const [direction, setDirection] = useState(1);

    const handleNext = () => {
        if (step < totalSteps) {
            setDirection(1);
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await api.post("/auth/signup", {
                email: formData.email,
                password: password || "TwinlyDefault123!",
                role,
            });

            const loginForm = new URLSearchParams();
            loginForm.append("username", formData.email);
            loginForm.append("password", password || "TwinlyDefault123!");
            const loginRes = await api.post("/auth/login", loginForm, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            const token: string = loginRes.data.access_token;
            setToken(token);
            setStoredUser({ email: formData.email, role: role as "candidate" | "recruiter" });

            if (role === "candidate") {
                const botName = `${formData.firstName} ${formData.lastName}`;
                const botRes = await api.post("/bots/create", { name: botName }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const botId: string = botRes.data.id ?? botRes.data._id;

                await api.patch(`/bots/${botId}`, {
                    linkedin_url: formData.linkedin_url || formData.linkedIn,
                    github_url: formData.github_url,
                    twitter_url: formData.twitter_url,
                    website_url: formData.website_url,
                    projects: formData.projects,
                    summary: formData.aspirations,
                    avatar_url: formData.avatarUrl,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                localStorage.setItem("twinly_botId", botId);
                localStorage.setItem("twinly_userName", botName);
                localStorage.setItem("userAvatar", formData.avatarUrl);
                localStorage.setItem("userName", botName);
            } else {
                // For recruiters, just store basic info
                localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`);
                localStorage.setItem("userAvatar", formData.avatarUrl);

                // Store keywords for default Dashboard view
                const keywords = [...formData.hiringRoles, ...formData.techStackFocus].filter(Boolean).join(" ");
                if (keywords) {
                    localStorage.setItem("recruiter_keywords", keywords);
                }
            }

            localStorage.removeItem(STORAGE_KEY);

            if (role === "recruiter") {
                router.push("/recruiter");
            } else {
                router.push("/candidate-empty");
            }
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            if (typeof detail === "string" && detail.includes("already exists")) {
                try {
                    const loginForm = new URLSearchParams();
                    loginForm.append("username", formData.email);
                    loginForm.append("password", password || "TwinlyDefault123!");
                    const loginRes = await api.post("/auth/login", loginForm, {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    });
                    const token: string = loginRes.data.access_token;
                    setToken(token);
                    setStoredUser({ email: formData.email, role: role as "candidate" | "recruiter" });
                    localStorage.removeItem(STORAGE_KEY);
                    router.push(role === "recruiter" ? "/recruiter" : "/candidate-empty");
                    return;
                } catch {
                    setSubmitError("Account exists but incorrect password. Please use the login page.");
                }
            } else {
                let errorMsg = "Something went wrong. Please try again.";
                if (typeof detail === "string") {
                    errorMsg = detail;
                } else if (Array.isArray(detail)) {
                    const detailArr = detail as any[];
                    if (detailArr.length > 0 && detailArr[0].msg) {
                        errorMsg = detailArr.map((d: any) => d.msg).join(", ");
                    }
                }
                setSubmitError(errorMsg);
                console.error("Submission error details:", detail, err);
            }
            setIsSubmitting(false);
        }
    };

    const handleAddProject = () => {
        if (formData.projects.length < 2) {
            setFormData({
                ...formData,
                projects: [...formData.projects, { name: "", description: "", link: "" }]
            });
        }
    };

    const handleRemoveProject = (index: number) => {
        const newProjects = [...formData.projects];
        newProjects.splice(index, 1);
        setFormData({ ...formData, projects: newProjects });
    };

    const handleUpdateProject = (index: number, field: keyof Project, value: string) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        setFormData({ ...formData, projects: newProjects });
    };

    const toggleHobby = (hobby: string) => {
        if (formData.hobbies.includes(hobby)) {
            setFormData({ ...formData, hobbies: formData.hobbies.filter(h => h !== hobby) });
        } else {
            setFormData({ ...formData, hobbies: [...formData.hobbies, hobby] });
        }
    };

    const addCustomHobby = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customHobby.trim()) {
            e.preventDefault();
            if (!formData.hobbies.includes(customHobby.trim())) {
                setFormData({ ...formData, hobbies: [...formData.hobbies, customHobby.trim()] });
            }
            setCustomHobby("");
        }
    };

    const addCustomTechStack = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customTechStack.trim()) {
            e.preventDefault();
            if (!formData.techStackFocus.includes(customTechStack.trim())) {
                setFormData({ ...formData, techStackFocus: [...formData.techStackFocus, customTechStack.trim()] });
            }
            setCustomTechStack("");
        }
    };

    const isStepValid = () => {
        if (step === 1) return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
        if (step === 2) return formData.avatarUrl !== "";
        if (step === 6) return formData.aspirations.trim() !== "";

        if (role === "recruiter") {
            if (step === 3) return formData.companyName.trim() !== "";
            if (step === 4) return formData.hiringRoles.length > 0;
            if (step === 5) return formData.email.trim() !== "" && formData.email.includes("@") && password.length >= 8;
        } else {
            // Candidate validation
            if (step === 3) return formData.email.trim() !== "" && formData.email.includes("@") && password.length >= 8;
            if (step === 4) {
                if (formData.projects.length > 0) {
                    return formData.projects.every(p => p.name.trim() !== "");
                }
                return true;
            }
            if (step === 5) return true;
        }
        return false;
    };

    const handleShuffleAvatars = () => {
        const bgColors = ['e2e8f0', 'fef08a', 'bfdbfe', 'fbcfe8', 'bbf7d0', 'fca5a5', 'fde047', 'c4b5fd'];
        const newAvatars = Array.from({ length: 8 }).map(() => {
            const seed = Math.random().toString(36).substring(7);
            const color = bgColors[Math.floor(Math.random() * bgColors.length)];
            return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=${color}`;
        });
        setAvatarOptions(newAvatars);
        if (!newAvatars.includes(formData.avatarUrl)) {
            setFormData({ ...formData, avatarUrl: "" });
        }
    };

    if (!isMounted) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 pb-24 bg-slate-100 dark:bg-[#0B0E14] transition-colors duration-300 relative overflow-hidden font-sans">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-0 dark:opacity-100 transition-opacity duration-300">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
            </div>

            <div className="fixed top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-50 bg-slate-100/80 dark:bg-[#0B0E14]/80 backdrop-blur-md border-b border-transparent dark:border-white/5">
                <div className="flex items-center gap-3 md:gap-4 font-sans antialiased">
                    <Image src="/butterfly.svg" alt="TwinlyAI" width={32} height={32} className="w-8 h-8 md:w-10 md:h-10" />

                    <AnimatePresence>
                        {step > 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="hidden sm:flex items-center gap-2 bg-slate-200/50 dark:bg-[#1C2128]/50 px-3 py-1.5 rounded-full">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-300 dark:border-white/20">
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                                        {formData.firstName}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <AnimatePresence>
                        {step > 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="sm:hidden"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-sm">
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => {
                            // Keep manual backup local storage before leaving just in case
                            localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
                            router.push("/role-selection");
                        }}
                        className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors min-h-[44px] flex items-center"
                    >
                        Save & Exit
                    </button>
                </div>
            </div>

            <main className="w-full max-w-2xl relative z-10">
                {isSubmitting ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[400px] w-full">
                        <div className="w-24 h-24 mb-10 relative">
                            {/* Abstract layered document icon animating */}
                            <motion.div
                                className="absolute inset-0 bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-2xl"
                                animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="absolute inset-0 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl flex items-center justify-center z-10"
                                animate={{ y: [0, 4, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            >
                                {role === 'candidate' ? (
                                    <Sparkles className="w-10 h-10 text-blue-600 dark:text-purple-400" />
                                ) : (
                                    <Target className="w-10 h-10 text-blue-600 dark:text-purple-400" />
                                )}
                            </motion.div>
                        </div>

                        <div className="space-y-4 max-w-sm w-full mx-auto bg-white/50 dark:bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/50 dark:border-white/5">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB] mb-6 text-center tracking-tight">
                                {role === 'candidate' ? "Assembling your AI Twin" : "Structuring your Workspace"}
                            </h2>
                            {[
                                { text: role === 'candidate' ? "Parsing background and experience..." : "Configuring job profiles...", delay: 0 },
                                { text: role === 'candidate' ? "Tuning personality matrix..." : "Structuring interview models...", delay: 1.5 },
                                { text: "Finalizing preferences...", delay: 3 }
                            ].map((stepItem, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: stepItem.delay, duration: 0.8, ease: "easeOut" }}
                                    className="flex items-center gap-4 text-[13px] font-semibold text-slate-500 dark:text-slate-400"
                                >
                                    <div className="relative flex items-center justify-center w-5 h-5">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute w-2 h-2 rounded-full bg-blue-500/30 dark:bg-purple-500/30"
                                        />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-purple-500 relative z-10" />
                                    </div>
                                    <span className="flex-1">{stepItem.text}</span>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: stepItem.delay + 1, duration: 0.3 }}
                                    >
                                        <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-12 flex items-center justify-center gap-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? 'w-8 bg-blue-600 dark:bg-purple-500' :
                                        i + 1 < step ? 'w-4 bg-blue-600/50 dark:bg-purple-500/50' :
                                            'w-4 bg-slate-200 dark:bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="bg-white dark:bg-[#161B22] border border-transparent dark:border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-2xl transition-colors duration-300 min-h-[450px] relative overflow-hidden flex flex-col">
                            {step > 1 && (
                                <button onClick={handleBack} className="absolute top-6 left-6 md:top-8 md:left-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-20 min-h-[44px] min-w-[44px] flex items-center justify-center">
                                    <ChevronLeft size={24} />
                                </button>
                            )}

                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex-1 flex flex-col"
                                >
                                    {/* ----------------- STEP 1: NAME ----------------- */}
                                    {step === 1 && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">Let's start with the basics.</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">What should we call you?</p>
                                            <div className="space-y-5">
                                                <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all placeholder:text-slate-400 dark:placeholder:text-[#57606A] text-lg font-medium" autoFocus />
                                                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all placeholder:text-slate-400 dark:placeholder:text-[#57606A] text-lg font-medium" />
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- STEP 2: AVATAR ----------------- */}
                                    {step === 2 && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">Choose your avatar.</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-8">How you'll appear to {role === 'candidate' ? 'recruiters' : 'candidates'} through your AI Twin.</p>
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                {avatarOptions.map((url, idx) => (
                                                    <button key={idx} onClick={() => setFormData({ ...formData, avatarUrl: url })}
                                                        className={`relative rounded-2xl aspect-square overflow-hidden border-4 transition-all duration-300 hover:scale-[1.03] ${formData.avatarUrl === url ? 'border-blue-600 dark:border-purple-500 shadow-md shadow-blue-500/20' : 'border-transparent hover:border-slate-300 dark:hover:border-white/20'}`}
                                                    >
                                                        <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                                                        {formData.avatarUrl === url && (
                                                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-center">
                                                <button onClick={handleShuffleAvatars} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                                                    <Sparkles size={16} /> Shuffle Avatars
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- STEP 3: CONTACT OR COMPANY DETAILS ----------------- */}
                                    {step === 3 && role === 'candidate' && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">Nice to meet you, {formData.firstName || 'there'}!</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">How should recruiters reach you?</p>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Email (Required)</label>
                                                    <input type="email" placeholder="hello@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all" autoFocus />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Password (Required)</label>
                                                    <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all" />
                                                    {password.length > 0 && password.length < 8 && (
                                                        <p className="text-red-500 text-xs mt-1 ml-2">Password must be at least 8 characters.</p>
                                                    )}
                                                </div>

                                                {showMoreContact ? (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Phone (Optional)</label>
                                                            <input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 ml-2">Preferred Contact Method</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['Email', 'Phone', 'LinkedIn', 'Text Message'].map(pref => (
                                                                    <button key={pref}
                                                                        onClick={() => {
                                                                            const prefs = formData.contactPreference.includes(pref) ? formData.contactPreference.filter(p => p !== pref) : [...formData.contactPreference, pref];
                                                                            setFormData({ ...formData, contactPreference: prefs });
                                                                        }}
                                                                        className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${formData.contactPreference.includes(pref) ? 'bg-blue-600/10 dark:bg-purple-500/20 border-blue-600 dark:border-purple-500 text-blue-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                                                                    >
                                                                        {pref}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* --- NEW SOCIAL LINKS BLOCK --- */}
                                                        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-2">Professional Profiles</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="url" placeholder="LinkedIn URL" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value, linkedIn: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="GitHub URL" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="Twitter URL" value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="Personal Website" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <button onClick={() => setShowMoreContact(true)} className="w-full py-3 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        Add phone or professional links (Optional)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && role === 'recruiter' && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">Welcome aboard, {formData.firstName || 'there'}!</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">Where are you hiring for?</p>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Company Name (Required)</label>
                                                    <input type="text" placeholder="Acme AI Inc." value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all" autoFocus />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Company Website (Optional)</label>
                                                    <input type="url" placeholder="https://..." value={formData.companyWebsite} onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 ml-2">Company Size</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['1-10', '11-50', '51-200', '201-500', '500+'].map(size => (
                                                            <button key={size}
                                                                onClick={() => setFormData({ ...formData, companySize: size })}
                                                                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${formData.companySize === size ? 'bg-blue-600/10 dark:bg-purple-500/20 border-blue-600 dark:border-purple-500 text-blue-600 dark:text-purple-400 shadow-sm' : 'bg-slate-50 dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- STEP 4: PROJECTS (Candidate Only) ----------------- */}
                                    {step === 4 && role === 'candidate' && (
                                        <div className="flex-1 flex flex-col justify-start max-w-lg mx-auto w-full max-h-full overflow-y-auto scrollbar-none pb-4">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-2 text-center mt-4">Got any cool projects?</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm text-center mb-8 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                                                <Sparkles className="inline-block w-4 h-4 mr-2 text-yellow-500" />
                                                We'll try to extract them from your resume, but let us know if you have anything particular to highlight!
                                            </p>

                                            <div className="space-y-6">
                                                {formData.projects.map((proj, idx) => (
                                                    <div key={idx} className="relative bg-slate-50 dark:bg-[#1C2128] p-5 rounded-3xl border border-slate-200 dark:border-white/10">
                                                        <button onClick={() => handleRemoveProject(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                                                            <X size={18} />
                                                        </button>
                                                        <div className="space-y-4">
                                                            <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => handleUpdateProject(idx, 'name', e.target.value)}
                                                                className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white" />
                                                            <input type="url" placeholder="Link (e.g., github.com/user/project)" value={proj.link} onChange={(e) => handleUpdateProject(idx, 'link', e.target.value)}
                                                                className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white text-sm" />
                                                            <textarea placeholder="Short description..." value={proj.description} onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                                                                className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white text-sm min-h-[80px] resize-none" />
                                                        </div>
                                                    </div>
                                                ))}

                                                {formData.projects.length < 2 && (
                                                    <button onClick={handleAddProject} className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 rounded-3xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-purple-500/10 dark:hover:border-purple-500/50 transition-all group">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-purple-500/20 group-hover:text-blue-600 dark:group-hover:text-purple-400 text-slate-400">
                                                            <Plus size={20} />
                                                        </div>
                                                        <span className="font-medium text-sm">Add a Project (Optional)</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && role === 'recruiter' && (
                                        <div className="flex-1 flex flex-col justify-start max-w-lg mx-auto w-full max-h-full overflow-y-auto scrollbar-none pb-4">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center mt-4">What talent do you need?</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">This helps us surface the perfect candidates.</p>

                                            <div className="space-y-8">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Primary Roles Required</label>
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {['AI Researchers', 'ML Engineers', 'Data Scientists', 'Full-Stack AI', 'Product Managers', 'Designers'].map(r => (
                                                            <button key={r} onClick={() => {
                                                                const roles = formData.hiringRoles.includes(r) ? formData.hiringRoles.filter(role => role !== r) : [...formData.hiringRoles, r];
                                                                setFormData({ ...formData, hiringRoles: roles });
                                                            }}
                                                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${formData.hiringRoles.includes(r) ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-purple-600 dark:border-purple-600 shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                                                            >
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Specific Tech Stack Focus</label>
                                                    <div className="flex flex-wrap gap-2 justify-center mb-3">
                                                        {formData.techStackFocus.map(stack => (
                                                            <button key={stack} onClick={() => setFormData({ ...formData, techStackFocus: formData.techStackFocus.filter(s => s !== stack) })}
                                                                className="px-3 py-1 rounded-md border border-indigo-600 bg-indigo-600 text-white dark:bg-purple-600 text-xs font-semibold shadow-sm"
                                                            >
                                                                {stack} &times;
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input type="text" placeholder="Type a skill (e.g., PyTorch, Next.js) and press Enter..." value={customTechStack} onChange={(e) => setCustomTechStack(e.target.value)} onKeyDown={addCustomTechStack}
                                                        className="w-full bg-transparent border-b border-slate-300 dark:border-white/20 text-slate-900 dark:text-white px-4 py-2 text-center focus:outline-none focus:border-blue-500 text-sm placeholder:text-slate-400" />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Hiring Velocity</label>
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {['Actively Hiring (ASAP)', 'Building Pipeline', 'Just Browsing'].map(vel => (
                                                            <button key={vel}
                                                                onClick={() => setFormData({ ...formData, hiringVelocity: vel })}
                                                                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${formData.hiringVelocity === vel ? 'bg-blue-600/10 dark:bg-purple-500/20 border-blue-600 dark:border-purple-500 text-blue-600 dark:text-purple-400 shadow-sm' : 'bg-slate-50 dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                                                            >
                                                                {vel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- STEP 5: PERSONALITY OR OUTREACH ----------------- */}
                                    {step === 5 && role === 'candidate' && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">Add some personality!</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">Make your AI Twin uniquely you.</p>

                                            <div className="space-y-8">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">What's your favorite quote or motto?</label>
                                                    <input type="text" placeholder='"Move fast and break things"' value={formData.favoriteQuote} onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] text-center px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 transition-all font-medium italic" />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">Pick a few hobbies</label>
                                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                                        {HOBBY_SUGGESTIONS.map(hobby => (
                                                            <button key={hobby} onClick={() => toggleHobby(hobby)}
                                                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${formData.hobbies.includes(hobby) ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-purple-600 dark:border-purple-600 shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                                                            >
                                                                {hobby}
                                                            </button>
                                                        ))}
                                                        {formData.hobbies.filter(h => !HOBBY_SUGGESTIONS.includes(h)).map(hobby => (
                                                            <button key={hobby} onClick={() => toggleHobby(hobby)}
                                                                className="px-4 py-2 rounded-full border border-indigo-600 bg-indigo-600 text-white dark:bg-purple-600 text-sm font-medium shadow-md shadow-indigo-500/20"
                                                            >
                                                                {hobby} &times;
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input type="text" placeholder="Type a custom hobby and press Enter..." value={customHobby} onChange={(e) => setCustomHobby(e.target.value)} onKeyDown={addCustomHobby}
                                                        className="w-full bg-transparent border-b border-slate-300 dark:border-white/20 text-slate-900 dark:text-white px-4 py-2 text-center focus:outline-none focus:border-blue-500 text-sm placeholder:text-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 5 && role === 'recruiter' && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">How should top tier candidates connect with you?</h1>

                                            <div className="space-y-5 mt-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Work Email (Required)</label>
                                                    <input type="email" placeholder="hiring@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all text-lg font-medium" autoFocus />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">Password (Required)</label>
                                                    <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all" />
                                                    {password.length > 0 && password.length < 8 && (
                                                        <p className="text-red-500 text-xs mt-1 ml-2">Password must be at least 8 characters.</p>
                                                    )}
                                                </div>

                                                {showMoreContact ? (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-2">LinkedIn Profile (Optional)</label>
                                                            <input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                                                                className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 ml-2">Preferences</label>
                                                            <div className="flex flex-col gap-2">
                                                                {['Open to Direct Messages', 'Apply via ATS Only', 'Schedule Intro Call'].map(pref => (
                                                                    <button key={pref}
                                                                        onClick={() => {
                                                                            const prefs = formData.outreachPreference.includes(pref) ? formData.outreachPreference.filter(p => p !== pref) : [...formData.outreachPreference, pref];
                                                                            setFormData({ ...formData, outreachPreference: prefs });
                                                                        }}
                                                                        className={`w-full text-left px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${formData.outreachPreference.includes(pref) ? 'bg-blue-600/10 dark:bg-purple-500/20 border-blue-600 dark:border-purple-500 text-blue-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-[#1C2128] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                                                                    >
                                                                        {pref}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* --- NEW SOCIAL LINKS BLOCK FOR RECRUITER --- */}
                                                        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-2">Links</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="url" placeholder="LinkedIn URL" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value, linkedIn: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="GitHub / Corp Repo" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="Twitter URL" value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                                <input type="url" placeholder="Other Website" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 text-sm" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <button onClick={() => setShowMoreContact(true)} className="w-full py-3 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors mt-2">
                                                        Add professional links or preferences (Optional)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- STEP 6: ASPIRATIONS ----------------- */}
                                    {step === 6 && (
                                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4 text-center">What are your goals?</h1>
                                            <p className="text-slate-500 dark:text-[#9CA3AF] text-lg text-center mb-10">This helps us tailor your AI Twin's interactions.</p>

                                            <textarea placeholder={role === 'candidate' ? "I want to transition into a senior AI engineering role focusing on generative models..." : "I'm looking to hire a founding engineering team for my AI startup..."}
                                                value={formData.aspirations} onChange={(e) => setFormData({ ...formData, aspirations: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] px-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all placeholder:text-slate-400 dark:placeholder:text-[#57606A] text-lg font-medium min-h-[160px] resize-none mb-6" autoFocus />

                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {PRESET_GOALS[role as keyof typeof PRESET_GOALS].map((preset, idx) => (
                                                    <button key={idx} onClick={() => setFormData({ ...formData, aspirations: preset })}
                                                        className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Error Display */}
                            <AnimatePresence>
                                {submitError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle size={20} />
                                        <span className="font-medium text-sm">{submitError}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer / Next Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 min-h-[44px] ${isStepValid()
                                        ? 'bg-blue-600 dark:bg-purple-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20 dark:shadow-purple-500/20 hover:scale-[1.02]'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {step === totalSteps ? "Complete Setup" : "Continue"}
                                    {step < totalSteps && <ArrowRight size={20} />}
                                </button>
                                {!isStepValid() && step === 5 && role === 'recruiter' && (
                                    <p className="absolute -bottom-6 right-0 text-[10px] text-slate-400">
                                        {!formData.email.includes('@') ? 'Enter a valid email' : password.length < 8 ? 'Password must be 8+ chars' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
