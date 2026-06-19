// src/lib/getApiBase.ts
// Single source of truth for the backend API base URL.
// Always reads from NEXT_PUBLIC_API_URL env var, with a safe fallback for local dev.

const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
const FALLBACK_PROD = "https://k632cnxhg3.ap-south-1.awsapprunner.com";
const FALLBACK_DEV = "http://localhost:8000";

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  (isProd ? FALLBACK_PROD : FALLBACK_DEV);

export function getApiBase(): string {
  return API_BASE_URL;
}
