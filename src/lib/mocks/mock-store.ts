import {
  AnatomicalProfile,
  BrandSizeChart,
  FabricSpec,
  FitPreference,
  GarmentDimensions,
  ReferenceGarment,
} from "@/core/types";

export interface MockBrand {
  id: string;
  name: string;
  slug: string;
  parentGroup: string;
  domain: string;
  officialStoreUrl: string;
  logoText: string;
  country: string;
  layerSupport: ("Layer 2 (Body Fit Ranges)" | "Layer 3 (Garment Dimensions)")[];
  catalogStatus: "verified_published" | "pending_review" | "staging";
  description: string;
  provenance: {
    sourceType: "brand_official" | "curated_dataset" | "contributor_verified";
    sourceUrl: string;
    retrievedAt: string;
    verificationHash: string;
  };
}

export interface MockProduct {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  category: "t_shirt" | "t_shirt_oversized" | "shirt_casual" | "shirt_formal" | "trousers_chinos" | "jeans";
  fitSilhouette: "slim" | "regular" | "relaxed" | "oversized";
  description: string;
  priceInr: number;
  imageUrl?: string;
  fabric: FabricSpec;
  layer3Specs?: GarmentDimensions[];
  layer2Charts?: BrandSizeChart[];
  provenance: {
    sourceType: "brand_official" | "curated_dataset" | "contributor_verified";
    sourceUrl: string;
    retrievedAt: string;
    verificationHash: string;
  };
}

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface MockProfile {
  id: string;
  userId: string;
  profileName: string;
  relation: "self" | "partner" | "child" | "friend";
  gender: "male" | "female" | "unisex";
  isDefault: boolean;
  consentGranted: boolean;
  createdAt: string;
}

