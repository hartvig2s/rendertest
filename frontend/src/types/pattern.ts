export interface Pattern {
  id: string;
  chart: PatternChart;
  instructions: string[];
  stitchCount: StitchCount;
  generatedAt: Date;
  version: number;
}

export interface PatternChart {
  rows: PatternRow[];
  legend: ChartLegend;
  stitchInterpretation: StitchInterpretation;
}

export interface PatternRow {
  rowNumber: number;
  stitches: StitchType[];
  direction: Direction;
}

export interface ChartLegend {
  openSymbol: string;
  filledSymbol: string;
}

export interface StitchCount {
  total: number;
  filled: number;
  open: number;
}

export interface GeneratePatternRequest {
  stitchInterpretation: StitchInterpretation;
}

export type StitchType = 'open' | 'filled';
export type StitchInterpretation = 'black_filled' | 'black_open';
export type Direction = 'left-to-right' | 'right-to-left';