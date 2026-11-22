/**
 * WearID Bilingual Translation Dictionary
 * English (en) and Hindi (हिन्दी)
 * Covers clothing anatomy, biometric landmarks, fit intentions, and app navigation.
 */

export type SupportedLocale = "en" | "hi";

export interface TranslationDictionary {
  // Navigation & Shell
  passport: string;
  sizeMatcher: string;
  compare: string;
  brands: string;
  tools: string;
  whatSizeAmI: string;
  wardrobeCloset: string;
  tailorCard: string;
  outfitBuilder: string;
  familyMatrix: string;
  brandRequests: string;
  switchProfile: string;
  home: string;
  dashboard: string;
  settings: string;
  language: string;

  // Biometrics & Anatomy
  chest: string;
  bust: string;
  waist: string;
  hips: string;
  shoulderWidth: string;
  height: string;
  weight: string;
  inseam: string;
  footLength: string;
  neck: string;
  sleeveLength: string;

  // Fit Types (Intentions)
  fit_slim: string;
  fit_regular: string;
  fit_relaxed: string;
  fit_oversized: string;

  // Fit Feelings & Quality
  fit_perfect: string;
  fit_too_tight: string;
  fit_slightly_tight: string;
  fit_slightly_loose: string;
  fit_too_loose: string;

  // Sizing Engine Terms
  recommendedSize: string;
  alternativeSize: string;
  fitConfidence: string;
  confidence_high: string;
  confidence_medium: string;
  confidence_low: string;
  wearingEase: string;
  garmentDimensions: string;
  bodyMeasurements: string;
  provenanceAudited: string;

  // Categories
  cat_all: string;
  cat_tshirt: string;
  cat_shirt: string;
  cat_jeans: string;
  cat_trousers: string;
  cat_shoes: string;
  cat_jacket: string;
  cat_kurta: string;
  cat_bra: string;
  cat_polo: string;
  cat_joggers: string;

