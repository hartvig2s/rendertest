export interface Grid {
  width: number;
  height: number;
  cells: GridCell[][];
  scale: number;
}

export interface GridCell {
  x: number;
  y: number;
  state: CellState;
  motifId: string | null;
  color: string;
}

export type CellState = 'empty' | 'filled' | 'motif';