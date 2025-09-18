"use client";

import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"; // NOTE: You may need to add this component via `npx shadcn-ui@latest add command`
import { Bot, KeyRound, MessageSquare, Settings, FileText, Code } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTabChange: (tab: string) => void;
  hasActiveBot: boolean;
}

export function CommandPalette({ open, setOpen, onTabChange, hasActiveBot }: CommandPaletteProps) {
  const navigate = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  const commandItems = [
    { name: "My Bots", icon: Bot, tab: "my-bots", requiresBot: false },
    { name: "Playground", icon: MessageSquare, tab: "playground", requiresBot: true },
    { name: "Resume", icon: FileText, tab: "resume", requiresBot: true },
    { name: "Embed Widget", icon: Code, tab: "embed", requiresBot: true },
    { name: "API Keys", icon: KeyRound, tab: "api-keys", requiresBot: true },
    { name: "Settings", icon: Settings, tab: "settings", requiresBot: true },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commandItems.map((item) => (
            <CommandItem
              key={item.tab}
              onSelect={() => navigate(item.tab)}
              disabled={item.requiresBot && !hasActiveBot}
              className="aria-disabled:opacity-50 aria-disabled:pointer-events-none"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}