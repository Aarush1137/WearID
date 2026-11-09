/**
 * Canonical Unit Conversion Utilities
 * All internal measurements are stored as integer millimeters (mm) and grams (g).
 * Conversions to colloquial/presentation units (cm, in, lbs) occur solely at display boundaries.
 */

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10.0;
export const GRAMS_PER_KG = 1000.0;
export const GRAMS_PER_LB = 453.59237;

/**
 * Converts centimeters to canonical integer millimeters.
 */
export function cmToMm(cm: number): number {
  if (cm < 0) {
    throw new RangeError("Dimension cannot be negative.");
  }
  return Math.round(cm * MM_PER_CM);
}

/**
 * Converts canonical millimeters to display centimeters.
 */
export function mmToCm(mm: number, precision: number = 1): number {
  if (mm < 0) {
    throw new RangeError("Dimension cannot be negative.");
  }
  const factor = Math.pow(10, precision);
  return Math.round((mm / MM_PER_CM) * factor) / factor;
}

/**
 * Converts inches to canonical integer millimeters.
 */
export function inchesToMm(inches: number): number {
  if (inches < 0) {
    throw new RangeError("Dimension cannot be negative.");
  }
  return Math.round(inches * MM_PER_INCH);
}

/**
 * Converts canonical millimeters to display inches.
 */
export function mmToInches(mm: number, precision: number = 2): number {
  if (mm < 0) {
    throw new RangeError("Dimension cannot be negative.");
  }
  const factor = Math.pow(10, precision);
  return Math.round((mm / MM_PER_INCH) * factor) / factor;
}

/**
 * Converts kilograms to canonical grams.
 */
export function kgToGrams(kg: number): number {
  if (kg < 0) {
    throw new RangeError("Weight cannot be negative.");
  }
  return Math.round(kg * GRAMS_PER_KG);
}

/**
 * Converts pounds (lbs) to canonical grams.
 */
export function lbsToGrams(lbs: number): number {
  if (lbs < 0) {
    throw new RangeError("Weight cannot be negative.");
  }
  return Math.round(lbs * GRAMS_PER_LB);
}

/**
 * Converts canonical grams to kilograms.
 */
export function gramsToKg(g: number, precision: number = 2): number {
  if (g < 0) {
    throw new RangeError("Weight cannot be negative.");
  }
  const factor = Math.pow(10, precision);
  return Math.round((g / GRAMS_PER_KG) * factor) / factor;
}

/**
 * Converts canonical grams to pounds (lbs).
 */
export function gramsToLbs(g: number, precision: number = 2): number {
  if (g < 0) {
    throw new RangeError("Weight cannot be negative.");
  }
  const factor = Math.pow(10, precision);
  return Math.round((g / GRAMS_PER_LB) * factor) / factor;
}
