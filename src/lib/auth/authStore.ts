"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
}

// Default inactivity timeout: 7 days in milliseconds
export const DEFAULT_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  lastActiveAt: number | null;
  sessionExpiresAt: number | null;
  sessionTimeoutReason: "inactivity" | "manual" | null;

  // Actions
  initAuth: () => Promise<void>;
  touchSession: () => void;
  checkSessionExpiry: () => boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithPhoneOtp: (phone: string) => Promise<{ error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  signInWithEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error?: string }>;
  signInWithTestAccount: (phoneOrEmail?: string) => void;
  signOut: (reason?: "inactivity" | "manual") => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      lastActiveAt: null,
      sessionExpiresAt: null,
      sessionTimeoutReason: null,

      touchSession: () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        const now = Date.now();
        set({
          lastActiveAt: now,
          sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
        });
      },

      checkSessionExpiry: () => {
        const { isAuthenticated, sessionExpiresAt } = get();
        if (!isAuthenticated) return false;
        if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
          get().signOut("inactivity");
          return false;
        }
        return true;
      },

      initAuth: async () => {
        try {
          set({ isLoading: true, authError: null });
          const now = Date.now();
          const current = get();

          // Check if persisted session has expired due to inactivity
          if (current.sessionExpiresAt && now > current.sessionExpiresAt) {
            await get().signOut("inactivity");
            return;
          }

          const { data, error } = await supabase.auth.getSession();
          if (error) {
            // If offline or network error, preserve persisted local session if valid
            if (current.isAuthenticated && current.user) {
              set({ isLoading: false });
              return;
            }
            set({ isLoading: false, authError: error.message });
            return;
          }

          if (data?.session?.user) {
            const u = data.session.user;
            set({
              user: {
                id: u.id,
                email: u.email,
                phone: u.phone,
                fullName:
                  u.user_metadata?.full_name ||
                  u.user_metadata?.name ||
                  u.email?.split("@")[0] ||
                  "WearID Member",
                avatarUrl: u.user_metadata?.avatar_url,
              },
              isAuthenticated: true,
              lastActiveAt: now,
              sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
              isLoading: false,
            });
          } else {
            // Keep local/test session if already authenticated and not expired
            if (current.isAuthenticated && current.user) {
              set({
                lastActiveAt: now,
                sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                lastActiveAt: null,
                sessionExpiresAt: null,
                isLoading: false,
              });
            }
          }

          // Listen to auth changes
          supabase.auth.onAuthStateChange((event: string, session: any) => {
            if (event === "SIGNED_OUT") {
              set({
                user: null,
                isAuthenticated: false,
                lastActiveAt: null,
                sessionExpiresAt: null,
                isLoading: false,
              });
              return;
            }

            if (session?.user) {
              const u = session.user;
              const updateTime = Date.now();
              set({
                user: {
                  id: u.id,
                  email: u.email,
                  phone: u.phone,
                  fullName:
                    u.user_metadata?.full_name ||
                    u.user_metadata?.name ||
                    u.email?.split("@")[0] ||
                    "WearID Member",
                  avatarUrl: u.user_metadata?.avatar_url,
                },
                isAuthenticated: true,
                lastActiveAt: updateTime,
                sessionExpiresAt: updateTime + DEFAULT_SESSION_DURATION_MS,
                isLoading: false,
              });
            }
          });
        } catch (err: any) {
          // Fallback: If network fails, do not wipe valid local session
          const current = get();
          if (current.isAuthenticated && current.user) {
            set({ isLoading: false });
          } else {
            set({ isLoading: false, authError: err?.message || "Auth initialization error" });
          }
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, authError: null });
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (typeof window !== "undefined" ? window.location.origin : "https://wear-id.vercel.app");

          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${appUrl}/app`,
            },
          });

          if (error) {
            set({ isLoading: false, authError: error.message });
            return { error: error.message };
          }

          set({ isLoading: false });
          return {};
        } catch (err: any) {
          const msg = err?.message || "Google sign in failed";
          set({ isLoading: false, authError: msg });
          return { error: msg };
        }
      },

      signInWithPhoneOtp: async (phone: string) => {
        try {
          set({ isLoading: true, authError: null });
          // Format phone number with country code if missing
          const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

          const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
          });

          if (error) {
            set({ isLoading: false, authError: error.message });
            return { error: error.message };
          }

          set({ isLoading: false });
          return {};
        } catch (err: any) {
          const msg = err?.message || "Failed to send phone OTP";
          set({ isLoading: false, authError: msg });
          return { error: msg };
        }
      },

      verifyPhoneOtp: async (phone: string, token: string) => {
        try {
          set({ isLoading: true, authError: null });
          const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

          const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: token.trim(),
            type: "sms",
          });

          if (error) {
            set({ isLoading: false, authError: error.message });
            return { error: error.message };
          }

          if (data?.user) {
            const u = data.user;
            const now = Date.now();
            set({
              user: {
                id: u.id,
                email: u.email,
                phone: u.phone,
                fullName: u.user_metadata?.full_name || formattedPhone,
              },
              isAuthenticated: true,
              lastActiveAt: now,
              sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
              sessionTimeoutReason: null,
              isLoading: false,
            });
          }

          return {};
        } catch (err: any) {
          const msg = err?.message || "Invalid OTP code";
          set({ isLoading: false, authError: msg });
          return { error: msg };
        }
      },

      signInWithEmailOtp: async (email: string) => {
        try {
          set({ isLoading: true, authError: null });
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (typeof window !== "undefined" ? window.location.origin : "https://wear-id.vercel.app");

          const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: {
              emailRedirectTo: `${appUrl}/app`,
            },
          });

          if (error) {
            set({ isLoading: false, authError: error.message });
            return { error: error.message };
          }

          set({ isLoading: false });
          return {};
        } catch (err: any) {
          const msg = err?.message || "Failed to send email link";
          set({ isLoading: false, authError: msg });
          return { error: msg };
        }
      },

      verifyEmailOtp: async (email: string, token: string) => {
        try {
          set({ isLoading: true, authError: null });
          const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: token.trim(),
            type: "email",
          });

          if (error) {
            set({ isLoading: false, authError: error.message });
            return { error: error.message };
          }

          if (data?.user) {
            const u = data.user;
            const now = Date.now();
            set({
              user: {
                id: u.id,
                email: u.email,
                fullName: u.user_metadata?.full_name || u.email?.split("@")[0],
              },
              isAuthenticated: true,
              lastActiveAt: now,
              sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
              sessionTimeoutReason: null,
              isLoading: false,
            });
          }

          return {};
        } catch (err: any) {
          const msg = err?.message || "Invalid email OTP code";
          set({ isLoading: false, authError: msg });
          return { error: msg };
        }
      },

      signInWithTestAccount: (phoneOrEmail?: string) => {
        const identifier = phoneOrEmail || "+917722890254";
        const now = Date.now();
        set({
          user: {
            id: "test-auth-user-" + now,
            phone: identifier.includes("@") ? undefined : identifier,
            email: identifier.includes("@") ? identifier : undefined,
            fullName: "Aarush",
          },
          isAuthenticated: true,
          lastActiveAt: now,
          sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
          sessionTimeoutReason: null,
          isLoading: false,
          authError: null,
        });
      },

      signOut: async (reason?: "inactivity" | "manual") => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        set({
          user: null,
          isAuthenticated: false,
          lastActiveAt: null,
          sessionExpiresAt: null,
          sessionTimeoutReason: reason || "manual",
          isLoading: false,
          authError: null,
        });
      },

      clearError: () => set({ authError: null }),
    }),
    {
      name: "wearid-auth-session",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActiveAt: state.lastActiveAt,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
