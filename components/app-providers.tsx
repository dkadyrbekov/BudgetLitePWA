"use client";

import type { ReactNode } from "react";

import { BudgetDataProvider } from "@/hooks/use-budget-data";
import { AuthProvider } from "@/hooks/use-auth";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BudgetDataProvider>{children}</BudgetDataProvider>
    </AuthProvider>
  );
}
