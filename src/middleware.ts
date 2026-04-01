// src/middleware.ts
// Protects routes that require authentication.
// Next.js edge middleware runs before every request.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/candidate-active", "/recruiter", "/candidate-empty"];
const AUTH_ROUTES = ["/login", "/role-selection", "/onboarding"];

/** Decode role from a JWT without external libraries (Edge-runtime safe). */
function getTokenRole(token: string): string {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return "candidate";
        // Edge runtime supports atob
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return (payload?.role as string) ?? "candidate";
    } catch {
        return "candidate";
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for token in cookies (set during OAuth callback) or the Authorization header
    const token =
        request.cookies.get("twinly_token")?.value ||
        request.headers.get("Authorization")?.split("Bearer ")[1];

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // If accessing a protected route without a token, redirect to login
    if (isProtected && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing /login while already logged in, redirect to role-appropriate dashboard
    // NOTE: /role-selection is intentionally excluded — OAuth new users are sent there with a token
    if (isAuthRoute && token && pathname === "/login") {
        const role = getTokenRole(token);
        const destination = role === "recruiter" ? "/recruiter" : "/candidate-active";
        return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/candidate-active/:path*",
        "/recruiter/:path*",
        "/candidate-empty/:path*",
        "/login",
    ],
};
