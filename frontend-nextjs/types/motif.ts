export interface Motif {
  id: string;
  name: string;
  category: MotifCategory;
  pattern: boolean[][];
  width: number;
  height: number;
  previewImage: string;
}

export interface PlacedMotif {
  id: string;
  motifId: string;
  x: number;
  y: number;
  placedAt: Date;
  rotation: number; // 0, 90, 180, 270
  flipped: boolean;
}

export interface PlaceMotifRequest {
  motifId: string;
  x: number;
  y: number;
  rotation?: number;
  flipped?: boolean;
}

export type MotifCategory = 'flower' | 'bird' | 'letter' | 'geometric';