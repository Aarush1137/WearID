"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useBrandRequestStore,
  BrandRequestItem,
  BrandRequestCategory,
  BrandRequestStatus,
} from "@/core/state/brandRequestStore";
import {
  Vote,
  Sparkles,
  Search,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Flame,
  Clock,
  ArrowUpDown,
  X,
  Filter,
} from "lucide-react";

const CATEGORY_LABELS: Record<BrandRequestCategory, string> = {
  streetwear: "Streetwear",
  oversized: "Oversized Fit",
  casual: "Casual Everyday",
  formal: "Formal & Tailored",
  ethnic: "Ethnic & Fusion",
  athleisure: "Athleisure",
  footwear: "Footwear",
  innerwear: "Innerwear / Basics",
};

const STATUS_CONFIG: Record<
  BrandRequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  open: {
    label: "Open for Votes",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  under_review: {
    label: "Under Review",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  sizing_chart_pending: {
    label: "Specs Pending",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  in_catalog: {
    label: "In Catalog",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
};

const VOTE_GOAL = 150;

export function BrandVotingBoard() {
  const {
    requests,
    userVotes,
    searchQuery,
    categoryFilter,
    statusFilter,
    sortBy,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setSortBy,
    toggleVote,
    checkDuplicate,
    submitRequest,
  } = useBrandRequestStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [newCategory, setNewCategory] = useState<BrandRequestCategory>("streetwear");
  const [newDescription, setNewDescription] = useState("");
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Live duplicate detection for search bar
  const searchDuplicate = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return null;
    return checkDuplicate(searchQuery.trim());
  }, [searchQuery, checkDuplicate]);

  // Live duplicate detection for submission modal
  const modalDuplicate = useMemo(() => {
    if (!newBrandName.trim() || newBrandName.trim().length < 2) return null;
    return checkDuplicate(newBrandName.trim());
  }, [newBrandName, checkDuplicate]);

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.brandName.toLowerCase().includes(q);
          const matchesDesc = item.description?.toLowerCase().includes(q);
          const matchesCat = item.primaryCategory.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        // Category filter
        if (categoryFilter !== "all" && item.primaryCategory !== categoryFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "votes") {
          return b.voteCount - a.voteCount;
        }
        if (sortBy === "recent") {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortBy === "alphabetical") {
          return a.brandName.localeCompare(b.brandName);
        }
        return 0;
      });
  }, [requests, searchQuery, categoryFilter, statusFilter, sortBy]);

  const handleVoteClick = (requestId: string) => {
    toggleVote(requestId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const result = submitRequest({
      brandName: newBrandName,
      websiteUrl: newWebsiteUrl,
      primaryCategory: newCategory,
      description: newDescription,
    });

    if (result.success) {
      setFormFeedback({ type: "success", message: result.message });
      setTimeout(() => {
        setIsModalOpen(false);
        setNewBrandName("");
        setNewWebsiteUrl("");
        setNewDescription("");
        setFormFeedback(null);
      }, 1500);
    } else {
      setFormFeedback({ type: result.isLiveInCatalog ? "info" : "error", message: result.message });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4A3E]/10 dark:bg-[#2D4A3E]/30 text-[#2D4A3E] dark:text-[#52B788] text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5" />
            Community Ingestion Queue
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4] tracking-tight">
            Brand Request Voting Board
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#78716C] dark:text-[#A8A29E] max-w-2xl leading-relaxed">
            Vote for brands you want calibrated in WearID. When a brand hits {VOTE_GOAL} votes, our sizing team contacts them or audits official garment dimensions to publish verified size maps.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormFeedback(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2D4A3E] hover:bg-[#243B32] text-white font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Request a Brand
        </button>
      </div>

      {/* Live catalog match banner when searching */}
      {searchDuplicate?.isLiveInCatalog && searchDuplicate.liveBrand && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {searchDuplicate.liveBrand.name} is already live in WearID!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                We already have verified Layer 2 & 3 size charts mapped for this brand.
              </p>
            </div>
          </div>
          <Link
            href="/app/recommendations"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
          >
            Explore Sizes →
          </Link>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requested brands (e.g. Rare Rabbit, Beyoung, Urbanic)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] text-sm text-[#1C1917] dark:text-[#F5F5F4] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[#78716C] dark:text-[#A8A29E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] text-sm text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
            >
              <option value="votes">Most Upvoted</option>
              <option value="recent">Newest Submissions</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[#78716C] dark:text-[#A8A29E] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-[#2D4A3E] text-white"
                : "bg-[#F5F5F4] dark:bg-[#292524] text-[#78716C] dark:text-[#A8A29E] hover:bg-[#E7E5E4]"
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
            <button
              key={catKey}
              onClick={() => setCategoryFilter(catKey)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                categoryFilter === catKey
                  ? "bg-[#2D4A3E] text-white"
                  : "bg-[#F5F5F4] dark:bg-[#292524] text-[#78716C] dark:text-[#A8A29E] hover:bg-[#E7E5E4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Request Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#E7E5E4] dark:border-[#292524] bg-white/40 dark:bg-[#1C1917]/40 space-y-3">
          <Sparkles className="w-8 h-8 text-[#A8A29E] mx-auto" />
          <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
            No brand requests found
          </h3>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-sm mx-auto">
            {searchQuery
              ? `Be the first to request "${searchQuery}" for official size calibration!`
              : "Try switching category or status filters."}
          </p>
          <button
            onClick={() => {
              if (searchQuery) {
                setNewBrandName(searchQuery);
              }
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D4A3E] text-white text-xs font-medium hover:bg-[#243B32] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Request This Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((item) => {
            const hasVoted = !!userVotes[item.id];
            const statusStyle = STATUS_CONFIG[item.status];
            const progressPct = Math.min(100, Math.round((item.voteCount / VOTE_GOAL) * 100));

            return (
              <div
                key={item.id}
                className="group p-5 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] hover:border-[#2D4A3E]/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Badges & Brand Name */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      {statusStyle.label}
                    </span>
                    <span className="text-[11px] font-medium text-[#A8A29E] px-2 py-0.5 bg-[#F5F5F4] dark:bg-[#292524] rounded-md">
                      {CATEGORY_LABELS[item.primaryCategory] || item.primaryCategory}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4] group-hover:text-[#2D4A3E] dark:group-hover:text-[#52B788] transition-colors">
                        {item.brandName}
                      </h3>
                      {item.websiteUrl && (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A8A29E] hover:text-[#2D4A3E] transition-colors"
                          title="Visit Brand Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-[#78716C] dark:text-[#A8A29E] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Progress & Upvote Button */}
                <div className="pt-3 border-t border-[#F5F5F4] dark:border-[#292524] space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-[11px] text-[#A8A29E] mb-1">
                      <span>{item.voteCount} / {VOTE_GOAL} votes</span>
                      <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F4]">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E7E5E4] dark:bg-[#292524] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2D4A3E] to-[#52B788] transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleVoteClick(item.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        hasVoted
                          ? "bg-[#2D4A3E] text-white shadow-sm ring-2 ring-[#2D4A3E]/30"
                          : "bg-[#F5F5F4] dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#E7E5E4] dark:hover:bg-[#322E2B]"
                      }`}
                    >
                      <Vote className={`w-3.5 h-3.5 ${hasVoted ? "fill-current" : ""}`} />
                      {hasVoted ? "Upvoted" : "Upvote"}
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">
                        {item.voteCount}
                      </span>
                    </button>

                    <span className="text-[10px] text-[#A8A29E] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.submittedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Request a New Brand
                </h3>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                  Enter details to add this brand to the community voting queue.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Duplicate Warning */}
            {modalDuplicate?.isLiveInCatalog && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>{modalDuplicate.liveBrand?.name}</strong> is already live in WearID! You can explore verified sizing now.
                </span>
              </div>
            )}
            {modalDuplicate?.isAlreadyRequested && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>{modalDuplicate.existingRequest?.brandName}</strong> is already on the voting board with {modalDuplicate.existingRequest?.voteCount} votes. Submitting will add your upvote!
                </span>
              </div>
            )}

            {formFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  formFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : formFeedback.type === "info"
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {formFeedback.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4] mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Bluorng, Powerlook, Jaypore"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#121110] text-sm text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4] mb-1">
                  Brand Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  placeholder="https://brandwebsite.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#121110] text-sm text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4] mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#121110] text-sm text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1917] dark:text-[#F5F5F4] mb-1">
                  Why do you want this brand? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Love their oversized drops, but the shoulder seam sizing is inconsistent."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#121110] text-sm text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#78716C] dark:text-[#A8A29E] hover:bg-[#F5F5F4] dark:hover:bg-[#292524] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBrandName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2D4A3E] hover:bg-[#243B32] disabled:opacity-50 text-white font-medium text-xs transition-all"
                >
                  Submit & Upvote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
