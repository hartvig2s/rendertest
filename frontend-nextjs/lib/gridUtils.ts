/**
 * Grid calculation and manipulation utilities
 */

/**
 * Convert grid cell dimensions to actual centimeters
 * Based on filet crochet standard: 10 squares = 10cm width, 9cm height
 */
export const GRID_CELL_SIZE = {
  WIDTH_CM_PER_CELL: 1, // 1cm per cell width (10 cells = 10cm)
  HEIGHT_CM_PER_CELL: 0.9, // 0.9cm per cell height (10 cells = 9cm)
} as const;

/**
 * Calculate grid cell position from coordinates
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param cellSize - Size of each cell in pixels
 * @returns Row and column indices
 */
export const getCellFromCoordinates = (
  x: number,
  y: number,
  cellSize: number
): { row: number; col: number } => {
  return {
    row: Math.floor(y / cellSize),
    col: Math.floor(x / cellSize),
  };
};

/**
 * Convert cell coordinates to string key for Map storage
 * @param row - Row index
 * @param col - Column index
 * @returns String key like "0-0"
 */
export const cellKey = (row: number, col: number): string => `${row}-${col}`;

/**
 * Parse cell key back to coordinates
 * @param key - String key like "0-0"
 * @returns Row and column indices
 */
export const parseCellKey = (key: string): { row: number; col: number } => {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
};

/**
 * Calculate actual grid dimensions from stitch counts
 * @param stitchWidth - Number of stitches/cells in width
 * @param stitchHeight - Number of stitches/cells in height
 * @returns Dimensions in centimeters
 */
export const getGridDimensionsFromStitches = (
  stitchWidth: number,
  stitchHeight: number
): { widthCm: number; heightCm: number } => {
  return {
    widthCm: stitchWidth * GRID_CELL_SIZE.WIDTH_CM_PER_CELL,
    heightCm: stitchHeight * GRID_CELL_SIZE.HEIGHT_CM_PER_CELL,
  };
};

/**
 * Validate grid dimensions
 * @param width - Width in centimeters
 * @param height - Height in centimeters
 * @param minWidth - Minimum allowed width
 * @param maxWidth - Maximum allowed width
 * @param minHeight - Minimum allowed height
 * @param maxHeight - Maximum allowed height
 * @returns Validation result
 */
export const validateGridDimensions = (
  width: number,
  height: number,
  minWidth: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number
): { isValid: boolean; error?: string } => {
  if (width < minWidth || width > maxWidth) {
    return {
      isValid: false,
      error: `Width must be between ${minWidth} and ${maxWidth} cm`,
    };
  }
  if (height < minHeight || height > maxHeight) {
    return {
      isValid: false,
      error: `Height must be between ${minHeight} and ${maxHeight} cm`,
    };
  }
  return { isValid: true };
};

/**
 * Calculate number of cells from dimensions
 * @param widthCm - Width in centimeters
 * @param heightCm - Height in centimeters
 * @returns Number of cells horizontally and vertically
 */
export const getCellCount = (widthCm: number, heightCm: number): { width: number; height: number } => {
  return {
    width: Math.round(widthCm / GRID_CELL_SIZE.WIDTH_CM_PER_CELL),
    height: Math.round(heightCm / GRID_CELL_SIZE.HEIGHT_CM_PER_CELL),
  };
};

/**
 * Check if a coordinate is within grid bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param gridWidth - Grid width in pixels
 * @param gridHeight - Grid height in pixels
 * @returns Whether coordinate is in bounds
 */
export const isWithinGridBounds = (
  x: number,
  y: number,
  gridWidth: number,
  gridHeight: number
): boolean => {
  return x >= 0 && x <= gridWidth && y >= 0 && y <= gridHeight;
};
