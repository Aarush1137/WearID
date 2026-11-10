"use client";

import React, { useState } from "react";
import { MessageSquarePlus, X, Star, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<
    "sizing_accuracy" | "missing_brand" | "shoe_sizing" | "bug_report" | "general_ux"
  >("sizing_accuracy");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState(user?.email || user?.phone || "");
  const [brandName, setBrandName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (message.trim().length < 5) {
      setErrorMsg("Please write at least 5 characters describing your feedback.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          message,
          emailOrPhone: contact,
          brandName: category === "missing_brand" ? brandName : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit feedback.");
      }

      setSubmittedTicket(data.ticketId);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setMessage("");
    setErrorMsg(null);
    onClose();
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
          onClick={handleReset}
          className="absolute right-4 top-4 p-1.5 rounded-btn text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedTicket ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-text-primary">
              Feedback Received!
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
              Thank you for helping us calibrate WearID. Your feedback has been assigned Ticket ID:
            </p>
            <div className="inline-block px-3 py-1.5 rounded bg-bg-elevated font-mono font-bold text-xs text-accent">
              {submittedTicket}
            </div>
            <div>
              <button
                type="button"
                onClick={handleReset}
                className="btn-primary min-h-[40px] px-6 text-xs font-semibold mt-4 shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-btn bg-accent-subtle text-accent flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  Beta Feedback & Calibration
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Help improve WearID sizing accuracy and report missing brands.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-card bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Feedback Topic
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "sizing_accuracy", label: "Sizing Accuracy" },
                  { id: "missing_brand", label: "Request a Brand" },
                  { id: "shoe_sizing", label: "Shoe Size Variance" },
                  { id: "bug_report", label: "Report a Bug" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`py-2 px-2.5 rounded-btn text-[11px] font-semibold text-center transition-all ${
                      category === item.id
                        ? "bg-accent text-white shadow-xs"
                        : "bg-bg-elevated border border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {category === "missing_brand" && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Brand Name You Want Added
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Rare Rabbit, Woodland, Flying Machine"
                  className="input-editorial w-full text-xs"
                />
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Your Overall Experience
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-text-tertiary"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Details & Observations
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about the fit recommendation, or any issue you encountered..."
                className="input-editorial w-full text-xs resize-none"
              />
            </div>

            {/* Contact Optional */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Contact Info (Optional, for follow-up)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@example.com or mobile number"
                className="input-editorial w-full text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || message.trim().length < 5}
              className="w-full btn-primary min-h-[44px] text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
