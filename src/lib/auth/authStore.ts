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
  hasInitialized: boolean;
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

let isAuthListenerAttached = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasInitialized: false,
      authError: null,
      lastActiveAt: null,
      sessionExpiresAt: null,
      sessionTimeoutReason: null,

      touchSession: () => {
        const { isAuthenticated, lastActiveAt } = get();
        if (!isAuthenticated) return;
        const now = Date.now();
        // Throttle updates: only persist new timestamp if more than 60 seconds have elapsed
        if (lastActiveAt && now - lastActiveAt < 60_000) return;
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
        const current = get();
        // If already initialized, do non-blocking session check and return immediately
        if (current.hasInitialized) {
          current.checkSessionExpiry();
          return;
        }

        const now = Date.now();
        // Check if persisted session has expired due to inactivity
        if (current.sessionExpiresAt && now > current.sessionExpiresAt) {
          await get().signOut("inactivity");
          set({ hasInitialized: true });
          return;
        }

        // Attach Supabase listener exactly once across application lifecycle
        if (!isAuthListenerAttached) {
          isAuthListenerAttached = true;
          supabase.auth.onAuthStateChange((event: string, session: any) => {
            if (event === "SIGNED_OUT") {
              set({
                user: null,
                isAuthenticated: false,
                lastActiveAt: null,
                sessionExpiresAt: null,
                isLoading: false,
                hasInitialized: true,
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
                hasInitialized: true,
              });
            }
          });
        }

        // If local persisted session exists, keep it active immediately without UI freeze
        if (current.isAuthenticated && current.user) {
          set({
            hasInitialized: true,
            lastActiveAt: now,
            sessionExpiresAt: now + DEFAULT_SESSION_DURATION_MS,
          });
        }

        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            set({ hasInitialized: true, isLoading: false });
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
              hasInitialized: true,
            });
          } else {
            // No remote session found; if no persisted user, mark unauthenticated
            if (!get().user) {
              set({
                user: null,
                isAuthenticated: false,
                lastActiveAt: null,
                sessionExpiresAt: null,
                isLoading: false,
                hasInitialized: true,
              });
            } else {
              set({ hasInitialized: true, isLoading: false });
            }
          }
        } catch (_) {
          set({ hasInitialized: true, isLoading: false });
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
