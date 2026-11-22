"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ArrowRight,
  User,
  Info,
  Layers,
} from "lucide-react";
import {
  ChatMessage,
  FitAssistantEngine,
  RecommendationCardData,
  ComparisonCardData,
  MissingMeasurementCardData,
} from "@/core/assistant/fitAssistantEngine";
import { DEMO_PROFILES } from "@/core/security/tokenRegistry";
import { FitType } from "@/core/types";
import { cn } from "@/lib/utils";

export interface FitAssistantChatProps {
  className?: string;
  initialProfileKey?: "athletic" | "regular" | "slim";
}

export const FitAssistantChat: React.FC<FitAssistantChatProps> = ({
  className,
  initialProfileKey = "regular",
}) => {
  const [profileKey, setProfileKey] = useState<"athletic" | "regular" | "slim">(initialProfileKey);
  const [fitIntent, setFitIntent] = useState<FitType>("regular");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualChestInput, setManualChestInput] = useState("");

  const engineRef = useRef<FitAssistantEngine | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize engine and send initial welcome
  useEffect(() => {
    const profile = DEMO_PROFILES[profileKey];
    const engine = new FitAssistantEngine({
      profile,
      fitIntent,
    });
    engineRef.current = engine;

    // Set initial welcome message
    setMessages([
      {
        id: "msg_welcome",
        role: "assistant",
        content: `👋 Hello! I am your **WearID AI Fit Assistant**.\n\nI am grounded strictly in WearID's deterministic sizing engine with **zero measurement hallucination**. Every recommendation is computed from verified garment dimensions.\n\nActive Profile: **${profileKey.toUpperCase()}** (${profile?.chestMm ? Math.round(profile.chestMm / 10) : 0} cm chest).`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [profileKey, fitIntent]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === "function") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !engineRef.current || isProcessing) return;

    setInputValue("");

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const activeProfile = DEMO_PROFILES[profileKey];
      const result = await engineRef.current.processUserMessage(text, {
        profile: activeProfile,
        fitIntent,
      });

      setMessages((prev) => [...prev, result.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: "assistant",
          content: "An error occurred while evaluating your sizing request. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChestMeasurement = () => {
    const cm = parseFloat(manualChestInput);
    if (isNaN(cm) || cm <= 0) return;

    const mm = Math.round(cm * 10);
    const updatedProfile = {
      ...DEMO_PROFILES[profileKey],
      chestMm: mm,
    };
    DEMO_PROFILES[profileKey] = updatedProfile;

    if (engineRef.current) {
      engineRef.current.setContext({ profile: updatedProfile });
    }

    setManualChestInput("");
    handleSendMessage(`I measured my chest: ${cm} cm. Please recommend my size now.`);
  };

  const SUGGESTION_CHIPS = [
    "What size am I in Uniqlo AIRism Oversized?",
    "Should I get M or L in Supima Tee?",
    "Recommend size for Snitch Boxy Tee",
    "Explain ease for relaxed fit",
  ];

  return (
    <div
      data-testid="fit-assistant-chat"
      className={cn(
        "flex flex-col h-[700px] max-h-[85vh] w-full rounded-2xl border border-[var(--border-subtle,rgba(0,0,0,0.1))] bg-[var(--bg-surface,#ffffff)] shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--border-subtle,rgba(0,0,0,0.08))] px-5 py-3.5 bg-[var(--bg-elevated,#f8fafc)] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary,#0f172a)] flex items-center gap-2">
              WearID AI Fit Assistant
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Deterministic Sizing
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary,#64748b)]">
              Grounded in Layer 3 physical garment specs • Zero hallucination
            </p>
          </div>
        </div>

        {/* Profile and Intent Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <select
              aria-label="Active Profile"
              value={profileKey}
              onChange={(e) => setProfileKey(e.target.value as "athletic" | "regular" | "slim")}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="athletic">Athletic (104cm chest)</option>
              <option value="regular">Regular (98cm chest)</option>
              <option value="slim">Slim (90cm chest)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <select
              aria-label="Fit Intent"
              value={fitIntent}
              onChange={(e) => setFitIntent(e.target.value as FitType)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="slim">Slim Fit</option>
              <option value="regular">Regular Fit</option>
              <option value="relaxed">Relaxed Fit</option>
              <option value="oversized">Oversized Fit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isUser
                    ? "bg-emerald-700 text-white rounded-br-none shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Structured Tool Result Cards */}
                {msg.toolResultCard && (
                  <div className="mt-3.5">
                    {msg.toolResultCard.type === "recommendation" && (
                      <RecommendationCard card={msg.toolResultCard} />
                    )}
                    {msg.toolResultCard.type === "comparison" && (
                      <ComparisonCard card={msg.toolResultCard} />
                    )}
                    {msg.toolResultCard.type === "missing_measurement_prompt" && (
                      <MissingMeasurementPromptCard
                        card={msg.toolResultCard}
                        inputValue={manualChestInput}
                        onInputChange={setManualChestInput}
                        onApply={handleApplyChestMeasurement}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Computing deterministic ease math across size catalog...
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Suggestions:
        </span>
        {SUGGESTION_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3.5 border-t border-[var(--border-subtle,rgba(0,0,0,0.08))] bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask for a size recommendation, compare sizes, or inquire about ease..."
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm bg-transparent outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isProcessing}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

/**
 * Recommendation Card Component
 */
const RecommendationCard: React.FC<{ card: RecommendationCardData }> = ({ card }) => {
  return (
    <div
      data-testid="recommendation-card"
      className="rounded-xl border border-emerald-300/80 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 text-slate-900 dark:text-slate-100 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          Recommended Fit
        </span>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
          {card.fitScore}% Match
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold font-serif text-emerald-900 dark:text-emerald-200">
          Size {card.recommendedSize}
        </span>
        {typeof card.chestEaseCm === "number" && (
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            +{card.chestEaseCm} cm wearing ease
          </span>
        )}
      </div>

      {card.isBorderline && card.alternativeSize && (
        <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 p-2.5 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">Borderline with Size {card.alternativeSize}: </span>
            {card.borderlineTradeoff}
          </div>
        </div>
      )}

      <p className="text-xs opacity-90 leading-relaxed">{card.summaryText}</p>
    </div>
  );
};

/**
 * Comparison Card Component
 */
const ComparisonCard: React.FC<{ card: ComparisonCardData }> = ({ card }) => {
  return (
    <div
      data-testid="comparison-card"
      className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-3"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">
        <Scale className="h-4 w-4" />
        Size Comparison: {card.productName}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 font-serif">
            Size {card.sizeA.sizeLabel}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            +{card.sizeA.chestEaseCm} cm ease
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">{card.sizeA.description}</p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 font-serif">
            Size {card.sizeB.sizeLabel}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            +{card.sizeB.chestEaseCm} cm ease
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">{card.sizeB.description}</p>
        </div>
      </div>

      <div className="text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{card.verdict}</span>
      </div>
    </div>
  );
};

/**
 * Missing Measurement Prompt Card Component (Invariant 1 Enforcement)
 */
const MissingMeasurementPromptCard: React.FC<{
  card: MissingMeasurementCardData;
  inputValue: string;
  onInputChange: (val: string) => void;
  onApply: () => void;
}> = ({ card, inputValue, onInputChange, onApply }) => {
  return (
    <div
      data-testid="missing-measurement-card"
      className="rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 p-4 space-y-3"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-400">
        <AlertTriangle className="h-4 w-4 text-rose-600" />
        Measurement Required (Invariant 1)
      </div>

      <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
        {card.message}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="number"
          step="0.5"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Chest (cm), e.g. 98"
          className="w-36 rounded-lg border border-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!inputValue.trim()}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition disabled:opacity-50"
        >
          Save & Re-evaluate
        </button>
      </div>
    </div>
  );
};
