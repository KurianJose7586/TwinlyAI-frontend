"use client";

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth(); // <--  HOOK

  // This effect will run when the component mounts or when isLoading/user changes
  useEffect(() => {
    // If loading is finished and there's still no user, redirect to the login page
    if (!isLoading && !user) {
      window.location.href = '/auth';
    }
  }, [isLoading, user]);

  // Show a loading state while the AuthContext is checking for a token
  if (isLoading || !user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-foreground">Loading...</p>
        </div>
    );
  }

  // If the user is logged in, show the dashboard
  return <DashboardLayout user={user} onLogout={logout} />;
}