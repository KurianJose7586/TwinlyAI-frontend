"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Play,
  Code,
  Key,
  BarChart3,
  Settings,
  LogOut,
  Users, // <-- Import new icon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator"; // <-- Import Separator
import { useAuth } from "@/app/context/AuthContext";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  {
    name: "My Bots",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Resume",
    href: "/dashboard/resume",
    icon: FileText,
  },
  {
    name: "Playground",
    href: "/dashboard/playground",
    icon: Play,
  },
  {
    name: "Embed Widget",
    href: "/dashboard/embed",
    icon: Code,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Usage",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (email: string) => {
    if (!email) return "NN";
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-20 flex-col border-r bg-card">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b">
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg bg-primary p-2.5 text-primary-foreground"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="mt-8 flex flex-1 flex-col items-center gap-2">
          {sidebarNavItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    (pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))) &&
                      "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                {item.name}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* --- NEW RECRUITER SECTION --- */}
          <Separator className="my-4 w-10" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/recruiter"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === "/recruiter" &&
                    "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Users className="h-6 w-6" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              Recruiter Mode
            </TooltipContent>
          </Tooltip>
          {/* --- END OF NEW SECTION --- */}
        </nav>

        {/* Footer Navigation (User & Logout) */}
        <nav className="mt-auto flex flex-col items-center gap-4 p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              Log Out
            </TooltipContent>
          </Tooltip>
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user?.email} />
            <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
          </Avatar>
        </nav>
      </aside>
    </TooltipProvider>
  );
}