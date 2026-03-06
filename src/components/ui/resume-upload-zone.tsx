"use client";

import React, { useRef, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, UploadCloud, FileText } from "lucide-react";
import api from "@/lib/api";

interface ResumeUploadZoneProps {
    botId: string | null;
    onSuccess?: (candidateName: string | null) => void;
}

export function ResumeUploadZone({ botId, onSuccess }: ResumeUploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const ACCEPTED = [".pdf", ".docx", ".txt", ".json"];

    const upload = async (file: File) => {
        if (!botId) {
            setError("No bot found. Please complete onboarding first.");
            return;
        }
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (!ACCEPTED.includes(ext)) {
            setError(`Unsupported file type. Please upload: ${ACCEPTED.join(", ")}`);
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        // Simulate gradual progress while the actual upload + LLM extraction runs
        const interval = setInterval(() => {
            setProgress(p => Math.min(p + Math.random() * 12, 85));
        }, 600);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(`/bots/${botId}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            clearInterval(interval);

            const data = res.data;
            setProgress(100);
            setUploadedFile(file.name);
            onSuccess?.(data?.candidate_name || null);
        } catch (err: any) {
            clearInterval(interval);
            const msg = err.response?.data?.detail || err.message || "Upload failed. Please try again.";
            setError(msg);
        }

        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${isDragging
                    ? "border-[#007AFF] bg-blue-50/50 dark:bg-blue-500/10"
                    : uploadedFile
                        ? "border-green-400 dark:border-green-500/60 bg-green-50/50 dark:bg-green-500/5"
                        : "border-slate-200 dark:border-white/10 hover:border-[#007AFF]/50 dark:hover:border-blue-400/30 hover:bg-slate-50/50 dark:hover:bg-white/5"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={handleChange}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-[#007AFF] animate-spin" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Uploading &amp; training your AI twin…
                        </p>
                        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 mt-1">
                            <div
                                className="bg-[#007AFF] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                        <CheckCircle2 size={32} className="text-green-500" />
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Resume indexed!
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <FileText size={14} />
                            {uploadedFile}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Click to replace
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <UploadCloud size={32} className="text-slate-400 dark:text-slate-500" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Drop your resume here
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                PDF, DOCX, TXT or JSON · Powers your AI Twin&apos;s answers
                            </p>
                        </div>
                        <span className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                            Browse files
                        </span>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