export const SEED_BRANDS: MockBrand[] = [
  {
    id: "westside",
    name: "Westside",
    slug: "westside",
    parentGroup: "Tata Trent Ltd.",
    domain: "westside.com",
    officialStoreUrl: "https://www.westside.com",
    logoText: "WESTSIDE",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "Domestic Indian department store sizing with generous wearing ease.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.westside.com/pages/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ws83920194bc0194fa82910471ab23",
    },
  },
  {
    id: "fabindia",
    name: "FabIndia",
    slug: "fabindia",
    parentGroup: "Fabindia Overseas Pvt. Ltd.",
    domain: "fabindia.com",
    officialStoreUrl: "https://www.fabindia.com",
    logoText: "FABINDIA",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "India's premier artisanal handloom ethnic and contemporary casual apparel.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.fabindia.com/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-fi9284710294bc1094fa83910283bc99",
    },
  },
  {
    id: "raymond",
    name: "Raymond",
    slug: "raymond",
    parentGroup: "Raymond Group",
    domain: "myraymond.com",
    officialStoreUrl: "https://www.myraymond.com",
    logoText: "RAYMOND",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "Flagship Indian formalwear and shirting with tailored collar and chest specifications.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.myraymond.com/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ry83910294bc1094fa83910247bc77",
    },
  },
  {
    id: "snitch",
    name: "Snitch",
    slug: "snitch",
    parentGroup: "Snitch Apparels Ltd.",
    domain: "snitch.co.in",
    officialStoreUrl: "https://www.snitch.co.in",
    logoText: "SNITCH",
    country: "India",
    layerSupport: ["Layer 3 (Garment Dimensions)", "Layer 2 (Body Fit Ranges)"],
    catalogStatus: "verified_published",
    description: "Indian streetwear brand featuring drop-shoulder, boxy silhouettes with flat specs.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.snitch.co.in/products/oversized-t-shirt",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-sn7192837bc901ef45a89201bcde34",
    },
  },
  {
    id: "roadster",
    name: "Roadster",
    slug: "roadster",
    parentGroup: "Myntra Designs Pvt. Ltd.",
    domain: "myntra.com/roadster",
    officialStoreUrl: "https://www.myntra.com/roadster",
    logoText: "ROADSTER",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "High-volume Indian casualwear benchmark measured via verified contributor protocols.",
    provenance: {
      sourceType: "contributor_verified",
      sourceUrl: "https://wearid.in/data-audit/roadster-verified-specs",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-rd91029384bc1094fa83910294bc66",
    },
  },
  {
    id: "hm",
    name: "H&M India",
    slug: "hm-india",
    parentGroup: "H&M Group",
    domain: "hm.com/en_in",
    officialStoreUrl: "https://www2.hm.com/en_in/index.html",
    logoText: "H&M",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "Structured commercial body fit tables across European and international cuts.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www2.hm.com/en_in/customer-service/size-guide/men.html",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-hm49102847a98b01c37d8912ef01a2",
    },
  },
  {
    id: "marks_spencer",
    name: "Marks & Spencer India",
    slug: "marks-and-spencer",
    parentGroup: "Marks and Spencer Reliance India Pvt. Ltd.",
    domain: "marksandspencer.in",
    officialStoreUrl: "https://www.marksandspencer.in",
    logoText: "M&S",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "British heritage menswear with dual-unit imperial/metric body charts and regular cuts.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.marksandspencer.in/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ms83910294bc1094fa83910247bc88",
    },
  },
  {
    id: "zara",
    name: "Zara India",
    slug: "zara-india",
    parentGroup: "Inditex Group / Trent Ltd.",
    domain: "zara.com/in",
    officialStoreUrl: "https://www.zara.com/in/",
    logoText: "ZARA",
    country: "India",
    layerSupport: ["Layer 2 (Body Fit Ranges)", "Layer 3 (Garment Dimensions)"],
    catalogStatus: "verified_published",
    description: "Contemporary European cuts with tight ease tolerances and slim silhouettes.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.zara.com/in/en/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-za92018471bc0192ea84729104bc12",
    },
  },
  {
    id: "uniqlo",
    name: "Uniqlo India",
    slug: "uniqlo-india",
    parentGroup: "Fast Retailing Co.",
    domain: "uniqlo.com/in",
    officialStoreUrl: "https://www.uniqlo.com/in/en/",
    logoText: "UNIQLO",
    country: "India",
    layerSupport: ["Layer 3 (Garment Dimensions)", "Layer 2 (Body Fit Ranges)"],
    catalogStatus: "verified_published",
    description: "Gold standard flat garment specs published directly on product display pages.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.uniqlo.com/in/en/products/E425974-000",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-u98124b89ca01287e0fa12894b912c",
    },
  },
  {
    id: "levis",
    name: "Levi's India",
    slug: "levis-india",
    parentGroup: "Levi Strauss & Co.",
    domain: "levi.in",
    officialStoreUrl: "https://www.levi.in",
    logoText: "LEVI'S",
    country: "India",
    layerSupport: ["Layer 3 (Garment Dimensions)", "Layer 2 (Body Fit Ranges)"],
    catalogStatus: "verified_published",
    description: "Global denim and casualwear benchmark with dual metric/imperial specs.",
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.levi.in/size-guide",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-lv81920384bc1920ae847291bc923a",
    },
  },
];

