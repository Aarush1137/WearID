/**
 * Category-Specific Measurement Weighting Distributions
 * Reflects how critical each anatomical dimension is to the fit of that garment type.
 */

export interface DimensionWeights {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  length?: number;
  sleeve?: number;
  neck?: number;
  inseam?: number;
  thigh?: number;
  rise?: number;
  torso_length?: number;
  foot_length?: number;
  [key: string]: number | undefined;
}

export function getCategoryWeights(category: string): DimensionWeights {
  const normalized = category.toLowerCase().trim();
  switch (normalized) {
    case "tshirt":
    case "t_shirt":
    case "t_shirt_oversized":
    case "polo":
      return { chest: 0.40, shoulder: 0.35, length: 0.15, sleeve: 0.10 };

    case "casual_shirt":
    case "shirt_casual":
      return { chest: 0.30, shoulder: 0.30, sleeve: 0.20, neck: 0.20 };

    case "formal_shirt":
    case "shirt_formal":
      return { chest: 0.25, shoulder: 0.25, sleeve: 0.25, neck: 0.25 };

    case "hoodie":
    case "sweatshirt":
      return { chest: 0.45, shoulder: 0.30, length: 0.15, sleeve: 0.10 };

    case "jacket":
    case "blazer":
    case "outerwear":
      return { chest: 0.40, shoulder: 0.30, sleeve: 0.20, length: 0.10 };

    case "jeans":
      return { waist: 0.40, inseam: 0.35, thigh: 0.25 };

    case "trousers":
    case "chinos":
    case "trousers_chinos":
      return { waist: 0.40, inseam: 0.30, thigh: 0.20, rise: 0.10 };

    case "joggers":
    case "jogger":
    case "track_pants":
    case "sweatpants":
      return { waist: 0.40, hips: 0.30, inseam: 0.20, thigh: 0.10 };

    case "shorts":
    case "short":
      return { waist: 0.45, hips: 0.35, length: 0.20 };

    case "bra":
    case "sports_bra":
    case "lingerie":
    case "intimates":
      return { chest: 0.60, waist: 0.40 };

    case "undershirt":
    case "briefs":
      return { chest: 0.50, waist: 0.50 };

    case "dress":
    case "dresses":
      return { chest: 0.40, waist: 0.35, hips: 0.25 };

    case "kurta":
    case "kurti":
      return { chest: 0.35, shoulder: 0.25, torso_length: 0.25, sleeve: 0.15 };

    case "shoe":
    case "shoes":
    case "footwear":
      return { foot_length: 1.0 };

    case "ring":
      return { ring_finger: 1.0 };

    case "bracelet":
      return { wrist: 1.0 };

    default:
      return { chest: 0.50, shoulder: 0.30, length: 0.20 };
  }
}
