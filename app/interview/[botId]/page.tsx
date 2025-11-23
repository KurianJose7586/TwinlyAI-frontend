"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Dynamic Import with SSR disabled
const InterviewComponent = dynamic(() => import("@/components/InterviewComponent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function InterviewPage() {
  const params = useParams();
  const botId = params.botId as string;

  return <InterviewComponent botId={botId} />;
}