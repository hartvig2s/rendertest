/**
 * Hook for managing placed motifs and custom motifs
 */

import { useState, useCallback } from 'react';
import {
  PlacedMotif,
  createPlacedMotif,
  updateMotifSize,
  toggleMotifFlip,
  moveMotif,
  updateMotifThreshold,
  duplicateMotif,
  removeMotif,
  findMotifById,
} from '@/lib/motifUtils';

interface UseMotifManagementReturn {
  placedMotifs: PlacedMotif[];
  backSideMotifs: PlacedMotif[];
  customMotifs: Array<{ id: string; name: string; imageData: string; category?: string }>;
  selectedMotifType: string | null;
  selectedMotifId: string | null;
  selectedCategory: string;

  // Front side motif operations
  addMotif: (motifId: string, x: number, y: number, name: string, isCustom?: boolean, imageData?: string) => void;
  removeMotifFront: (id: string) => void;
  updateMotifSizeFront: (id: string, size: number) => void;
  updateMotifThresholdFront: (id: string, threshold: number) => void;
  toggleMotifFlipFront: (id: string, direction: 'horizontal' | 'vertical') => void;
  moveMotifFront: (id: string, x: number, y: number) => void;
  duplicateMotifFront: (id: string, offsetX?: number, offsetY?: number) => void;

  // Back side motif operations
  addMotifBack: (motifId: string, x: number, y: number, name: string, isCustom?: boolean, imageData?: string) => void;
  removeMotifBack: (id: string) => void;
  updateMotifSizeBack: (id: string, size: number) => void;
  updateMotifThresholdBack: (id: string, threshold: number) => void;
  toggleMotifFlipBack: (id: string, direction: 'horizontal' | 'vertical') => void;
  moveMotifBack: (id: string, x: number, y: number) => void;
  duplicateMotifBack: (id: string, offsetX?: number, offsetY?: number) => void;

  // Custom motif management
  addCustomMotif: (name: string, imageData: string, category?: string) => void;
  removeCustomMotif: (id: string) => void;
  getCustomMotifs: (category?: string) => Array<{ id: string; name: string; imageData: string; category?: string }>;

  // Selection management
  setSelectedMotifType: (id: string | null) => void;
  setSelectedMotifId: (id: string | null) => void;
  setSelectedCategory: (category: string) => void;

  // Batch operations
  clearAllMotifs: () => void;
}

