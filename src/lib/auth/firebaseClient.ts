/**
 * Google Firebase Phone Authentication Client for WearID
 *
 * Provides:
 * - 10,000 Free Phone SMS OTP verifications every month worldwide (including India +91)
 * - Zero Indian DLT / TRAI registration required
 * - Built-in invisible reCAPTCHA anti-bot protection
 * - Deterministic fallback to mock / API route in development / test environments
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
} from "firebase/auth";

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Checks if Firebase is configured with real client credentials
 */
export function isFirebaseConfigured(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey.length > 10 &&
      !firebaseConfig.apiKey.includes("mock")
    )
  );
}

// Module-level singletons
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let activeConfirmationResult: ConfirmationResult | null = null;

/**
 * Initialize or retrieve Firebase App singleton safely across client renders
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else if (firebaseConfig.apiKey) {
      appInstance = initializeApp(firebaseConfig as Record<string, string>);
    }
  }
  return appInstance;
}

/**
 * Initialize or retrieve Firebase Auth instance
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;

  if (!authInstance) {
    const app = getFirebaseApp();
    if (app) {
      authInstance = getAuth(app);
    }
  }
  return authInstance;
}

/**
 * Initialize the invisible reCAPTCHA verifier attached to a DOM container
 */
export function setupRecaptchaVerifier(containerId = "recaptcha-container"): RecaptchaVerifier | null {
  if (typeof window === "undefined") return null;

  const auth = getFirebaseAuth();
  if (!auth) return null;

  // Clear existing verifier if any
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore cleanup error
    }
    recaptchaVerifier = null;
  }

  // Ensure DOM container exists
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved automatically
    },
    "expired-callback": () => {
      // Reset if expired
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }
    },
  });

  return recaptchaVerifier;
}

/**
 * Send an SMS OTP via Google Firebase Phone Authentication
 * Free quota: 10,000 SMS / month
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  containerId = "recaptcha-container"
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }

    // Ensure phone number has international country code format (e.g., +91 for India)
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : cleanDigits.length === 10
      ? `+91${cleanDigits}`
      : `+${cleanDigits}`;

    const verifier = setupRecaptchaVerifier(containerId);
    if (!verifier) {
      throw new Error("Could not initialize reCAPTCHA verifier.");
    }

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    activeConfirmationResult = confirmationResult;

    return { success: true };
  } catch (err: any) {
    // Reset verifier on failure so user can retry immediately
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch {
        // Ignore
      }
      recaptchaVerifier = null;
    }

    let errorMessage = err?.message || "Failed to dispatch SMS via Firebase.";
    if (err?.code === "auth/invalid-phone-number") {
      errorMessage = "Invalid mobile number format. Please include your 10-digit number.";
    } else if (err?.code === "auth/too-many-requests") {
      errorMessage = "Too many OTP requests from this device. Please wait a few minutes.";
    } else if (err?.code === "auth/quota-exceeded") {
      errorMessage = "SMS quota exceeded for today. Please use Email OTP sign-in.";
    } else if (err?.code === "auth/captcha-check-failed") {
      errorMessage = "Bot verification challenge failed. Please refresh and try again.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Confirm the 6-digit OTP code with Firebase Confirmation Result
 */
export async function verifyFirebasePhoneOtp(
  otpCode: string
): Promise<{ success: boolean; user?: UserCredential["user"]; error?: string }> {
  try {
    if (!activeConfirmationResult) {
      throw new Error("No active verification session found. Please request a new code.");
    }

    const cleanCode = otpCode.trim().replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      throw new Error("Please enter a valid 6-digit verification code.");
    }

    const credential = await activeConfirmationResult.confirm(cleanCode);
    activeConfirmationResult = null; // Consume confirmation

    return { success: true, user: credential.user };
  } catch (err: any) {
    let errorMessage = err?.message || "Invalid verification code.";
    if (err?.code === "auth/invalid-verification-code") {
      errorMessage = "Incorrect verification code. Please check your SMS and try again.";
    } else if (err?.code === "auth/code-expired") {
      errorMessage = "Verification code has expired. Please request a new code.";
      activeConfirmationResult = null;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Clear any active confirmation results (useful on logout / reset)
 */
export function clearActiveConfirmation(): void {
  activeConfirmationResult = null;
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore
    }
    recaptchaVerifier = null;
  }
}
