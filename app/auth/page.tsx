"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "lucide-react";
import Link from "next/link";
import { WebsiteHeader } from "@/components/website-header";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast"; // <-- IMPORT useToast

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast(); // <-- INITIALIZE useToast

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

        // NOTE: We keep the direct fetch here because the backend's login
        // is specifically set up to handle 'x-www-form-urlencoded' data,
        // which the api.ts helper doesn't do by default. We just need to
        // make sure it's pointing to the right place.
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

      } else { // For signup
        // Use the centralized api helper for signup
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
    // The rest of your JSX remains the same...
    <>
      <WebsiteHeader />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-xl font-bold text-foreground">
              TwinlyAI
            </Link>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-card-foreground">Welcome</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-md">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" name="password" type="password" placeholder="Enter your password" required />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                     {error && (
                      <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-md">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="password" type="password" placeholder="Create a password" required />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
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
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="http://127.0.0.1:8000/api/v1/oauth/login/google">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        {/* Google SVG Path */}
                      </svg>
                      Google
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="http://127.0.0.1:8000/api/v1/oauth/login/github">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}