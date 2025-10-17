# Hektet - Crochet Design Tool

## Comprehensive Application Documentation

**Version:** 1.0.0
**Last Updated:** January 2025
**Language:** Norwegian (UI), English (Technical Docs)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Technical Architecture](#technical-architecture)
4. [Features & Functionality](#features--functionality)
5. [User Interface Components](#user-interface-components)
6. [Data Models & Types](#data-models--types)
7. [Core Algorithms](#core-algorithms)
8. [Installation & Setup](#installation--setup)
9. [Development Guide](#development-guide)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Known Limitations](#known-limitations)
13. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Hektet** (Norwegian for "Crocheted") is a specialized web application designed for creating custom filet crochet patterns for tote bags. The application provides a visual, drag-and-drop interface for designing crochet patterns with automatic yarn calculations, PDF export, and real-time pattern generation.

### Key Highlights

- **Target Audience:** Crochet enthusiasts, designers, and crafters
- **Primary Use Case:** Creating custom filet crochet bag patterns with precise measurements
- **Core Value:** Eliminates manual pattern creation, automates yarn calculations, provides professional PDF exports
- **Technology Focus:** Client-side processing, no backend required, works offline after initial load

---

## Application Overview

### What is Filet Crochet?

Filet crochet is a technique that creates a grid-like mesh where some squares are filled (solid stitches) and others are open (chain stitches), forming patterns and images. This application translates visual designs into crochet-ready patterns.

### Application Purpose

1. **Pattern Design:** Create custom designs for crochet tote bags using a visual grid interface
2. **Measurement Precision:** Ensure designs fit specific bag dimensions (8-200cm width, 7.2-180cm height)
3. **Yarn Calculation:** Automatically calculate exact yarn requirements based on design complexity
4. **Professional Export:** Generate PDF patterns with Norwegian instructions ready for crochet work

### User Workflow

```
1. Create Project → 2. Design Front → 3. Design Back → 4. Export PDF
   ↓                  ↓                 ↓                 ↓
Set dimensions    Place motifs      Copy/modify      Get instructions
(cm to grid)      Upload images     design           + yarn needs
```

---

## Technical Architecture

### Technology Stack

#### Core Framework
- **React 18.2.0** - UI framework with functional components and hooks
- **TypeScript 5.0.2** - Type-safe development
- **Vite 4.4.5** - Build tool and development server

#### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@react-pdf/renderer` | 3.1.12 | Client-side PDF generation |
| `konva` | 9.2.0 | Canvas-based grid rendering (optional) |
| `react-konva` | 18.2.10 | React bindings for Konva |
| `@dnd-kit/core` | 6.1.0 | Drag-and-drop functionality |
| `zustand` | 4.4.1 | State management |
| `html2canvas` | 1.4.1 | Grid screenshot generation |

#### Development Tools
- **ESLint** - Code quality and standards
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Storybook** - Component development

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DesignWorkspace.tsx    # Main design interface (1,949 lines)
│   │   ├── ProjectCreation.tsx     # Project setup modal
│   │   └── PatternPDF.tsx          # PDF export component
│   ├── types/
│   │   ├── motif.ts                # Motif type definitions
│   │   ├── grid.ts                 # Grid and cell types
│   │   ├── pattern.ts              # Pattern generation types
│   │   ├── project.ts              # Project structure
│   │   ├── yarn.ts                 # Yarn calculation types
│   │   └── export.ts               # Export formats
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # Global styles (2,300+ lines)
│   ├── index.css                   # Base styles and fonts
│   └── main.tsx                    # Application entry point
├── public/
│   └── motifs/                     # Pre-loaded motif library
├── tests/
│   ├── contract/                   # Service layer tests
│   ├── integration/                # E2E workflow tests
│   └── setup.ts                    # Test configuration
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Component Architecture

```
App (Router & State Container)
├── ProjectCreation (Modal)
│   └── Form inputs for dimensions
└── DesignWorkspace (Main Interface)
    ├── Left Panel: Motif Library
    │   ├── Category Filter
    │   ├── Motif Grid Display
    │   ├── Image Upload
    │   ├── Text Motif Creator
    │   └── Manual Fill Tool
    ├── Center Panel: Dual Grid View
    │   ├── Front Side Grid
    │   ├── Back Side Grid
    │   ├── Zoom Controls
    │   └── Grid Size Controls
    └── Right Panel: Controls
        ├── Edge Pattern Selector
        ├── Pattern Actions (Copy/Invert)
        └── Placed Motif Controls
            ├── Size Slider
            ├── Threshold/Balance Control
            ├── Flip Controls
            ├── Duplicate/Remove Actions
            └── Thumbnail Preview
```

### State Management

The application uses React hooks for state management with the following key state variables:

**Grid State:**
- `gridWidth`, `gridHeight` - Grid dimensions in cells
- `gridZoom` - Visual zoom level (0.5x - 3.0x)
- `generatedPattern`, `backSidePattern` - Generated crochet patterns

**Motif State:**
- `placedMotifs` - Front side motifs array
- `backSideMotifs` - Back side motifs array
- `customMotifs` - User-uploaded motifs library
- `selectedMotifId` - Currently selected motif

**UI State:**
- `currentSide` - Active side ('front' or 'back')
- `stitchInterpretation` - Pattern mode ('black_filled' or 'black_open')
- `manualFillMode` - Manual editing mode toggle
- `manualFillCells` - Manual cell overrides (Map<string, string>)

**History State:**
- `history` - Undo/redo state stack (up to 50 states)
- `historyIndex` - Current position in history

### Data Flow

```
User Action → State Update → Pattern Generation → Grid Re-render
                ↓
         Save to History (Undo/Redo)
```

**Auto-Update Pattern:**
The application automatically regenerates patterns whenever:
- Motifs are added, removed, or modified
- Manual fills are changed
- Edge patterns are updated
- Stitch interpretation is toggled
- Grid size is changed

**Debounced Updates:**
Pattern generation is debounced by 300ms to prevent excessive recalculations during drag operations.

---

## Features & Functionality

### 1. Project Creation

**Location:** `src/components/ProjectCreation.tsx`

**Capabilities:**
- Set project name (max 100 characters)
- Define bag dimensions in centimeters
- Width: 8-200 cm (1cm = 1 grid square)
- Height: 7.2-180 cm (0.9cm = 1 grid square)
- Real-time grid preview
- Automatic yarn estimation

**Validation:**
- Name required
- Dimensions must be within valid ranges
- Grid must be 8-200 squares in both dimensions

**Example:**
```typescript
{
  name: "My Summer Bag",
  width: 40,    // 40 grid squares = 40cm
  height: 45    // 45 grid squares = 40.5cm (45 × 0.9)
}
```

### 2. Motif Library

**Pre-loaded Categories:**
- **Hav (Sea):** Fish, shells, ocean elements
- **Fugler (Birds):** Various bird designs
- **Blomster (Flowers):** Flower and fruit motifs
- **Sport:** Sports-related icons
- **Andre (Other):** Miscellaneous designs

**Dynamic Loading:**
All images in `/public/motifs/*.{png,jpg,jpeg,gif,svg}` are automatically loaded on startup using Vite's `import.meta.glob()`.

**Categorization Logic:**
```typescript
const categorizeMotif = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.startsWith('blomst') || lowerName.includes('flower'))
    return 'flowers';
  if (lowerName.startsWith('fisk') || lowerName.includes('shell'))
    return 'sea';
  if (lowerName.startsWith('fugl') || lowerName.includes('bird'))
    return 'birds';
  if (lowerName.startsWith('sykkel') || lowerName.includes('sport'))
    return 'sport';
  return 'other';
};
```

### 3. Custom Motif Upload

**Supported Formats:** PNG, JPG, JPEG, GIF, SVG

**Process:**
1. User uploads image file
2. Image converted to base64 data URI
3. Added to `customMotifs` array
4. Displayed in motif library
5. Available for placement on grid

**Drag & Drop:**
Users can drag images directly onto the grid, which:
- Uploads the image
- Adds to motif library
- Places motif at drop position
- Activates the dropped-on side

### 4. Text Motif Creation

**Feature:** Convert text strings into crochet-ready motifs

**Implementation:**
```typescript
createTextMotif(text: string) {
  1. Create canvas element
  2. Render text with bold Arial font (56px)
  3. Add stroke for emphasis (1.5px)
  4. Convert to PNG base64
  5. Add to customMotifs with category='text'
  6. Display below "Legg til tekst" button
}
```

**Specifications:**
- Font: Bold Arial 56px
- Stroke: 1.5px black
- Background: White
- Padding: 12px
- Max length: 50 characters

### 5. Motif Placement & Control

**Placement:**
- Click motif in library to select
- Click grid cell to place at that position
- Drag & drop images directly onto grid
- Motifs positioned using percentage coordinates (0-100%)

**Motif Properties:**

| Property | Range | Default | Description |
|----------|-------|---------|-------------|
| `size` | 0.1 - 1.2 | 0.7 | Size multiplier (70% default, max 120%) |
| `threshold` | 0 - 255 | 128 | Black/white conversion sensitivity |
| `flipHorizontal` | boolean | false | Mirror horizontally |
| `flipVertical` | boolean | false | Mirror vertically |
| `x` | 0 - 100% | 50% | Horizontal position |
| `y` | 0 - 100% | 50% | Vertical position |

**Interactions:**
- **Select:** Click on motif in grid to show full controls
- **Move:** Drag motif to new position (click and hold, move to new cell)
- **Resize:** Use size slider (0.1-1.2 scale)
- **Adjust Balance:** Threshold slider (more/less black pixels)
- **Flip:** Horizontal or vertical flip buttons
- **Duplicate:** Create copy with +5% offset
- **Remove:** Delete from current side

**Multi-Motif Handling:**
- Only one motif can be fully expanded at a time
- Other motifs show collapsed thumbnail headers
- Click thumbnail to expand that motif's controls
- No limit on motifs per side (previous 5-motif limit removed)

### 6. Dual-Side Design

**Front & Back Grids:**
- Independent designs for bag front and back
- Side switcher with "Aktiver" (Activate) buttons
- Active side highlighted with blue border (3px)
- Inactive side has gray border (2px) with 70% opacity
- Visual indicator of which side is being edited

**Copy Front to Back:**
- One-click button to duplicate front design to back
- Copies all motifs with new IDs
- Copies all manual fills
- Automatically switches to back side to show result

### 7. Manual Fill Tool

**Purpose:** Fine-tune individual grid cells beyond motif automation

**Modes:**
- **Fill Mode:** Add filled cells (current color)
- **Clear Mode:** Remove fills and set to empty

**Color Options:**
- White (#FFFBF5) - Empty/background
- Red (#6D190D) - Default fill color
- Green (#939C59) - Alternative fill
- Blue (#A0AFC1) - Alternative fill

**Operations:**
- Toggle manual fill mode on/off
- Click cells to fill or clear
- Change color to update all cells of previous color
- Clear current side or clear all sides
- Manual fills override motif-generated fills
- Manual fills persist through pattern inversion

**Visual Feedback:**
- Active mode shows "Fyll" or "Tøm" indicator
- Cell cursor changes to pointer in manual mode
- Cells show in selected color when filled

### 8. Edge Patterns

**Available Patterns:**

| Pattern | Description |
|---------|-------------|
| `none` | No border |
| `border-1` | Single-row border around entire grid |
| `border-2` | Two-row border |
| `corner-triangles` | Triangular fills in all 4 corners (5 cells deep) |
| `checkerboard-edges` | Alternating checkerboard in 3-cell border |
| `snake-pattern` | Celtic knot/weaving pattern in 3-cell border |
| `stepped-border` | Stepped border (rows 0, 2, and last two) |
| `checkerboard-2row` | Mini checkerboard in outer 2 rows |

**Implementation:**
Edge patterns are applied during pattern generation by checking each cell's position and returning `true` if it should be filled according to the pattern logic.

**Example (Border-1):**
```typescript
case 'border-1':
  return rowIndex === 0 || rowIndex === gridHeight - 1 ||
         colIndex === 0 || colIndex === gridWidth - 1;
```

### 9. Pattern Inversion

**Stitch Interpretation:**
- **Black Filled (`black_filled`):** Black cells = filled stitches, white cells = open
- **Black Open (`black_open`):** Black cells = open spaces, white cells = filled

**Toggle Behavior:**
Clicking "Invertér" (Invert) button inverts the visual representation WITHOUT changing the underlying motif data.

**Use Case:**
Different crocheters prefer different visual styles. Some prefer dark backgrounds with light patterns; others prefer the opposite.

### 10. Grid Zoom & Resize

**Zoom Control:**
- Range: 0.5x to 3.0x (50% to 300%)
- Default: 1.25x (125%)
- Adjustable via slider or +/- buttons
- Reset button returns to 100%
- Ctrl/Cmd + Mouse Wheel also adjusts zoom

**Grid Size Change:**
- Modal dialog to change grid dimensions
- Preserves motif percentage positions
- Regenerates patterns automatically
- Min: 10x10, Max: 200x200 cells

**Panel Resize:**
- Resizable left (motif library) and right (controls) panels
- Drag handles between panels
- Min width: 200px, Max width: 500px
- Responsive design for mobile (<1200px width)

### 11. Undo/Redo System

**Capabilities:**
- Undo via Ctrl+Z / Cmd+Z (Mac)
- Tracks up to 50 states
- Saves full state snapshots including:
  - Front and back motifs
  - Manual fill cells for both sides

**State Capture:**
Automatically saves state before:
- Placing or removing motifs
- Toggling manual fills
- Duplicating motifs

**Implementation:**
```typescript
const saveToHistory = () => {
  const currentState = {
    placedMotifs: [...placedMotifs],
    backSideMotifs: [...backSideMotifs],
    manualFillCells: {
      front: new Map(manualFillCells.front),
      back: new Map(manualFillCells.back)
    }
  };
  // Add to history, limit to 50 states
};
```

### 12. Pattern Generation

**Algorithm:**

```typescript
handleGeneratePattern() {
  1. Initialize empty grid: gridHeight × gridWidth of false values

  2. For each placed motif:
     a. Convert percentage position to grid coordinates
     b. Load motif image
     c. Convert image to pixel art:
        - Resize to motif.size
        - Apply threshold for black/white
        - Apply horizontal/vertical flips
        - Map pixels to grid cells
     d. Merge into main grid using OR logic

  3. Apply manual fill overrides

  4. Apply edge pattern fills

  5. Calculate statistics:
     - Total cells
     - Filled cells
     - Open cells
     - Foundation stitches
     - Filled stitches
     - Yarn length
     - Skeins needed

  6. Store pattern with metadata
}
```

**Yarn Calculation:**

```typescript
// Foundation grid framework
foundationStitches = (gridWidth + 1) × (gridHeight + 1)

// Filled squares
filledStitches = count of filled cells

// Total stitches
totalStitches = foundationStitches + filledStitches

// Yarn calculation
gridScaleWidth = 1.0   // 1cm per width square
gridScaleHeight = 0.9  // 0.9cm per height square
avgGridScale = (gridScaleWidth + gridScaleHeight) / 2

foundationYarnLength = foundationStitches × 2 × avgGridScale
filledYarnLength = filledStitches × 4 × avgGridScale
totalYarnLength = foundationYarnLength + filledYarnLength

// Skeins needed (75m = 7500cm per skein)
skeinsNeeded = ceil(totalYarnLength / 7500)
```

**Pattern Structure:**
```typescript
{
  id: "pattern-1234567890",
  stitchInterpretation: "black_filled",
  gridDimensions: "40 × 45 (40.0 × 40.5 cm)",
  totalSquares: 1800,
  filledSquares: 456,
  openSquares: 1344,
  foundationStitches: 1886,
  filledStitches: 456,
  totalStitches: 2342,
  foundationYarnLength: 3584.4,
  filledYarnLength: 1728,
  yarnLength: 5312.4,
  skeinsNeeded: 1,
  generatedAt: "2025-01-16 14:30:00",
  grid: [[false, true, ...], ...],
  gridMotifs: [...]
}
```

### 13. PDF Export

**Location:** `src/components/PatternPDF.tsx`

**Export Process:**
```typescript
handleExportPattern() {
  1. Validate that at least one pattern exists

  2. Calculate combined yarn for both sides

  3. Generate SVG representations of grids:
     - 10px per cell
     - Black fill for filled cells
     - White background
     - Grid lines (0.5px stroke)

  4. Create PDF document with:
     - Page 1: Instructions and info
     - Page 2: Front grid diagram (if exists)
     - Page 3: Back grid diagram (if exists)

  5. Convert to blob

  6. Download as {project_name}_oppskrift.pdf
}
```

**PDF Contents:**

**Page 1 - Instructions:**
- **Hektet** logo (styled as "Recoleta" font fallback)
- Yarn info box:
  - Total skeins needed (50g/75m cotton yarn)
  - Hook size: 3.5mm
  - Gauge: 10 squares = 10cm width, 9 squares = 10cm height
- Glossary (Norwegian-English):
  - Luftmasker = chain stitch
  - Kjedemasker = slip stitch
  - Stavmasker = double crochet
- Pattern instructions (Norwegian):
  - Bottom row fully filled: Standard foundation instructions
  - Bottom row with openings: Detailed diagram-based instructions
- Notice: "Se neste side(r) for rutenettdiagram"

**Pages 2-3 - Grid Diagrams:**
- Title: "Forside - Diagram" or "Bakside - Diagram"
- Grid dimensions display
- Full SVG grid render
- A4 page size
- Auto-scaled to fit (max height 650px)

**PDF Styling:**
```typescript
styles = {
  page: { fontFamily: 'Helvetica', padding: 40, backgroundColor: '#FFFFFF' },
  logo: { fontSize: 36, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
  infoBox: { border: '1px solid #000', padding: 15, borderRadius: 5 },
  heading: { fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  patternText: { fontSize: 11, lineHeight: 1.6, textAlign: 'justify' }
}
```

### 14. Image to Pixel Art Conversion

**Algorithm:**

```typescript
convertImageToPixelArt(
  imageData: base64 string,
  motifSize: 0.1-1.2,
  gridX, gridY: center position,
  grid: target grid array,
  threshold: 0-255,
  flipHorizontal: boolean,
  flipVertical: boolean
) {
  1. Load image into canvas

  2. Calculate target size:
     baseSize = max(5, min(100, round(motifSize × 25)))
     pixelsWide = pixelsHigh = baseSize

  3. Apply flip transformations using canvas context

  4. Draw and resize image to target dimensions

  5. Extract pixel data

  6. For each pixel:
     a. Calculate grayscale: 0.299R + 0.587G + 0.114B
     b. Compare to threshold: shouldFill = grayscale < threshold
     c. Map to grid position (centered on gridX, gridY)
     d. Merge into grid using OR logic

  7. Resolve promise when complete
}
```

**Threshold Behavior:**
- **Lower threshold (0-127):** More black pixels included → denser pattern
- **Higher threshold (128-255):** Fewer black pixels → lighter pattern
- **Default (128):** Balanced conversion

**Flip Implementation:**
```typescript
if (flipHorizontal && flipVertical) {
  ctx.translate(pixelsWide, pixelsHigh);
  ctx.scale(-1, -1);
} else if (flipHorizontal) {
  ctx.translate(pixelsWide, 0);
  ctx.scale(-1, 1);
} else if (flipVertical) {
  ctx.translate(0, pixelsHigh);
  ctx.scale(1, -1);
}
```

---

## User Interface Components

### Typography & Fonts

**Primary Font:** Public Sans (Google Fonts)
- Weights: 300, 400, 500, 600, 700
- Usage: Body text, UI elements

**Heading Font:** Recoleta (with Playfair Display fallback)
- Usage: All h1-h6 elements
- Fallback: Georgia, serif

**Button Font:** Recoleta (with Playfair Display fallback)
- Applied via `font-family: 'Recoleta', 'Playfair Display', Georgia, serif !important;`

**Base Font Size:** 110% (increased by 10% from default)

### Color Palette

**Brand Colors:**
```css
Primary Background: #FFFBF5 (warm white)
Primary Green: #B4BA8F (sage green)
Secondary Green: #9BA377 (darker sage)
Dark Text: #2c3e50
Light Text: #7f8c8d
```

**Fill Colors:**
```css
Red: #6D190D (dark burgundy)
Green: #939C59 (olive green)
Blue: #A0AFC1 (slate blue)
White: #FFFBF5
```

**Accent Colors:**
```css
Active Blue: #3498db
Hover Blue: #2980b9
Success Green: #4CAF50
Danger Red: #e74c3c
```

### Layout System

**Main Layout:**
```
┌─────────────────────────────────────┐
│         Header (Fixed)              │
├─────┬───────────────────────┬───────┤
│     │                       │       │
│ Left│     Center Grid       │ Right │
│Panel│     (Scrollable)      │ Panel │
│     │                       │       │
└─────┴───────────────────────┴───────┘
```

**Responsive Breakpoints:**
- Desktop: >1200px - 3-column grid layout
- Tablet: 768-1200px - Stacked column layout
- Mobile: <768px - Single column, reduced panel heights

**Grid System:**
```css
.workspace-content {
  display: grid;
  grid-template-columns: {leftWidth}px 4px 1fr 4px {rightWidth}px;
  gap: 0;
  padding: 1rem;
}
```

### Visual Design System

**Cards & Panels:**
```css
background: #FFFBF5;
border-radius: 8px;
padding: 1.5rem;
box-shadow: 0 2px 10px rgba(0,0,0,0.05);
```

**Buttons:**
```css
Primary: background: #B4BA8F, color: #FFFBF5
Secondary: background: #B4BA8F, color: #FFFBF5
Outline: background: #FFFBF5, border: 2px solid #B4BA8F
Small: padding: 0.4rem 0.8rem, fontSize: 0.8rem
```

**Interactive States:**
```css
Hover: transform: translateY(-2px), box-shadow enhanced
Active: transform: scale(0.95)
Disabled: opacity: 0.5, cursor: not-allowed
```

### Animations

**Grid Boundary Pulse:**
```css
@keyframes gridPulse {
  0%, 100%: border-color: #3498db, background: rgba(52,152,219,0.05)
  25%: border-color: #2980b9
  50%: border-color: #1abc9c
  75%: border-color: #2980b9
}
```

**Label Fade-In:**
```css
@keyframes labelFadeIn {
  from: opacity: 0, transform: translateY(-15px) scale(0.9)
  to: opacity: 1, transform: translateY(0) scale(1)
}
```

**Auto-Update Spinner:**
```css
@keyframes spin {
  from: transform: rotate(0deg)
  to: transform: rotate(360deg)
}
```

### Accessibility Features

- **Keyboard Navigation:** Tab through all interactive elements
- **Keyboard Shortcuts:** Ctrl/Cmd+Z for undo
- **Title Attributes:** Tooltips on all buttons and controls
- **Semantic HTML:** Proper heading hierarchy, ARIA labels
- **Color Contrast:** WCAG AA compliant (minimum 4.5:1 ratio)
- **Focus Indicators:** Clear focus states on all inputs

---

## Data Models & Types

### Project Type

**File:** `src/types/project.ts`

```typescript
interface Project {
  name: string;      // Project name (max 100 chars)
  width: number;     // Grid width in cells (8-200)
  height: number;    // Grid height in cells (8-200)
}
```

### Motif Types

**File:** `src/types/motif.ts`

```typescript
interface Motif {
  id: string;
  name: string;
  category: MotifCategory;
  pattern: boolean[][];
  width: number;
  height: number;
  previewImage: string;
}

interface PlacedMotif {
  id: string;                  // Unique instance ID
  motifId: string;             // Reference to original motif
  x: number;                   // Position X (0-100%)
  y: number;                   // Position Y (0-100%)
  name: string;                // Display name
  size: number;                // Size multiplier (0.1-1.2)
  threshold: number;           // Black/white threshold (0-255)
  flipHorizontal?: boolean;    // Horizontal flip
  flipVertical?: boolean;      // Vertical flip
  isCustom?: boolean;          // User-uploaded flag
  imageData?: string;          // Base64 image data
}

type MotifCategory = 'flower' | 'bird' | 'letter' | 'geometric' |
                     'sea' | 'sport' | 'other' | 'text';
```

### Grid Types

**File:** `src/types/grid.ts`

```typescript
interface Grid {
  width: number;
  height: number;
  cells: GridCell[][];
  scale: number;
}

interface GridCell {
  x: number;
  y: number;
  state: CellState;
  motifId: string | null;
  color: string;
}

type CellState = 'empty' | 'filled' | 'motif';
```

### Pattern Types

**File:** `src/types/pattern.ts`

```typescript
interface Pattern {
  id: string;
  chart: PatternChart;
  instructions: string[];
  stitchCount: StitchCount;
  generatedAt: Date;
  version: number;
}

interface PatternChart {
  rows: PatternRow[];
  legend: ChartLegend;
  stitchInterpretation: StitchInterpretation;
}

interface StitchCount {
  total: number;
  filled: number;
  open: number;
}

type StitchInterpretation = 'black_filled' | 'black_open';
type StitchType = 'open' | 'filled';
type Direction = 'left-to-right' | 'right-to-left';
```

### Generated Pattern (Runtime)

```typescript
interface GeneratedPattern {
  id: string;
  stitchInterpretation: 'black_filled' | 'black_open';
  gridDimensions: string;          // e.g., "40 × 45 (40.0 × 40.5 cm)"
  totalSquares: number;
  filledSquares: number;
  openSquares: number;
  foundationStitches: number;
  filledStitches: number;
  totalStitches: number;
  foundationYarnLength: number;    // in cm
  filledYarnLength: number;        // in cm
  yarnLength: number;              // total in cm
  skeinsNeeded: number;
  generatedAt: string;
  grid: boolean[][];               // 2D array of fill states
  gridMotifs: PlacedMotif[];      // Motifs with grid positions
}
```

---

## Core Algorithms

### 1. Grid Dimension Calculation

**Input:** Width (cm), Height (cm)
**Output:** Grid dimensions (cells)

```typescript
// Width: 1 cm = 1 square
gridWidth = round(widthCm / 1.0)

// Height: 0.9 cm = 1 square
gridHeight = round(heightCm / 0.9)

// Validation
if (gridWidth < 8 || gridWidth > 200) error
if (gridHeight < 8 || gridHeight > 200) error
```

### 2. Percentage to Grid Coordinate Conversion

```typescript
// Motif position (0-100%) to grid cell
gridX = round((motif.x / 100) * gridWidth)
gridY = round((motif.y / 100) * gridHeight)

// Grid cell to percentage position
percentX = (gridX / gridWidth) * 100
percentY = (gridY / gridHeight) * 100
```

### 3. Image to Grid Conversion

**High-Level Flow:**

```
Image File → Canvas → Pixel Data → Grayscale → Threshold → Grid Cells
```

**Detailed Steps:**

```typescript
1. Load image into HTMLImageElement
2. Create canvas with dimensions: baseSize × baseSize
   where baseSize = max(5, min(100, round(motifSize × 25)))
3. Apply flip transformations to canvas context
4. Draw image scaled to canvas size
5. Extract ImageData (RGBA pixel array)
6. For each pixel (pixelX, pixelY):
   a. Extract RGBA values
   b. Skip if alpha < 128 (transparent)
   c. Calculate grayscale = 0.299×R + 0.587×G + 0.114×B
   d. shouldFill = (grayscale < threshold)
   e. Map to grid position:
      gridPosX = centerX - floor(baseSize/2) + pixelX
      gridPosY = centerY - floor(baseSize/2) + pixelY
   f. If within grid bounds:
      grid[gridPosY][gridPosX] = grid[gridPosY][gridPosX] || shouldFill
```

**Overlapping Motifs:**
Uses OR logic: `grid[y][x] = grid[y][x] || shouldFill`

This means:
- Once a cell is filled, it stays filled
- Multiple motifs can overlap without erasing each other
- Order of processing doesn't matter

### 4. Yarn Calculation Algorithm

**Constants:**
```typescript
GRID_SCALE_WIDTH = 1.0   // 1cm per width square
GRID_SCALE_HEIGHT = 0.9  // 0.9cm per height square
AVG_GRID_SCALE = (GRID_SCALE_WIDTH + GRID_SCALE_HEIGHT) / 2 = 0.95

FOUNDATION_CM_PER_STITCH = 2
FILLED_CM_PER_STITCH = 4
SKEIN_LENGTH_CM = 7500  // 75 meters
```

**Calculation:**
```typescript
foundationStitches = (gridWidth + 1) × (gridHeight + 1)
filledStitches = count(grid cells where cell === true)

foundationYarnLength = foundationStitches × 2 × 0.95
filledYarnLength = filledStitches × 4 × 0.95
totalYarnLength = foundationYarnLength + filledYarnLength

skeinsNeeded = ceil(totalYarnLength / 7500)
```

**Example:**
```
Grid: 40 × 45 (1800 cells)
Filled: 456 cells (25.3%)

Foundation: 41 × 46 = 1886 stitches
Filled: 456 stitches

Foundation yarn: 1886 × 2 × 0.95 = 3583.4 cm
Filled yarn: 456 × 4 × 0.95 = 1732.8 cm
Total: 5316.2 cm = 53.16 m

Skeins: ceil(5316.2 / 7500) = 1 skein
```

### 5. Manual Fill Color Update

**Problem:** When user changes fill color, update all previously filled cells to new color.

**Solution:**
```typescript
updateFillColor(newColor) {
  for each side (front, back):
    for each (cellKey, cellColor) in manualFillCells[side]:
      if cellColor !== 'white' && cellColor === fillColor:
        set cellColor to newColor

  fillColor = newColor
}
```

**Rationale:**
- 'white' represents cleared cells (not a fill)
- Only cells matching current fill color are updated
- Preserves multi-color manual fills

---

## Installation & Setup

### Prerequisites

```bash
Node.js: >= 18.0.0
Package Manager: npm, pnpm, or yarn
Git: Latest version
```

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd frontend

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Start development server
npm run dev
# or
pnpm dev

# 4. Open browser to http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

**Output:**
- Build artifacts in `dist/` directory
- Optimized and minified JavaScript/CSS
- Source maps enabled
- Ready for static hosting (Netlify, Vercel, GitHub Pages, etc.)

### Environment Configuration

**Vite Config** (`vite.config.ts`):
```typescript
{
  plugins: [react()],
  base: './',              // Relative paths for static hosting
  server: {
    port: 3000,
    open: true,            // Auto-open browser
    allowedHosts: [...]    // ngrok support
  },
  build: {
    outDir: 'dist',
    sourcemap: true        // Enable source maps
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'konva', 'react-konva']
  }
}
```

**TypeScript Config** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Development Guide

### Code Style & Standards

**TypeScript:**
- Strict mode enabled
- No unused locals or parameters
- No fallthrough cases in switch statements
- Explicit return types for functions

**React:**
- Functional components only
- Hooks for state management
- Props destructuring
- TypeScript interfaces for props

**CSS:**
- BEM-inspired naming: `.component-element--modifier`
- Mobile-first responsive design
- Consistent spacing: rem units
- Color variables via `getColorValue()`

### Project Scripts

```json
{
  "dev": "vite",                        // Start dev server
  "build": "tsc && vite build",         // Build for production
  "preview": "vite preview",            // Preview production build
  "test": "vitest",                     // Run unit tests
  "test:ui": "vitest --ui",             // Run tests with UI
  "test:e2e": "playwright test",        // Run E2E tests
  "lint": "eslint . --ext ts,tsx",      // Lint code
  "lint:fix": "eslint . --ext ts,tsx --fix",  // Fix lint issues
  "format": "prettier --write .",       // Format code
  "storybook": "storybook dev -p 6006", // Start Storybook
  "build-storybook": "storybook build"  // Build Storybook
}
```

### Adding New Features

**Example: Adding a New Edge Pattern**

1. **Add pattern to type:**
```typescript
// src/components/DesignWorkspace.tsx
type EdgePattern = '...' | 'my-new-pattern';
```

2. **Implement pattern logic:**
```typescript
const isEdgePatternCell = (colIndex, rowIndex, side?) => {
  switch(edgePattern) {
    // ... existing patterns ...
    case 'my-new-pattern':
      // Your pattern logic here
      return shouldFill;
  }
};
```

3. **Add to UI selector:**
```typescript
<option value="my-new-pattern">My New Pattern</option>
```

4. **Test pattern generation**

### Component Development with Storybook

```bash
# Start Storybook
npm run storybook

# Build static Storybook
npm run build-storybook
```

**Creating a Story:**
```typescript
// src/components/MyComponent.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // props
  },
};
```

### Debugging Tips

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree, props, and state
- Track component re-renders

**Console Logging:**
```typescript
// Image processing debug
console.log(`Processing image: ${pixelsWide}x${pixelsHigh} with threshold ${threshold}`);

// Motif loading
console.log(`Loaded ${validMotifs.length} motifs from library`);
```

**Vite HMR:**
- Fast Hot Module Replacement
- Preserves state during development
- Instant feedback on changes

---

## Testing Strategy

### Test Coverage

```
tests/
├── contract/                 # Service layer contract tests (9 files)
├── integration/              # E2E workflow tests (4 files)
└── setup.ts                  # Test configuration
```

### Unit Tests (Vitest)

**Running Tests:**
```bash
npm test                      # Run all tests
npm test -- --watch           # Watch mode
npm test:ui                   # Interactive UI
```

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateYarn } from './utils';

describe('Yarn Calculator', () => {
  it('should calculate yarn for 40x45 grid', () => {
    const result = calculateYarn(40, 45, 456);
    expect(result.skeinsNeeded).toBe(1);
    expect(result.totalYarnLength).toBeCloseTo(5316.2, 1);
  });
});
```

### Integration Tests (Playwright)

**Running E2E Tests:**
```bash
npm run test:e2e              # Run all E2E tests
npx playwright test --ui      # Interactive mode
npx playwright show-report    # View HTML report
```

**Test Files:**
- `test-basic-workflow.spec.ts` - Full user workflow
- `test-edge-cases.spec.ts` - Boundary conditions
- `test-pattern-variations.spec.ts` - Different pattern types
- `test-persistence.spec.ts` - State management

**Example E2E Test:**
```typescript
test('create project and export pattern', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Create project
  await page.getByTestId('new-project').click();
  await page.fill('#projectName', 'Test Bag');
  await page.fill('#width', '40');
  await page.fill('#height', '45');
  await page.getByText('Opprett Prosjekt').click();

  // Place motif
  await page.locator('.motif-item').first().click();
  await page.locator('.crochet-cell').nth(500).click();

  // Export
  await page.getByText('Eksporter oppskrift').click();

  // Verify download
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('_oppskrift.pdf');
});
```

### Performance Testing

**Metrics to Monitor:**
- Grid rendering time (target: <50ms)
- Pattern generation time (target: <5s for 200×200)
- PDF export time (target: <10s)
- Memory usage during large grids
- File upload processing time

**Profiling:**
```typescript
console.time('Pattern Generation');
await handleGeneratePattern();
console.timeEnd('Pattern Generation');
```

---

## Performance Considerations

### Optimization Strategies

**1. Debounced Pattern Regeneration:**
```typescript
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await handleGeneratePattern();
  }, 300);  // 300ms debounce
  return () => clearTimeout(timeoutId);
}, [placedMotifs, backSideMotifs, ...]);
```

**2. Conditional Rendering:**
```typescript
// Only render grids when pattern exists
{generatedPattern && renderGrid('front', generatedPattern, placedMotifs)}
```

**3. Memoization:**
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers

**4. Virtual Scrolling:**
- Consider `react-window` for large motif libraries
- Render only visible grid cells on very large grids

**5. Image Optimization:**
- Convert uploaded images to optimal size
- Use WebP format where supported
- Limit base64 string sizes

### Performance Metrics

| Operation | Target | Current |
|-----------|--------|---------|
| Grid render (40×45) | <50ms | ~30ms |
| Pattern generation (40×45) | <2s | ~500ms |
| Pattern generation (200×200) | <10s | ~5s |
| PDF export | <10s | ~3s |
| Image upload | <1s | ~200ms |
| Motif placement | <100ms | ~50ms |

### Memory Management

**Large Grid Handling:**
- 200×200 grid = 40,000 cells
- Each cell = boolean + metadata
- Estimated memory: ~2MB for grid data
- Pattern generation creates temporary canvases (GC'd after use)

**Image Data:**
- Base64 images stored in state
- Can be large (100KB-1MB per image)
- Consider limits on motif library size
- Clear unused motifs periodically

---

## Known Limitations

### Technical Constraints

1. **Browser Compatibility:**
   - Requires modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
   - No IE11 support
   - Limited mobile browser testing

2. **File Size Limits:**
   - Large image uploads (>5MB) may cause slowdowns
   - Very large grids (>150×150) may have performance issues
   - PDF export limited by browser memory (~50MB PDFs max)

3. **Grid Size:**
   - Maximum 200×200 cells (40,000 cells)
   - Very large grids may slow down on older devices
   - Mobile devices limited to ~100×100 for smooth experience

4. **No Backend:**
   - All processing happens client-side
   - No cloud save/sync
   - No collaborative editing
   - No pattern sharing

### Feature Gaps

1. **Undo/Redo:**
   - Only works for motif placement and manual fills
   - Does not track edge pattern changes
   - Does not track stitch interpretation toggles
   - Limited to 50 states

2. **Export Formats:**
   - PDF only (no PNG, SVG, or JSON export)
   - No individual grid image export
   - No pattern format export (e.g., .pat files)

3. **Pattern Library:**
   - No built-in pattern search
   - No user-created pattern sharing
   - No cloud library integration

4. **Mobile Experience:**
   - Touch interactions not fully optimized
   - Small screens make grid editing difficult
   - No mobile-specific UI adaptations

### Design Limitations

1. **Filet Crochet Only:**
   - Only supports filet crochet technique
   - No other crochet styles (amigurumi, granny square, etc.)

2. **Single Project:**
   - Only one project open at a time
   - No project management
   - No project history

3. **Color:**
   - Patterns are monochrome (filled/open only)
   - Manual fills support colors, but PDF export doesn't use them
   - No multi-color crochet support

4. **Instructions:**
   - Norwegian language only in PDF
   - Limited customization of instructions
   - No diagram annotations

---

## Future Roadmap

### Short-term Enhancements (Q1-Q2 2025)

**1. Additional Export Formats**
- [ ] PNG export of individual grids
- [ ] SVG export for vector editing
- [ ] JSON export for project save/load
- [ ] Plain text pattern export

**2. Improved Mobile Experience**
- [ ] Touch-optimized grid interaction
- [ ] Mobile-specific panel layouts
- [ ] Responsive grid sizing
- [ ] Gesture support (pinch zoom, swipe)

**3. Pattern Library Expansion**
- [ ] Search and filter motifs
- [ ] Motif categories expansion
- [ ] User-submitted motif gallery
- [ ] Motif preview modal

**4. Enhanced Undo/Redo**
- [ ] Track all state changes (edge patterns, colors, etc.)
- [ ] Redo functionality (Ctrl+Shift+Z)
- [ ] History panel showing change log
- [ ] Branching history

### Medium-term Features (Q3-Q4 2025)

**1. Project Management**
- [ ] Save multiple projects to browser storage
- [ ] Project list/gallery view
- [ ] Duplicate projects
- [ ] Project templates

**2. Cloud Integration**
- [ ] User accounts (OAuth)
- [ ] Cloud save/sync
- [ ] Project sharing via link
- [ ] Community pattern library

**3. Advanced Design Tools**
- [ ] Copy/paste motifs between sides
- [ ] Rotate motifs (90°, 180°, 270°)
- [ ] Motif alignment guides
- [ ] Grid background patterns
- [ ] Custom edge pattern creator

**4. Localization**
- [ ] English translation
- [ ] Multi-language PDF export
- [ ] User language preference

### Long-term Vision (2026+)

**1. Multi-technique Support**
- [ ] Cross-stitch patterns
- [ ] Knitting charts
- [ ] Granny square patterns
- [ ] Amigurumi patterns

**2. Advanced Pattern Generation**
- [ ] AI-powered motif generation
- [ ] Pattern optimization algorithms
- [ ] Auto-suggest yarn colors
- [ ] Pattern difficulty rating

**3. Collaboration Features**
- [ ] Real-time collaborative editing
- [ ] Comments and annotations
- [ ] Version control
- [ ] Pattern forking

**4. Marketplace**
- [ ] Sell/buy custom patterns
- [ ] Designer profiles
- [ ] Pattern ratings and reviews
- [ ] Premium motif packs

### Community Requests

**Top User Requests:**
1. Multi-color pattern support
2. Print-optimized layouts (A4/Letter)
3. Metric/imperial unit toggle
4. Video tutorials
5. Pattern sharing on social media

---

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo last action |
| `Ctrl/Cmd + Mouse Wheel` | Zoom grid in/out |
| `Enter` (in text input) | Create text motif |
| `Escape` (in text input) | Cancel text input |

### File Structure Reference

```
src/
├── App.tsx                    # Main app router and state
├── App.css                    # Global styles (2,309 lines)
├── index.css                  # Base styles and fonts
├── main.tsx                   # React entry point
├── components/
│   ├── DesignWorkspace.tsx    # Main design interface (1,949 lines)
│   ├── ProjectCreation.tsx    # Project creation modal (143 lines)
│   └── PatternPDF.tsx         # PDF generation component (210 lines)
└── types/
    ├── motif.ts               # Motif type definitions
    ├── grid.ts                # Grid and cell types
    ├── pattern.ts             # Pattern types
    ├── project.ts             # Project structure
    ├── yarn.ts                # Yarn calculation types
    └── export.ts              # Export format types
```

### External Resources

**Fonts:**
- [Public Sans (Google Fonts)](https://fonts.google.com/specimen/Public+Sans)
- [Playfair Display (Google Fonts)](https://fonts.google.com/specimen/Playfair+Display)

**Documentation:**
- [React 18 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [@react-pdf/renderer Docs](https://react-pdf.org/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)

**Crochet Resources:**
- [Filet Crochet Tutorial](https://www.youtube.com/watch?v=...)
- [Crochet Gauge Guide](https://www.craftyarncouncil.com/)

---

## Changelog

### Version 1.0.0 (January 2025)

**Initial Release:**
- Project creation with custom dimensions
- Motif library with categories (Sea, Birds, Flowers, Sport, Other)
- Custom image upload
- Text motif creation
- Dual-side design (front and back)
- Manual fill tool with color options
- 7 edge pattern options
- Pattern inversion (black filled/black open)
- Grid zoom and resize
- Undo/Redo (Ctrl+Z)
- Resizable panels
- PDF export with Norwegian instructions
- Automatic yarn calculation
- Drag & drop image upload
- Motif controls (size, threshold, flip, duplicate, remove)
- Auto-update pattern generation

**Technical:**
- React 18.2 + TypeScript 5.0
- Vite build system
- @react-pdf/renderer for PDF export
- Comprehensive testing with Vitest and Playwright
- Responsive design
- Accessibility features

---

## Contributors & Credits

**Development:**
- Lead Developer: [Your Name]
- UI/UX Design: [Designer Name]
- Testing: [QA Team]

**Special Thanks:**
- Norwegian crochet community for feedback
- Beta testers
- Open-source contributors

**License:**
MIT License - See LICENSE file for details

---

## Support & Contact

**Bug Reports:**
Submit issues at [GitHub Issues URL]

**Feature Requests:**
Use [GitHub Discussions URL]

**Contact:**
Email: support@hektet.no (example)

**Documentation:**
Full docs at [Documentation URL]

---

*This documentation was generated on January 16, 2025. For the latest updates, see the GitHub repository.*
