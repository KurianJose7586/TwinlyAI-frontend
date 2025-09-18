"use client";

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // <-- IMPORT THE SPINNER

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [isLoading, user, router]);

  // --- START OF NEW DESIGN ---
  // Replace the simple "Loading..." text with the new component
  if (isLoading || !user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
            <LoadingSpinner className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Authenticating your session...</p>
        </div>
    );
  }
  // --- END OF NEW DESIGN ---

  return <DashboardLayout />;
}