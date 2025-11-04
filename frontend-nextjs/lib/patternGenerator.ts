/**
 * Pattern generation and border pattern utilities
 */

import { BORDER_PATTERNS } from './constants';

export type BorderPattern =
  | 'none'
  | 'border-1'
  | 'border-2'
  | 'corner-triangles'
  | 'checkerboard-edges'
  | 'snake-pattern'
  | 'stepped-border'
  | 'checkerboard-2row';

/**
 * Border pattern definitions with their properties
 */
export const BORDER_PATTERN_DEFINITIONS = {
  [BORDER_PATTERNS.NONE]: {
    name: 'None',
    rows: 0,
    description: 'No border',
  },
  [BORDER_PATTERNS.SIMPLE]: {
    name: 'Simple border',
    rows: 1,
    description: 'Single row border',
  },
  [BORDER_PATTERNS.DOUBLE]: {
    name: 'Double border',
    rows: 2,
    description: 'Two row border',
  },
  [BORDER_PATTERNS.CORNER_TRIANGLES]: {
    name: 'Corner triangles',
    rows: 1,
    description: 'Triangles in corners',
  },
  [BORDER_PATTERNS.CHECKERBOARD]: {
    name: 'Checkerboard',
    rows: 1,
    description: 'Checkerboard pattern',
  },
  [BORDER_PATTERNS.SNAKE]: {
    name: 'Snake pattern',
    rows: 2,
    description: 'Snake/zigzag pattern',
  },
  [BORDER_PATTERNS.STEPPED]: {
    name: 'Stepped border',
    rows: 2,
    description: 'Stepped/stair pattern',
  },
  [BORDER_PATTERNS.CHECKERBOARD_2ROW]: {
    name: 'Checkerboard 2-row',
    rows: 2,
    description: 'Two-row checkerboard',
  },
} as const;

/**
 * Get border pattern rows count
 * @param pattern - Border pattern type
 * @returns Number of rows for this pattern
 */
export const getBorderPatternRows = (pattern: BorderPattern): number => {
  return BORDER_PATTERN_DEFINITIONS[pattern]?.rows ?? 0;
};

/**
 * Get border pattern display name
 * @param pattern - Border pattern type
 * @returns Display name
 */
export const getBorderPatternName = (pattern: BorderPattern): string => {
  return BORDER_PATTERN_DEFINITIONS[pattern]?.name ?? 'Unknown';
};

/**
 * Validate border pattern
 * @param pattern - Pattern to validate
 * @returns Whether pattern is valid
 */
export const isValidBorderPattern = (pattern: any): pattern is BorderPattern => {
  return Object.values(BORDER_PATTERNS).includes(pattern);
};

/**
 * Generate filled cells for a simple border pattern
 * @param width - Grid width in cells
 * @param height - Grid height in cells
 * @param pattern - Border pattern type
 * @returns Map of filled cell keys
 */
export const generateBorderPattern = (
  width: number,
  height: number,
  pattern: BorderPattern
): Map<string, string> => {
  const filledCells = new Map<string, string>();

  if (pattern === BORDER_PATTERNS.NONE) {
    return filledCells;
  }

  const rows = getBorderPatternRows(pattern);

  // Add top and bottom borders
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < width; col++) {
      // Top border
      filledCells.set(`${row}-${col}`, 'black');
      // Bottom border
      filledCells.set(`${height - 1 - row}-${col}`, 'black');
    }
  }

  // Add left and right borders
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < rows; col++) {
      // Left border
      filledCells.set(`${row}-${col}`, 'black');
      // Right border
      filledCells.set(`${row}-${width - 1 - col}`, 'black');
    }
  }

  return filledCells;
};

/**
 * Get all available border patterns
 * @returns Array of pattern keys
 */
export const getAvailableBorderPatterns = (): BorderPattern[] => {
  return Object.keys(BORDER_PATTERN_DEFINITIONS) as BorderPattern[];
};

/**
 * Check if grid has any pattern
 * @param grid - Grid data (Map of filled cells)
 * @returns Whether grid has any filled cells
 */
export const hasPattern = (grid: Map<string, string>): boolean => {
  return grid.size > 0;
};

/**
 * Clear all patterns from a grid
 * @param grid - Grid to clear
 * @returns New empty grid
 */
export const clearAllPatterns = (): Map<string, string> => {
  return new Map<string, string>();
};

/**
 * Merge two patterns (overlay pattern)
 * @param basePattern - Base pattern
 * @param overlayPattern - Pattern to overlay
 * @returns Merged pattern
 */
export const mergePatterns = (
  basePattern: Map<string, string>,
  overlayPattern: Map<string, string>
): Map<string, string> => {
  const merged = new Map(basePattern);
  overlayPattern.forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
};
