# Data Model: Crochet Tote Bag Design Tool

**Date**: 2025-09-23
**Purpose**: Define core entities and their relationships based on feature requirements

## Core Entities

### Project
Represents a complete tote bag design session with all configuration and design data.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `name`: string - User-assigned project name
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last modification timestamp
- `dimensions`: Dimensions - Bag size configuration
- `grid`: Grid - Design canvas state
- `motifs`: PlacedMotif[] - Array of motifs placed on grid
- `pattern`: Pattern | null - Generated crochet pattern (null until generated)
- `yarnCalculation`: YarnCalculation | null - Material requirements (null until calculated)
- `settings`: ProjectSettings - User preferences and toggles

**Relationships**:
- Has one Grid (embedded)
- Has many PlacedMotifs (embedded array)
- Has zero or one Pattern (computed)
- Has zero or one YarnCalculation (computed)

**Validation Rules**:
- name: Required, 1-100 characters
- dimensions.width: Required, 20-200 cm
- dimensions.height: Required, 20-200 cm
- motifs: Cannot exceed grid boundaries
- Unique motif IDs within project

### Dimensions
Represents the physical size of the tote bag to be created.

**Fields**:
- `width`: number - Width in centimeters (20-200)
- `height`: number - Height in centimeters (20-200)

**Validation Rules**:
- width: Integer, min 20, max 200
- height: Integer, min 20, max 200
- Both dimensions required for grid generation

### Grid
Represents the design canvas where each cell corresponds to 1cm x 1cm of the physical bag.

**Fields**:
- `width`: number - Number of columns (derived from dimensions.width)
- `height`: number - Number of rows (derived from dimensions.height)
- `cells`: GridCell[][] - 2D array representing grid state
- `scale`: number - Display scale factor for UI (1.0 = actual size)

**Relationships**:
- Belongs to one Project
- Contains many GridCells (2D array)

**State Transitions**:
- Empty → Populated (when motifs placed)
- Populated → Pattern Ready (when all motifs positioned)

### GridCell
Represents a single 1cm x 1cm cell in the design grid.

**Fields**:
- `x`: number - Column position (0-based)
- `y`: number - Row position (0-based)
- `state`: CellState - Visual state ("empty" | "filled" | "motif")
- `motifId`: string | null - Reference to motif if cell is part of motif
- `color`: string - Display color for UI ("#ffffff" for empty, "#000000" for filled)

**Validation Rules**:
- x: Non-negative integer, < grid.width
- y: Non-negative integer, < grid.height
- motifId: Must reference existing motif if not null
- color: Valid hex color code

### Motif
Represents a pre-defined decorative element that can be placed on the grid.

**Fields**:
- `id`: string - Unique identifier
- `name`: string - Display name (e.g., "Rose", "Bird", "Letter A")
- `category`: MotifCategory - Classification ("flower" | "bird" | "letter" | "geometric")
- `pattern`: boolean[][] - 2D array defining filled/empty cells
- `width`: number - Pattern width in cells
- `height`: number - Pattern height in cells
- `previewImage`: string - Base64 or URL for thumbnail display

**Validation Rules**:
- name: Required, 1-50 characters
- pattern: Required, non-empty 2D array
- width/height: Must match pattern dimensions
- previewImage: Valid image format

### PlacedMotif
Represents a motif instance positioned on the grid.

**Fields**:
- `id`: string (UUID) - Unique placement identifier
- `motifId`: string - Reference to source motif definition
- `x`: number - Left position on grid (0-based)
- `y`: number - Top position on grid (0-based)
- `placedAt`: Date - Placement timestamp
- `rotation`: number - Rotation in degrees (0, 90, 180, 270)
- `flipped`: boolean - Whether horizontally flipped

**Relationships**:
- Belongs to one Project
- References one Motif (by motifId)

**Validation Rules**:
- x + motif.width ≤ grid.width (no overflow)
- y + motif.height ≤ grid.height (no overflow)
- rotation: Must be 0, 90, 180, or 270
- motifId: Must reference existing motif

### Pattern
Represents the generated crochet pattern with instructions and visual chart.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `chart`: PatternChart - Visual grid showing filled/open stitches
- `instructions`: string[] - Row-by-row crochet instructions
- `stitchCount`: StitchCount - Total stitch calculations
- `generatedAt`: Date - Generation timestamp
- `version`: number - Pattern version (for regeneration tracking)

