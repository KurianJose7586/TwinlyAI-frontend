"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResumeTabProps {
  activeBot: { id: string; name: string; status: string } | null
  onTabChange: (tab: string) => void
}

export function ResumeTab({ activeBot, onTabChange }: ResumeTabProps) {
  const [botStatus, setBotStatus] = useState<"ready" | "indexing" | "no_data">("no_data")
  const [lastFile, setLastFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !activeBot) return;

  setLastFile(file);
  setIsLoading(true);
  setBotStatus("indexing");
  toast({ title: "Uploading...", description: `Uploading "${file.name}" for bot "${activeBot.name}".` });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found.");

    // THIS IS THE FIX: Use the native fetch but with the correct live URL
    //const response = await fetch(`https://joserman-twinlyaibackend.hf.space/api/v1/bots/${activeBot.id}/upload`,
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const response = await fetch(`${baseUrl}/bots/${activeBot.id}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Upload failed.");
    }

    const result = await response.json();
    toast({ title: "Success!", description: result.message });
    setBotStatus("ready");
  } catch (error: any) {
    toast({ title: "Upload Error", description: error.message, variant: "destructive" });
    setBotStatus("no_data");
  } finally {
    setIsLoading(false);
  }
};

  const handleGoToBots = () => {
    onTabChange("my-bots")
  }

  if (!activeBot) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Please select a bot to manage its resume</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Choose a bot from the 'My Bots' page to upload and manage its knowledge base.
        </p>
        <Button onClick={handleGoToBots} className="bg-blue-600 hover:bg-blue-700">
          <Bot className="h-4 w-4 mr-2" />
          Go to My Bots
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Managing Resume for: {activeBot.name}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Resume</h1>
        <p className="text-muted-foreground">Upload and manage the resume data for "{activeBot.name}".</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>Upload a file to train your bot. Existing data will be overwritten.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Drop your resume here or click to browse</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                data-testid="file-upload-input"
                disabled={isLoading}
              />
              <Button asChild variant="outline" data-testid="select-file-button" disabled={isLoading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  {isLoading ? "Processing..." : "Select File (PDF, DOCX, TXT, JSON)"}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge
              variant={botStatus === "ready" ? "default" : botStatus === "indexing" ? "secondary" : "destructive"}
            >
              {botStatus === "ready" && "Ready"}
              {botStatus === "indexing" && "Indexing..."}
              {botStatus === "no_data" && "No Data"}
            </Badge>
          </div>
          {lastFile && botStatus !== "no_data" && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last File Processed:</span>
              <span className="text-sm text-muted-foreground">{lastFile.name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}