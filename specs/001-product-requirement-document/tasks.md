# Tasks: Crochet Tote Bag Design Tool MVP

**Input**: Design documents from `/specs/001-product-requirement-document/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `frontend/src/` for React application, `frontend/tests/` for tests
- Based on plan.md structure: Option 2 (Web application) - frontend application with client-side PDF generation

## Phase 3.1: Setup
- [x] T001 Create web application project structure with frontend/ directory
- [x] T002 Initialize React + TypeScript + Vite project with dependencies (React, Konva.js, @dnd-kit/core, @react-pdf/renderer, Zustand)
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript configuration files
- [x] T004 [P] Set up Vitest configuration in frontend/vitest.config.ts
- [x] T005 [P] Set up Playwright configuration in frontend/playwright.config.ts
- [x] T006 [P] Set up Storybook configuration in frontend/.storybook/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Service Layer)
- [x] T007 [P] Contract test createProject in frontend/tests/contract/test-project-service.test.ts
- [x] T008 [P] Contract test getProject in frontend/tests/contract/test-project-service.test.ts
- [x] T009 [P] Contract test updateProject in frontend/tests/contract/test-project-service.test.ts
- [x] T010 [P] Contract test placeMotif in frontend/tests/contract/test-motif-service.test.ts
- [x] T011 [P] Contract test removeMotif in frontend/tests/contract/test-motif-service.test.ts
- [x] T012 [P] Contract test generatePattern in frontend/tests/contract/test-pattern-service.test.ts
- [x] T013 [P] Contract test calculateYarn in frontend/tests/contract/test-yarn-service.test.ts
- [x] T014 [P] Contract test exportProject in frontend/tests/contract/test-export-service.test.ts
- [x] T015 [P] Contract test getMotifs in frontend/tests/contract/test-motif-library.test.ts

### Integration Tests (User Workflows)
- [x] T016 [P] Integration test "Create Basic Tote Bag Pattern" workflow in frontend/tests/integration/test-basic-workflow.spec.ts
- [x] T017 [P] Integration test "Boundary Validation" edge cases in frontend/tests/integration/test-edge-cases.spec.ts
- [x] T018 [P] Integration test "Pattern Generation Variations" in frontend/tests/integration/test-pattern-variations.spec.ts
- [x] T019 [P] Integration test "Data Persistence" scenarios in frontend/tests/integration/test-persistence.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models and Types
- [ ] T020 [P] Project model types in frontend/src/types/project.ts
- [ ] T021 [P] Dimensions model in frontend/src/types/dimensions.ts
- [ ] T022 [P] Grid model types in frontend/src/types/grid.ts
- [ ] T023 [P] Motif model types in frontend/src/types/motif.ts
- [ ] T024 [P] Pattern model types in frontend/src/types/pattern.ts
- [ ] T025 [P] YarnCalculation model types in frontend/src/types/yarn.ts

### Utilities and Services
- [ ] T026 [P] Grid utilities (generation, cell management) in frontend/src/utils/grid.ts
- [ ] T027 [P] Yarn calculation utilities in frontend/src/utils/yarn.ts
- [ ] T028 [P] Pattern generation utilities in frontend/src/utils/pattern.ts
- [ ] T029 [P] Validation utilities in frontend/src/utils/validation.ts
- [ ] T030 ProjectService implementation in frontend/src/services/project-service.ts
- [ ] T031 MotifService implementation in frontend/src/services/motif-service.ts
- [ ] T032 PatternService implementation in frontend/src/services/pattern-service.ts
- [ ] T033 YarnService implementation in frontend/src/services/yarn-service.ts
- [ ] T034 ExportService implementation in frontend/src/services/export-service.ts
- [ ] T035 StorageService implementation in frontend/src/services/storage-service.ts

### State Management
- [ ] T036 Zustand store setup in frontend/src/store/index.ts
- [ ] T037 Project store slice in frontend/src/store/project-store.ts
- [ ] T038 Motif store slice in frontend/src/store/motif-store.ts
- [ ] T039 UI store slice in frontend/src/store/ui-store.ts

### Core Components
- [ ] T040 [P] GridCell component in frontend/src/components/Grid/GridCell.tsx
- [ ] T041 [P] Grid component in frontend/src/components/Grid/Grid.tsx
- [ ] T042 [P] MotifLibrary component in frontend/src/components/Motifs/MotifLibrary.tsx
- [ ] T043 [P] MotifItem component in frontend/src/components/Motifs/MotifItem.tsx
- [ ] T044 [P] DraggableMotif component in frontend/src/components/Motifs/DraggableMotif.tsx
- [ ] T045 PatternView component in frontend/src/components/PatternView/PatternView.tsx
- [ ] T046 PatternChart component in frontend/src/components/PatternView/PatternChart.tsx
- [ ] T047 YarnCalculationDisplay component in frontend/src/components/YarnCalculation/YarnCalculationDisplay.tsx

### Form and Input Components
- [ ] T048 [P] DimensionsInput component in frontend/src/components/Forms/DimensionsInput.tsx
- [ ] T049 [P] ProjectSettings component in frontend/src/components/Forms/ProjectSettings.tsx
- [ ] T050 [P] ExportOptions component in frontend/src/components/Export/ExportOptions.tsx

### Main Application Components
- [ ] T051 ProjectCreation page in frontend/src/pages/ProjectCreation.tsx
- [ ] T052 DesignCanvas page in frontend/src/pages/DesignCanvas.tsx
- [ ] T053 PatternGeneration page in frontend/src/pages/PatternGeneration.tsx
- [ ] T054 App component integration in frontend/src/App.tsx

## Phase 3.4: Integration
- [ ] T055 Connect drag-and-drop with @dnd-kit/core for motif placement
- [ ] T056 Integrate Konva.js for grid rendering and interaction
- [ ] T057 Integrate @react-pdf/renderer for PDF export
- [ ] T058 Connect localStorage/IndexedDB persistence
- [ ] T059 Error boundaries and error handling
- [ ] T060 Loading states and performance optimizations

## Phase 3.5: Polish
- [ ] T061 [P] Unit tests for Grid utilities in frontend/tests/unit/test-grid-utils.test.ts
- [ ] T062 [P] Unit tests for Yarn calculations in frontend/tests/unit/test-yarn-utils.test.ts
- [ ] T063 [P] Unit tests for Pattern generation in frontend/tests/unit/test-pattern-utils.test.ts
- [ ] T064 [P] Unit tests for Validation functions in frontend/tests/unit/test-validation.test.ts
- [ ] T065 [P] Storybook stories for Grid components in frontend/src/components/Grid/Grid.stories.tsx
- [ ] T066 [P] Storybook stories for Motif components in frontend/src/components/Motifs/MotifLibrary.stories.tsx
- [ ] T067 [P] Storybook stories for Pattern components in frontend/src/components/PatternView/PatternView.stories.tsx
- [ ] T068 Performance tests for large grids (200x200) using Playwright
- [ ] T069 Accessibility testing and ARIA labels implementation
- [ ] T070 Mobile/tablet responsive design optimization
- [ ] T071 Browser compatibility testing (Chrome 88+, Firefox 85+, Safari 14+)
- [ ] T072 Bundle size optimization and code splitting
- [ ] T073 Run quickstart.md validation scenarios

## Dependencies

### Sequential Dependencies
- Setup (T001-T006) before all other phases
- Tests (T007-T019) before implementation (T020-T054)
- Types (T020-T025) before services (T030-T035)
- Services before store (T030-T035 → T036-T039)
- Store before components (T036-T039 → T040-T054)
- Core components (T040-T047) before pages (T051-T054)
- Implementation before integration (T020-T054 → T055-T060)
- Integration before polish (T055-T060 → T061-T073)

### Parallel Blocks
- **Block 1**: T007-T019 (All tests in parallel)
- **Block 2**: T020-T025 (Type definitions in parallel)
- **Block 3**: T026-T029 (Utility functions in parallel)
- **Block 4**: T040-T044, T048-T050 (Independent components in parallel)
- **Block 5**: T061-T067 (Unit tests and stories in parallel)

## Parallel Execution Examples

### Launch all contract tests together (after setup complete):
```bash
# T007-T015: Contract tests can run in parallel
Task: "Contract test createProject in frontend/tests/contract/test-project-service.test.ts"
Task: "Contract test getProject in frontend/tests/contract/test-project-service.test.ts"
Task: "Contract test updateProject in frontend/tests/contract/test-project-service.test.ts"
Task: "Contract test placeMotif in frontend/tests/contract/test-motif-service.test.ts"
Task: "Contract test removeMotif in frontend/tests/contract/test-motif-service.test.ts"
Task: "Contract test generatePattern in frontend/tests/contract/test-pattern-service.test.ts"
Task: "Contract test calculateYarn in frontend/tests/contract/test-yarn-service.test.ts"
Task: "Contract test exportProject in frontend/tests/contract/test-export-service.test.ts"
Task: "Contract test getMotifs in frontend/tests/contract/test-motif-library.test.ts"
```

### Launch all integration tests together:
```bash
# T016-T019: Integration tests can run in parallel
Task: "Integration test 'Create Basic Tote Bag Pattern' workflow in frontend/tests/integration/test-basic-workflow.spec.ts"
Task: "Integration test 'Boundary Validation' edge cases in frontend/tests/integration/test-edge-cases.spec.ts"
Task: "Integration test 'Pattern Generation Variations' in frontend/tests/integration/test-pattern-variations.spec.ts"
Task: "Integration test 'Data Persistence' scenarios in frontend/tests/integration/test-persistence.spec.ts"
```

### Launch all type definitions together:
```bash
# T020-T025: Type definitions can run in parallel
Task: "Project model types in frontend/src/types/project.ts"
Task: "Dimensions model in frontend/src/types/dimensions.ts"
Task: "Grid model types in frontend/src/types/grid.ts"
Task: "Motif model types in frontend/src/types/motif.ts"
Task: "Pattern model types in frontend/src/types/pattern.ts"
Task: "YarnCalculation model types in frontend/src/types/yarn.ts"
```

### Launch utility functions together:
```bash
# T026-T029: Utility functions can run in parallel
Task: "Grid utilities (generation, cell management) in frontend/src/utils/grid.ts"
Task: "Yarn calculation utilities in frontend/src/utils/yarn.ts"
Task: "Pattern generation utilities in frontend/src/utils/pattern.ts"
Task: "Validation utilities in frontend/src/utils/validation.ts"
```

### Launch independent components together:
```bash
# T040-T044: Grid and motif components can run in parallel
Task: "GridCell component in frontend/src/components/Grid/GridCell.tsx"
Task: "Grid component in frontend/src/components/Grid/Grid.tsx"
Task: "MotifLibrary component in frontend/src/components/Motifs/MotifLibrary.tsx"
Task: "MotifItem component in frontend/src/components/Motifs/MotifItem.tsx"
Task: "DraggableMotif component in frontend/src/components/Motifs/DraggableMotif.tsx"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify all tests fail before implementing corresponding functionality
- Commit after each task completion
- Frontend-only application - no backend services needed
- All API calls are to client-side service layer functions
- PDF generation happens entirely in browser using @react-pdf/renderer

## Task Generation Rules Applied
1. **From Contracts**: Each endpoint in project-api.json → contract test task [P]
2. **From Data Model**: Each entity (Project, Grid, Motif, Pattern, etc.) → model creation task [P]
3. **From User Stories**: Each quickstart scenario → integration test [P]
4. **Ordering**: Setup → Tests → Models → Services → Components → Pages → Integration → Polish

## Validation Checklist
- [x] All contract endpoints have corresponding tests (T007-T015)
- [x] All entities have model tasks (T020-T025)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] All quickstart scenarios have integration tests (T016-T019)
- [x] All user workflows covered in integration tests