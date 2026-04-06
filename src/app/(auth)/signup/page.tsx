"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/lib/firebase";
import { Mail, Lock, Eye, EyeOff, User, Ticket, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.inviteCode && data.inviteCode.length > 0) {
    return /^EXCEL-[A-Z0-9]{5}$/.test(data.inviteCode);
  }
  return true;
}, {
  message: "Invite code must be in format EXCEL-XXXXX",
  path: ["inviteCode"],
});

type SignupForm = z.infer<typeof signupSchema>;

const firebaseErrors: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Try logging in.",
  "auth/weak-password": "Password is too weak. Add more characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
};

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  async function onSubmit(data: SignupForm) {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.fullName.trim() });

      // If invite code provided, join institution
      if (data.inviteCode && data.inviteCode.trim().length > 0) {
        try {
          const joinInstitution = httpsCallable(functions, "joinInstitution");
          await joinInstitution({ invite_code: data.inviteCode.trim() });
          setSuccess("Account created & joined institution!");
        } catch {
          setSuccess("Account created! (Invite code could not be verified — you can try again from your profile.)");
        }
      } else {
        setSuccess("Account created successfully!");
      }

      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      setError(firebaseErrors[err?.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-1">
        Create your account
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Get 100 free practice credits instantly.
      </p>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">or</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 p-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-3 mb-5 rounded-xl bg-green-50 border border-green-100 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="signup-name"
              type="text"
              {...register("fullName")}
              placeholder="Chinedu Okafor"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="signup-email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Password
          </label>
          <PasswordInput id="signup-password" register={register("password")} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          {/* Strength indicators */}
          {password.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((pass, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${pass ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-800"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Confirm Password
          </label>
          <PasswordInput id="signup-confirm" register={register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Invite Code (Optional) */}
        <div>
          <label htmlFor="signup-invite" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Institution Invite Code <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="signup-invite"
              type="text"
              {...register("inviteCode")}
              placeholder="EXCEL-XXXXX"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
            />
          </div>
          {errors.inviteCode && <p className="text-xs text-red-500 mt-1">{errors.inviteCode.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[var(--brand)]/20 mt-1"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">Log in</Link>
      </p>
    </>
  );
}

function PasswordInput({ id, register }: { id: string; register: any }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        id={id}
        type={show ? "text" : "password"}
        {...register}
        placeholder="••••••••"
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
