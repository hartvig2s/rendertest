# Crochet Tote Bag Design Tool MVP

A web-based digital design tool for creating custom crochet tote bag patterns using filet crochet.

## Features

- 🎨 **Custom Grid Design**: Create grids from 20x20cm to 200x200cm with 1cm resolution
- 🎯 **Drag & Drop Interface**: Place pre-defined motifs (flowers, birds, letters, geometric shapes)
- 📐 **Automatic Pattern Generation**: Convert designs to filet crochet charts with filled/open stitches
- 🧶 **Yarn Calculator**: Calculate exact number of skeins needed (1 stitch = 4cm, 1 skein = 75m)
- 📄 **Export Options**: PDF patterns, PNG images, and JSON project files
- 💾 **Auto-Save**: Automatic project persistence in browser storage

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

### Development Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run unit tests (Vitest)
pnpm test:ui          # Run tests with UI
pnpm test:e2e         # Run integration tests (Playwright)

# Code Quality
pnpm lint             # Check code with ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier

# Storybook
pnpm storybook        # Start Storybook
pnpm build-storybook  # Build Storybook
```

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Canvas Rendering**: Konva.js for interactive grid
- **Drag & Drop**: @dnd-kit/core for accessible interactions
- **State Management**: Zustand for lightweight state
- **PDF Generation**: @react-pdf/renderer (client-side)
- **Testing**: Vitest + Playwright + Storybook

### Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Grid/            # Grid rendering components
│   │   ├── Motifs/          # Motif library and placement
│   │   ├── PatternView/     # Pattern display components
│   │   └── Export/          # Export functionality
│   ├── types/               # TypeScript type definitions
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── store/               # Zustand state management
│   └── pages/               # Main application pages
├── tests/
│   ├── contract/            # API contract tests
│   ├── integration/         # E2E workflow tests
│   └── unit/                # Unit tests
└── public/                  # Static assets
```

## Implementation Status

### ✅ Completed (MVP Foundation)

- **Project Setup**: React + TypeScript + Vite configuration
- **Testing Framework**: Vitest + Playwright + Storybook setup
- **Type Definitions**: Complete TypeScript interfaces
- **Contract Tests**: 9 comprehensive service tests covering all APIs
- **Integration Tests**: 4 complete workflow tests covering user scenarios
- **Basic UI**: Landing page with feature overview

### 🔄 In Progress (Core Implementation)

The following components need implementation to make tests pass:

#### Data Models & Services (T020-T035)
- Grid utilities and cell management
- Yarn calculation algorithms
- Pattern generation logic
- Project/Motif/Export services
- Storage service for persistence

#### Components (T040-T054)
- Interactive grid with Konva.js
- Drag-and-drop motif library
- Pattern visualization
- Form components for project creation
- Export options interface

#### Integration (T055-T060)
- @dnd-kit/core drag-and-drop integration
- Konva.js grid rendering
- @react-pdf/renderer PDF export
- Browser storage persistence

## User Workflow

1. **Create Project**: Set tote bag dimensions (20-200cm)
2. **Design Grid**: Auto-generated 1cm x 1cm grid canvas
3. **Place Motifs**: Drag flowers, birds, letters onto grid
4. **Generate Pattern**: Convert to filet crochet chart (filled/open stitches)
5. **Calculate Yarn**: Automatic skein requirements
6. **Export**: Download as PDF, PNG, or JSON

## Testing

### Test-Driven Development

All tests are written to **FAIL** until implementations are created:

- **Contract Tests**: Validate service layer APIs match OpenAPI spec
- **Integration Tests**: Verify complete user workflows from quickstart scenarios
- **Unit Tests**: Test individual utilities and components

### Running Tests

```bash
# All tests
pnpm test

# Contract tests only
pnpm test tests/contract

# Integration tests only
pnpm test:e2e

# Watch mode
pnpm test --watch
```

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Modern mobile browsers

## Performance Targets

- **Grid Rendering**: <50ms response time for interactions
- **Pattern Generation**: <5 seconds for maximum grid (200x200)
- **Project Creation**: <2 seconds for grid setup
- **Large Grids**: 200x200 grids render in <10 seconds

## Contributing

This is an MVP implementation following Test-Driven Development:

1. Tests are written first and must fail
2. Implement minimum code to make tests pass
3. Refactor while keeping tests green
4. All features must have corresponding tests

## License

MIT License - Built for crochet enthusiasts with ❤️