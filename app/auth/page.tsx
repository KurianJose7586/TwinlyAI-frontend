"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Bot } from "lucide-react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/website-header";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (activeTab === "login") {
        const loginFormData = new URLSearchParams();
        loginFormData.append('username', email);
        loginFormData.append('password', password);

        const response = await fetch("https://joserman-twinlyaibackend.hf.space/api/v1/auth/login", {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Login failed. Please check your credentials.");
        }
        
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";

      } else {
        await api.post("/auth/signup", { email, password });
        
        toast({
          title: "Signup Successful!",
          description: "You can now log in with your new account.",
        });
        
        setActiveTab("login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <WebsiteHeader />
      <main className="min-h-screen flex items-center justify-center p-6">
        {/* --- START OF NEW DESIGN --- */}
        <div className="relative w-full max-w-4xl mx-auto grid md:grid-cols-2 rounded-xl overflow-hidden border border-border shadow-2xl shadow-blue-500/10">
          
          {/* Left Side: Brand Showcase */}
          <div className="hidden md:flex flex-col justify-center items-center p-10 bg-muted/30 border-r border-border">
            <Bot className="h-16 w-16 text-blue-500 mb-6" />
            <h2 className="text-3xl font-bold text-center text-foreground">Unlock Your AI Twin</h2>
            <p className="text-muted-foreground text-center mt-4">
              Transform your resume into an interactive AI assistant and let your career story speak for itself.
            </p>
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
                      <a href="https://joserman-twinlyaibackend.hf.space/api/v1/oauth/login/google">
                         <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.9 1.62-3.03 0-5.49-2.3-5.49-5.09s2.46-5.09 5.49-5.09c1.5 0 2.72.48 3.79 1.44l2.74-2.74c-1.73-1.52-3.9-2.48-6.53-2.48-5.35 0-9.62 4.15-9.62 9.35s4.27 9.35 9.62 9.35c2.82 0 4.9-1.07 6.54-2.64 1.73-1.52 2.55-3.64 2.55-6.09 0-.45-.05-.88-.14-1.31h-9.2z" fill="currentColor"/></svg>
                        Google
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="https://joserman-twinlyaibackend.hf.space/api/v1/oauth/login/github">
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
        {/* --- END OF NEW DESIGN --- */}
      </main>
    </>
  );
}