import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnatomicalProfile, FitType } from "../types";
import { DisplayUnit } from "../formatters";

export interface ReferenceGarmentItem {
  id: string;
  brandName: string;
  garmentName: string;
  sizeLabel: string;
  fitRating: number; // 1-5 stars
  fitFeel: "tight" | "perfect" | "loose";
  category: string;
  flatChestMm?: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  relation: "self" | "partner" | "parent" | "child" | "other";
  gender: "male" | "female" | "unisex";
  shoppingCategories?: ("mens" | "womens")[];
  measurements: AnatomicalProfile;
  preferences: Record<string, FitType>;
  referenceGarments: ReferenceGarmentItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  displayUnit: DisplayUnit;
  activeProfileId: string;
  profiles: UserProfile[];

  // Actions
  setDisplayUnit: (unit: DisplayUnit) => void;
  toggleDisplayUnit: () => void;
  setActiveProfileId: (id: string) => void;
  getActiveProfile: () => UserProfile;
  addProfile: (profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">) => string;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  updateMeasurements: (profileId: string, measurements: Partial<AnatomicalProfile>) => void;
  updatePreference: (profileId: string, category: string, fitType: FitType) => void;
  addReferenceGarment: (profileId: string, garment: Omit<ReferenceGarmentItem, "id">) => void;
  removeReferenceGarment: (profileId: string, garmentId: string) => void;
  resetToSampleData: () => void;
}

const DEFAULT_PROFILE_ID = "profile_self_primary";

const INITIAL_DEFAULT_PROFILE: UserProfile = {
  id: DEFAULT_PROFILE_ID,
  name: "",
  relation: "self",
  gender: "male",
  measurements: {
    profileId: DEFAULT_PROFILE_ID,
    chestMm: 980,          // 98 cm / 38.6"
    shoulderWidthMm: 450,  // 45 cm / 17.7"
    waistMm: 820,          // 82 cm / 32.3"
    hipsMm: 960,           // 96 cm / 37.8"
    heightMm: 1780,        // 178 cm / 5'10"
    inseamMm: 790,         // 79 cm / 31.1"
    footLengthMm: 270,     // 27 cm / UK 9
    neckMm: 390,           // 39 cm / 15.4"
    measurementMethod: {
      chestMm: "physical_tape",
      shoulderWidthMm: "calibrated_garment",
      waistMm: "physical_tape",
    },
    isCurrent: true,
    recordedAt: "2026-03-01T08:00:00Z",
  },
  preferences: {
    t_shirt: "regular",
    t_shirt_oversized: "oversized",
    shirt_casual: "relaxed",
    shirt_formal: "regular",
    trousers_chinos: "regular",
    jeans: "regular",
  },
  referenceGarments: [
    {
      id: "ref_1",
      brandName: "Uniqlo India",
      garmentName: "Supima Cotton Crew",
      sizeLabel: "M",
      fitRating: 5,
      fitFeel: "perfect",
      category: "t_shirt",
      flatChestMm: 515,
      notes: "Ideal torso length and shoulder seam aligns exactly with acromion.",
    },
    {
      id: "ref_2",
      brandName: "Levi's India",
      garmentName: "501 Original Fit Jeans",
      sizeLabel: "32x32",
      fitRating: 5,
      fitFeel: "perfect",
      category: "jeans",
      notes: "Waist sits right at natural waist with zero belt bunching.",
    },
  ],
  createdAt: "2026-03-01T08:00:00Z",
  updatedAt: "2026-03-01T08:00:00Z",
};

const SECONDARY_PROFILE: UserProfile = {
  id: "profile_partner_ananya",
  name: "Ananya (Partner)",
  relation: "partner",
  gender: "female",
  measurements: {
    profileId: "profile_partner_ananya",
    chestMm: 860,         // 86 cm
    bustMm: 870,
    waistMm: 680,         // 68 cm
    hipsMm: 930,          // 93 cm
    shoulderWidthMm: 390, // 39 cm
    heightMm: 1650,       // 165 cm
    inseamMm: 740,        // 74 cm
    measurementMethod: { chestMm: "physical_tape" },
    isCurrent: true,
    recordedAt: "2026-03-01T08:30:00Z",
  },
  preferences: {
    t_shirt: "relaxed",
    t_shirt_oversized: "oversized",
    shirt_casual: "relaxed",
  },
  referenceGarments: [],
  createdAt: "2026-03-01T08:30:00Z",
  updatedAt: "2026-03-01T08:30:00Z",
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      displayUnit: "cm",
      activeProfileId: DEFAULT_PROFILE_ID,
      profiles: [INITIAL_DEFAULT_PROFILE, SECONDARY_PROFILE],

      setDisplayUnit: (unit: DisplayUnit) => set({ displayUnit: unit }),

      toggleDisplayUnit: () =>
        set((state) => ({
          displayUnit: state.displayUnit === "cm" ? "in" : "cm",
        })),

      setActiveProfileId: (id: string) => set({ activeProfileId: id }),

      getActiveProfile: () => {
        const state = get();
        const active = state.profiles.find((p) => p.id === state.activeProfileId);
        return active || state.profiles[0] || INITIAL_DEFAULT_PROFILE;
      },

      addProfile: (profileData) => {
        const newId = `profile_${Date.now()}`;
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          ...profileData,
          id: newId,
          createdAt: now,
          updatedAt: now,
          measurements: {
            ...profileData.measurements,
            profileId: newId,
            isCurrent: true,
            recordedAt: now,
          },
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          activeProfileId: newId,
        }));

        return newId;
      },

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      updateMeasurements: (profileId, measurementUpdates) =>
        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            return {
              ...p,
              measurements: {
                ...p.measurements,
                ...measurementUpdates,
                isCurrent: true,
                recordedAt: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updatePreference: (profileId, category, fitType) =>
        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            return {
              ...p,
              preferences: {
                ...p.preferences,
                [category]: fitType,
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      addReferenceGarment: (profileId, garmentData) => {
        const refId = `ref_${Date.now()}`;
        const newGarment: ReferenceGarmentItem = {
          ...garmentData,
          id: refId,
        };

        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            return {
              ...p,
              referenceGarments: [...p.referenceGarments, newGarment],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeReferenceGarment: (profileId, garmentId) =>
        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            return {
              ...p,
              referenceGarments: p.referenceGarments.filter((g) => g.id !== garmentId),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      resetToSampleData: () =>
        set({
          displayUnit: "cm",
          activeProfileId: DEFAULT_PROFILE_ID,
          profiles: [INITIAL_DEFAULT_PROFILE, SECONDARY_PROFILE],
        }),
    }),
    {
      name: "wearid-profile-storage-v1",
    }
  )
);
