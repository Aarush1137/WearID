import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PilotProduct } from "../data/pilotBrands";
import { ShoeDemographic } from "../data/shoeSizeMatrix";
import { ItemEvaluationResult, OutfitEvaluationResult } from "../sizing/outfitScoring";

export type OutfitOccasion =
  | "casual"
  | "smart_casual"
  | "streetwear"
  | "formal"
  | "athleisure";

export interface ShoeSelection {
  brandId: string;
  brandName: string;
  modelName: string;
  demographic?: ShoeDemographic;
}

export interface SavedOutfit {
  id: string;
  profileId: string;
  name: string;
  occasion: OutfitOccasion;
  top?: ItemEvaluationResult;
  bottom?: ItemEvaluationResult;
  shoes?: ItemEvaluationResult;
  combinedFitScore: number;
  combinedConfidence: "high" | "medium" | "low";
  harmonyNote: string;
  createdAt: string;
}

export interface OutfitStoreState {
  currentDraft: {
    top: PilotProduct | null;
    bottom: PilotProduct | null;
    shoes: ShoeSelection | null;
    occasion: OutfitOccasion;
  };
  savedOutfits: SavedOutfit[];

  // Actions
  selectTop: (product: PilotProduct | null) => void;
  selectBottom: (product: PilotProduct | null) => void;
  selectShoes: (shoes: ShoeSelection | null) => void;
  setOccasion: (occasion: OutfitOccasion) => void;
  saveCurrentOutfit: (
    name: string,
    profileId: string,
    evaluation: OutfitEvaluationResult
  ) => SavedOutfit | null;
  deleteSavedOutfit: (outfitId: string) => void;
  resetDraft: () => void;
}

const DEFAULT_DRAFT = {
  top: null,
  bottom: null,
  shoes: null,
  occasion: "casual" as OutfitOccasion,
};

export const useOutfitStore = create<OutfitStoreState>()(
  persist(
    (set, get) => ({
      currentDraft: DEFAULT_DRAFT,
      savedOutfits: [],

      selectTop: (top) =>
        set((state) => ({
          currentDraft: { ...state.currentDraft, top },
        })),

      selectBottom: (bottom) =>
        set((state) => ({
          currentDraft: { ...state.currentDraft, bottom },
        })),

      selectShoes: (shoes) =>
        set((state) => ({
          currentDraft: { ...state.currentDraft, shoes },
        })),

      setOccasion: (occasion) =>
        set((state) => ({
          currentDraft: { ...state.currentDraft, occasion },
        })),

      saveCurrentOutfit: (name, profileId, evaluation) => {
        const { currentDraft } = get();
        if (!currentDraft.top && !currentDraft.bottom && !currentDraft.shoes) {
          return null;
        }

        const newOutfit: SavedOutfit = {
          id: `outfit_${Date.now().toString(36)}`,
          profileId,
          name: name.trim() || `Outfit #${get().savedOutfits.length + 1}`,
          occasion: currentDraft.occasion,
          top: evaluation.top,
          bottom: evaluation.bottom,
          shoes: evaluation.shoes,
          combinedFitScore: evaluation.overallScore,
          combinedConfidence: evaluation.confidenceLabel,
          harmonyNote: evaluation.harmonyNote,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          savedOutfits: [newOutfit, ...state.savedOutfits],
        }));

        return newOutfit;
      },

      deleteSavedOutfit: (outfitId) =>
        set((state) => ({
          savedOutfits: state.savedOutfits.filter((o) => o.id !== outfitId),
        })),

      resetDraft: () =>
        set({
          currentDraft: DEFAULT_DRAFT,
        }),
    }),
    {
      name: "wearid_outfits_store",
      partialize: (state) => ({
        savedOutfits: state.savedOutfits,
      }),
    }
  )
);
