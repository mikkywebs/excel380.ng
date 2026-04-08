import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SubscriptionPlan {
  label: string;
  price: number;
  duration_months: number;
}

export interface AppConfig {
  // Core economy
  free_credits: number;
  credits_per_question: number;
  free_questions_per_test: number;

  // Timing
  pause_window_minutes: number;
  pause_between_tests_minutes: number;
  exam_time_minutes: number;

  // Per-exam-body time limits (minutes)
  jamb_time_minutes: number;
  waec_time_minutes: number;
  neco_time_minutes: number;
  nabteb_time_minutes: number;

  // Content
  questions_per_exam: number;
  passing_percentage: number;
  subjects_available: number;
  institutions_available: number;

  // Institutions
  max_institution_students: number;

  // Appearance
  primary_color: string;

  // Subscription plans
  subscription_plans: Record<string, SubscriptionPlan>;

  // Feature flags
  maintenance_mode: boolean;
  ai_generation_enabled: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  free_credits: 100,
  credits_per_question: 1,
  free_questions_per_test: 10,
  pause_window_minutes: 30,
  pause_between_tests_minutes: 30,
  exam_time_minutes: 120,
  jamb_time_minutes: 120,
  waec_time_minutes: 90,
  neco_time_minutes: 90,
  nabteb_time_minutes: 90,
  questions_per_exam: 40,
  passing_percentage: 50,
  subjects_available: 25,
  institutions_available: 182,
  max_institution_students: 500,
  primary_color: '#45a257',
  subscription_plans: {
    scholar_6m: { label: 'Scholar', price: 5000, duration_months: 6 },
    academy_6m: { label: 'Academy', price: 20000, duration_months: 6 },
  },
  maintenance_mode: false,
  ai_generation_enabled: true,
};

export async function getAppConfig(): Promise<AppConfig> {
  try {
    // Try primary path first, then fallback path for backward compat
    let configDoc = await getDoc(doc(db, 'config', 'app_config'));

    if (!configDoc.exists()) {
      configDoc = await getDoc(doc(db, 'app_config', 'main_settings'));
    }

    if (configDoc.exists()) {
      return { ...DEFAULT_CONFIG, ...configDoc.data() } as AppConfig;
    }

    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error fetching app config:', error);
    return DEFAULT_CONFIG;
  }
}