export const SEED_PRODUCTS: MockProduct[] = [
  {
    id: "prod_uniqlo_airism_oversized",
    brandId: "uniqlo",
    brandName: "Uniqlo India",
    name: "AIRism Cotton Oversized Crew Neck T-Shirt",
    slug: "uniqlo-airism-cotton-oversized-crew-neck-t-shirt",
    category: "t_shirt_oversized",
    fitSilhouette: "oversized",
    description: "Drop shoulder silhouette with smooth AIRism fabric blend. Boxy cut through the chest.",
    priceInr: 1490,
    fabric: {
      materialComposition: "53% Cotton, 47% Polyester",
      elastanePercentage: 0,
      stretchLevel: "low",
      estimatedShrinkagePct: 1,
    },
    layer3Specs: [
      { productId: "prod_uniqlo_airism_oversized", sizeLabel: "S", chestFlatMm: 530, shoulderMm: 515, lengthMm: 685, sleeveMm: 240, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_airism_oversized", sizeLabel: "M", chestFlatMm: 560, shoulderMm: 530, lengthMm: 705, sleeveMm: 250, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_airism_oversized", sizeLabel: "L", chestFlatMm: 590, shoulderMm: 545, lengthMm: 735, sleeveMm: 260, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_airism_oversized", sizeLabel: "XL", chestFlatMm: 630, shoulderMm: 565, lengthMm: 765, sleeveMm: 270, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
    ],
    layer2Charts: [
      { brandId: "uniqlo", category: "t_shirt_oversized", gender: "male", fitType: "oversized", sizeLabel: "S", chestMinMm: 880, chestMaxMm: 960, sortOrder: 1, confidence: 0.9 },
      { brandId: "uniqlo", category: "t_shirt_oversized", gender: "male", fitType: "oversized", sizeLabel: "M", chestMinMm: 960, chestMaxMm: 1040, sortOrder: 2, confidence: 0.9 },
      { brandId: "uniqlo", category: "t_shirt_oversized", gender: "male", fitType: "oversized", sizeLabel: "L", chestMinMm: 1040, chestMaxMm: 1120, sortOrder: 3, confidence: 0.9 },
      { brandId: "uniqlo", category: "t_shirt_oversized", gender: "male", fitType: "oversized", sizeLabel: "XL", chestMinMm: 1120, chestMaxMm: 1200, sortOrder: 4, confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.uniqlo.com/in/en/products/E425974-000",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-uq425974a9810283bca8910283bcde",
    },
  },
  {
    id: "prod_uniqlo_supima_regular",
    brandId: "uniqlo",
    brandName: "Uniqlo India",
    name: "Supima Cotton Regular Fit Crew Neck T-Shirt",
    slug: "uniqlo-supima-cotton-regular-fit-crew-neck-t-shirt",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "100% premium long-staple Supima cotton. Classic straight cut through the torso.",
    priceInr: 1290,
    fabric: {
      materialComposition: "100% Supima Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 2,
    },
    layer3Specs: [
      { productId: "prod_uniqlo_supima_regular", sizeLabel: "S", chestFlatMm: 485, shoulderMm: 425, lengthMm: 660, sleeveMm: 210, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_supima_regular", sizeLabel: "M", chestFlatMm: 515, shoulderMm: 440, lengthMm: 690, sleeveMm: 220, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_supima_regular", sizeLabel: "L", chestFlatMm: 545, shoulderMm: 455, lengthMm: 720, sleeveMm: 230, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
      { productId: "prod_uniqlo_supima_regular", sizeLabel: "XL", chestFlatMm: 585, shoulderMm: 475, lengthMm: 750, sleeveMm: 240, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.95 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.uniqlo.com/in/en/products/E422990-000",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-uq422990b9810283bca8910283bc99",
    },
  },
  {
    id: "prod_snitch_heavyweight_boxy",
    brandId: "snitch",
    brandName: "Snitch",
    name: "Heavyweight 240 GSM Boxy Tee",
    slug: "snitch-heavyweight-240-gsm-boxy-tee",
    category: "t_shirt_oversized",
    fitSilhouette: "oversized",
    description: "High-density 240 GSM combed cotton. Wide torso, exaggerated drop shoulders, structured hang.",
    priceInr: 1199,
    fabric: {
      materialComposition: "100% Combed Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 2,
    },
    layer3Specs: [
      { productId: "prod_snitch_heavyweight_boxy", sizeLabel: "S", chestFlatMm: 535, shoulderMm: 520, lengthMm: 700, sleeveMm: 235, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_snitch_heavyweight_boxy", sizeLabel: "M", chestFlatMm: 565, shoulderMm: 540, lengthMm: 720, sleeveMm: 245, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_snitch_heavyweight_boxy", sizeLabel: "L", chestFlatMm: 595, shoulderMm: 560, lengthMm: 740, sleeveMm: 255, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_snitch_heavyweight_boxy", sizeLabel: "XL", chestFlatMm: 625, shoulderMm: 580, lengthMm: 760, sleeveMm: 265, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.snitch.co.in/products/oversized-black-tshirt",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-sn98120384bc1094fa83910283bc78",
    },
  },
  {
    id: "prod_levis_original_tee",
    brandId: "levis",
    brandName: "Levi's India",
    name: "Original Housemark Graphic T-Shirt",
    slug: "levis-original-housemark-graphic-t-shirt",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Standard American cut with non-stretch 100% cotton jersey.",
    priceInr: 1599,
    fabric: {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    },
    layer3Specs: [
      { productId: "prod_levis_original_tee", sizeLabel: "S", chestFlatMm: 490, shoulderMm: 430, lengthMm: 680, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_levis_original_tee", sizeLabel: "M", chestFlatMm: 520, shoulderMm: 450, lengthMm: 700, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_levis_original_tee", sizeLabel: "L", chestFlatMm: 550, shoulderMm: 470, lengthMm: 720, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_levis_original_tee", sizeLabel: "XL", chestFlatMm: 590, shoulderMm: 495, lengthMm: 740, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.levi.in/men/clothing/t-shirts/housemark-tee/224910001.html",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-lv98120384bc1094fa83910294bc11",
    },
  },
  {
    id: "prod_hm_regular_tee",
    brandId: "hm",
    brandName: "H&M India",
    name: "Regular Fit Round Neck T-Shirt",
    slug: "hm-regular-fit-round-neck-t-shirt",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Soft cotton jersey tee with standard European body grading.",
    priceInr: 799,
    fabric: {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    },
    layer2Charts: [
      { brandId: "hm", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 880, chestMaxMm: 960, waistMinMm: 760, waistMaxMm: 840, sortOrder: 1, confidence: 0.85 },
      { brandId: "hm", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 960, chestMaxMm: 1040, waistMinMm: 840, waistMaxMm: 920, sortOrder: 2, confidence: 0.85 },
      { brandId: "hm", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1040, chestMaxMm: 1120, waistMinMm: 920, waistMaxMm: 1000, sortOrder: 3, confidence: 0.85 },
      { brandId: "hm", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1120, chestMaxMm: 1200, waistMinMm: 1000, waistMaxMm: 1080, sortOrder: 4, confidence: 0.85 },
    ],
    layer3Specs: [
      { productId: "prod_hm_regular_tee", sizeLabel: "S", chestFlatMm: 490, shoulderMm: 430, lengthMm: 680, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_hm_regular_tee", sizeLabel: "M", chestFlatMm: 520, shoulderMm: 450, lengthMm: 700, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_hm_regular_tee", sizeLabel: "L", chestFlatMm: 550, shoulderMm: 470, lengthMm: 720, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_hm_regular_tee", sizeLabel: "XL", chestFlatMm: 590, shoulderMm: 490, lengthMm: 740, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www2.hm.com/en_in/productpage.0685814001.html",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-hm0685814a091823bca8910283bc41",
    },
  },
  {
    id: "prod_westside_wes_tee",
    brandId: "westside",
    brandName: "Westside",
    name: "WES Casuals Pure Cotton Regular T-Shirt",
    slug: "westside-wes-casuals-cotton-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Relaxed Indian domestic fit with generous chest wearing ease.",
    priceInr: 899,
    fabric: {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    },
    layer2Charts: [
      { brandId: "westside", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 910, chestMaxMm: 960, waistMinMm: 790, waistMaxMm: 840, sortOrder: 1, confidence: 0.85 },
      { brandId: "westside", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 970, chestMaxMm: 1020, waistMinMm: 850, waistMaxMm: 900, sortOrder: 2, confidence: 0.85 },
      { brandId: "westside", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1030, chestMaxMm: 1080, waistMinMm: 910, waistMaxMm: 960, sortOrder: 3, confidence: 0.85 },
      { brandId: "westside", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1090, chestMaxMm: 1140, waistMinMm: 970, waistMaxMm: 1020, sortOrder: 4, confidence: 0.85 },
    ],
    layer3Specs: [
      { productId: "prod_westside_wes_tee", sizeLabel: "S", chestFlatMm: 505, shoulderMm: 440, lengthMm: 690, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_westside_wes_tee", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 460, lengthMm: 710, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_westside_wes_tee", sizeLabel: "L", chestFlatMm: 565, shoulderMm: 480, lengthMm: 730, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_westside_wes_tee", sizeLabel: "XL", chestFlatMm: 600, shoulderMm: 500, lengthMm: 750, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.westside.com/products/wes-casuals-cotton-tee-3009101",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ws98120384bc1094fa83910294bc10",
    },
  },
  {
    id: "prod_fabindia_cotton_crew",
    brandId: "fabindia",
    brandName: "FabIndia",
    name: "Handloom Cotton Classic Fit T-Shirt",
    slug: "fabindia-handloom-cotton-classic-fit-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Breathable pure handloom cotton jersey with Indian artisanal drape.",
    priceInr: 999,
    fabric: {
      materialComposition: "100% Handloom Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    },
    layer2Charts: [
      { brandId: "fabindia", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 900, chestMaxMm: 950, sortOrder: 1, confidence: 0.85 },
      { brandId: "fabindia", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 960, chestMaxMm: 1010, sortOrder: 2, confidence: 0.85 },
      { brandId: "fabindia", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1020, chestMaxMm: 1070, sortOrder: 3, confidence: 0.85 },
      { brandId: "fabindia", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1080, chestMaxMm: 1140, sortOrder: 4, confidence: 0.85 },
    ],
    layer3Specs: [
      { productId: "prod_fabindia_cotton_crew", sizeLabel: "S", chestFlatMm: 500, shoulderMm: 435, lengthMm: 685, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_fabindia_cotton_crew", sizeLabel: "M", chestFlatMm: 530, shoulderMm: 455, lengthMm: 705, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_fabindia_cotton_crew", sizeLabel: "L", chestFlatMm: 560, shoulderMm: 475, lengthMm: 725, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_fabindia_cotton_crew", sizeLabel: "XL", chestFlatMm: 595, shoulderMm: 495, lengthMm: 745, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.fabindia.com/cotton-crew-neck-tshirt-107293",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-fi98120384bc1094fa83910294bc12",
    },
  },
  {
    id: "prod_raymond_parx_tee",
    brandId: "raymond",
    brandName: "Raymond",
    name: "Parx Solid Regular Fit Cotton T-Shirt",
    slug: "raymond-parx-solid-regular-fit-cotton-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Combed cotton jersey from Raymond Parx casual line with structured shoulder line.",
    priceInr: 999,
    fabric: {
      materialComposition: "100% Combed Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 2,
    },
    layer2Charts: [
      { brandId: "raymond", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 920, chestMaxMm: 970, sortOrder: 1, confidence: 0.85 },
      { brandId: "raymond", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 980, chestMaxMm: 1030, sortOrder: 2, confidence: 0.85 },
      { brandId: "raymond", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1040, chestMaxMm: 1090, sortOrder: 3, confidence: 0.85 },
      { brandId: "raymond", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1100, chestMaxMm: 1160, sortOrder: 4, confidence: 0.85 },
    ],
    layer3Specs: [
      { productId: "prod_raymond_parx_tee", sizeLabel: "S", chestFlatMm: 505, shoulderMm: 440, lengthMm: 690, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_raymond_parx_tee", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 460, lengthMm: 710, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_raymond_parx_tee", sizeLabel: "L", chestFlatMm: 565, shoulderMm: 480, lengthMm: 730, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_raymond_parx_tee", sizeLabel: "XL", chestFlatMm: 600, shoulderMm: 500, lengthMm: 750, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.myraymond.com/products/parx-solid-crew-tee-2819",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ry98120384bc1094fa83910294bc13",
    },
  },
  {
    id: "prod_roadster_crew_tee",
    brandId: "roadster",
    brandName: "Roadster",
    name: "Roadster Men Solid Pure Cotton T-Shirt",
    slug: "roadster-men-solid-pure-cotton-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Myntra Roadster standard crew neck tee measured via verified physical contributor protocol.",
    priceInr: 499,
    fabric: {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    },
    layer2Charts: [
      { brandId: "roadster", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 910, chestMaxMm: 965, sortOrder: 1, confidence: 0.8 },
      { brandId: "roadster", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 965, chestMaxMm: 1015, sortOrder: 2, confidence: 0.8 },
      { brandId: "roadster", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1015, chestMaxMm: 1065, sortOrder: 3, confidence: 0.8 },
      { brandId: "roadster", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1065, chestMaxMm: 1120, sortOrder: 4, confidence: 0.8 },
    ],
    layer3Specs: [
      { productId: "prod_roadster_crew_tee", sizeLabel: "S", chestFlatMm: 495, shoulderMm: 430, lengthMm: 680, measurementMethod: "laid_flat", measuredBy: "contributor", confidence: 0.88 },
      { productId: "prod_roadster_crew_tee", sizeLabel: "M", chestFlatMm: 525, shoulderMm: 450, lengthMm: 700, measurementMethod: "laid_flat", measuredBy: "contributor", confidence: 0.88 },
      { productId: "prod_roadster_crew_tee", sizeLabel: "L", chestFlatMm: 555, shoulderMm: 470, lengthMm: 720, measurementMethod: "laid_flat", measuredBy: "contributor", confidence: 0.88 },
      { productId: "prod_roadster_crew_tee", sizeLabel: "XL", chestFlatMm: 590, shoulderMm: 490, lengthMm: 740, measurementMethod: "laid_flat", measuredBy: "contributor", confidence: 0.88 },
    ],
    provenance: {
      sourceType: "contributor_verified",
      sourceUrl: "https://wearid.in/data-audit/roadster-verified-specs",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-rd98120384bc1094fa83910294bc14",
    },
  },
  {
    id: "prod_marks_spencer_pure_cotton",
    brandId: "marks_spencer",
    brandName: "Marks & Spencer India",
    name: "Pure Cotton Regular Fit Crew Neck T-Shirt",
    slug: "marks-spencer-pure-cotton-crew-neck-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "StayNew technology pure British cotton tee with standard metric body grading.",
    priceInr: 1299,
    fabric: {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 1,
    },
    layer2Charts: [
      { brandId: "marks_spencer", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 910, chestMaxMm: 965, sortOrder: 1, confidence: 0.88 },
      { brandId: "marks_spencer", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 965, chestMaxMm: 1015, sortOrder: 2, confidence: 0.88 },
      { brandId: "marks_spencer", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1015, chestMaxMm: 1065, sortOrder: 3, confidence: 0.88 },
      { brandId: "marks_spencer", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1065, chestMaxMm: 1145, sortOrder: 4, confidence: 0.88 },
    ],
    layer3Specs: [
      { productId: "prod_marks_spencer_pure_cotton", sizeLabel: "S", chestFlatMm: 500, shoulderMm: 435, lengthMm: 690, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.92 },
      { productId: "prod_marks_spencer_pure_cotton", sizeLabel: "M", chestFlatMm: 530, shoulderMm: 455, lengthMm: 710, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.92 },
      { productId: "prod_marks_spencer_pure_cotton", sizeLabel: "L", chestFlatMm: 560, shoulderMm: 475, lengthMm: 730, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.92 },
      { productId: "prod_marks_spencer_pure_cotton", sizeLabel: "XL", chestFlatMm: 600, shoulderMm: 500, lengthMm: 750, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.92 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.marksandspencer.in/pure-cotton-crew-neck-t-shirt/p/000000000060502001.html",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-ms98120384bc1094fa83910294bc15",
    },
  },
  {
    id: "prod_zara_textured_tee",
    brandId: "zara",
    brandName: "Zara India",
    name: "Textured Ottoman Ribbed T-Shirt",
    slug: "zara-textured-ottoman-ribbed-tee",
    category: "t_shirt",
    fitSilhouette: "regular",
    description: "Ribbed knit tee with European slim-to-regular fit and neat neck trim.",
    priceInr: 1990,
    fabric: {
      materialComposition: "96% Cotton, 4% Elastane",
      elastanePercentage: 4,
      stretchLevel: "medium",
      estimatedShrinkagePct: 2,
    },
    layer2Charts: [
      { brandId: "zara", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "S", chestMinMm: 910, chestMaxMm: 960, sortOrder: 1, confidence: 0.85 },
      { brandId: "zara", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "M", chestMinMm: 960, chestMaxMm: 1010, sortOrder: 2, confidence: 0.85 },
      { brandId: "zara", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "L", chestMinMm: 1020, chestMaxMm: 1070, sortOrder: 3, confidence: 0.85 },
      { brandId: "zara", category: "t_shirt", gender: "male", fitType: "regular", sizeLabel: "XL", chestMinMm: 1080, chestMaxMm: 1140, sortOrder: 4, confidence: 0.85 },
    ],
    layer3Specs: [
      { productId: "prod_zara_textured_tee", sizeLabel: "S", chestFlatMm: 485, shoulderMm: 425, lengthMm: 680, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_zara_textured_tee", sizeLabel: "M", chestFlatMm: 510, shoulderMm: 445, lengthMm: 700, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_zara_textured_tee", sizeLabel: "L", chestFlatMm: 540, shoulderMm: 465, lengthMm: 720, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
      { productId: "prod_zara_textured_tee", sizeLabel: "XL", chestFlatMm: 575, shoulderMm: 485, lengthMm: 740, measurementMethod: "laid_flat", measuredBy: "brand", confidence: 0.9 },
    ],
    provenance: {
      sourceType: "brand_official",
      sourceUrl: "https://www.zara.com/in/en/textured-t-shirt-p00722300.html",
      retrievedAt: "2026-03-01T10:00:00Z",
      verificationHash: "sha256-za98120384bc1094fa83910294bc77",
    },
  },
];

export const MOCK_USER: MockUser = {
  id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  email: "aarush@example.com",
  fullName: "Aarush Sharma",
  createdAt: "2026-01-15T08:00:00Z",
};

export const MOCK_PROFILE: MockProfile = {
  id: "7f8b3c2a-9e1d-4a5f-8b2c-3d4e5f6a7b8c",
  userId: MOCK_USER.id,
  profileName: "Aarush (Self)",
  relation: "self",
  gender: "male",
  isDefault: true,
  consentGranted: true,
  createdAt: "2026-01-15T08:00:00Z",
};

export const MOCK_ANATOMICAL_PROFILE: AnatomicalProfile = {
  profileId: MOCK_PROFILE.id,
  chestMm: 980,
  waistMm: 840,
  shoulderWidthMm: 450,
  heightMm: 1780,
  weightG: 74000,
  inseamMm: 790,
  neckMm: 390,
  measurementMethod: {
    chestMm: "physical_tape",
    waistMm: "physical_tape",
    shoulderWidthMm: "physical_tape",
    heightMm: "stadiometer",
  },
  isCurrent: true,
  recordedAt: "2026-03-01T10:00:00Z",
};

export const MOCK_REFERENCE_GARMENTS: ReferenceGarment[] = [
  {
    id: "ref-uniqlo-supima-m",
    brandId: "uniqlo",
    brandNameRaw: "Uniqlo India",
    category: "t_shirt",
    sizeLabel: "M",
    fitQuality: "perfect",
    userFitRating: "perfect",
    verifiedChestFlatMm: 515,
  },
  {
    id: "ref-levis-housemark-m",
    brandId: "levis",
    brandNameRaw: "Levi's India",
    category: "t_shirt",
    sizeLabel: "M",
    fitQuality: "perfect",
    userFitRating: "perfect",
    verifiedChestFlatMm: 520,
  },
];

class MockStore {
  private brands: MockBrand[] = [...SEED_BRANDS];
  private products: MockProduct[] = [...SEED_PRODUCTS];
  private users: MockUser[] = [{ ...MOCK_USER }];
  private profiles: MockProfile[] = [{ ...MOCK_PROFILE }];
  private measurements: Map<string, AnatomicalProfile> = new Map([
    [MOCK_PROFILE.id, { ...MOCK_ANATOMICAL_PROFILE }],
  ]);
  private preferences: Map<string, Map<string, FitPreference>> = new Map([
    [
      MOCK_PROFILE.id,
      new Map([
        ["t_shirt", { profileId: MOCK_PROFILE.id, category: "t_shirt", fitType: "regular" }],
        [
          "t_shirt_oversized",
          { profileId: MOCK_PROFILE.id, category: "t_shirt_oversized", fitType: "relaxed" },
        ],
      ]),
    ],
  ]);
  private referenceGarments: Map<string, ReferenceGarment[]> = new Map([
    [MOCK_PROFILE.id, [...MOCK_REFERENCE_GARMENTS]],
  ]);

  // Brands
  getBrands(): MockBrand[] {
    return [...this.brands];
  }

  getBrand(idOrSlug: string): MockBrand | undefined {
    return this.brands.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
  }

  // Products
  getProducts(brandId?: string): MockProduct[] {
    if (brandId) {
      return this.products.filter((p) => p.brandId === brandId);
    }
    return [...this.products];
  }

  getProduct(idOrSlug: string): MockProduct | undefined {
    return this.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  // User & Auth
  getUser(): MockUser {
    return { ...this.users[0] };
  }

  getProfiles(userId?: string): MockProfile[] {
    const targetUserId = userId || this.users[0].id;
    return this.profiles.filter((p) => p.userId === targetUserId);
  }

  getProfile(id?: string): MockProfile | undefined {
    if (!id) return this.profiles.find((p) => p.isDefault) || this.profiles[0];
    return this.profiles.find((p) => p.id === id);
  }

  // Measurements
  getMeasurements(profileId?: string): AnatomicalProfile {
    const targetId = profileId || MOCK_PROFILE.id;
    return this.measurements.get(targetId) || { ...MOCK_ANATOMICAL_PROFILE };
  }

  updateMeasurements(profileId: string, data: Partial<AnatomicalProfile>): AnatomicalProfile {
    const existing = this.getMeasurements(profileId);
    const updated: AnatomicalProfile = {
      ...existing,
      ...data,
      profileId,
      recordedAt: new Date().toISOString(),
    };
    this.measurements.set(profileId, updated);
    return updated;
  }

  // Preferences
  getPreferences(profileId?: string): FitPreference[] {
    const targetId = profileId || MOCK_PROFILE.id;
    const prefMap = this.preferences.get(targetId);
    return prefMap ? Array.from(prefMap.values()) : [];
  }

  setPreference(profileId: string, category: string, fitType: FitPreference["fitType"]): FitPreference {
    if (!this.preferences.has(profileId)) {
      this.preferences.set(profileId, new Map());
    }
    const pref: FitPreference = { profileId, category, fitType };
    this.preferences.get(profileId)!.set(category, pref);
    return pref;
  }

  // Reference Garments
  getReferenceGarments(profileId?: string): ReferenceGarment[] {
    const targetId = profileId || MOCK_PROFILE.id;
    return this.referenceGarments.get(targetId) || [];
  }

  addReferenceGarment(profileId: string, garment: ReferenceGarment): ReferenceGarment {
    const list = this.getReferenceGarments(profileId);
    const item: ReferenceGarment = {
      ...garment,
      id: garment.id || `ref-${Date.now()}`,
    };
    this.referenceGarments.set(profileId, [...list, item]);
    return item;
  }

  reset(): void {
    this.brands = [...SEED_BRANDS];
    this.products = [...SEED_PRODUCTS];
    this.users = [{ ...MOCK_USER }];
    this.profiles = [{ ...MOCK_PROFILE }];
    this.measurements = new Map([[MOCK_PROFILE.id, { ...MOCK_ANATOMICAL_PROFILE }]]);
    this.preferences = new Map([
      [
        MOCK_PROFILE.id,
        new Map([
          ["t_shirt", { profileId: MOCK_PROFILE.id, category: "t_shirt", fitType: "regular" }],
          [
            "t_shirt_oversized",
            { profileId: MOCK_PROFILE.id, category: "t_shirt_oversized", fitType: "relaxed" },
          ],
        ]),
      ],
    ]);
    this.referenceGarments = new Map([[MOCK_PROFILE.id, [...MOCK_REFERENCE_GARMENTS]]]);
  }
}

export const mockStore = new MockStore();
