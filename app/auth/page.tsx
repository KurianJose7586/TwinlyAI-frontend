"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Bot, Users } from "lucide-react";
import { WebsiteHeader } from "@/components/website-header";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [userRole, setUserRole] = useState<"candidate" | "recruiter">("candidate");
  const { toast } = useToast();

  // Helper to get the correct API URL (Local vs Prod)
  const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const baseUrl = getBaseUrl();

    try {
      if (activeTab === "login") {
        const loginFormData = new URLSearchParams();
        loginFormData.append('username', email);
        loginFormData.append('password', password);

        // --- NEW DYNAMIC LINK WITH NGROK HEADER ---
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            // This header tells ngrok to skip the "You are about to visit..." warning page
            'ngrok-skip-browser-warning': 'true' 
          },
          body: loginFormData,
        });

        if (!response.ok) {
          // Safety Check: Ensure response is JSON before parsing to avoid crashes
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
             const errorData = await response.json();
             throw new Error(errorData.detail || "Login failed. Please check your credentials.");
          } else {
             // If we get HTML (like the Ngrok warning page or a 404), read it as text
             const text = await response.text();
             console.error("Non-JSON response received:", text);
             throw new Error("Connection Error: The server returned HTML instead of JSON. Check the console for details.");
          }
        }
        
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        // The AuthContext will handle the redirect based on role
        window.location.href = "/dashboard";

      } else {
        // --- SIGNUP LOGIC ---
        await api.post("/auth/signup", { 
            email, 
            password,
            role: userRole 
        });
        
        toast({
          title: "Account Created!",
          description: `You have signed up as a ${userRole}. Please log in.`,
        });
        
        setActiveTab("login");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <WebsiteHeader />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="relative w-full max-w-4xl mx-auto grid md:grid-cols-2 rounded-xl overflow-hidden border border-border shadow-2xl shadow-blue-500/10">
          
          {/* Left Side: Brand Showcase (Dynamic based on Role) */}
          <div className="hidden md:flex flex-col justify-center items-center p-10 bg-muted/30 border-r border-border">
            {activeTab === 'signup' && userRole === 'recruiter' ? (
                <>
                    <Users className="h-16 w-16 text-purple-500 mb-6" />
                    <h2 className="text-3xl font-bold text-center text-foreground">Find Top Talent</h2>
                    <p className="text-muted-foreground text-center mt-4">
                      Use our AI-powered semantic search to find candidates that match your exact intent, not just keywords.
                    </p>
                </>
            ) : (
                <>
                    <Bot className="h-16 w-16 text-blue-500 mb-6" />
                    <h2 className="text-3xl font-bold text-center text-foreground">Unlock Your AI Twin</h2>
                    <p className="text-muted-foreground text-center mt-4">
                      Transform your resume into an interactive AI assistant and let your career story speak for itself.
                    </p>
                </>
            )}
          </div>

          {/* Right Side: Authentication Form */}
          <div className="p-8 bg-background">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-card-foreground text-2xl">Welcome</CardTitle>
                <CardDescription>Sign in or create an account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-md">
                          {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" name="email" type="email" placeholder="m@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" name="password" type="password" required />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-md">
                          {error}
                        </div>
                      )}
                      
                      {/* --- Role Selection UI --- */}
                      <div className="space-y-2">
                        <Label>I want to...</Label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={() => setUserRole("candidate")}
                                className={`flex items-center justify-center gap-2 p-2 text-sm font-medium rounded-md transition-all ${
                                userRole === "candidate" 
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5" 
                                    : "text-muted-foreground hover:bg-background/50"
                                }`}
                            >
                                <Bot className="w-4 h-4" />
                                Be Hired
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRole("recruiter")}
                                className={`flex items-center justify-center gap-2 p-2 text-sm font-medium rounded-md transition-all ${
                                userRole === "recruiter" 
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5" 
                                    : "text-muted-foreground hover:bg-background/50"
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                Hire Talent
                            </button>
                        </div>
                      </div>
                      {/* ------------------------- */}

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" name="password" type="password" required />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`${getBaseUrl()}/oauth/login/google`}>
                         <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.9 1.62-3.03 0-5.49-2.3-5.49-5.09s2.46-5.09 5.49-5.09c1.5 0 2.72.48 3.79 1.44l2.74-2.74c-1.73-1.52-3.9-2.48-6.53-2.48-5.35 0-9.62 4.15-9.62 9.35s4.27 9.35 9.62 9.35c2.82 0 4.9-1.07 6.54-2.64 1.73-1.52 2.55-3.64 2.55-6.09 0-.45-.05-.88-.14-1.31h-9.2z" fill="currentColor"/></svg>
                        Google
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`${getBaseUrl()}/oauth/login/github`}>
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}