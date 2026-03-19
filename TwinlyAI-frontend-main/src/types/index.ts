export interface UserProfile {
    id: string;
    email: string;
    role: "candidate" | "recruiter";
}

export interface Project {
    name: string;
    description: string;
    link: string;
}

export interface Candidate {
    id: string;
    name: string;
    role: string;
    email: string;
    linkedin: string;
    github_url?: string;
    twitter_url?: string;
    website_url?: string;
    projects?: Project[];
    quote: string;
    match: number;
    matchStyle: string;
    avatar: string;
    skills: string[];
    resume_url?: string;
    thumbnail_url?: string;
}
export interface BotResponse {
    id: string;
    name: string;
    summary?: string;
    match_score: number;
    avatar_url?: string;
    skills: string[];
    resume_url?: string;
    thumbnail_url?: string;
}
