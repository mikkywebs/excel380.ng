import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface AppConfig {
  primary_color: string;
  free_credits: number;
  credits_per_question: number;
  free_questions_per_test: number;
  pause_between_tests_minutes: number;
  jamb_time_minutes: number;
  waec_time_minutes: number;
  neco_time_minutes: number;
  nabteb_time_minutes: number;
  max_institution_students: number;
  maintenance_mode: boolean;
  ai_generation_enabled: boolean;
  subscription_plans: {
    [key: string]: {
      price: number;
      duration_months: number | null;
      label: string;
    };
  };
}

let cachedConfig: AppConfig | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches application configuration from Firestore with in-memory caching.
 * Re-fetches every 5 minutes.
 */
export async function getAppConfig(): Promise<AppConfig> {
  const now = Date.now();

  if (cachedConfig && now - lastFetchTime < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const configDoc = await getDoc(doc(db, "app_config", "main_settings"));
    
    if (!configDoc.exists()) {
      throw new Error("Configuration not found in Firestore.");
    }

    cachedConfig = configDoc.data() as AppConfig;
    lastFetchTime = now;
    
    return cachedConfig;
  } catch (error) {
    console.error("Error fetching app config:", error);
    if (cachedConfig) return cachedConfig; // Fallback to stale cache on error
    throw error;
  }
}
