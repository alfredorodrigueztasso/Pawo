"use client";

import { ToastProvider } from "@orion-ds/react/client";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
