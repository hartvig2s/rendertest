/**
 * Hook for managing manual fill mode and manual fill cells
 */

import { useState, useCallback } from 'react';
import { FILL_MODES, DEFAULT_FILL_COLOR, SIDES } from '@/lib/constants';
import { cellKey } from '@/lib/gridUtils';

interface UseManualFillReturn {
  manualFillMode: boolean;
  manualFillCells: { front: Map<string, string>; back: Map<string, string> };
  manualToolMode: 'fill' | 'clear';
  fillColor: 'white' | 'red' | 'green' | 'blue';

  // Mode operations
  setManualFillMode: (enabled: boolean) => void;
  toggleManualFillMode: () => void;

  // Tool mode operations
  setManualToolMode: (mode: 'fill' | 'clear') => void;
  toggleToolMode: () => void;

  // Fill color operations
  setFillColor: (color: 'white' | 'red' | 'green' | 'blue') => void;

  // Cell operations
  toggleCell: (row: number, col: number, side: 'front' | 'back') => void;
  fillCell: (row: number, col: number, side: 'front' | 'back', color: string) => void;
  clearCell: (row: number, col: number, side: 'front' | 'back') => void;
  isCellFilled: (row: number, col: number, side: 'front' | 'back') => boolean;
  getCellColor: (row: number, col: number, side: 'front' | 'back') => string | undefined;

  // Batch operations
  clearAllManualFills: () => void;
  clearManualFillsForSide: (side: 'front' | 'back') => void;
  hasManualFills: () => boolean;
}

export const useManualFill = (): UseManualFillReturn => {
  const [manualFillMode, setManualFillMode] = useState<boolean>(false);
  const [manualFillCells, setManualFillCells] = useState<{
    front: Map<string, string>;
    back: Map<string, string>;
  }>({
    front: new Map<string, string>(),
    back: new Map<string, string>(),
  });
  const [manualToolMode, setManualToolMode] = useState<'fill' | 'clear'>(FILL_MODES.FILL);
  const [fillColor, setFillColor] = useState<'white' | 'red' | 'green' | 'blue'>(DEFAULT_FILL_COLOR);

  const toggleManualFillMode = useCallback(() => {
    setManualFillMode(prev => !prev);
  }, []);

  const toggleToolMode = useCallback(() => {
    setManualToolMode(prev => (prev === FILL_MODES.FILL ? FILL_MODES.CLEAR : FILL_MODES.FILL));
  }, []);

  const toggleCell = useCallback(
    (row: number, col: number, side: 'front' | 'back') => {
      setManualFillCells(prev => {
        const newCells = {
          ...prev,
          [side]: new Map(prev[side]),
        };
        const key = cellKey(row, col);
        if (newCells[side].has(key)) {
          newCells[side].delete(key);
        } else {
          newCells[side].set(key, fillColor);
        }
        return newCells;
      });
    },
    [fillColor]
  );

  const fillCell = useCallback(
    (row: number, col: number, side: 'front' | 'back', color: string) => {
      setManualFillCells(prev => {
        const newCells = {
          ...prev,
          [side]: new Map(prev[side]),
        };
        newCells[side].set(cellKey(row, col), color);
        return newCells;
      });
    },
    []
  );

  const clearCell = useCallback((row: number, col: number, side: 'front' | 'back') => {
    setManualFillCells(prev => {
      const newCells = {
        ...prev,
        [side]: new Map(prev[side]),
      };
      newCells[side].delete(cellKey(row, col));
      return newCells;
    });
  }, []);

  const isCellFilled = useCallback(
    (row: number, col: number, side: 'front' | 'back'): boolean => {
      return manualFillCells[side].has(cellKey(row, col));
    },
    [manualFillCells]
  );

  const getCellColor = useCallback(
    (row: number, col: number, side: 'front' | 'back'): string | undefined => {
      return manualFillCells[side].get(cellKey(row, col));
    },
    [manualFillCells]
  );

  const clearAllManualFills = useCallback(() => {
    setManualFillCells({
      front: new Map<string, string>(),
      back: new Map<string, string>(),
    });
  }, []);

  const clearManualFillsForSide = useCallback((side: 'front' | 'back') => {
    setManualFillCells(prev => ({
      ...prev,
      [side]: new Map<string, string>(),
    }));
  }, []);

  const hasManualFills = useCallback((): boolean => {
    return manualFillCells.front.size > 0 || manualFillCells.back.size > 0;
  }, [manualFillCells]);

  return {
    manualFillMode,
    manualFillCells,
    manualToolMode,
    fillColor,
    setManualFillMode,
    toggleManualFillMode,
    setManualToolMode,
    toggleToolMode,
    setFillColor,
    toggleCell,
    fillCell,
    clearCell,
    isCellFilled,
    getCellColor,
    clearAllManualFills,
    clearManualFillsForSide,
    hasManualFills,
  };
};
