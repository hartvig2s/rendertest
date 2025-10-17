export interface ExportRequest {
  format: ExportFormat;
  includeInstructions?: boolean;
  includeYarnCalculation?: boolean;
}

export type ExportFormat = 'pdf' | 'png' | 'json';