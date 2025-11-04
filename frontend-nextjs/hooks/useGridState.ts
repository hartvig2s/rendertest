/**
 * Hook for managing grid dimensions and properties
 */

import { useState, useCallback } from 'react';
import { GRID_ZOOM, SIDES } from '@/lib/constants';
import { validateGridDimensions, getCellCount } from '@/lib/gridUtils';

interface UseGridStateReturn {
  gridWidth: number;
  gridHeight: number;
  gridZoom: number;
  currentSide: 'front' | 'back';

  setGridWidth: (width: number) => void;
  setGridHeight: (height: number) => void;
  setGridZoom: (zoom: number) => void;
  setCurrentSide: (side: 'front' | 'back') => void;

  // Grid dimension operations
  updateGridDimensions: (width: number, height: number, minW: number, maxW: number, minH: number, maxH: number) => boolean;
  getGridCellCount: () => { width: number; height: number };

  // Zoom operations
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  resetZoom: () => void;

  // Side operations
  toggleSide: () => void;
}

export const useGridState = (defaultWidth: number, defaultHeight: number): UseGridStateReturn => {
  const [gridWidth, setGridWidth] = useState<number>(defaultWidth);
  const [gridHeight, setGridHeight] = useState<number>(defaultHeight);
  const [gridZoom, setGridZoom] = useState<number>(GRID_ZOOM.DEFAULT);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(SIDES.FRONT);

  const updateGridDimensions = useCallback(
    (width: number, height: number, minW: number, maxW: number, minH: number, maxH: number): boolean => {
      const validation = validateGridDimensions(width, height, minW, maxW, minH, maxH);
      if (validation.isValid) {
        setGridWidth(width);
        setGridHeight(height);
        return true;
      }
      return false;
    },
    []
  );

  const getGridCellCount = useCallback(() => {
    return getCellCount(gridWidth, gridHeight);
  }, [gridWidth, gridHeight]);

  const zoomIn = useCallback((step = 0.1) => {
    setGridZoom(prev => Math.min(prev + step, 3.0)); // Max 300% zoom
  }, []);

  const zoomOut = useCallback((step = 0.1) => {
    setGridZoom(prev => Math.max(prev - step, 0.25)); // Min 25% zoom
  }, []);

  const resetZoom = useCallback(() => {
    setGridZoom(GRID_ZOOM.DEFAULT);
  }, []);

  const toggleSide = useCallback(() => {
    setCurrentSide(prev => (prev === SIDES.FRONT ? SIDES.BACK : SIDES.FRONT));
  }, []);

  return {
    gridWidth,
    gridHeight,
    gridZoom,
    currentSide,
    setGridWidth,
    setGridHeight,
    setGridZoom,
    setCurrentSide,
    updateGridDimensions,
    getGridCellCount,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleSide,
  };
};
