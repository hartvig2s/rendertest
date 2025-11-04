/**
 * Motif manipulation and utility functions
 */

import { MOTIF_SIZING } from './constants';

export interface PlacedMotif {
  id: string;
  motifId: string;
  x: number;
  y: number;
  name: string;
  size: number;
  threshold: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  isCustom?: boolean;
  imageData?: string;
}

/**
 * Validate motif size is within allowed bounds
 * @param size - Size multiplier
 * @returns Clamped size
 */
export const clampMotifSize = (size: number): number => {
  return Math.max(
    MOTIF_SIZING.MIN_SIZE,
    Math.min(size, MOTIF_SIZING.MAX_SIZE)
  );
};

/**
 * Create a new placed motif object
 * @param motifId - ID of the motif
 * @param x - X position
 * @param y - Y position
 * @param name - Display name
 * @param isCustom - Whether it's a custom motif
 * @param imageData - Image data for custom motifs
 * @returns PlacedMotif object
 */
export const createPlacedMotif = (
  motifId: string,
  x: number,
  y: number,
  name: string,
  isCustom: boolean = false,
  imageData?: string
): PlacedMotif => {
  return {
    id: Math.random().toString(36).substr(2, 9), // Generate unique ID
    motifId,
    x,
    y,
    name,
    size: MOTIF_SIZING.DEFAULT_SIZE,
    threshold: 128,
    flipHorizontal: false,
    flipVertical: false,
    isCustom,
    imageData,
  };
};

/**
 * Update motif size with validation
 * @param motif - Motif to update
 * @param newSize - New size value
 * @returns Updated motif
 */
export const updateMotifSize = (motif: PlacedMotif, newSize: number): PlacedMotif => {
  return {
    ...motif,
    size: clampMotifSize(newSize),
  };
};

/**
 * Toggle motif flip state
 * @param motif - Motif to update
 * @param direction - 'horizontal' or 'vertical'
 * @returns Updated motif
 */
export const toggleMotifFlip = (
  motif: PlacedMotif,
  direction: 'horizontal' | 'vertical'
): PlacedMotif => {
  if (direction === 'horizontal') {
    return {
      ...motif,
      flipHorizontal: !motif.flipHorizontal,
    };
  }
  return {
    ...motif,
    flipVertical: !motif.flipVertical,
  };
};

/**
 * Update motif position
 * @param motif - Motif to update
 * @param x - New X position
 * @param y - New Y position
 * @returns Updated motif
 */
export const moveMotif = (
  motif: PlacedMotif,
  x: number,
  y: number
): PlacedMotif => {
  return {
    ...motif,
    x,
    y,
  };
};

/**
 * Update motif threshold (for black/white conversion)
 * @param motif - Motif to update
 * @param threshold - New threshold value (0-255)
 * @returns Updated motif
 */
export const updateMotifThreshold = (
  motif: PlacedMotif,
  threshold: number
): PlacedMotif => {
  return {
    ...motif,
    threshold: Math.max(0, Math.min(255, threshold)),
  };
};

/**
 * Create a duplicate of a motif at a new position
 * @param motif - Motif to duplicate
 * @param offsetX - X offset from original
 * @param offsetY - Y offset from original
 * @returns New motif instance
 */
export const duplicateMotif = (
  motif: PlacedMotif,
  offsetX: number = 0,
  offsetY: number = 0
): PlacedMotif => {
  return {
    ...motif,
    id: Math.random().toString(36).substr(2, 9), // Generate new unique ID
    x: motif.x + offsetX,
    y: motif.y + offsetY,
  };
};

/**
 * Filter placed motifs by custom status
 * @param motifs - Array of motifs
 * @param isCustom - Whether to return custom motifs (true) or library motifs (false)
 * @returns Filtered array
 */
export const filterMotifsByType = (
  motifs: PlacedMotif[],
  isCustom: boolean
): PlacedMotif[] => {
  return motifs.filter(m => (m.isCustom ?? false) === isCustom);
};

/**
 * Find motif by ID
 * @param motifs - Array of motifs
 * @param id - Motif ID to find
 * @returns Found motif or undefined
 */
export const findMotifById = (
  motifs: PlacedMotif[],
  id: string
): PlacedMotif | undefined => {
  return motifs.find(m => m.id === id);
};

/**
 * Remove motif from array
 * @param motifs - Array of motifs
 * @param id - ID of motif to remove
 * @returns New array without the motif
 */
export const removeMotif = (
  motifs: PlacedMotif[],
  id: string
): PlacedMotif[] => {
  return motifs.filter(m => m.id !== id);
};

/**
 * Check if point is within motif bounds
 * @param x - Point X coordinate
 * @param y - Point Y coordinate
 * @param motif - Motif to check
 * @param motifSize - Width/height of motif in pixels
 * @returns Whether point is within motif
 */
export const isPointInMotif = (
  x: number,
  y: number,
  motif: PlacedMotif,
  motifSize: number
): boolean => {
  const adjustedSize = motifSize * motif.size;
  return (
    x >= motif.x &&
    x <= motif.x + adjustedSize &&
    y >= motif.y &&
    y <= motif.y + adjustedSize
  );
};