  // Common Actions & UI
  matchMyFit: string;
  saveOutfit: string;
  upvote: string;
  upvoted: string;
  requestBrand: string;
  searchPlaceholder: string;
  copySummary: string;
  copied: string;
  active: string;
  addMember: string;
  selectCategory: string;
  viewDetails: string;
  cancel: string;
  submit: string;
  save: string;
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  en: {
    passport: "Passport",
    sizeMatcher: "Size Matcher",
    compare: "Compare Brands",
    brands: "Brands Catalog",
    tools: "Tools",
    whatSizeAmI: "What Size Am I?",
    wardrobeCloset: "Wardrobe Closet",
    tailorCard: "Tailor Card & PDF",
    outfitBuilder: "Outfit Builder",
    familyMatrix: "Family Size Matrix",
    brandRequests: "Request Brands",
    switchProfile: "Switch Profile",
    home: "Home",
    dashboard: "Dashboard",
    settings: "Settings",
    language: "Language",

    chest: "Chest",
    bust: "Bust",
    waist: "Waist",
    hips: "Hips",
    shoulderWidth: "Shoulder Width",
    height: "Height",
    weight: "Weight",
    inseam: "Inseam",
    footLength: "Foot Length",
    neck: "Neck / Collar",
    sleeveLength: "Sleeve Length",

    fit_slim: "Slim Fit",
    fit_regular: "Regular Fit",
    fit_relaxed: "Relaxed Fit",
    fit_oversized: "Oversized Fit",

    fit_perfect: "Best Fit (Perfect)",
    fit_too_tight: "Too Tight",
    fit_slightly_tight: "Slightly Tight",
    fit_slightly_loose: "Slightly Loose",
    fit_too_loose: "Too Loose",

    recommendedSize: "Recommended Size",
    alternativeSize: "Alternative Size",
    fitConfidence: "Fit Confidence",
    confidence_high: "High Confidence",
    confidence_medium: "Medium Confidence",
    confidence_low: "Low Confidence",
    wearingEase: "Wearing Ease",
    garmentDimensions: "Garment Dimensions (Laid Flat)",
    bodyMeasurements: "Body Measurements",
    provenanceAudited: "Provenance Audited",

    cat_all: "All Items",
    cat_tshirt: "T-Shirt",
    cat_shirt: "Shirt",
    cat_jeans: "Jeans",
    cat_trousers: "Trousers / Chinos",
    cat_shoes: "Shoes / Footwear",
    cat_jacket: "Jacket / Outerwear",
    cat_kurta: "Kurta",
    cat_bra: "Bra",
    cat_polo: "Polo",
    cat_joggers: "Joggers / Sweatpants",

    matchMyFit: "Match My Fit",
    saveOutfit: "Save Outfit",
    upvote: "Upvote",
    upvoted: "Upvoted",
    requestBrand: "Request a Brand",
    searchPlaceholder: "Search brands, styles, or categories...",
    copySummary: "Copy Summary",
    copied: "Copied!",
    active: "Active",
    addMember: "Add Member",
    selectCategory: "Select Category",
    viewDetails: "View Details",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
  },
  hi: {
    passport: "साइज़ पासपोर्ट",
    sizeMatcher: "साइज़ जांचें",
    compare: "ब्रांड तुलना",
    brands: "ब्रांड्स सूची",
    tools: "उपकरण",
    whatSizeAmI: "मेरा क्या साइज़ है?",
    wardrobeCloset: "मेरी अलमारी",
    tailorCard: "दर्ज़ी कार्ड",
    outfitBuilder: "आउटफ़िट बिल्डर",
    familyMatrix: "परिवार नाप तालिका",
    brandRequests: "ब्रांड अनुरोध",
    switchProfile: "प्रोफ़ाइल बदलें",
    home: "होम",
    dashboard: "डैशबोर्ड",
    settings: "सेटिंग्स",
    language: "भाषा",

    chest: "छाती (Chest)",
    bust: "वक्ष (Bust)",
    waist: "कमर (Waist)",
    hips: "कूल्हे (Hips)",
    shoulderWidth: "कंधे की चौड़ाई",
    height: "कद / लंबाई",
    weight: "वज़न",
    inseam: "इनसीम (पैंट की लंबाई)",
    footLength: "पैर की लंबाई",
    neck: "गला / कॉलर",
    sleeveLength: "आस्तीन की लंबाई",

    fit_slim: "स्लिम फिट",
    fit_regular: "रेगुलर फिट",
    fit_relaxed: "ढीला (रिलैक्स्ड)",
    fit_oversized: "ओवरसाइज़्ड",

    fit_perfect: "सही नाप (परफेक्ट)",
    fit_too_tight: "बहुत तंग",
    fit_slightly_tight: "हल्का तंग",
    fit_slightly_loose: "हल्का ढीला",
    fit_too_loose: "बहुत ढीला",

    recommendedSize: "अनुशंसित साइज़",
    alternativeSize: "वैकल्पिक साइज़",
    fitConfidence: "सटीकता स्तर",
    confidence_high: "उच्च सटीकता",
    confidence_medium: "मध्यम सटीकता",
    confidence_low: "कम सटीकता",
    wearingEase: "ईज़ (पहनने का ढीलापन)",
    garmentDimensions: "कपड़े की माप (सपाट)",
    bodyMeasurements: "शरीर की माप",
    provenanceAudited: "प्रमाणित स्रोत",

    cat_all: "सभी कपड़े",
    cat_tshirt: "टी-शर्ट",
    cat_shirt: "शर्ट",
    cat_jeans: "जींस",
    cat_trousers: "पतलून / चीनो",
    cat_shoes: "जूते / फुटवियर",
    cat_jacket: "जैकेट",
    cat_kurta: "कुर्ता",
    cat_bra: "ब्रा",
    cat_polo: "पोलो",
    cat_joggers: "जॉगर्स",

    matchMyFit: "मेरा नाप मिलाएं",
    saveOutfit: "आउटफ़िट सहेजें",
    upvote: "वोट दें",
    upvoted: "वोट दिया",
    requestBrand: "ब्रांड का अनुरोध करें",
    searchPlaceholder: "ब्रांड या कपड़े खोजें...",
    copySummary: "कॉपी करें",
    copied: "कॉपी हो गया!",
    active: "सक्रिय",
    addMember: "सदस्य जोड़ें",
    selectCategory: "श्रेणी चुनें",
    viewDetails: "विवरण देखें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    save: "सहेजें",
  },
};
