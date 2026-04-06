"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotForm) {
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSent(true);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 dark:bg-green-950/30">
          <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          We've sent a password reset link to:
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          {getValues("email")}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">
          Can't find the email? Check your spam folder or try again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setSent(false); setError(""); }}
            className="w-full h-11 rounded-xl border border-zinc-200 text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition-all dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Try another email
          </button>
          <Link
            href="/login"
            className="w-full h-11 flex items-center justify-center rounded-xl bg-[var(--brand)] text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--brand)]/20"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to login
      </Link>

      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-1">
        Reset your password
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Enter the email you used to sign up. We'll send you a link to reset your password.
      </p>

      {error && (
        <div className="flex items-start gap-3 p-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="forgot-email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              autoFocus
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[var(--brand)]/20"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
        </button>
      </form>
    </>
  );
}
