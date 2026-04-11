"use client";

import React from "react";
// Import the generated skeleton registry - this is a side effect that registers the bones
// We import it here in a "use client" component to ensure it only runs on the browser.
import "../bones/registry";

interface BoneyardProviderProps {
  children: React.ReactNode;
}


export function BoneyardProvider({ children }: BoneyardProviderProps) {
  return <>{children}</>;
}
