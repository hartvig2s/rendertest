# tirsdag Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-17

## Active Technologies
- TypeScript 5.0+ with React 18+, Node.js 18+ + React, Konva.js, @dnd-kit/core, @react-pdf/renderer, Vite, Zustand (001-product-requirement-document)

## Project Structure
```
backend/
frontend/
  ├── src/
  │   ├── components/
  │   │   ├── DesignWorkspace.tsx     # Main design canvas with grid rendering
  │   │   └── PatternPDF.tsx          # PDF generation with Norwegian crochet instructions
  │   └── ...
tests/
```

## Commands
- `npm run dev` - Start development server
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

## Code Style
TypeScript 5.0+ with React 18+, Node.js 18+: Follow standard conventions

## Recent Changes
- 001-product-requirement-document: Added TypeScript 5.0+ with React 18+, Node.js 18+ + React, Konva.js, @dnd-kit/core, @react-pdf/renderer, Vite, Zustand

## PDF Export Features
The application generates Norwegian crochet patterns as PDF documents with the following features:

### Pattern Diagrams
- **Grid visualization**: Grids are rendered as PNG images using HTML5 Canvas API
- **Edge patterns**: User-selected edge/border patterns are automatically applied to diagrams
- **Numbering system**: 0-10-20-30 numbering along bottom (right-to-left) and right side (bottom-to-top)
- **Visual clarity**: Small gaps (0.5px) between filled cells for easier counting
- **Stitch interpretation**: Supports both 'black_filled' and 'black_open' modes

### Pattern Instructions
- Complete step-by-step Norwegian filet crochet instructions
- Detailed foundation, sides, and finishing steps
- Yarn requirements calculation (based on 75m/50g cotton skeins)
- Grid dimensions with actual measurements (10 squares = 10cm width, 9cm height)

### Technical Implementation
- **Canvas-based rendering** (DesignWorkspace.tsx:1008-1082): Converts boolean grid to PNG with margins for numbering
- **Edge pattern integration** (DesignWorkspace.tsx:1084-1097): Applies edge patterns before PNG generation
- **PDF assembly** (PatternPDF.tsx): React-PDF component that combines instructions and diagrams

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->