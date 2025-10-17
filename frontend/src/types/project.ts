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
  showGrid: boolean;
  snapToGrid: boolean;
  autoSave: boolean;
  exportFormat: ExportFormat;
}

export type StitchInterpretation = 'black_filled' | 'black_open';
export type ExportFormat = 'pdf' | 'png' | 'json';