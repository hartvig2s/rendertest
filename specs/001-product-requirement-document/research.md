# Research: Crochet Tote Bag Design Tool MVP

**Date**: 2025-09-23
**Purpose**: Resolve technical clarifications and establish technology stack decisions

## Technology Stack Decisions

### Frontend Framework
**Decision**: React with TypeScript + Vite
**Rationale**:
- Market dominance (~40% market share) ensures long-term support
- Excellent drag-and-drop ecosystem (`@dnd-kit/core`, `react-grid-layout`)
- Proven performance for large grids (200x200 cells) with virtual scrolling
- TypeScript integration enhances maintainability for MVP development
- Vite provides instant hot reload and optimized builds

**Alternatives considered**: Vue 3 (gentler learning curve but smaller ecosystem for grid/drag-drop)

### Canvas/Grid Rendering
**Decision**: Konva.js with react-konva
**Rationale**:
- Optimized for interactive canvas with many objects (motifs on grid)
- Excellent performance for 200x200 cell grids through layer-based rendering
- Built-in drag/drop/selection event system
- Shape caching for repeated motif patterns
- Viewport culling for off-screen elements

**Alternatives considered**: Fabric.js (better SVG compatibility but less performance optimized)

### PDF Generation
**Decision**: @react-pdf/renderer (client-side)
**Rationale**:
- Seamless React component integration for PDF creation
- Dynamic embedding of charts, calculations, and pattern grids
- Real-time preview capabilities for users
- No server dependency reduces infrastructure complexity
- Component-based approach matches React architecture

**Alternatives considered**: jsPDF + html2canvas (mature but less React-integrated)

### Testing Framework
**Decision**: Vitest + Playwright + Storybook
**Rationale**:
- Vitest: 3x faster than Jest, zero-config TypeScript support
- Playwright: Cross-browser support, visual testing for pattern accuracy
- Storybook: Component documentation perfect for motif library

**Alternatives considered**: Jest (slower), Cypress (heavier E2E solution)

### Drag-and-Drop
**Decision**: @dnd-kit/core
**Rationale**:
- Modern, accessible implementation with ARIA support
- Touch-friendly for tablet users
- Excellent React integration
- Configurable collision detection for grid boundaries

**Alternatives considered**: react-beautiful-dnd (deprecated), react-grid-layout (more complex than needed)

### Project Structure
**Decision**: Vite + TypeScript monorepo with pnpm
**Rationale**:
- Modular architecture enables component reusability
- pnpm is 50% faster than npm with better workspace management
- Clean separation allows future mobile app development
- TypeScript across packages ensures type safety

## Performance Considerations

### Grid Optimization
- Layer-based rendering (grid, motifs, selection as separate layers)
- Virtual scrolling for grids larger than viewport
- Shape caching for repeated motif patterns
- Viewport culling for off-screen elements

### Bundle Size Management
- Code splitting at motif library level
- Lazy loading of PDF generation components
- Tree shaking with ES modules
- Image optimization for motif assets

## MVP Implementation Strategy

1. **Phase 1**: Basic grid rendering with Konva.js
2. **Phase 2**: Simple motif placement (click-to-place)
3. **Phase 3**: Drag-and-drop functionality
4. **Phase 4**: Pattern generation and yarn calculations
5. **Phase 5**: PDF export functionality

## Development Environment

**Language/Version**: TypeScript 5.0+ with React 18+
**Build Tool**: Vite 5.0+
**Package Manager**: pnpm 8.0+
**Node Version**: Node.js 18+ (for optimal Vite performance)
**Browser Targets**: Modern browsers (ES2020+), Chrome 88+, Firefox 85+, Safari 14+

## Architecture Decisions

### State Management
**Decision**: Zustand for global state
**Rationale**: Lightweight, TypeScript-friendly, easier than Redux for MVP scope

### Styling Approach
**Decision**: Tailwind CSS
**Rationale**: Rapid prototyping, consistent design system, small bundle with purging

### File Organization
```
src/
├── components/
│   ├── Grid/           # Grid rendering components
│   ├── Motifs/         # Motif library and placement
│   ├── PatternView/    # Generated pattern display
│   └── Export/         # PDF generation components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── utils/              # Yarn calculations, grid helpers
└── types/              # TypeScript type definitions
```

## Risk Mitigation

### Performance Risks
- **Large grid rendering**: Mitigated by Konva.js layer system and viewport culling
- **Memory usage**: Managed through virtual scrolling and component cleanup

### Browser Compatibility
- **Canvas support**: All target browsers support HTML5 Canvas
- **PDF generation**: Client-side PDF works in all modern browsers
- **Drag-and-drop**: @dnd-kit provides fallbacks for accessibility

### User Experience
- **Learning curve**: Familiar drag-and-drop interactions reduce friction
- **Performance feedback**: Loading states and progress indicators for PDF generation
- **Error handling**: Clear validation messages for dimension inputs and motif placement

## Technical Constraints Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:
- ✅ Language/Version: TypeScript 5.0+ with React 18+
- ✅ Primary Dependencies: React, Konva.js, @dnd-kit/core, @react-pdf/renderer
- ✅ Testing: Vitest + Playwright + Storybook
- ✅ Performance targets confirmed and optimization strategies defined