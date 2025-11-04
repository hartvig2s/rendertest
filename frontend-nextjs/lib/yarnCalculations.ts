/**
 * Yarn calculation utilities for crochet projects
 * Based on empirical data from finished bags
 */

import { YARN_CALCULATION } from './constants';

export interface YarnRequired {
  grams: number;
  skeinsNeeded: number;
}

/**
 * Calculate yarn required based on grid dimensions
 * Uses area-based formula with consumption rates from empirical data
 *
 * @param widthCm - Width in centimeters
 * @param heightCm - Height in centimeters
 * @param type - Grid type: 'åpent' (open) or 'tett' (filled)
 * @returns Object with total grams and number of skeins needed
 *
 * @example
 * const result = calculateYarnRequired(30, 35, 'tett');
 * console.log(result); // { grams: 218.55, skeinsNeeded: 5 }
 */
export const calculateYarnRequired = (
  widthCm: number,
  heightCm: number,
  type: 'åpent' | 'tett'
): YarnRequired => {
  const area = widthCm * heightCm; // cm²

  // Consumption rates based on real finished bag data (g/cm²)
  const consumptionRate =
    type === 'tett'
      ? YARN_CALCULATION.CONSUMPTION_RATE_TETT
      : YARN_CALCULATION.CONSUMPTION_RATE_ÅPENT;

  const grams = area * consumptionRate;
  const skeinsNeeded = Math.ceil(grams / YARN_CALCULATION.SKEIN_WEIGHT);

  return { grams, skeinsNeeded };
};

/**
 * Format yarn amount for display
 * @param grams - Amount in grams
 * @returns Formatted string (e.g., "218.55g")
 */
export const formatYarnGrams = (grams: number): string => {
  return `${grams.toFixed(2)}g`;
};

/**
 * Format skeins for display
 * @param skeins - Number of skeins
 * @param weight - Weight per skein in grams
 * @returns Formatted string (e.g., "5 × 50g")
 */
export const formatSkeins = (skeins: number, weight: number = YARN_CALCULATION.SKEIN_WEIGHT): string => {
  return `${skeins} × ${weight}g`;
};
