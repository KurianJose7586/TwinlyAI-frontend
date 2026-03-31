"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import {
    Loader2, RefreshCw, CheckCircle2, AlertCircle,
    Github, ChevronRight, Unplug, Lock, Globe
} from 'lucide-react';

type Connector = {
    id: string;
    connector_type: string;
    status: string;
    connected_at?: string;
};

type Repository = {
    id: number;
    name: string;
    full_name?: string;
    description: string;
    url: string;
    private: boolean;
    size_kb: number;
    language?: string;
    updated_at?: string;
};

const isProd = process.env.NODE_ENV === "production";
const apiBase = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://k632cnxhg3.ap-south-1.awsapprunner.com" : "http://localhost:8000");

export function IntegrationHub() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [reposLoading, setReposLoading] = useState(false);
    const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
    const [syncedRepos, setSyncedRepos] = useState<Set<string>>(new Set());

    // Handle OAuth callback result from URL params (?connector=github&status=success)
    useEffect(() => {
        const connector = searchParams.get('connector');
        const status = searchParams.get('status');
        if (connector === 'github') {
            if (status === 'success') {
                toast('GitHub connected successfully', 'success');
                fetchConnectors();
            } else if (status === 'error') {
                const msg = searchParams.get('msg') || 'Connection failed';
                toast(`GitHub connection failed: ${msg}`, 'error');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                if ((data.connectors || []).find((c: Connector) => c.connector_type === "github")) {
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
        const token = localStorage.getItem("twinly_token");
        window.location.href = `${apiBase}/api/v1/connectors/github/authorize?token=${token}`;
    };

    const handleDisconnectGithub = async () => {
        const token = localStorage.getItem("twinly_token");
        const res = await fetch(`${apiBase}/api/v1/connectors/github`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setConnectors(prev => prev.filter(c => c.connector_type !== "github"));
            setRepositories([]);
            toast('GitHub disconnected', 'info');
        }
    };

    const handleSyncRepo = async (repoName: string) => {
        setSyncingRepo(repoName);
        try {
            const token = localStorage.getItem("twinly_token");
            const res = await fetch(`${apiBase}/api/v1/connectors/github/repositories/${repoName}/sync`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast(data?.detail || `Failed to sync ${repoName}.`, 'error');
                return;
            }

            setSyncedRepos(prev => new Set([...prev, repoName]));
            toast(data?.message || `${repoName} synced successfully.`, 'success');
        } catch {
            toast(`Failed to sync ${repoName}. Please try again.`, 'error');
        } finally {
            setSyncingRepo(null);
        }
    };

    const hasGithub = connectors.some(c => c.connector_type === "github");
    const githubConnector = connectors.find(c => c.connector_type === "github");

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 w-5 h-5" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page title */}
            <div>
                <h2 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight">Connectors</h2>
                <p className="text-[14px] text-slate-400 dark:text-slate-500 mt-1">
                    Connect external accounts so your AI Twin can answer deeper technical questions.
                </p>
            </div>

            {/* GitHub Connector Card */}
            <div className={`border rounded-xl transition-colors ${hasGithub
                    ? 'border-slate-200 dark:border-white/10'
                    : 'border-slate-100 dark:border-white/[0.06]'
                }`}>
                {/* Card Header */}
                <div className="flex items-start justify-between p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center shrink-0">
                            <Github className="w-5 h-5 text-white dark:text-slate-900" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white">GitHub</h4>
                                {hasGithub && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[11px] font-medium rounded-full border border-green-100 dark:border-green-500/20">
                                        <CheckCircle2 size={11} /> Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 max-w-md">
                                Index your repositories for deep code-level answers. Your AI Twin can explain architecture, functions, and patterns.
                            </p>
                            {hasGithub && githubConnector?.connected_at && (
                                <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-1">
                                    Connected {new Date(githubConnector.connected_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {!hasGithub ? (
                            <button
                                onClick={handleConnectGithub}
                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-medium rounded-md hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                            >
                                Connect
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={fetchRepositories}
                                    title="Refresh repositories"
                                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-md hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <RefreshCw size={16} className={reposLoading ? "animate-spin" : ""} />
                                </button>
                                <button
                                    onClick={handleDisconnectGithub}
                                    title="Disconnect GitHub"
                                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <Unplug size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Repository List */}
                {hasGithub && (
                    <div className="border-t border-slate-100 dark:border-white/[0.06] px-6 pb-6 pt-5">
                        <h5 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                            Repositories
                        </h5>

                        {reposLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 w-5 h-5" />
                            </div>
                        ) : repositories.length === 0 ? (
                            <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center py-6">
                                No repositories found.
                            </p>
                        ) : (
                            <div className="space-y-1 max-h-80 overflow-y-auto">
                                {repositories.map(repo => {
                                    const isSyncing = syncingRepo === repo.name;
                                    const isSynced = syncedRepos.has(repo.name);
                                    return (
                                        <div
                                            key={repo.id}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {repo.private
                                                    ? <Lock size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                                    : <Globe size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                                }
                                                <div className="min-w-0">
                                                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate block">{repo.name}</span>
                                                    {repo.description && (
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block">{repo.description}</span>
                                                    )}
                                                </div>
                                                {repo.size_kb > 50000 && (
                                                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                                                        <AlertCircle size={9} /> Large
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleSyncRepo(repo.name)}
                                                disabled={isSyncing}
                                                className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors disabled:opacity-50 shrink-0 ml-4 ${
                                                    isSynced
                                                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 border border-slate-100 dark:border-white/[0.07]'
                                                }`}
                                            >
                                                {isSyncing
                                                    ? <Loader2 size={11} className="animate-spin" />
                                                    : isSynced
                                                        ? <><CheckCircle2 size={11} /> Synced</>
                                                        : <>Sync <ChevronRight size={11} /></>
                                                }
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Strict mode toggle */}
                        {repositories.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-white/[0.04] flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="strict-mode"
                                    defaultChecked
                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 accent-slate-900 dark:accent-white"
                                />
                                <label htmlFor="strict-mode" className="text-[12px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                    Strict Mode — only answer when highly confident in code knowledge
                                </label>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* More connectors placeholder */}
            <div className="grid grid-cols-2 gap-4 opacity-40">
                {[
                    { name: 'Notion', desc: 'Index your Notion pages' },
                    { name: 'Linear', desc: 'Sync project issues and docs' },
                ].map(c => (
                    <div key={c.name} className="border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{c.name[0]}</span>
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{c.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.desc}</p>
                        </div>
                        <span className="ml-auto text-[10px] font-medium text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded">Soon</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
