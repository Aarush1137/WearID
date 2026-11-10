"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserCheck,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/app";
  const reason = searchParams.get("reason");

  const {
    isAuthenticated,
    user,
    isLoading,
    authError,
    sessionTimeoutReason,
    signInWithPhoneOtp,
    verifyPhoneOtp,
    signInWithEmailOtp,
    verifyEmailOtp,
    signInWithGoogle,
    signInWithTestAccount,
    clearError,
  } = useAuthStore();

  const [authMethod, setAuthMethod] = useState<"phone" | "email" | "google">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMsg(null);

    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length < 10) {
      setLocalError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullPhone = clean.startsWith("91") && clean.length === 12 ? `+${clean}` : `+91${clean.slice(-10)}`;
    const res = await signInWithPhoneOtp(fullPhone, "firebase-recaptcha-login");
    if (res.error) {
      setLocalError(res.error || "Unable to send verification code. Please verify your mobile number or use email sign-in.");
    } else {
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`Verification code dispatched to ${fullPhone}.`);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const clean = phoneNumber.replace(/\D/g, "");
    const fullPhone = clean.startsWith("91") && clean.length === 12 ? `+${clean}` : `+91${clean.slice(-10)}`;

    const res = await verifyPhoneOtp(fullPhone, otpCode.trim());
    if (res.error) {
      setLocalError(res.error || "Invalid verification code. Please try again.");
    } else {
      router.push(returnUrl);
    }
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMsg(null);

    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    const res = await signInWithEmailOtp(email.trim().toLowerCase());
    if (res.error) {
      setLocalError(res.error);
    } else {
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`Sign-in link / OTP sent to ${email}.`);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const res = await verifyEmailOtp(email.trim().toLowerCase(), emailOtpCode.trim());
    if (res.error) {
      setLocalError(res.error);
    } else {
      router.push(returnUrl);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-btn bg-accent text-white flex items-center justify-center font-display text-xl group-hover:bg-accent-hover transition-colors shadow-xs">
            W
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-text-primary leading-none">
              Wear<span className="text-accent">Id</span>
            </span>
            <span className="text-[10px] text-text-secondary tracking-wide uppercase font-medium mt-0.5">
              Clothing Identity
            </span>
          </div>
        </Link>

        <Link
          href="/app"
          className="text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-btn hover:bg-bg-elevated transition-colors inline-flex items-center gap-1"
        >
          <span>Continue as Guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        {/* Security Timeout Alert */}
        {(reason === "timeout" || sessionTimeoutReason === "inactivity") && (
          <div className="mb-4 p-3.5 rounded-card bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>For your biometric security, your session expired due to inactivity. Please sign in to resume.</span>
          </div>
        )}

        {/* Primary Auth Form Container */}
        <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-subtle/80 text-accent flex items-center justify-center mx-auto mb-3 border border-accent/20">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl text-text-primary">
              Sign In to WearID
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Access your personal size passport, manage family profiles, and carry your size everywhere.
            </p>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-bg-elevated rounded-btn text-xs font-semibold mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setOtpSent(false);
                setLocalError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-btn transition-colors flex items-center justify-center gap-1.5 ${
                authMethod === "phone"
                  ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setOtpSent(false);
                setLocalError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-3 rounded-btn transition-colors flex items-center justify-center gap-1.5 ${
                authMethod === "email"
                  ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Link</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {(localError || authError) && (
            <div className="mb-4 p-3 rounded-card bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="block font-medium">{localError || authError}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-card bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Phone Auth Tab */}
          {authMethod === "phone" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center rounded-btn border border-border-strong bg-bg-surface focus-within:ring-2 focus-within:ring-accent overflow-hidden">
                      <span className="px-3 py-2.5 bg-bg-elevated text-xs font-semibold text-text-secondary border-r border-border">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-3 py-2.5 text-sm bg-transparent outline-none text-text-primary"
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3 inline" />
                      10,000 free monthly SMS powered by Google Firebase Phone Auth.
                    </span>
                    {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
                    <div id="firebase-recaptcha-login" className="mt-1"></div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.replace(/\D/g, "").length < 10}
                    className="btn-primary w-full min-h-[44px] text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="font-semibold text-text-primary">
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-accent hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="958921"
                      className="input-editorial w-full text-center text-xl font-mono tracking-widest"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.trim().length < 6}
                    className="btn-primary w-full min-h-[44px] text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <span className="text-[11px] text-text-tertiary">
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="text-[11px] font-semibold text-accent hover:underline"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Email Auth Tab */}
          {authMethod === "email" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendEmailLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="input-editorial w-full"
                      autoFocus
                    />
                    <span className="text-[10px] text-text-tertiary block mt-1">
                      We send a passwordless login code directly to your inbox.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.includes("@")}
                    className="btn-primary w-full min-h-[44px] text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? "Sending Link..." : "Send Login Link"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="font-semibold text-text-primary">
                        Enter Email OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-accent hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Change Email
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtpCode}
                      onChange={(e) => setEmailOtpCode(e.target.value)}
                      placeholder="123456"
                      className="input-editorial w-full text-center text-xl font-mono tracking-widest"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || emailOtpCode.trim().length < 6}
                    className="btn-primary w-full min-h-[44px] text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative px-3 bg-bg-surface text-[10px] uppercase font-semibold text-text-tertiary">
              Or Connect With
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full min-h-[44px] px-4 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors flex items-center justify-center gap-2.5 text-xs font-semibold text-text-primary shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </main>

      {/* Footer Security Badges */}
      <footer className="max-w-md mx-auto w-full text-center space-y-2 pt-6">
        <div className="flex items-center justify-center gap-2 text-[11px] text-text-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Sovereign Biometric Privacy · Private by Default</span>
        </div>
        <p className="text-[10px] text-text-tertiary">
          Your body measurements are stored locally on your device with AES-256-GCM encryption. WearID never sells biometric data.
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center text-xs font-semibold text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Loading authentication...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
