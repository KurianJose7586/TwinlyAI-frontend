import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Settings2, Github, ChevronRight } from 'lucide-react';

type Connector = {
    id: string;
    connector_type: string;
    status: string;
};

type Repository = {
    id: number;
    name: string;
    description: string;
    url: string;
    private: boolean;
    size_kb: number;
};

export function IntegrationHub() {
    const { user } = useAuth();
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [reposLoading, setReposLoading] = useState(false);
    const [syncingRepo, setSyncingRepo] = useState<string | null>(null);

    const isProd = process.env.NODE_ENV === "production";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://twinlyai-backend-v2-0.onrender.com" : "http://localhost:8000");

    useEffect(() => {
        fetchConnectors();
    }, []);

    const fetchConnectors = async () => {
        try {
            const token = localStorage.getItem("twinly_token");
            const res = await fetch(`${apiBase}/api/v1/connectors/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConnectors(data.connectors || []);
                if (data.connectors.find((c: Connector) => c.connector_type === "github")) {
                    fetchRepositories();
                }
            }
        } catch (error) {
            console.error("Failed to fetch connectors", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRepositories = async () => {
        setReposLoading(true);
        try {
            const token = localStorage.getItem("twinly_token");
            const res = await fetch(`${apiBase}/api/v1/connectors/github/repositories`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRepositories(data.repositories || []);
            }
        } catch (error) {
            console.error("Failed to fetch repos", error);
        } finally {
            setReposLoading(false);
        }
    };

    const handleConnectGithub = () => {
        window.location.href = `${apiBase}/api/v1/connectors/github/authorize`;
    };

    const handleSyncRepo = async (repoName: string) => {
        setSyncingRepo(repoName);
        try {
            const token = localStorage.getItem("twinly_token");
            await fetch(`${apiBase}/api/v1/connectors/github/repositories/${repoName}/sync`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            // Ideally we'd poll or use a websocket here, but for now we just show it's syncing
            setTimeout(() => {
                setSyncingRepo(null);
                alert(`Started indexing ${repoName} in the background.`);
            }, 1500);
        } catch (err) {
            console.error(err);
            setSyncingRepo(null);
        }
    };

    const hasGithub = connectors.some(c => c.connector_type === "github");

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/80 dark:bg-[#1C2128]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-3xl p-8">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Integration Hub</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Connect external accounts so your AI Twin can answer deeper technical questions and stay up to date without hallucinating.</p>
                </div>

                {/* Base Card */}
                <div className={`bg-slate-50 dark:bg-[#0B0E14]/50 border ${hasGithub ? 'border-[#007AFF]/50' : 'border-slate-200 dark:border-white/10'} rounded-2xl p-6 relative overflow-hidden group transition-all`}>
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center shrink-0">
                                <Github className="w-8 h-8 text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">GitHub Code Intelligence</h4>
                                    {hasGithub && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                            <CheckCircle2 size={14} /> Connected
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                                    Allow your twin to index your repositories using advanced semantic chunking. Enables intricate code-level answers.
                                </p>
                            </div>
                        </div>
                        {!hasGithub && (
                            <button onClick={handleConnectGithub} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md">
                                Connect
                            </button>
                        )}
                        {hasGithub && (
                            <button onClick={fetchRepositories} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Refresh repos">
                                <RefreshCw size={20} className={reposLoading ? "animate-spin" : ""} />
                            </button>
                        )}
                    </div>

                    {/* Repository Selector */}
                    {hasGithub && (
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-4">
                            <h5 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings2 size={18} className="text-[#007AFF]" /> Select Repositories to Index
                            </h5>

                            {reposLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20">
                                    {repositories.map(repo => (
                                        <div key={repo.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{repo.name}</span>
                                                    {repo.private && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] uppercase rounded">Private</span>}
                                                    {repo.size_kb > 50000 && (
                                                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded" title="Large repos activate Smart Indexing">
                                                            <AlertCircle size={10} /> {Math.round(repo.size_kb / 1024)}mb (Smart Index)
                                                        </span>
                                                    )}
                                                </div>
                                                {repo.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{repo.description}</p>}
                                            </div>

                                            <button
                                                onClick={() => handleSyncRepo(repo.name)}
                                                disabled={syncingRepo === repo.name}
                                                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-[#007AFF] hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                {syncingRepo === repo.name ? <Loader2 size={14} className="animate-spin" /> : "Sync Codebase"}
                                                {syncingRepo !== repo.name && <ChevronRight size={14} />}
                                            </button>
                                        </div>
                                    ))}
                                    {repositories.length === 0 && !reposLoading && (
                                        <p className="text-sm text-slate-500 text-center py-4">No repositories found.</p>
                                    )}
                                </div>
                            )}

                            {/* Knowledge Control Settings */}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Knowledge Boundaries</h5>
                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-[#1C2128] rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer w-max">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF] border-slate-300 bg-slate-100 dark:bg-[#0B0E14] dark:border-white/10" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Strict Mode (Requires high confidence for code answers)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
