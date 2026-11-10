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

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // Actions
  initAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithPhoneOtp: (phone: string) => Promise<{ error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  signInWithEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error?: string }>;
  signInWithTestAccount: (phoneOrEmail?: string) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,

      initAuth: async () => {
        try {
          set({ isLoading: true, authError: null });
          const { data, error } = await supabase.auth.getSession();
          if (error) {
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
                fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "WearID Member",
                avatarUrl: u.user_metadata?.avatar_url,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }

          // Listen to auth changes
          supabase.auth.onAuthStateChange((_event: string, session: any) => {
            if (session?.user) {
              const u = session.user;
              set({
                user: {
                  id: u.id,
                  email: u.email,
                  phone: u.phone,
                  fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "WearID Member",
                  avatarUrl: u.user_metadata?.avatar_url,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          });
        } catch (err: any) {
          set({ isLoading: false, authError: err?.message || "Auth initialization error" });
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
            set({
              user: {
                id: u.id,
                email: u.email,
                phone: u.phone,
                fullName: u.user_metadata?.full_name || formattedPhone,
              },
              isAuthenticated: true,
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
            set({
              user: {
                id: u.id,
                email: u.email,
                fullName: u.user_metadata?.full_name || u.email?.split("@")[0],
              },
              isAuthenticated: true,
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
        set({
          user: {
            id: "test-auth-user-" + Date.now(),
            phone: identifier.includes("@") ? undefined : identifier,
            email: identifier.includes("@") ? identifier : undefined,
            fullName: "Aarush",
          },
          isAuthenticated: true,
          isLoading: false,
          authError: null,
        });
      },

      signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, isLoading: false, authError: null });
      },

      clearError: () => set({ authError: null }),
    }),
    {
      name: "wearid-auth-session",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