**Relationships**:
- Belongs to one Project
- Has one PatternChart (embedded)
- Has one StitchCount (embedded)

### PatternChart
Visual representation of the crochet pattern showing filled and open stitches.

**Fields**:
- `rows`: PatternRow[] - Array of pattern rows
- `legend`: ChartLegend - Symbol definitions
- `stitchInterpretation`: StitchInterpretation - How black/white maps to stitches

**Validation Rules**:
- rows: Length must equal grid.height
- Each row length must equal grid.width

### PatternRow
Single row in the crochet pattern chart.

**Fields**:
- `rowNumber`: number - 1-based row number
- `stitches`: StitchType[] - Array of stitch types for this row
- `direction`: Direction - Reading direction ("left-to-right" | "right-to-left")

### YarnCalculation
Material requirements calculation based on pattern complexity.

**Fields**:
- `totalStitches`: number - Count of all stitches in pattern
- `yarnLength`: number - Total yarn needed in centimeters
- `skeinsNeeded`: number - Number of skeins required (rounded up)
- `calculatedAt`: Date - Calculation timestamp
- `formula`: CalculationFormula - Formula parameters used

**Relationships**:
- Belongs to one Project

**Calculation Rules**:
- 1 stitch = 4cm of yarn (from requirements)
- 1 skein = 75 meters = 7500cm
- skeinsNeeded = Math.ceil(totalStitches * 4 / 7500)

### ProjectSettings
User preferences and configuration toggles.

**Fields**:
- `stitchInterpretation`: StitchInterpretation - How to interpret black squares
- `showGrid`: boolean - Whether to display grid lines
- `snapToGrid`: boolean - Whether motifs snap to grid positions
- `autoSave`: boolean - Whether to auto-save changes
- `exportFormat`: ExportFormat - Preferred export format

## Enums

### CellState
- `empty` - No motif, displays as white/background
- `filled` - Part of motif, displays as black/foreground
- `motif` - Occupied by motif (synonym for filled)

### MotifCategory
- `flower` - Floral patterns (roses, daisies, etc.)
- `bird` - Bird silhouettes and shapes
- `letter` - Alphabet characters A-Z
- `geometric` - Abstract shapes and patterns

### StitchType
- `open` - Open mesh stitch (chain + double crochet)
- `filled` - Solid stitch (double crochet)

### StitchInterpretation
- `black_filled` - Black squares = filled stitches, white = open
- `black_open` - Black squares = open stitches, white = filled

### Direction
- `left-to-right` - Read pattern from left to right
- `right-to-left` - Read pattern from right to left

### ExportFormat
- `pdf` - PDF document
- `png` - Image file
- `json` - Project file for sharing

## Derived Calculations

### Grid Size
```typescript
grid.width = dimensions.width  // 1:1 mapping (1cm = 1 cell)
grid.height = dimensions.height
```

### Stitch Count
```typescript
totalStitches = grid.width * grid.height  // Every cell is a stitch
filledStitches = count(cells where state === "filled")
openStitches = totalStitches - filledStitches
```

### Yarn Requirements
```typescript
yarnLength = totalStitches * 4  // 4cm per stitch
skeinsNeeded = Math.ceil(yarnLength / 7500)  // 7500cm per skein
```

## State Management Structure

### Zustand Store Schema
```typescript
interface CrochetDesignStore {
  // Current project state
  currentProject: Project | null

  // Available motifs library
  motifLibrary: Motif[]

  // UI state
  selectedMotif: Motif | null
  isGeneratingPattern: boolean
  isExporting: boolean

  // Actions
  createProject: (dimensions: Dimensions) => void
  loadProject: (project: Project) => void
  placeMotif: (motif: Motif, position: {x: number, y: number}) => void
  generatePattern: () => Promise<Pattern>
  calculateYarn: () => YarnCalculation
  exportProject: (format: ExportFormat) => Promise<Blob>
}
```

## Persistence Strategy

### Browser Storage
- **localStorage**: Project metadata and settings
- **IndexedDB**: Project data with motif placements (for larger data)
- **sessionStorage**: Temporary UI state (selected motifs, etc.)

### Data Serialization
- Projects serialized as JSON for export/import
- Image assets (motif previews) stored as Base64 in project files
- Automatic save every 30 seconds during active editing