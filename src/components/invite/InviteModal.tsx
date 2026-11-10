"use client";

import React, { useState } from "react";
import { UserPlus, X, Copy, Check, Share2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";
import { useProfileStore } from "@/core/state/profileStore";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { user } = useAuthStore();
  const { getActiveProfile } = useProfileStore();
  const activeProfile = getActiveProfile();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wear-id.vercel.app";

  const inviteCode =
    user?.id ? user.id.slice(0, 8).toUpperCase() : "BETA2026";
  const shareUrl = `${appUrl}/onboarding?ref=${inviteCode}`;

  const shareText = `I calibrated my universal clothing size profile on WearID. Calibrate yours once to get your exact size across 28+ brands (Zara, Uniqlo, Levi's, Nike & more): ${shareUrl}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(waUrl, "_blank");
  };

  const handleTwitterShare = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(twUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WearID — Universal Clothing Identity",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-card border border-border bg-bg-surface p-6 shadow-xl text-text-primary">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-btn text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-btn bg-accent-subtle text-accent flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">
              Invite Friends & Family
            </h3>
            <p className="text-[11px] text-text-secondary">
              Share WearID to compare sizes and calibrate passports together.
            </p>
          </div>
        </div>

        {/* Invite Code Badge */}
        <div className="p-3 rounded-card bg-accent/5 border border-accent/20 mb-4 text-center">
          <span className="text-[10px] uppercase font-semibold text-text-tertiary block mb-1">
            Your Personal Beta Invite Pass
          </span>
          <div className="font-mono text-base font-bold text-accent tracking-widest">
            {inviteCode}
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 mb-5">
          <label className="block text-xs font-semibold text-text-primary">
            Direct Invitation Link
          </label>
          <div className="flex items-center rounded-btn border border-border-strong bg-bg-elevated overflow-hidden p-1">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full px-2.5 py-1.5 text-xs bg-transparent outline-none text-text-primary font-mono truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn-primary min-h-[36px] px-3.5 text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full min-h-[42px] px-4 rounded-btn bg-[#25D366] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-xs"
          >
            <span>Share via WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleTwitterShare}
              className="min-h-[40px] px-3 rounded-btn border border-border bg-bg-surface hover:bg-bg-elevated text-xs font-semibold text-text-primary inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Share on X / Twitter</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="min-h-[40px] px-3 rounded-btn border border-border bg-bg-surface hover:bg-bg-elevated text-xs font-semibold text-text-primary inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span>More Options</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-text-tertiary text-center mt-5">
          Invited members calibrate their own sovereign profile. Your private biometric measurements are never shared without explicit consent.
        </p>
      </div>
    </div>
  );
}
