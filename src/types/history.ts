// src/types/history.ts
// Types for the History tab feature

export type ConversationStatus = "qualified" | "cold" | "followup" | "ghosted";
export type EventType = "chat" | "resume" | "profile";

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

export interface Conversation {
    id: string;
    bot_id: string;
    recruiter_id?: string;
    recruiter_name?: string;
    recruiter_company?: string;
    recruiter_email?: string;
    messages: ConversationMessage[];
    message_count: number;
    duration_seconds: number;
    summary?: string;
    status: ConversationStatus;
    started_at?: string;
    ended_at?: string;
}

export interface ResumeVersion {
    id: string;
    bot_id: string;
    user_id: string;
    filename: string;
    uploaded_at: string;
    is_active: boolean;
    version_number: number;
}

export interface ActivityEvent {
    id: string;
    user_id: string;
    bot_id?: string;
    event_type: EventType;
    title: string;
    detail?: string;
    ref_id?: string;
    created_at: string;
}
