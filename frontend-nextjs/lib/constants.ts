/**
 * Application-wide constants for the crochet design tool
 */

// Panel dimensions
export const PANEL_WIDTHS = {
  LEFT_PANEL: 300,
  RIGHT_PANEL: 300,
} as const;

// Grid zoom defaults
export const GRID_ZOOM = {
  DEFAULT: 1.0,
  INITIAL_PINCH: 1.25,
} as const;

// Motif sizing
export const MOTIF_SIZING = {
  MAX_SIZE: 1.2, // Maximum size is 120% (1.2)
  MIN_SIZE: 0.1,
  DEFAULT_SIZE: 1.0,
  SIZE_STEP: 0.05,
} as const;

// Yarn calculation
export const YARN_CALCULATION = {
  CONSUMPTION_RATE_TETT: 0.209, // g/cm² for filled grid
  CONSUMPTION_RATE_ÅPENT: 0.194, // g/cm² for open grid
  SKEIN_WEIGHT: 50, // grams per skein
} as const;

// Threshold for motif conversion
export const MOTIF_THRESHOLD = {
  MIN: 0,
  MAX: 230,
  DEFAULT: 128,
  STEP: 5,
} as const;

// History/undo-redo
export const HISTORY = {
  MAX_STATES: 50,
} as const;

// Grid dimensions defaults
export const GRID_DEFAULTS = {
  DEFAULT_WIDTH: 30, // cm
  DEFAULT_HEIGHT: 35, // cm
  MIN_WIDTH: 8, // cm
  MAX_WIDTH: 200, // cm
  MIN_HEIGHT: 7.2, // cm
  MAX_HEIGHT: 180, // cm
} as const;

// Stitch interpretation modes
export const STITCH_MODES = {
  BLACK_FILLED: 'black_filled',
  BLACK_OPEN: 'black_open',
} as const;

// Grid types
export const GRID_TYPES = {
  ÅPENT: 'åpent',
  TETT: 'tett',
} as const;

// Edge/border patterns
export const BORDER_PATTERNS = {
  NONE: 'none',
  SIMPLE: 'border-1',
  DOUBLE: 'border-2',
  CORNER_TRIANGLES: 'corner-triangles',
  CHECKERBOARD: 'checkerboard-edges',
  SNAKE: 'snake-pattern',
  STEPPED: 'stepped-border',
  CHECKERBOARD_2ROW: 'checkerboard-2row',
} as const;

export const DEFAULT_BORDER_PATTERN = BORDER_PATTERNS.SIMPLE;

// Fill colors
export const FILL_COLORS = {
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
} as const;

export const DEFAULT_FILL_COLOR = FILL_COLORS.RED;

// Fill modes
export const FILL_MODES = {
  FILL: 'fill',
  CLEAR: 'clear',
} as const;

// Sides
export const SIDES = {
  FRONT: 'front',
  BACK: 'back',
} as const;

// Long press duration for mobile
export const MOBILE = {
  LONG_PRESS_DURATION: 500, // ms
} as const;

// Canvas rendering
export const CANVAS = {
  GRID_CELL_GAP: 0.5, // px gap between filled cells for easier counting
  MARGIN_FOR_NUMBERING: 50, // px margin for row/column numbering
  DPI: 300, // DPI for exported images
} as const;

// PDF export
export const PDF = {
  PAGE_WIDTH: 210, // mm (A4)
  PAGE_HEIGHT: 297, // mm (A4)
  MARGIN: 20, // mm
} as const;

// Text motif defaults
export const TEXT_MOTIF = {
  MAX_LENGTH: 50,
  DEFAULT_FONT_SIZE: 24,
} as const;

// Motif categories
export const MOTIF_CATEGORIES = {
  ALL: 'all',
  FLOWERS: 'flowers',
  SEA: 'sea',
  BIRDS: 'birds',
  SPORT: 'sport',
  OTHER: 'other',
  TEXT: 'text',
} as const;

// Resize debounce
export const DEBOUNCE = {
  RESIZE: 300, // ms
  AUTO_SAVE: 1000, // ms
} as const;
