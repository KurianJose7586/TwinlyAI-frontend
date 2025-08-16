"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, RefreshCw, Trash2 } from "lucide-react"

interface ResumeTabProps {
  setHasUploadedResume: (uploaded: boolean) => void
}

export function ResumeTab({ setHasUploadedResume }: ResumeTabProps) {
  const [botStatus, setBotStatus] = useState<"ready" | "indexing" | "error">("ready")
  const [lastFile, setLastFile] = useState("resume.pdf")
  const [jsonContent, setJsonContent] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBotStatus("indexing")
      setLastFile(file.name)
      setHasUploadedResume(true)
      // Simulate processing
      setTimeout(() => setBotStatus("ready"), 2000)
    }
  }

  const handleReIndex = () => {
    setBotStatus("indexing")
    setTimeout(() => setBotStatus("ready"), 2000)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete all resume data? This action cannot be undone.")) {
      setLastFile("")
      setBotStatus("error")
      setHasUploadedResume(false)
    }
  }

  const handleJsonUpload = () => {
    if (jsonContent.trim()) {
      setBotStatus("indexing")
      setLastFile("JSON Content")
      setHasUploadedResume(true)
      setTimeout(() => setBotStatus("ready"), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Resume</h1>
        <p className="text-muted-foreground">Upload and manage your resume data for the AI chatbot.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>Choose how you want to provide your resume data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Drop your resume here or click to browse</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                data-testid="file-upload-input"
              />
              <Button asChild variant="outline" data-testid="select-file-button">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Select File (PDF, DOCX, TXT)
                </label>
              </Button>
            </div>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <label htmlFor="json-content" className="text-sm font-medium">
              Or paste JSON content directly:
            </label>
            <Textarea
              id="json-content"
              placeholder="Paste your resume data in JSON format..."
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              data-testid="json-textarea"
            />
            {jsonContent.trim() && (
              <Button
                onClick={handleJsonUpload}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="upload-json-button"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload JSON Content
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge variant={botStatus === "ready" ? "default" : botStatus === "indexing" ? "secondary" : "destructive"}>
              {botStatus === "ready" && "Ready"}
              {botStatus === "indexing" && "Indexing..."}
              {botStatus === "error" && "Error"}
            </Badge>
          </div>
          {lastFile && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last File:</span>
              <span className="text-sm text-muted-foreground">{lastFile}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleReIndex} variant="outline" data-testid="reindex-button">
          <RefreshCw className="mr-2 h-4 w-4" />
          Re-Index Bot
        </Button>
        <Button variant="outline" data-testid="replace-file-button">
          <Upload className="mr-2 h-4 w-4" />
          Replace File
        </Button>
        <Button onClick={handleDelete} variant="destructive" data-testid="delete-resume-button">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Resume Data
        </Button>
      </div>
    </div>
  )
}
