"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppConfig } from "@/lib/app-config";
import { Save, Loader2, Settings, ShieldAlert, Palette, KeyRound, Building2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const { register, handleSubmit, control, reset, setValue } = useForm<AppConfig>();
  const [planKeys, setPlanKeys] = useState<string[]>([]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, "config", "app_config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppConfig;
          reset(data);
          
          if (data.subscription_plans) {
            setPlanKeys(Object.keys(data.subscription_plans));
          }
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load configuration.' });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [reset]);

  const onSubmit = async (data: AppConfig) => {
    setSaving(true);
    setMessage(null);
    try {
      // Ensure specific nested numbering parses back to integers effectively.
      // Normally RHF tracks them as strict numbers using valueAsNumber on inputs, 
      // but double check for cleanliness if needed.
      const docRef = doc(db, "config", "app_config");
      await setDoc(docRef, data, { merge: true });
      setMessage({ type: 'success', text: 'Settings saved successfully! Changes apply immediately.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error saving settings. Check permissions.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse max-w-4xl">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children, desc }: any) => (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{title}</h3>
          {desc && <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Control Center</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage core platform settings, limits, and configurations.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900'}`}>
          {message.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={20} /> : <AlertCircle className="shrink-0 mt-0.5" size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* EXAM & CREDIT SETTINGS */}
        <Section title="Exam & Credit Limits" icon={Settings} desc="Configure the economy and timing of CBT sessions.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Free Credits on Signup</span>
              <input type="number" {...register("free_credits", { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Credits per Question</span>
              <input type="number" {...register("credits_per_question", { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Free Questions Per Test</span>
              <input type="number" {...register("free_questions_per_test", { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Pause Between Tests (minutes)</span>
              <input type="number" {...register("pause_between_tests_minutes", { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
            </label>
            
            <div className="col-span-full border-t border-zinc-200 dark:border-zinc-800 my-2 pt-6">
              <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Exam Body Time Limits (Minutes)</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">JAMB</span>
                  <input type="number" {...register("jamb_time_minutes", { valueAsNumber: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 text-sm" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">WAEC</span>
                  <input type="number" {...register("waec_time_minutes", { valueAsNumber: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 text-sm" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">NECO</span>
                  <input type="number" {...register("neco_time_minutes", { valueAsNumber: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 text-sm" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">NABTEB</span>
                  <input type="number" {...register("nabteb_time_minutes", { valueAsNumber: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 text-sm" />
                </label>
              </div>
            </div>
          </div>
        </Section>

        {/* SUBSCRIPTION PLANS */}
        <Section title="Subscription Plans" icon={KeyRound} desc="Adjust pricing and durations. Setting duration to 0 acts as a lifetime access flag if managed logically in functions.">
          <div className="flex flex-col gap-6">
            {planKeys.map((key) => (
              <div key={key} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row gap-4 md:items-end bg-zinc-50/50 dark:bg-zinc-900/30">
                <label className="flex-1 flex flex-col gap-2">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1 truncate capitalize">
                    {key.replace('_', ' ')} Label
                  </span>
                  <input type="text" {...register(`subscription_plans.${key}.label`)} className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
                </label>
                <label className="flex-1 flex flex-col gap-2">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Price (NGN Kobo)</span>
                  <input type="number" {...register(`subscription_plans.${key}.price`, { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
                </label>
                <label className="w-full md:w-32 flex flex-col gap-2">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Months</span>
                  <input type="number" {...register(`subscription_plans.${key}.duration_months`, { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
                </label>
              </div>
            ))}
          </div>
        </Section>

        {/* INSTITUTION SETTINGS */}
        <Section title="Institutions" icon={Building2} desc="Manage limitations for institutional subscriptions.">
          <label className="flex flex-col gap-2 max-w-sm">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Max Students Per Institution</span>
            <input type="number" {...register("max_institution_students", { valueAsNumber: true })} className="h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
          </label>
        </Section>

        {/* APPEARANCE */}
        <Section title="Appearance" icon={Palette}>
          <label className="flex flex-col gap-2 max-w-sm">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Primary Brand Color (Hex)</span>
            <div className="flex items-center gap-3">
              <input type="color" {...register("primary_color")} className="h-11 w-11 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-sm" />
              <input type="text" {...register("primary_color")} className="flex-1 h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 uppercase font-mono focus:ring-2 focus:ring-primary  dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">This heavily affects buttons, accents, and overall site feel.</p>
          </label>
        </Section>

        {/* FEATURE FLAGS */}
        <Section title="Feature Flags" icon={ShieldAlert} desc="Kill-switches and operational toggles.">
          <div className="flex flex-col gap-6 max-w-md">
            
            <Controller
              name="maintenance_mode"
              control={control}
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Maintenance Mode</span>
                    <p className="text-xs text-zinc-500 mt-0.5">Locks out all non-admin users.</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-red-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                </label>
              )}
            />

            <Controller
              name="ai_generation_enabled"
              control={control}
              render={({ field: { value, onChange } }) => (
                <label className="flex items-center justify-between cursor-pointer group border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">AI Generator API</span>
                    <p className="text-xs text-zinc-500 mt-0.5">Allow AI staging functions to execute queries to OpenAI.</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                </label>
              )}
            />

          </div>
        </Section>

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-6 z-10 flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-bold text-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save All Settings</>}
          </button>
        </div>

      </form>
    </div>
  );
}