export const useMotifManagement = (): UseMotifManagementReturn => {
  const [placedMotifs, setPlacedMotifs] = useState<PlacedMotif[]>([]);
  const [backSideMotifs, setBackSideMotifs] = useState<PlacedMotif[]>([]);
  const [customMotifs, setCustomMotifs] = useState<Array<{ id: string; name: string; imageData: string; category?: string }>>([]);
  const [selectedMotifType, setSelectedMotifType] = useState<string | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('flowers');

  // Front side operations
  const addMotif = useCallback(
    (motifId: string, x: number, y: number, name: string, isCustom = false, imageData?: string) => {
      const newMotif = createPlacedMotif(motifId, x, y, name, isCustom, imageData);
      setPlacedMotifs(prev => [...prev, newMotif]);
    },
    []
  );

  const removeMotifFront = useCallback((id: string) => {
    setPlacedMotifs(prev => removeMotif(prev, id));
  }, []);

  const updateMotifSizeFront = useCallback((id: string, size: number) => {
    setPlacedMotifs(prev =>
      prev.map(m => (m.id === id ? updateMotifSize(m, size) : m))
    );
  }, []);

  const updateMotifThresholdFront = useCallback((id: string, threshold: number) => {
    setPlacedMotifs(prev =>
      prev.map(m => (m.id === id ? updateMotifThreshold(m, threshold) : m))
    );
  }, []);

  const toggleMotifFlipFront = useCallback(
    (id: string, direction: 'horizontal' | 'vertical') => {
      setPlacedMotifs(prev =>
        prev.map(m => (m.id === id ? toggleMotifFlip(m, direction) : m))
      );
    },
    []
  );

  const moveMotifFront = useCallback((id: string, x: number, y: number) => {
    setPlacedMotifs(prev =>
      prev.map(m => (m.id === id ? moveMotif(m, x, y) : m))
    );
  }, []);

  const duplicateMotifFront = useCallback((id: string, offsetX = 20, offsetY = 20) => {
    const motif = findMotifById(placedMotifs, id);
    if (motif) {
      const newMotif = duplicateMotif(motif, offsetX, offsetY);
      setPlacedMotifs(prev => [...prev, newMotif]);
    }
  }, [placedMotifs]);

  // Back side operations
  const addMotifBack = useCallback(
    (motifId: string, x: number, y: number, name: string, isCustom = false, imageData?: string) => {
      const newMotif = createPlacedMotif(motifId, x, y, name, isCustom, imageData);
      setBackSideMotifs(prev => [...prev, newMotif]);
    },
    []
  );

  const removeMotifBack = useCallback((id: string) => {
    setBackSideMotifs(prev => removeMotif(prev, id));
  }, []);

  const updateMotifSizeBack = useCallback((id: string, size: number) => {
    setBackSideMotifs(prev =>
      prev.map(m => (m.id === id ? updateMotifSize(m, size) : m))
    );
  }, []);

  const updateMotifThresholdBack = useCallback((id: string, threshold: number) => {
    setBackSideMotifs(prev =>
      prev.map(m => (m.id === id ? updateMotifThreshold(m, threshold) : m))
    );
  }, []);

  const toggleMotifFlipBack = useCallback(
    (id: string, direction: 'horizontal' | 'vertical') => {
      setBackSideMotifs(prev =>
        prev.map(m => (m.id === id ? toggleMotifFlip(m, direction) : m))
      );
    },
    []
  );

  const moveMotifBack = useCallback((id: string, x: number, y: number) => {
    setBackSideMotifs(prev =>
      prev.map(m => (m.id === id ? moveMotif(m, x, y) : m))
    );
  }, []);

  const duplicateMotifBack = useCallback((id: string, offsetX = 20, offsetY = 20) => {
    const motif = findMotifById(backSideMotifs, id);
    if (motif) {
      const newMotif = duplicateMotif(motif, offsetX, offsetY);
      setBackSideMotifs(prev => [...prev, newMotif]);
    }
  }, [backSideMotifs]);

  // Custom motif operations
  const addCustomMotif = useCallback((name: string, imageData: string, category = 'other') => {
    const newMotif = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      imageData,
      category,
    };
    setCustomMotifs(prev => [...prev, newMotif]);
  }, []);

  const removeCustomMotif = useCallback((id: string) => {
    setCustomMotifs(prev => prev.filter(m => m.id !== id));
  }, []);

  const getCustomMotifs = useCallback(
    (category?: string) => {
      if (!category) return customMotifs;
      return customMotifs.filter(m => m.category === category);
    },
    [customMotifs]
  );

  const clearAllMotifs = useCallback(() => {
    setPlacedMotifs([]);
    setBackSideMotifs([]);
    setCustomMotifs([]);
    setSelectedMotifType(null);
    setSelectedMotifId(null);
  }, []);

  return {
    placedMotifs,
    backSideMotifs,
    customMotifs,
    selectedMotifType,
    selectedMotifId,
    selectedCategory,
    addMotif,
    removeMotifFront,
    updateMotifSizeFront,
    updateMotifThresholdFront,
    toggleMotifFlipFront,
    moveMotifFront,
    duplicateMotifFront,
    addMotifBack,
    removeMotifBack,
    updateMotifSizeBack,
    updateMotifThresholdBack,
    toggleMotifFlipBack,
    moveMotifBack,
    duplicateMotifBack,
    addCustomMotif,
    removeCustomMotif,
    getCustomMotifs,
    setSelectedMotifType,
    setSelectedMotifId,
    setSelectedCategory,
    clearAllMotifs,
  };
};
