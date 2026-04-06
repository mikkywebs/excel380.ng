"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAppConfig, AppConfig } from "@/lib/app-config";

interface AppConfigContextRef {
  config: AppConfig | null;
  loading: boolean;
  error: Error | null;
}

const AppConfigContext = createContext<AppConfigContextRef | undefined>(undefined);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getAppConfig();
        setConfig(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error("useAppConfig must be used within an AppConfigProvider");
  }
  return context;
}
