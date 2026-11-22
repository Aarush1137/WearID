"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicFitReportDTO } from "@/app/api/fit/share/[token]/route";

export default function FitReportPage({
  params,
}: {
  params: { token: string } | Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string>("");
  const [report, setReport] = useState<PublicFitReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await Promise.resolve(params);
        const resolvedToken = resolvedParams?.token;
        setToken(resolvedToken);

        if (!resolvedToken) {
          setError("No share token provided in URL.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/fit/share/${resolvedToken}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to load public fit passport.");
        }

        const data: PublicFitReportDTO = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || "Failed to resolve fit report.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-4 text-center dark:bg-neutral-950">
        <div className="space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#1B2A4A] border-t-transparent dark:border-blue-400" />
          <p className="font-serif text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Verifying cryptographic token & resolving deterministic sizing...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/40 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            ⚠
          </div>
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
            Fit Passport Unavailable
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {error || "This size passport token has expired or is invalid."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block rounded-xl bg-[#1B2A4A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#253966] dark:bg-blue-600"
            >
              Return to WearID Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="public-fit-report-page"
      className="min-h-screen bg-[#FAF8F5] py-8 px-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header & Brand Anchor */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-black tracking-tight text-[#1B2A4A] dark:text-white">
              WearID
            </span>
            <span className="rounded-full bg-[#E5E0D8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1B2A4A] dark:bg-neutral-800 dark:text-neutral-300">
              Sovereign Passport
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              data-testid="copy-share-link-btn"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {copied ? "✓ Copied Link" : "Copy Passport Link"}
            </button>
            <Link
              href="/app"
              className="rounded-lg bg-[#1B2A4A] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#253966] dark:bg-blue-600"
            >
              Open App
            </Link>
          </div>
        </div>

        {/* Invariant 7 Privacy Shield Banner */}
        <div
          data-testid="privacy-guarantee-banner"
          className="rounded-2xl border border-[#D5DFD7] bg-[#F2F7F4] p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1D5D42] text-sm text-white">
              🛡
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1D5D42] dark:text-emerald-300">
                Zero-Biometric Sovereign Privacy Guarantee (Invariant 7)
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#235840] dark:text-emerald-400">
                This public sizing report securely displays deterministic size recommendations and
                ease allowances without exposing private anatomical dimensions (chest, waist, hips,
                stature). Third-party retailers and friends can see your exact fit across brands while
                your biometric identity remains private.
              </p>
            </div>
          </div>
        </div>

        {/* Member Profile Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Fit Identity
              </span>
              <h1 className="mt-1 font-serif text-2xl font-bold text-[#1B2A4A] dark:text-white sm:text-3xl">
                {report.profileName}
              </h1>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Preferred Silhouette:{" "}
                <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                  {report.preferredSilhouette} Fit
                </span>{" "}
                • Token: <span className="font-mono text-[11px] text-neutral-400">{token.slice(0, 18)}...</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                ● Verified Active
              </span>
            </div>
          </div>
        </div>

        {/* Categories Sizing Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#1B2A4A] dark:text-white">
              Deterministic Size Recommendations
            </h2>
            <span className="text-xs text-neutral-500">
              {report.categories.length} Verified Apparel Categories
            </span>
          </div>

          <div
            data-testid="categories-fit-grid"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {report.categories.map((cat) => (
              <div
                key={cat.category}
                data-testid={`category-card-${cat.category}`}
                className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {cat.categoryLabel}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cat.fitConfidence === "high"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {cat.fitScorePct}% FIT
                    </span>
                  </div>

                  {/* Recommended Size Display */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      data-testid={`recommended-size-${cat.category}`}
                      className="font-serif text-3xl font-extrabold text-[#1B2A4A] dark:text-blue-400"
                    >
                      Size {cat.recommendedSize}
                    </span>
                  </div>

                  {/* Ease summary */}
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {cat.easeDescription}
                  </p>

                  {/* Borderline Tradeoff note */}
                  {cat.isBorderline && cat.borderlineTradeoff && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                      <span className="font-semibold">Borderline Fit: </span>
                      {cat.borderlineTradeoff}
                    </div>
                  )}
                </div>

                {/* Tested reference product */}
                {cat.testedGarments && cat.testedGarments.length > 0 && (
                  <div className="mt-4 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400 dark:border-neutral-800">
                    <span>
                      Tested with {cat.testedGarments[0].brandName} {cat.testedGarments[0].productName}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-[#E5E0D8] pt-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
          <p>
            Powered by WearID Deterministic Sizing Engine • Zero Measurement Hallucination Guarantee
          </p>
          <p className="mt-1">
            Expires on{" "}
            {new Date(report.expiresAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
