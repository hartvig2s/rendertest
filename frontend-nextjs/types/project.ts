import type { Grid } from './grid'
import type { PlacedMotif } from './motif'
import type { Pattern } from './pattern'
import type { YarnCalculation } from './yarn'

export interface CreateProjectRequest {
  name: string;
  dimensions: Dimensions;
}

export interface UpdateProjectRequest {
  name?: string;
  settings?: Partial<ProjectSettings>;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  dimensions: Dimensions;
  grid: Grid;
  motifs: PlacedMotif[];
  pattern: Pattern | null;
  yarnCalculation: YarnCalculation | null;
  settings: ProjectSettings;
}

export interface Dimensions {
  width: number; // 20-200 cm
  height: number; // 20-200 cm
}

export interface ProjectSettings {
  stitchInterpretation: StitchInterpretation;
  gridType: GridType;
  showGrid: boolean;
  snapToGrid: boolean;
  autoSave: boolean;
  exportFormat: ExportFormat;
}

export type StitchInterpretation = 'black_filled' | 'black_open';
export type GridType = 'åpent' | 'tett';
export type ExportFormat = 'pdf' | 'png' | 'json';