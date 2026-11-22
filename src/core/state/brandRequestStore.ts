import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { PILOT_BRANDS, PilotBrand } from "../data/pilotBrands";

export const BrandRequestStatusEnum = z.enum([
  "open",
  "under_review",
  "sizing_chart_pending",
  "in_catalog",
]);
export type BrandRequestStatus = z.infer<typeof BrandRequestStatusEnum>;

export const BrandRequestCategoryEnum = z.enum([
  "streetwear",
  "oversized",
  "casual",
  "formal",
  "ethnic",
  "athleisure",
  "footwear",
  "innerwear",
]);
export type BrandRequestCategory = z.infer<typeof BrandRequestCategoryEnum>;

export const BrandRequestItemSchema = z.object({
  id: z.string(),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  slug: z.string(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  primaryCategory: BrandRequestCategoryEnum,
  description: z.string().optional(),
  voteCount: z.number().int().nonnegative(),
  status: BrandRequestStatusEnum,
  submittedAt: z.string(),
  submittedByProfileId: z.string().optional(),
});
export type BrandRequestItem = z.infer<typeof BrandRequestItemSchema>;

export const INITIAL_BRAND_REQUESTS: BrandRequestItem[] = [
  {
    id: "req_bonkers_corner",
    brandName: "Bonkers Corner",
    slug: "bonkers-corner",
    websiteUrl: "https://www.bonkerscorner.com",
    primaryCategory: "streetwear",
    description: "Indian pop culture, anime, and oversized streetwear fits with drop shoulders.",
    voteCount: 142,
    status: "under_review",
    submittedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "req_rare_rabbit",
    brandName: "Rare Rabbit",
    slug: "rare-rabbit",
    websiteUrl: "https://thehouseofrare.com",
    primaryCategory: "formal",
    description: "Premium contemporary menswear, tailored shirting and structured blazers.",
    voteCount: 118,
    status: "under_review",
    submittedAt: "2026-03-02T11:00:00Z",
  },
  {
    id: "req_souled_store",
    brandName: "The Souled Store",
    slug: "the-souled-store",
    websiteUrl: "https://www.thesouledstore.com",
    primaryCategory: "casual",
    description: "Official merchandise, supima tees, and relaxed everyday oversized fits.",
    voteCount: 97,
    status: "open",
    submittedAt: "2026-03-03T09:30:00Z",
  },
  {
    id: "req_beyoung",
    brandName: "Beyoung",
    slug: "beyoung",
    websiteUrl: "https://www.beyoung.in",
    primaryCategory: "casual",
    description: "Affordable everyday shirts, polo tees, and chino trousers.",
    voteCount: 84,
    status: "open",
    submittedAt: "2026-03-04T14:15:00Z",
  },
  {
    id: "req_bewakoof",
    brandName: "Bewakoof",
    slug: "bewakoof",
    websiteUrl: "https://www.bewakoof.com",
    primaryCategory: "streetwear",
    description: "Graphic casualwear, fleece cargo joggers, and boxy fits.",
    voteCount: 76,
    status: "open",
    submittedAt: "2026-03-05T08:00:00Z",
  },
  {
    id: "req_urbanic",
    brandName: "Urbanic",
    slug: "urbanic",
    websiteUrl: "https://www.urbanic.com",
    primaryCategory: "casual",
    description: "Contemporary women's dresses, knitwear, and European cut tops.",
    voteCount: 65,
    status: "open",
    submittedAt: "2026-03-06T12:00:00Z",
  },
];

export interface BrandRequestState {
  requests: BrandRequestItem[];
  userVotes: Record<string, boolean>; // requestId -> boolean
  searchQuery: string;
  categoryFilter: string;
  statusFilter: "all" | BrandRequestStatus;
  sortBy: "votes" | "recent" | "alphabetical";
  lastVoteTime: Record<string, number>;

  // Actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: "all" | BrandRequestStatus) => void;
  setSortBy: (sort: "votes" | "recent" | "alphabetical") => void;
  toggleVote: (requestId: string) => { success: boolean; newCount: number; hasVoted: boolean; error?: string };
  checkDuplicate: (brandName: string) => {
    isLiveInCatalog: boolean;
    liveBrand?: PilotBrand;
    isAlreadyRequested: boolean;
    existingRequest?: BrandRequestItem;
  };
  submitRequest: (payload: {
    brandName: string;
    websiteUrl?: string;
    primaryCategory: BrandRequestCategory;
    description?: string;
    profileId?: string;
  }) => {
    success: boolean;
    message: string;
    id?: string;
    existingBrandId?: string;
    existingRequestId?: string;
    isLiveInCatalog?: boolean;
    isAlreadyRequested?: boolean;
  };
  resetToDefault: () => void;
}

function normalizeBrandName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const useBrandRequestStore = create<BrandRequestState>()(
  persist(
    (set, get) => ({
      requests: INITIAL_BRAND_REQUESTS,
      userVotes: {},
      searchQuery: "",
      categoryFilter: "all",
      statusFilter: "all",
      sortBy: "votes",
      lastVoteTime: {},

      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setSortBy: (sortBy) => set({ sortBy }),

      checkDuplicate: (rawName) => {
        const normalized = normalizeBrandName(rawName);
        if (!normalized) {
          return { isLiveInCatalog: false, isAlreadyRequested: false };
        }

        // 1. Check PILOT_BRANDS
        const liveBrand = PILOT_BRANDS.find((b) => {
          const normBrand = normalizeBrandName(b.name);
          const normId = normalizeBrandName(b.id);
          return (
            normBrand === normalized ||
            normId === normalized ||
            normBrand.includes(normalized) ||
            normalized.includes(normBrand)
          );
        });

        if (liveBrand) {
          return {
            isLiveInCatalog: true,
            liveBrand,
            isAlreadyRequested: false,
          };
        }

        // 2. Check existing requests
        const existingRequest = get().requests.find((r) => {
          const normReq = normalizeBrandName(r.brandName);
          const normSlug = normalizeBrandName(r.slug);
          return normReq === normalized || normSlug === normalized;
        });

        if (existingRequest) {
          return {
            isLiveInCatalog: false,
            isAlreadyRequested: true,
            existingRequest,
          };
        }

        return { isLiveInCatalog: false, isAlreadyRequested: false };
      },

      toggleVote: (requestId) => {
        const now = Date.now();
        const lastTime = get().lastVoteTime[requestId] || 0;
        
        // Anti-duplicate rapid debounce guard (300ms)
        if (now - lastTime < 300) {
          const current = get().requests.find((r) => r.id === requestId);
          return {
            success: false,
            newCount: current ? current.voteCount : 0,
            hasVoted: !!get().userVotes[requestId],
            error: "Too fast. Please wait a moment.",
          };
        }

        const state = get();
        const request = state.requests.find((r) => r.id === requestId);
        if (!request) {
          return { success: false, newCount: 0, hasVoted: false, error: "Request not found" };
        }

        const currentlyVoted = !!state.userVotes[requestId];
        const nextVoted = !currentlyVoted;
        const newCount = nextVoted ? request.voteCount + 1 : Math.max(0, request.voteCount - 1);

        set({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, voteCount: newCount } : r
          ),
          userVotes: {
            ...state.userVotes,
            [requestId]: nextVoted,
          },
          lastVoteTime: {
            ...state.lastVoteTime,
            [requestId]: now,
          },
        });

        return {
          success: true,
          newCount,
          hasVoted: nextVoted,
        };
      },

      submitRequest: ({ brandName, websiteUrl = "", primaryCategory, description = "", profileId }) => {
        const trimmedName = brandName.trim();
        if (trimmedName.length < 2) {
          return {
            success: false,
            message: "Brand name must be at least 2 characters.",
          };
        }

        // Validate duplicates
        const dupCheck = get().checkDuplicate(trimmedName);

        if (dupCheck.isLiveInCatalog && dupCheck.liveBrand) {
          return {
            success: false,
            isLiveInCatalog: true,
            existingBrandId: dupCheck.liveBrand.id,
            message: `${dupCheck.liveBrand.name} is already live in WearID with verified size charts!`,
          };
        }

        if (dupCheck.isAlreadyRequested && dupCheck.existingRequest) {
          // If not yet voted, automatically upvote it
          const existingId = dupCheck.existingRequest.id;
          if (!get().userVotes[existingId]) {
            get().toggleVote(existingId);
          }
          return {
            success: true,
            isAlreadyRequested: true,
            existingRequestId: existingId,
            message: `${dupCheck.existingRequest.brandName} is already on the voting board! We've recorded your upvote.`,
          };
        }

        const slug = slugify(trimmedName);
        const newId = `req_${slug}_${Date.now().toString(36)}`;
        const newItem: BrandRequestItem = {
          id: newId,
          brandName: trimmedName,
          slug,
          websiteUrl: websiteUrl.trim(),
          primaryCategory,
          description: description.trim(),
          voteCount: 1, // Submitter automatically casts first vote
          status: "open",
          submittedAt: new Date().toISOString(),
          submittedByProfileId: profileId,
        };

        set((state) => ({
          requests: [newItem, ...state.requests],
          userVotes: {
            ...state.userVotes,
            [newId]: true,
          },
        }));

        return {
          success: true,
          id: newId,
          message: `Request for ${trimmedName} submitted successfully and upvoted!`,
        };
      },

      resetToDefault: () => {
        set({
          requests: INITIAL_BRAND_REQUESTS,
          userVotes: {},
          searchQuery: "",
          categoryFilter: "all",
          statusFilter: "all",
          sortBy: "votes",
          lastVoteTime: {},
        });
      },
    }),
    {
      name: "wearid_brand_request_store",
      partialize: (state) => ({
        requests: state.requests,
        userVotes: state.userVotes,
      }),
    }
  )
);
