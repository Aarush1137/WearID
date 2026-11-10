/**
 * Universal Footwear Size Conversion & Cross-Brand Equivalence Matrix
 * All internal matching is anchored on canonical foot length in millimeters (mm).
 * Adheres strictly to AGENTS.md Invariant #4 (Canonical Units: Millimeters) and Invariant #8 (Explainable Recommendations).
 */

export type ShoeDemographic = "men" | "women" | "kids";

export interface ShoeSizeRecord {
  uk: string;
  us: string;
  eu: string;
  cm: number;       // e.g. 26.5
  inches: number;   // e.g. 10.4
  footMinMm: number; // lower bound of recommended foot length in mm
  footMaxMm: number; // upper bound of recommended foot length in mm
}

export interface BrandFootwearProfile {
  brandId: string;
  brandName: string;
  country: string;
  lastOrigin: string; // e.g. "US Athletic Last", "German Continental Last (Parisian Point)", "Indian Standard BIS Last"
  fitNote: string;
  sizes: Record<ShoeDemographic, ShoeSizeRecord[]>;
}

export const SHOE_BRANDS: BrandFootwearProfile[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. NIKE
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "nike",
    brandName: "Nike",
    country: "USA",
    lastOrigin: "US Athletic Performance Last (True to standard US size, snug midfoot)",
    fitNote: "Nike athletic shoes run true-to-length in US sizing. UK sizing is strictly 1 full size below US Men (US 9 = UK 8). Toe box is tapered for lockdown.",
    sizes: {
      men: [
        { uk: "6", us: "7", eu: "40", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "6.5", us: "7.5", eu: "40.5", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7", us: "8", eu: "41", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "7.5", us: "8.5", eu: "42", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
        { uk: "8", us: "9", eu: "42.5", cm: 27.0, inches: 10.6, footMinMm: 266, footMaxMm: 270 },
        { uk: "8.5", us: "9.5", eu: "43", cm: 27.5, inches: 10.8, footMinMm: 271, footMaxMm: 275 },
        { uk: "9", us: "10", eu: "44", cm: 28.0, inches: 11.0, footMinMm: 276, footMaxMm: 280 },
        { uk: "9.5", us: "10.5", eu: "44.5", cm: 28.5, inches: 11.2, footMinMm: 281, footMaxMm: 285 },
        { uk: "10", us: "11", eu: "45", cm: 29.0, inches: 11.4, footMinMm: 286, footMaxMm: 290 },
        { uk: "10.5", us: "11.5", eu: "45.5", cm: 29.5, inches: 11.6, footMinMm: 291, footMaxMm: 295 },
        { uk: "11", us: "12", eu: "46", cm: 30.0, inches: 11.8, footMinMm: 296, footMaxMm: 300 },
        { uk: "12", us: "13", eu: "47.5", cm: 31.0, inches: 12.2, footMinMm: 301, footMaxMm: 310 },
      ],
      women: [
        { uk: "2.5", us: "5", eu: "35.5", cm: 22.0, inches: 8.7, footMinMm: 216, footMaxMm: 220 },
        { uk: "3", us: "5.5", eu: "36", cm: 22.5, inches: 8.9, footMinMm: 221, footMaxMm: 225 },
        { uk: "3.5", us: "6", eu: "36.5", cm: 23.0, inches: 9.1, footMinMm: 226, footMaxMm: 230 },
        { uk: "4", us: "6.5", eu: "37.5", cm: 23.5, inches: 9.3, footMinMm: 231, footMaxMm: 235 },
        { uk: "4.5", us: "7", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 236, footMaxMm: 240 },
        { uk: "5", us: "7.5", eu: "38.5", cm: 24.5, inches: 9.6, footMinMm: 241, footMaxMm: 245 },
        { uk: "5.5", us: "8", eu: "39", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "6", us: "8.5", eu: "40", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "6.5", us: "9", eu: "40.5", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "7", us: "9.5", eu: "41", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
        { uk: "7.5", us: "10", eu: "42", cm: 27.0, inches: 10.6, footMinMm: 266, footMaxMm: 270 },
        { uk: "8", us: "10.5", eu: "42.5", cm: 27.5, inches: 10.8, footMinMm: 271, footMaxMm: 275 },
      ],
      kids: [
        { uk: "0K", us: "1C", eu: "16", cm: 8.0, inches: 3.1, footMinMm: 75, footMaxMm: 80 },
        { uk: "1K", us: "2C", eu: "17", cm: 9.0, inches: 3.5, footMinMm: 81, footMaxMm: 90 },
        { uk: "2K", us: "3C", eu: "18", cm: 10.0, inches: 3.9, footMinMm: 91, footMaxMm: 100 },
        { uk: "3K", us: "4C", eu: "19", cm: 11.0, inches: 4.3, footMinMm: 101, footMaxMm: 110 },
        { uk: "4K", us: "5C", eu: "20", cm: 12.0, inches: 4.7, footMinMm: 111, footMaxMm: 120 },
        { uk: "5K", us: "6C", eu: "21.5", cm: 13.0, inches: 5.1, footMinMm: 121, footMaxMm: 130 },
        { uk: "6K", us: "7C", eu: "23", cm: 14.0, inches: 5.5, footMinMm: 131, footMaxMm: 140 },
        { uk: "7K", us: "8C", eu: "24", cm: 15.0, inches: 5.9, footMinMm: 141, footMaxMm: 150 },
        { uk: "8K", us: "9C", eu: "25.5", cm: 15.5, inches: 6.1, footMinMm: 151, footMaxMm: 155 },
        { uk: "9K", us: "10C", eu: "27", cm: 16.5, inches: 6.5, footMinMm: 156, footMaxMm: 165 },
        { uk: "10K", us: "10.5C", eu: "28", cm: 17.0, inches: 6.7, footMinMm: 166, footMaxMm: 170 },
        { uk: "11K", us: "11.5C", eu: "29", cm: 17.8, inches: 7.0, footMinMm: 171, footMaxMm: 178 },
        { uk: "12K", us: "12.5C", eu: "31", cm: 18.7, inches: 7.4, footMinMm: 179, footMaxMm: 187 },
        { uk: "13K", us: "13.5C", eu: "32", cm: 19.5, inches: 7.7, footMinMm: 188, footMaxMm: 195 },
        { uk: "1", us: "1.5Y", eu: "33", cm: 20.3, inches: 8.0, footMinMm: 196, footMaxMm: 203 },
        { uk: "2", us: "2.5Y", eu: "34.5", cm: 21.2, inches: 8.3, footMinMm: 204, footMaxMm: 212 },
        { uk: "3", us: "3.5Y", eu: "35.5", cm: 22.0, inches: 8.7, footMinMm: 213, footMaxMm: 220 },
        { uk: "4", us: "4.5Y", eu: "37", cm: 23.0, inches: 9.1, footMinMm: 221, footMaxMm: 230 },
        { uk: "5", us: "5.5Y", eu: "38", cm: 23.8, inches: 9.4, footMinMm: 231, footMaxMm: 238 },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ADIDAS
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "adidas",
    brandName: "Adidas",
    country: "Germany",
    lastOrigin: "Continental European Last (Parisian points 2/3 cm / 6.67mm step)",
    fitNote: "Adidas grades UK sizing in 0.5 size intervals that differ from US brands. For instance, UK 8 in Adidas corresponds to 26.5 cm, whereas in Nike UK 8 corresponds to 27.0 cm. Adidas shoes commonly feel a half-size smaller if comparing raw UK numbers.",
    sizes: {
      men: [
        { uk: "6", us: "6.5", eu: "39 1/3", cm: 24.5, inches: 9.6, footMinMm: 240, footMaxMm: 245 },
        { uk: "6.5", us: "7", eu: "40", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "7", us: "7.5", eu: "40 2/3", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7.5", us: "8", eu: "41 1/3", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "8", us: "8.5", eu: "42", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
        { uk: "8.5", us: "9", eu: "42 2/3", cm: 27.0, inches: 10.6, footMinMm: 266, footMaxMm: 270 },
        { uk: "9", us: "9.5", eu: "43 1/3", cm: 27.5, inches: 10.8, footMinMm: 271, footMaxMm: 275 },
        { uk: "9.5", us: "10", eu: "44", cm: 28.0, inches: 11.0, footMinMm: 276, footMaxMm: 280 },
        { uk: "10", us: "10.5", eu: "44 2/3", cm: 28.5, inches: 11.2, footMinMm: 281, footMaxMm: 285 },
        { uk: "10.5", us: "11", eu: "45 1/3", cm: 29.0, inches: 11.4, footMinMm: 286, footMaxMm: 290 },
        { uk: "11", us: "11.5", eu: "46", cm: 29.5, inches: 11.6, footMinMm: 291, footMaxMm: 295 },
        { uk: "11.5", us: "12", eu: "46 2/3", cm: 30.0, inches: 11.8, footMinMm: 296, footMaxMm: 300 },
        { uk: "12", us: "12.5", eu: "47 1/3", cm: 30.5, inches: 12.0, footMinMm: 301, footMaxMm: 305 },
      ],
      women: [
        { uk: "3.5", us: "5", eu: "36", cm: 22.0, inches: 8.7, footMinMm: 216, footMaxMm: 220 },
        { uk: "4", us: "5.5", eu: "36 2/3", cm: 22.5, inches: 8.9, footMinMm: 221, footMaxMm: 225 },
        { uk: "4.5", us: "6", eu: "37 1/3", cm: 23.0, inches: 9.1, footMinMm: 226, footMaxMm: 230 },
        { uk: "5", us: "6.5", eu: "38", cm: 23.5, inches: 9.3, footMinMm: 231, footMaxMm: 235 },
        { uk: "5.5", us: "7", eu: "38 2/3", cm: 24.0, inches: 9.4, footMinMm: 236, footMaxMm: 240 },
        { uk: "6", us: "7.5", eu: "39 1/3", cm: 24.5, inches: 9.6, footMinMm: 241, footMaxMm: 245 },
        { uk: "6.5", us: "8", eu: "40", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "7", us: "8.5", eu: "40 2/3", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7.5", us: "9", eu: "41 1/3", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "8", us: "9.5", eu: "42", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
      ],
      kids: [
        { uk: "0K", us: "1K", eu: "16", cm: 8.0, inches: 3.1, footMinMm: 75, footMaxMm: 80 },
        { uk: "1K", us: "2K", eu: "17", cm: 9.0, inches: 3.5, footMinMm: 81, footMaxMm: 90 },
        { uk: "2K", us: "3K", eu: "18", cm: 10.0, inches: 3.9, footMinMm: 91, footMaxMm: 100 },
        { uk: "3K", us: "4K", eu: "19", cm: 11.0, inches: 4.3, footMinMm: 101, footMaxMm: 110 },
        { uk: "4K", us: "5K", eu: "20", cm: 12.0, inches: 4.7, footMinMm: 111, footMaxMm: 120 },
        { uk: "5K", us: "5.5K", eu: "21", cm: 12.8, inches: 5.0, footMinMm: 121, footMaxMm: 128 },
        { uk: "6K", us: "6.5K", eu: "23", cm: 13.8, inches: 5.4, footMinMm: 129, footMaxMm: 138 },
        { uk: "7K", us: "7.5K", eu: "24", cm: 14.5, inches: 5.7, footMinMm: 139, footMaxMm: 145 },
        { uk: "8K", us: "8.5K", eu: "25.5", cm: 15.3, inches: 6.0, footMinMm: 146, footMaxMm: 153 },
        { uk: "9K", us: "9.5K", eu: "27", cm: 16.1, inches: 6.3, footMinMm: 154, footMaxMm: 161 },
        { uk: "10K", us: "10.5K", eu: "28", cm: 17.0, inches: 6.7, footMinMm: 162, footMaxMm: 170 },
        { uk: "11K", us: "11.5K", eu: "29", cm: 17.8, inches: 7.0, footMinMm: 171, footMaxMm: 178 },
        { uk: "12K", us: "12.5K", eu: "30.5", cm: 18.5, inches: 7.3, footMinMm: 179, footMaxMm: 185 },
        { uk: "13K", us: "13.5K", eu: "32", cm: 19.3, inches: 7.6, footMinMm: 186, footMaxMm: 193 },
        { uk: "1", us: "1.5", eu: "33", cm: 20.0, inches: 7.9, footMinMm: 194, footMaxMm: 200 },
        { uk: "2", us: "2.5", eu: "34", cm: 20.8, inches: 8.2, footMinMm: 201, footMaxMm: 208 },
        { uk: "3", us: "3.5", eu: "35.5", cm: 21.6, inches: 8.5, footMinMm: 209, footMaxMm: 216 },
        { uk: "4", us: "4.5", eu: "36.5", cm: 22.5, inches: 8.9, footMinMm: 217, footMaxMm: 225 },
        { uk: "5", us: "5.5", eu: "38", cm: 23.3, inches: 9.2, footMinMm: 226, footMaxMm: 233 },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PUMA
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "puma",
    brandName: "Puma",
    country: "Germany",
    lastOrigin: "Global Athletic Speed Last",
    fitNote: "Puma shoes feature a slightly narrower, contoured heel fit with a standard athletic forefoot. Sizing aligns closely with US standard lengths.",
    sizes: {
      men: [
        { uk: "6", us: "7", eu: "39", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "6.5", us: "7.5", eu: "40", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7", us: "8", eu: "40.5", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "7.5", us: "8.5", eu: "41", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
        { uk: "8", us: "9", eu: "42", cm: 27.0, inches: 10.6, footMinMm: 266, footMaxMm: 270 },
        { uk: "8.5", us: "9.5", eu: "42.5", cm: 27.5, inches: 10.8, footMinMm: 271, footMaxMm: 275 },
        { uk: "9", us: "10", eu: "43", cm: 28.0, inches: 11.0, footMinMm: 276, footMaxMm: 280 },
        { uk: "9.5", us: "10.5", eu: "44", cm: 28.5, inches: 11.2, footMinMm: 281, footMaxMm: 285 },
        { uk: "10", us: "11", eu: "44.5", cm: 29.0, inches: 11.4, footMinMm: 286, footMaxMm: 290 },
        { uk: "10.5", us: "11.5", eu: "45", cm: 29.5, inches: 11.6, footMinMm: 291, footMaxMm: 295 },
        { uk: "11", us: "12", eu: "46", cm: 30.0, inches: 11.8, footMinMm: 296, footMaxMm: 300 },
      ],
      women: [
        { uk: "3", us: "5.5", eu: "35.5", cm: 22.0, inches: 8.7, footMinMm: 216, footMaxMm: 220 },
        { uk: "3.5", us: "6", eu: "36", cm: 22.5, inches: 8.9, footMinMm: 221, footMaxMm: 225 },
        { uk: "4", us: "6.5", eu: "37", cm: 23.0, inches: 9.1, footMinMm: 226, footMaxMm: 230 },
        { uk: "4.5", us: "7", eu: "37.5", cm: 23.5, inches: 9.3, footMinMm: 231, footMaxMm: 235 },
        { uk: "5", us: "7.5", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 236, footMaxMm: 240 },
        { uk: "5.5", us: "8", eu: "38.5", cm: 24.5, inches: 9.6, footMinMm: 241, footMaxMm: 245 },
        { uk: "6", us: "8.5", eu: "39", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "6.5", us: "9", eu: "40", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7", us: "9.5", eu: "40.5", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
        { uk: "7.5", us: "10", eu: "41", cm: 26.5, inches: 10.4, footMinMm: 261, footMaxMm: 265 },
      ],
      kids: [
        { uk: "0K", us: "1C", eu: "16", cm: 8.0, inches: 3.1, footMinMm: 75, footMaxMm: 80 },
        { uk: "1K", us: "2C", eu: "17", cm: 9.0, inches: 3.5, footMinMm: 81, footMaxMm: 90 },
        { uk: "2K", us: "3C", eu: "18", cm: 10.0, inches: 3.9, footMinMm: 91, footMaxMm: 100 },
        { uk: "3K", us: "4C", eu: "19", cm: 11.0, inches: 4.3, footMinMm: 101, footMaxMm: 110 },
        { uk: "4K", us: "5C", eu: "20", cm: 12.0, inches: 4.7, footMinMm: 111, footMaxMm: 120 },
        { uk: "5K", us: "6C", eu: "22", cm: 13.0, inches: 5.1, footMinMm: 121, footMaxMm: 130 },
        { uk: "6K", us: "7C", eu: "23", cm: 14.0, inches: 5.5, footMinMm: 131, footMaxMm: 140 },
        { uk: "7K", us: "8C", eu: "24", cm: 15.0, inches: 5.9, footMinMm: 141, footMaxMm: 150 },
        { uk: "8K", us: "9C", eu: "25.5", cm: 15.5, inches: 6.1, footMinMm: 151, footMaxMm: 155 },
        { uk: "9K", us: "10C", eu: "27", cm: 16.5, inches: 6.5, footMinMm: 156, footMaxMm: 165 },
        { uk: "10K", us: "11C", eu: "28", cm: 17.0, inches: 6.7, footMinMm: 166, footMaxMm: 170 },
        { uk: "11K", us: "12C", eu: "30", cm: 18.0, inches: 7.1, footMinMm: 171, footMaxMm: 180 },
        { uk: "12K", us: "13C", eu: "31", cm: 18.5, inches: 7.3, footMinMm: 181, footMaxMm: 185 },
        { uk: "13K", us: "1Y", eu: "32.5", cm: 19.5, inches: 7.7, footMinMm: 186, footMaxMm: 195 },
        { uk: "1", us: "2Y", eu: "33.5", cm: 20.5, inches: 8.1, footMinMm: 196, footMaxMm: 205 },
        { uk: "2", us: "3Y", eu: "35", cm: 21.5, inches: 8.5, footMinMm: 206, footMaxMm: 215 },
        { uk: "3", us: "4Y", eu: "36", cm: 22.5, inches: 8.9, footMinMm: 216, footMaxMm: 225 },
        { uk: "4", us: "5Y", eu: "37", cm: 23.0, inches: 9.1, footMinMm: 226, footMaxMm: 230 },
        { uk: "5", us: "6Y", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 231, footMaxMm: 240 },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BATA INDIA (Indian Standard BIS)
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "bata",
    brandName: "Bata India",
    country: "India",
    lastOrigin: "Indian BIS Standard Last (IS 1638:1969) with wider G/H ball girth",
    fitNote: "Indian Standard sizing matches UK size numbers 1:1, but lasts are crafted wider across the metatarsal head (ball of foot) to accommodate typical Indian foot morphology without lateral pinch.",
    sizes: {
      men: [
        { uk: "5", us: "6", eu: "38", cm: 24.2, inches: 9.5, footMinMm: 235, footMaxMm: 242 },
        { uk: "6", us: "7", eu: "39", cm: 25.0, inches: 9.8, footMinMm: 243, footMaxMm: 250 },
        { uk: "7", us: "8", eu: "41", cm: 25.8, inches: 10.2, footMinMm: 251, footMaxMm: 258 },
        { uk: "8", us: "9", eu: "42", cm: 26.6, inches: 10.5, footMinMm: 259, footMaxMm: 266 },
        { uk: "9", us: "10", eu: "43", cm: 27.4, inches: 10.8, footMinMm: 267, footMaxMm: 274 },
        { uk: "10", us: "11", eu: "44", cm: 28.2, inches: 11.1, footMinMm: 275, footMaxMm: 282 },
        { uk: "11", us: "12", eu: "45", cm: 29.0, inches: 11.4, footMinMm: 283, footMaxMm: 290 },
      ],
      women: [
        { uk: "3", us: "5", eu: "36", cm: 22.4, inches: 8.8, footMinMm: 217, footMaxMm: 224 },
        { uk: "4", us: "6", eu: "37", cm: 23.2, inches: 9.1, footMinMm: 225, footMaxMm: 232 },
        { uk: "5", us: "7", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 233, footMaxMm: 240 },
        { uk: "6", us: "8", eu: "39", cm: 24.8, inches: 9.8, footMinMm: 241, footMaxMm: 248 },
        { uk: "7", us: "9", eu: "40", cm: 25.6, inches: 10.1, footMinMm: 249, footMaxMm: 256 },
        { uk: "8", us: "10", eu: "41", cm: 26.4, inches: 10.4, footMinMm: 257, footMaxMm: 264 },
      ],
      kids: [
        { uk: "0K", us: "1C", eu: "16", cm: 8.5, inches: 3.3, footMinMm: 78, footMaxMm: 85 },
        { uk: "1K", us: "2C", eu: "17", cm: 9.3, inches: 3.7, footMinMm: 86, footMaxMm: 93 },
        { uk: "2K", us: "3C", eu: "18", cm: 10.2, inches: 4.0, footMinMm: 94, footMaxMm: 102 },
        { uk: "3K", us: "4C", eu: "19", cm: 11.0, inches: 4.3, footMinMm: 103, footMaxMm: 110 },
        { uk: "4K", us: "5C", eu: "20", cm: 11.8, inches: 4.6, footMinMm: 111, footMaxMm: 118 },
        { uk: "5K", us: "6C", eu: "21.5", cm: 12.7, inches: 5.0, footMinMm: 119, footMaxMm: 127 },
        { uk: "6K", us: "7C", eu: "23", cm: 13.5, inches: 5.3, footMinMm: 128, footMaxMm: 135 },
        { uk: "7K", us: "8C", eu: "24", cm: 14.4, inches: 5.7, footMinMm: 136, footMaxMm: 144 },
        { uk: "8K", us: "9C", eu: "25", cm: 15.2, inches: 6.0, footMinMm: 145, footMaxMm: 152 },
        { uk: "9K", us: "10C", eu: "26.5", cm: 16.1, inches: 6.3, footMinMm: 153, footMaxMm: 161 },
        { uk: "10K", us: "11C", eu: "28", cm: 16.9, inches: 6.7, footMinMm: 162, footMaxMm: 169 },
        { uk: "11K", us: "12C", eu: "29.5", cm: 17.8, inches: 7.0, footMinMm: 170, footMaxMm: 178 },
        { uk: "12K", us: "13C", eu: "31", cm: 18.6, inches: 7.3, footMinMm: 179, footMaxMm: 186 },
        { uk: "13K", us: "1Y", eu: "32", cm: 19.5, inches: 7.7, footMinMm: 187, footMaxMm: 195 },
        { uk: "1", us: "2Y", eu: "33", cm: 20.3, inches: 8.0, footMinMm: 196, footMaxMm: 203 },
        { uk: "2", us: "3Y", eu: "34.5", cm: 21.2, inches: 8.3, footMinMm: 204, footMaxMm: 212 },
        { uk: "3", us: "4Y", eu: "35.5", cm: 22.0, inches: 8.7, footMinMm: 213, footMaxMm: 220 },
        { uk: "4", us: "5Y", eu: "37", cm: 22.8, inches: 9.0, footMinMm: 221, footMaxMm: 228 },
        { uk: "5", us: "6Y", eu: "38", cm: 23.7, inches: 9.3, footMinMm: 229, footMaxMm: 237 },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. RED TAPE
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "red_tape",
    brandName: "Red Tape",
    country: "India",
    lastOrigin: "Contemporary Lifestyle Sneaker Last",
    fitNote: "Red Tape footwear employs generous interior foam padding. Standard Indian UK sizing fits true to size, with roomy toe clearance for walking comfort.",
    sizes: {
      men: [
        { uk: "6", us: "7", eu: "40", cm: 25.0, inches: 9.8, footMinMm: 242, footMaxMm: 250 },
        { uk: "7", us: "8", eu: "41", cm: 25.8, inches: 10.2, footMinMm: 251, footMaxMm: 258 },
        { uk: "8", us: "9", eu: "42", cm: 26.6, inches: 10.5, footMinMm: 259, footMaxMm: 266 },
        { uk: "9", us: "10", eu: "43", cm: 27.4, inches: 10.8, footMinMm: 267, footMaxMm: 274 },
        { uk: "10", us: "11", eu: "44", cm: 28.2, inches: 11.1, footMinMm: 275, footMaxMm: 282 },
      ],
      women: [
        { uk: "4", us: "6", eu: "37", cm: 23.2, inches: 9.1, footMinMm: 225, footMaxMm: 232 },
        { uk: "5", us: "7", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 233, footMaxMm: 240 },
        { uk: "6", us: "8", eu: "39", cm: 24.8, inches: 9.8, footMinMm: 241, footMaxMm: 248 },
        { uk: "7", us: "9", eu: "40", cm: 25.6, inches: 10.1, footMinMm: 249, footMaxMm: 256 },
      ],
      kids: [
        { uk: "10K", us: "11C", eu: "28", cm: 17.0, inches: 6.7, footMinMm: 163, footMaxMm: 170 },
        { uk: "11K", us: "12C", eu: "29", cm: 17.8, inches: 7.0, footMinMm: 171, footMaxMm: 178 },
        { uk: "12K", us: "13C", eu: "31", cm: 18.6, inches: 7.3, footMinMm: 179, footMaxMm: 186 },
        { uk: "13K", us: "1Y", eu: "32", cm: 19.5, inches: 7.7, footMinMm: 187, footMaxMm: 195 },
        { uk: "1", us: "2Y", eu: "33", cm: 20.3, inches: 8.0, footMinMm: 196, footMaxMm: 203 },
        { uk: "2", us: "3Y", eu: "34", cm: 21.2, inches: 8.3, footMinMm: 204, footMaxMm: 212 },
        { uk: "3", us: "4Y", eu: "35", cm: 22.0, inches: 8.7, footMinMm: 213, footMaxMm: 220 },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CLARKS
  // ─────────────────────────────────────────────────────────────────────────
  {
    brandId: "clarks",
    brandName: "Clarks",
    country: "UK",
    lastOrigin: "British Heritage Shoemaker Last (Traditional F-Fitting)",
    fitNote: "Clarks traditional leather shoes adhere to the historical English barleycorn scale (1/3 inch). They run approximately 0.5 size snugger than modern cushioned running sneakers. For broad feet, sizing up 0.5 UK is recommended.",
    sizes: {
      men: [
        { uk: "6", us: "7", eu: "39.5", cm: 24.6, inches: 9.7, footMinMm: 240, footMaxMm: 246 },
        { uk: "6.5", us: "7.5", eu: "40", cm: 25.0, inches: 9.8, footMinMm: 247, footMaxMm: 250 },
        { uk: "7", us: "8", eu: "41", cm: 25.4, inches: 10.0, footMinMm: 251, footMaxMm: 254 },
        { uk: "7.5", us: "8.5", eu: "41.5", cm: 25.8, inches: 10.2, footMinMm: 255, footMaxMm: 258 },
        { uk: "8", us: "9", eu: "42", cm: 26.3, inches: 10.4, footMinMm: 259, footMaxMm: 263 },
        { uk: "8.5", us: "9.5", eu: "42.5", cm: 26.7, inches: 10.5, footMinMm: 264, footMaxMm: 267 },
        { uk: "9", us: "10", eu: "43", cm: 27.1, inches: 10.7, footMinMm: 268, footMaxMm: 271 },
        { uk: "9.5", us: "10.5", eu: "44", cm: 27.6, inches: 10.9, footMinMm: 272, footMaxMm: 276 },
        { uk: "10", us: "11", eu: "44.5", cm: 28.0, inches: 11.0, footMinMm: 277, footMaxMm: 280 },
        { uk: "10.5", us: "11.5", eu: "45", cm: 28.4, inches: 11.2, footMinMm: 281, footMaxMm: 284 },
        { uk: "11", us: "12", eu: "46", cm: 28.8, inches: 11.3, footMinMm: 285, footMaxMm: 288 },
      ],
      women: [
        { uk: "3", us: "5", eu: "35.5", cm: 22.0, inches: 8.7, footMinMm: 215, footMaxMm: 220 },
        { uk: "3.5", us: "5.5", eu: "36", cm: 22.5, inches: 8.9, footMinMm: 221, footMaxMm: 225 },
        { uk: "4", us: "6", eu: "37", cm: 23.0, inches: 9.1, footMinMm: 226, footMaxMm: 230 },
        { uk: "4.5", us: "6.5", eu: "37.5", cm: 23.5, inches: 9.3, footMinMm: 231, footMaxMm: 235 },
        { uk: "5", us: "7", eu: "38", cm: 24.0, inches: 9.4, footMinMm: 236, footMaxMm: 240 },
        { uk: "5.5", us: "7.5", eu: "39", cm: 24.5, inches: 9.6, footMinMm: 241, footMaxMm: 245 },
        { uk: "6", us: "8", eu: "39.5", cm: 25.0, inches: 9.8, footMinMm: 246, footMaxMm: 250 },
        { uk: "6.5", us: "8.5", eu: "40", cm: 25.5, inches: 10.0, footMinMm: 251, footMaxMm: 255 },
        { uk: "7", us: "9", eu: "41", cm: 26.0, inches: 10.2, footMinMm: 256, footMaxMm: 260 },
      ],
      kids: [
        { uk: "0K", us: "0.5", eu: "15", cm: 7.8, inches: 3.1, footMinMm: 72, footMaxMm: 78 },
        { uk: "1K", us: "1.5", eu: "16", cm: 8.7, inches: 3.4, footMinMm: 79, footMaxMm: 87 },
        { uk: "2K", us: "2.5", eu: "17.5", cm: 9.6, inches: 3.8, footMinMm: 88, footMaxMm: 96 },
        { uk: "3K", us: "3.5", eu: "19", cm: 10.5, inches: 4.1, footMinMm: 97, footMaxMm: 105 },
        { uk: "4K", us: "4.5", eu: "20", cm: 11.3, inches: 4.4, footMinMm: 106, footMaxMm: 113 },
        { uk: "5K", us: "5.5", eu: "21.5", cm: 12.2, inches: 4.8, footMinMm: 114, footMaxMm: 122 },
        { uk: "6K", us: "6.5", eu: "23", cm: 13.0, inches: 5.1, footMinMm: 123, footMaxMm: 130 },
        { uk: "7K", us: "7.5", eu: "24", cm: 13.9, inches: 5.5, footMinMm: 131, footMaxMm: 139 },
        { uk: "8K", us: "8.5", eu: "25.5", cm: 14.7, inches: 5.8, footMinMm: 140, footMaxMm: 147 },
        { uk: "9K", us: "9.5", eu: "27", cm: 15.6, inches: 6.1, footMinMm: 148, footMaxMm: 156 },
        { uk: "10K", us: "10.5", eu: "28", cm: 16.5, inches: 6.5, footMinMm: 157, footMaxMm: 165 },
        { uk: "11K", us: "11.5", eu: "29", cm: 17.3, inches: 6.8, footMinMm: 166, footMaxMm: 173 },
        { uk: "12K", us: "12.5", eu: "30.5", cm: 18.2, inches: 7.2, footMinMm: 174, footMaxMm: 182 },
        { uk: "13K", us: "13.5", eu: "32", cm: 19.0, inches: 7.5, footMinMm: 183, footMaxMm: 190 },
        { uk: "1", us: "1.5", eu: "33", cm: 19.9, inches: 7.8, footMinMm: 191, footMaxMm: 199 },
        { uk: "2", us: "2.5", eu: "34", cm: 20.7, inches: 8.1, footMinMm: 200, footMaxMm: 207 },
        { uk: "3", us: "3.5", eu: "35.5", cm: 21.6, inches: 8.5, footMinMm: 208, footMaxMm: 216 },
      ],
    },
  },
];

/**
 * Deterministically match a foot length (in mm) to a brand's shoe size.
 */
export function matchShoeSizeByFootLength(
  brandId: string,
  demographic: ShoeDemographic,
  footLengthMm: number
): ShoeSizeRecord | null {
  const brand = SHOE_BRANDS.find((b) => b.brandId === brandId);
  if (!brand) return null;

  const list = brand.sizes[demographic] || [];
  if (list.length === 0) return null;

  // Exact range match
  const found = list.find((s) => footLengthMm >= s.footMinMm && footLengthMm <= s.footMaxMm);
  if (found) return found;

  // If below minimum size, return smallest
  if (footLengthMm < list[0].footMinMm) {
    return list[0];
  }

  // If above largest size, return largest
  if (footLengthMm > list[list.length - 1].footMaxMm) {
    return list[list.length - 1];
  }

  // Nearest match
  return list.reduce((prev, curr) => {
    const prevMid = (prev.footMinMm + prev.footMaxMm) / 2;
    const currMid = (curr.footMinMm + curr.footMaxMm) / 2;
    return Math.abs(currMid - footLengthMm) < Math.abs(prevMid - footLengthMm) ? curr : prev;
  });
}

/**
 * Cross-brand size translation:
 * Takes a user's known size in Brand A, resolves its canonical footbed mm,
 * and maps it to the exact equivalent size in Brand B.
 */
export function convertShoeSizeCrossBrand(
  fromBrandId: string,
  toBrandId: string,
  demographic: ShoeDemographic,
  fromUkSize: string
): {
  fromRecord: ShoeSizeRecord | null;
  toRecord: ShoeSizeRecord | null;
  varianceNote: string;
} {
  const fromBrand = SHOE_BRANDS.find((b) => b.brandId === fromBrandId);
  const toBrand = SHOE_BRANDS.find((b) => b.brandId === toBrandId);

  if (!fromBrand || !toBrand) {
    return { fromRecord: null, toRecord: null, varianceNote: "Brand not found in database." };
  }

  const fromRecord =
    fromBrand.sizes[demographic]?.find((s) => s.uk.toLowerCase() === fromUkSize.toLowerCase()) ||
    fromBrand.sizes[demographic]?.[0] ||
    null;

  if (!fromRecord) {
    return { fromRecord: null, toRecord: null, varianceNote: "Size not recognized for source brand." };
  }

  const footbedMidMm = Math.round((fromRecord.footMinMm + fromRecord.footMaxMm) / 2);
  const toRecord = matchShoeSizeByFootLength(toBrandId, demographic, footbedMidMm);

  let varianceNote = `${fromBrand.brandName} UK ${fromRecord.uk} corresponds to ${fromRecord.cm} cm (${fromRecord.inches} in) footbed length.`;

  if (toRecord) {
    if (toRecord.uk !== fromRecord.uk) {
      varianceNote += ` In ${toBrand.brandName}, order UK ${toRecord.uk} because ${toBrand.brandName} ${toBrand.lastOrigin.toLowerCase()}.`;
    } else {
      varianceNote += ` In ${toBrand.brandName}, the matching size is identical (UK ${toRecord.uk}).`;
    }
  }

  return { fromRecord, toRecord, varianceNote };
}
