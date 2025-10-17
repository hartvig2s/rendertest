export interface YarnCalculation {
  totalStitches: number;
  yarnLength: number; // in centimeters
  skeinsNeeded: number;
  calculatedAt: Date;
  formula: CalculationFormula;
}

export interface CalculationFormula {
  stitchLength: number; // cm per stitch (default: 4)
  skeinLength: number; // cm per skein (default: 7500)
}