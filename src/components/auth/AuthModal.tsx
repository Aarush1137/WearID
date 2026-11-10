"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/auth/authStore";
import { ShieldCheck, Phone, Mail, ArrowRight, Check, X, AlertCircle, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = "phone" | "google" | "email";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithPhoneOtp,
    verifyPhoneOtp,
    signInWithEmailOtp,
    verifyEmailOtp,
    signInWithTestAccount,
    isLoading,
    authError,
    clearError,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  // Phone flow state
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  // Email flow state
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  if (!isOpen) return null;

  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const res = await signInWithPhoneOtp(phone, "firebase-recaptcha-modal");
    if (!res.error) {
      setPhoneOtpSent(true);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const res = await verifyPhoneOtp(phone, phoneOtp);
    if (!res.error) {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleEmailSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const res = await signInWithEmailOtp(email);
    if (!res.error) {
      setEmailOtpSent(true);
    }
  };

  const handleEmailVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const res = await verifyEmailOtp(email, emailOtp);
    if (!res.error) {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-bg-surface border border-border rounded-card shadow-lg p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sovereign Identity Access
          </div>
          <h2 id="auth-modal-title" className="font-display text-2xl text-text-primary">
            Sign In to WearID
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Access your clothing passport, manage multi-member profiles, and carry your size everywhere.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-1 bg-bg-elevated rounded-btn mb-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "google"}
            onClick={() => {
              setActiveTab("google");
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-btn transition-colors min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === "google"
                ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {/* Google G icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            Gmail / Google
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "email"}
            onClick={() => {
              setActiveTab("email");
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-btn transition-colors min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === "email"
                ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Link
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "phone"}
            onClick={() => {
              setActiveTab("phone");
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-btn transition-colors min-h-[40px] flex items-center justify-center gap-1.5 ${
              activeTab === "phone"
                ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Phone SMS
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 rounded-card bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">{authError}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Phone OTP Form */}
        {activeTab === "phone" && (
          <div>
            {!phoneOtpSent ? (
              <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 rounded-btn border border-border bg-bg-elevated text-xs font-semibold text-text-primary">
                      IN +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="input-editorial flex-1"
                      autoFocus
                    />
                  </div>
                  {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
                  <div id="firebase-recaptcha-modal" className="mt-1"></div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full btn-primary min-h-[44px] text-sm font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      Send SMS Code
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-text-primary">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhoneOtpSent(false)}
                      className="text-[11px] text-accent hover:underline font-medium"
                    >
                      Change Phone
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="958921"
                    className="input-editorial w-full text-center tracking-widest text-lg font-mono font-semibold"
                    autoFocus
                  />
                  <span className="text-[11px] text-text-secondary block mt-1 text-center">
                    Sent to +91 {phone}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phoneOtp.length < 6}
                  className="w-full btn-primary min-h-[44px] text-sm font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      Verify & Access Passport
                      <Check className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Google Sign-in */}
        {activeTab === "google" && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              Sign in with your Google Account or Gmail ID. No passwords required — we use sovereign OAuth 2.0 to safely link your measurement passport.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full min-h-[48px] px-4 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors inline-flex items-center justify-center gap-3 text-sm font-medium text-text-primary shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  Continue with Google
                </>
              )}
            </button>

            <span className="text-[11px] text-text-tertiary block text-center mt-2">
              By continuing, your biometric data remains encrypted and private per Invariant 7.
            </span>
          </div>
        )}

        {/* Tab 3: Email Magic Link */}
        {activeTab === "email" && (
          <div>
            {!emailOtpSent ? (
              <form onSubmit={handleEmailSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-editorial w-full"
                    autoFocus
                  />
                  <span className="text-[11px] text-text-secondary block mt-1">
                    We will send a passwordless login link and verification code.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.includes("@")}
                  className="w-full btn-primary min-h-[44px] text-sm font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      Send Magic Link / OTP
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-text-primary">
                      Enter 6-Digit Email Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmailOtpSent(false)}
                      className="text-[11px] text-accent hover:underline font-medium"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="958921"
                    className="input-editorial w-full text-center tracking-widest text-lg font-mono font-semibold"
                    autoFocus
                  />
                  <span className="text-[11px] text-text-secondary block mt-1 text-center">
                    Check your inbox at {email}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || emailOtp.length < 6}
                  className="w-full btn-primary min-h-[44px] text-sm font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      Verify & Log In
                      <Check className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
