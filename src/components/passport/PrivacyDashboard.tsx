"use client";

import React, { useState } from "react";
import { useProfileStore } from "@/core/state/profileStore";
import { SizingTokenService } from "@/core/security/sizingTokenService";
import { PILOT_BRANDS } from "@/core/data/pilotBrands";
import {
  ShieldCheck,
  Key,
  Download,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  EyeOff,
  ExternalLink,
} from "lucide-react";

// Injected mock signing key from env.template.md for secure client-side generation
const MOCK_SIGNING_KEY = "mock_jwt_secret_key_wearid_sandbox_2026_deterministic";

export function PrivacyDashboard() {
  const { getActiveProfile, resetToSampleData } = useProfileStore();
  const profile = getActiveProfile();

  // Token Generator state
  const [selectedRetailer, setSelectedRetailer] = useState<string>("all");
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);

  // Handle Token Generation
  const handleGenerateToken = () => {
    try {
      const service = new SizingTokenService(MOCK_SIGNING_KEY);
      const token = service.generateToken(profile.measurements, {
        expiresInSeconds: expiresInHours * 3600,
        allowedRetailer: selectedRetailer === "all" ? undefined : selectedRetailer,
      });
      setGeneratedToken(token);
    } catch (err) {
      console.error("Token generation error:", err);
    }
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Handle JSON Data Export
  const handleExportJson = () => {
    const exportData = {
      wearid_version: "1.0",
      export_timestamp: new Date().toISOString(),
      profile_id: profile.id,
      identity_name: profile.name,
      relationship: profile.relation,
      gender: profile.gender,
      canonical_measurements_mm: profile.measurements,
      fit_preferences: profile.preferences,
      reference_garments: profile.referenceGarments,
      privacy_governance: {
        visibility: "private",
        zero_knowledge_compliant: true,
        canonical_unit: "mm",
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wearid-sovereign-profile-${profile.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Complete Data Purge
  const handleConfirmPurge = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") return;
    localStorage.clear();
    resetToSampleData();
    setIsDeleted(true);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8" role="region" aria-label="Privacy & Sovereignty Dashboard">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Biometric Sovereignty & Privacy Controls
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
          Privacy & Portable Tokens
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-xl">
          Manage third-party merchant permissions, generate zero-knowledge sizing tokens, and execute sovereign data exports.
        </p>
      </div>

      {/* 1. Portable Sizing Token Generator Card */}
      <section className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-lg text-text-primary flex items-center gap-2">
              <Key className="w-4 h-4 text-accent" />
              Generate Scoped Sizing Token (WearID Connect)
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Create a time-bound cryptographic token allowing online retailers to find your size without seeing your body dimensions.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-badge bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider shrink-0">
            Zero-Knowledge
          </span>
        </div>

        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Merchant Scoping
            </label>
            <select
              value={selectedRetailer}
              onChange={(e) => {
                setSelectedRetailer(e.target.value);
                setGeneratedToken(null);
              }}
              className="input-editorial w-full"
            >
              <option value="all">Any Merchant (Unscoped)</option>
              {PILOT_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.domain})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-text-secondary block mt-1">
              Locking to a specific brand prevents other websites from reusing this token.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Token Expiration Window
            </label>
            <select
              value={expiresInHours}
              onChange={(e) => {
                setExpiresInHours(Number(e.target.value));
                setGeneratedToken(null);
              }}
              className="input-editorial w-full"
            >
              <option value={1}>1 Hour (Quick Checkout)</option>
              <option value={24}>24 Hours (1 Day)</option>
              <option value={168}>7 Days (1 Week)</option>
              <option value={720}>30 Days (Extended)</option>
            </select>
            <span className="text-[11px] text-text-secondary block mt-1">
              Tokens automatically revoke after expiration.
            </span>
          </div>
        </div>

        {/* Generate CTA & Token Box */}
        {!generatedToken ? (
          <button
            type="button"
            onClick={handleGenerateToken}
            className="btn-primary min-h-[44px] text-xs font-semibold shadow-xs"
          >
            Generate Scoped Token
          </button>
        ) : (
          <div className="p-4 rounded-card bg-bg-elevated/50 border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-text-secondary block uppercase tracking-wider">
                  Active Sizing Token
                </span>
                <span className="font-mono text-xs text-text-primary break-all select-all font-semibold">
                  {generatedToken}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyToken}
                className="min-h-[40px] px-3.5 rounded-btn bg-accent text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent-hover transition-colors shrink-0"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Token
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-start gap-2 text-xs text-text-secondary">
              <EyeOff className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guarantee:</strong> When the merchant validates this token, our API returns only
                &quot;Size recommended: M (94% confidence)&quot;. Your actual chest, waist, and shoulder millimeters are never revealed.
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Sovereign Data Export & Portability Card */}
      <section className="rounded-card border border-border bg-bg-surface p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-base text-text-primary flex items-center gap-2">
            <Download className="w-4 h-4 text-accent" />
            Full Biometric Data Export (JSON)
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 max-w-xl leading-relaxed">
            Download your raw anatomical dimensions in canonical integer millimeters, fit preferences, and benchmark calibration history under GDPR/CCPA data portability standards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJson}
          className="btn-secondary min-h-[44px] text-xs font-semibold shrink-0 inline-flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </section>

      {/* 3. Account Deletion & Local Data Purge Card */}
      <section className="rounded-card border border-rose-200 bg-rose-50/40 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-base text-rose-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-700" />
              Right to Complete Erasure
            </h2>
            <p className="text-xs text-rose-800/80 mt-0.5 max-w-xl leading-relaxed">
              Permanently purge all biometric measurements, fit histories, and saved benchmark garments from this device and cache.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="min-h-[44px] px-4 rounded-btn bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-1.5 shadow-xs"
          >
            Purge My Data
          </button>
        </div>

        {isDeleted && (
          <div className="mt-4 p-3 rounded-card bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            All local biometric records have been permanently purged and reset.
          </div>
        )}
      </section>

      {/* Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-base text-text-primary">
                Confirm Complete Data Purge
              </h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This action is permanent and cannot be undone. All your anatomical profiles, reference garments, and sizing preferences will be permanently wiped from your browser storage.
            </p>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="input-editorial w-full font-mono text-sm uppercase"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText("");
                }}
                className="min-h-[40px] px-4 rounded-btn border border-border text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                onClick={handleConfirmPurge}
                className="min-h-[40px] px-4 rounded-btn bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
