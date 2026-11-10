"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg">
            W
          </span>
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Wear<span className="text-accent">Id</span>
          </span>
        </Link>
        <Link
          href="/app"
          className="text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          Continue as Guest →
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full py-12 text-center">
        <AuthModal
          isOpen={modalOpen}
          onClose={() => router.push("/app")}
          onSuccess={() => router.push("/app")}
        />
      </main>

      <footer className="text-center text-xs text-text-tertiary">
        WearID · Sovereign Biometric Sizing Passport · Private by Default
      </footer>
    </div>
  );
}
