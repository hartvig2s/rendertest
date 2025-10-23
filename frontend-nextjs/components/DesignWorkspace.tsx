'use client';

import React, { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PatternPDF } from './PatternPDF';
import { motifFiles } from '@/lib/motifs';

interface Project {
  name: string;
  width: number;
  height: number;
}

interface PlacedMotif {
  id: string;
  motifId: string;
  x: number;
  y: number;
  name: string;
  size: number; // Size multiplier (1.0 = default, 0.5 = half size, 2.0 = double size)
  threshold: number; // Threshold for black/white conversion (0-255, default 128)
  flipHorizontal?: boolean; // Flip motif horizontally
  flipVertical?: boolean; // Flip motif vertically
  isCustom?: boolean;
  imageData?: string; // Base64 image data for custom motifs
}

interface DesignWorkspaceProps {
  project: Project;
  onBack: () => void;
}

export const DesignWorkspace: React.FC<DesignWorkspaceProps> = ({ project, onBack }) => {
  const [placedMotifs, setPlacedMotifs] = useState<PlacedMotif[]>([]);
  const [selectedMotifType, setSelectedMotifType] = useState<string | null>(null);
  const [generatedPattern, setGeneratedPattern] = useState<any>(null);
  const [stitchInterpretation, setStitchInterpretation] = useState<'black_filled' | 'black_open'>('black_filled');
  // const [draggingMotif, setDraggingMotif] = useState<string | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string | null>(null);
  const [customMotifs, setCustomMotifs] = useState<{id: string, name: string, imageData: string, category?: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('flowers');
  const [textInput, setTextInput] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(300);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [autoUpdating, setAutoUpdating] = useState<boolean>(false);
  const [gridDragging, setGridDragging] = useState<string | null>(null);
  // const [isDragging, setIsDragging] = useState<boolean>(false);
  const [gridZoom, setGridZoom] = useState<number>(1.25);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [backSideMotifs, setBackSideMotifs] = useState<PlacedMotif[]>([]);
  const [backSidePattern, setBackSidePattern] = useState<any>(null);
  const [dragOverSide, setDragOverSide] = useState<'front' | 'back' | null>(null);

  // Touch/pinch zoom state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1.25);
  const [manualFillMode, setManualFillMode] = useState<boolean>(false);
  const [manualFillCells, setManualFillCells] = useState<{front: Map<string, string>, back: Map<string, string>}>({
    front: new Map<string, string>(),
    back: new Map<string, string>()
  });
  const [manualToolMode, setManualToolMode] = useState<'fill' | 'clear'>('fill');
  const [fillColor, setFillColor] = useState<'white' | 'red' | 'green' | 'blue'>('red');
  const [edgePattern, setEdgePattern] = useState<'none' | 'border-1' | 'border-2' | 'corner-triangles' | 'checkerboard-edges' | 'snake-pattern' | 'stepped-border' | 'checkerboard-2row'>('border-1');
  const [gridWidth, setGridWidth] = useState<number>(project.width);
  const [gridHeight, setGridHeight] = useState<number>(project.height);

  // Undo/Redo history
  const [history, setHistory] = useState<{
    placedMotifs: PlacedMotif[];
    backSideMotifs: PlacedMotif[];
    manualFillCells: {front: Map<string, string>, back: Map<string, string>};
  }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Helper function to calculate maximum motif size based on grid dimensions
  // 120% = maximum allowed size for illustrations
  const getMaxMotifSize = () => {
    // Maximum size is 120% (1.2)
    return 1.2;
  };

  // Save current state to history
  const saveToHistory = () => {
    const currentState = {
      placedMotifs: [...placedMotifs],
      backSideMotifs: [...backSideMotifs],
      manualFillCells: {
        front: new Map(manualFillCells.front),
        back: new Map(manualFillCells.back)
      }
    };

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    // Limit history to last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }

    setHistory(newHistory);
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setPlacedMotifs(previousState.placedMotifs);
      setBackSideMotifs(previousState.backSideMotifs);
      setManualFillCells(previousState.manualFillCells);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Helper functions for manual fill and colors
  const getCellKey = (x: number, y: number) => `${x},${y}`;
  const getCurrentManualFills = () => manualFillCells[currentSide];

  // Function to update fill color and all manually filled cells
  const updateFillColor = (newColor: 'white' | 'red' | 'green' | 'blue') => {
    // Update all manually filled cells to the new color (except 'white' which means cleared)
    setManualFillCells(prev => {
      const newFills = {
        front: new Map(prev.front),
        back: new Map(prev.back)
      };

      // Update front side cells
      prev.front.forEach((cellColor, cellKey) => {
        if (cellColor !== 'white' && cellColor === fillColor) {
          newFills.front.set(cellKey, newColor);
        }
      });

      // Update back side cells
      prev.back.forEach((cellColor, cellKey) => {
        if (cellColor !== 'white' && cellColor === fillColor) {
          newFills.back.set(cellKey, newColor);
        }
      });

      return newFills;
    });

    setFillColor(newColor);
  };

  const getColorValue = (color: string) => {
    switch(color) {
      case 'white': return '#FFFBF5';
      case 'red': return '#6D190D';
      case 'green': return '#939C59';
      case 'blue': return '#A0AFC1';
      default: return '#6D190D';
    }
  };

  const getColorBorder = (color: string) => {
    return color === 'white' ? '1px solid #999' : 'none';
  };

  const isEdgePatternCell = (colIndex: number, rowIndex: number, side?: 'front' | 'back') => {
    switch(edgePattern) {
      case 'border-1':
        return rowIndex === 0 || rowIndex === gridHeight - 1 ||
               colIndex === 0 || colIndex === gridWidth - 1;
      case 'border-2':
        return rowIndex < 2 || rowIndex >= gridHeight - 2 ||
               colIndex < 2 || colIndex >= gridWidth - 2;
      case 'corner-triangles':
        const fromTopLeft = rowIndex + colIndex;
        const fromTopRight = rowIndex + (gridWidth - 1 - colIndex);
        const fromBottomLeft = (gridHeight - 1 - rowIndex) + colIndex;
        const fromBottomRight = (gridHeight - 1 - rowIndex) + (gridWidth - 1 - colIndex);
        return fromTopLeft < 5 || fromTopRight < 5 || fromBottomLeft < 5 || fromBottomRight < 5;
      case 'checkerboard-edges':
        // Check if we're in the 3-row border areas
        const isInTopBorder = rowIndex < 3;
        const isInBottomBorder = rowIndex >= gridHeight - 3;
        const isInLeftBorder = colIndex < 3;
        const isInRightBorder = colIndex >= gridWidth - 3;

        if (isInTopBorder || isInBottomBorder || isInLeftBorder || isInRightBorder) {
          // Checkerboard pattern: alternating fill based on row + column sum
          let shouldFill = (rowIndex + colIndex) % 2 === 0;

          // If width is odd, invert the pattern for the back side
          if (gridWidth % 2 === 1 && side === 'back') {
            shouldFill = !shouldFill;
          }

          return shouldFill;
        }
        return false;
      case 'snake-pattern':
        // 3x3 corner squares (minus center)
        const isTopLeftCorner = rowIndex < 3 && colIndex < 3 && !(rowIndex === 1 && colIndex === 1);
        const isTopRightCorner = rowIndex < 3 && colIndex >= gridWidth - 3 && !(rowIndex === 1 && colIndex === gridWidth - 2);
        const isBottomLeftCorner = rowIndex >= gridHeight - 3 && colIndex < 3 && !(rowIndex === gridHeight - 2 && colIndex === 1);
        const isBottomRightCorner = rowIndex >= gridHeight - 3 && colIndex >= gridWidth - 3 && !(rowIndex === gridHeight - 2 && colIndex === gridWidth - 2);

        if (isTopLeftCorner || isTopRightCorner || isBottomLeftCorner || isBottomRightCorner) {
          return true;
        }

        // Snake pattern for top and bottom 3 rows (excluding corners already handled)
        if ((rowIndex < 3 || rowIndex >= gridHeight - 3) && colIndex >= 3 && colIndex < gridWidth - 3) {
          const adjustedCol = colIndex - 3; // Start from 0 for the middle section
          const patternLength = 8; // Pattern repeats every 8 columns (3 filled + 1 side + 3 filled + 1 side)
          const posInPattern = adjustedCol % patternLength;

          // Determine which row in the 3-row group we're in
          const localRow = (rowIndex < 3) ? rowIndex : (rowIndex - (gridHeight - 3));

          if (localRow === 0 || localRow === 2) {
            // Top and bottom rows of the 3-row group: fill groups of 3
            return posInPattern < 3 || (posInPattern >= 4 && posInPattern < 7);
          } else if (localRow === 1) {
            // Middle row: fill single squares alternating sides
            return posInPattern === 3 || posInPattern === 7;
          }
        }

        // Snake pattern for left and right 3 columns (excluding corners)
        if ((colIndex < 3 || colIndex >= gridWidth - 3) && rowIndex >= 3 && rowIndex < gridHeight - 3) {
          const adjustedRow = rowIndex - 3; // Start from 0 for the middle section
          const patternLength = 8; // Pattern repeats every 8 rows
          const posInPattern = adjustedRow % patternLength;

          // Determine which column in the 3-column group we're in
          const localCol = (colIndex < 3) ? colIndex : (colIndex - (gridWidth - 3));

          if (localCol === 0 || localCol === 2) {
            // Left and right columns of the 3-column group: fill groups of 3
            return posInPattern < 3 || (posInPattern >= 4 && posInPattern < 7);
          } else if (localCol === 1) {
            // Middle column: fill single squares alternating sides
            return posInPattern === 3 || posInPattern === 7;
          }
        }

        return false;
      case 'stepped-border':
        // Fill outer border (row/col 0 and last)
        const isOuterBorder = rowIndex === 0 || rowIndex === gridHeight - 1 ||
                              colIndex === 0 || colIndex === gridWidth - 1;

        // Fill 3rd row/column in (row/col 2 and height-3/width-3)
        const isThirdBorder = rowIndex === 2 || rowIndex === gridHeight - 3 ||
                              colIndex === 2 || colIndex === gridWidth - 3;

        return isOuterBorder || isThirdBorder;
      case 'checkerboard-2row':
        // Check if we're in the 2 outer rows/columns only
        const isInTop2Rows = rowIndex < 2;
        const isInBottom2Rows = rowIndex >= gridHeight - 2;
        const isInLeft2Cols = colIndex < 2;
        const isInRight2Cols = colIndex >= gridWidth - 2;

        if (isInTop2Rows || isInBottom2Rows || isInLeft2Cols || isInRight2Cols) {
          // Checkerboard pattern: alternating fill based on row + column sum
          return (rowIndex + colIndex) % 2 === 0;
        }
        return false;
      default:
        return false;
    }
  };
  const toggleManualFill = (x: number, y: number, side: 'front' | 'back') => {
    // Save current state before making changes
    saveToHistory();

    const cellKey = getCellKey(x, y);
    setManualFillCells(prev => {
      const newFills = { ...prev };
      const currentMap = new Map(prev[side]);

      if (manualToolMode === 'clear') {
        // Clear mode: Set cell to white (empty) to override any fills
        if (currentMap.get(cellKey) === 'white') {
          // If already white, remove the override
          currentMap.delete(cellKey);
        } else {
          // Set to white (empty)
          currentMap.set(cellKey, 'white');
        }
      } else {
        // Fill mode: Use current fill color
        // If clicking the same cell with the same color, remove it (toggle off)
        if (currentMap.get(cellKey) === fillColor) {
          currentMap.delete(cellKey);
        } else {
          // Otherwise, set the cell to the current fill color
          currentMap.set(cellKey, fillColor);
        }
      }

      newFills[side] = currentMap;
      return newFills;
    });
  };

  const clearManualFills = (side?: 'front' | 'back') => {
    if (side) {
      setManualFillCells(prev => ({
        ...prev,
        [side]: new Map<string, string>()
      }));
    } else {
      setManualFillCells({
        front: new Map<string, string>(),
        back: new Map<string, string>()
      });
    }
  };

  // Helper functions for current side
  const getCurrentMotifs = () => currentSide === 'front' ? placedMotifs : backSideMotifs;
  const setCurrentMotifs = (motifs: PlacedMotif[] | ((prev: PlacedMotif[]) => PlacedMotif[])) => {
    if (currentSide === 'front') {
      setPlacedMotifs(motifs);
    } else {
      setBackSideMotifs(motifs);
    }
  };
  const getCurrentPattern = () => currentSide === 'front' ? generatedPattern : backSidePattern;
  const setCurrentPattern = (pattern: any) => {
    if (currentSide === 'front') {
      setGeneratedPattern(pattern);
    } else {
      setBackSidePattern(pattern);
    }
  };

  // Categorize motifs based on filename
  const categorizeMotif = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('blomst') || lowerName.startsWith('frukt') || lowerName.includes('lotus') || lowerName.includes('flower')) {
      return 'flowers';
    } else if (lowerName.startsWith('fisk') || lowerName.includes('shell') || lowerName.includes('sea') || lowerName.includes('ocean')) {
      return 'sea';
    } else if (lowerName.startsWith('fugl') || lowerName.includes('svale') || lowerName.includes('bird')) {
      return 'birds';
    } else if (lowerName.startsWith('sykkel') || lowerName.includes('sport') || lowerName.includes('hang-loose')) {
      return 'sport';
    } else if (lowerName.includes('text') || lowerName === 'text') {
      return 'text';
    } else {
      return 'other';
    }
  };

  // Load motifs from public folder on mount
  useEffect(() => {
    const loadLibraryMotifs = async () => {
      try {
        // Use static motif list for Next.js (import.meta.glob doesn't work)
        const loadedMotifs = await Promise.all(
          motifFiles.map(async (filename) => {
            try {
              const name = filename.replace(/\.[^/.]+$/, "");
              const url = `/motifs/${filename}`;

              const response = await fetch(url);
              if (!response.ok) {
                console.warn(`Failed to load motif: ${filename}`);
                return null;
              }
              const blob = await response.blob();
              const reader = new FileReader();

              return new Promise<{id: string, name: string, imageData: string, category: string} | null>((resolve) => {
                reader.onload = (e) => {
                  const imageData = e.target?.result as string;
                  const category = categorizeMotif(name);
                  resolve({
                    id: `library-${name}`,
                    name: name,
                    imageData,
                    category
                  });
                };
                reader.onerror = () => {
                  console.warn(`Failed to read motif: ${filename}`);
                  resolve(null);
                };
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.warn(`Error loading motif ${filename}:`, error);
              return null;
            }
          })
        );

        // Filter out null values (failed loads)
        const validMotifs = loadedMotifs.filter((m): m is {id: string, name: string, imageData: string, category: string} => m !== null);
        setCustomMotifs(validMotifs);

        if (validMotifs.length > 0) {
          console.log(`Loaded ${validMotifs.length} motifs from library`);
        }
      } catch (error) {
        console.error('Error loading library motifs:', error);
      }
    };

    loadLibraryMotifs();
  }, []);

  // Initialize both patterns on component mount
  useEffect(() => {
    const initializeBothPatterns = async () => {
      setAutoUpdating(true);

      // Store current side
      const originalSide = currentSide;

      // Generate pattern for front side
      setCurrentSide('front');
      await handleGeneratePattern();

      // Generate pattern for back side
      setCurrentSide('back');
      await handleGeneratePattern();

      // Return to original side
      setCurrentSide(originalSide);
      setAutoUpdating(false);
    };

    initializeBothPatterns();
  }, []); // Only run on mount

  // Auto-update pattern when motifs change
  useEffect(() => {
    // const currentMotifs = getCurrentMotifs();
    setAutoUpdating(true);
    // Generate pattern even with no motifs to show default fill
    // Small delay to avoid too frequent updates during dragging
    const timeoutId = setTimeout(async () => {
      await handleGeneratePattern();
      setAutoUpdating(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setAutoUpdating(false);
    };
  }, [placedMotifs, backSideMotifs, currentSide, stitchInterpretation, gridWidth, gridHeight, manualFillCells]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const handleMotifClick = (motifId: string, name: string) => {
    // Save current state before making changes
    saveToHistory();

    // Check if it's a custom motif
    const customMotif = customMotifs.find(m => m.id === motifId);

    // Place motif at center of preview canvas (in percentage coordinates)
    const newMotif: PlacedMotif = {
      id: `${motifId}-${currentSide}-${Date.now()}`,
      motifId,
      x: 50, // percentage from left
      y: 50, // percentage from top
      name,
      size: 0.7, // 70% default size
      threshold: 128, // Default threshold (0-255)
      flipHorizontal: false,
      flipVertical: false,
      isCustom: !!customMotif,
      imageData: customMotif?.imageData
    };

    setCurrentMotifs(prev => [...prev, newMotif]);
    setSelectedMotifType(null);
  };

  // const handleMotifDragStart = (motifId: string) => {
  //   setDraggingMotif(motifId);
  // };

  // const handleMotifDrag = (motifId: string, x: number, y: number) => {
  //   // Allow positioning outside canvas bounds (-50% to 150%)
  //   const clampedX = Math.max(-50, Math.min(150, x));
  //   const clampedY = Math.max(-50, Math.min(150, y));

  //   setCurrentMotifs(prev => prev.map(motif =>
  //     motif.id === motifId ? { ...motif, x: clampedX, y: clampedY } : motif
  //   ));
  // };

  // const handleMotifDragEnd = () => {
  //   setDraggingMotif(null);
  // };

  // Grid-based interaction handlers
  const handleGridCellClick = (gridX: number, gridY: number, side: 'front' | 'back') => {
    if (manualFillMode) {
      // In manual fill mode, toggle the cell fill state
      toggleManualFill(gridX, gridY, side);
      return;
    }

    if (selectedMotifType) {
      // Convert grid coordinates to percentage
      const x = (gridX / gridWidth) * 100;
      const y = (gridY / gridHeight) * 100;

      const customMotif = customMotifs.find(m => m.id === selectedMotifType);
      if (customMotif) {
        const newMotif: PlacedMotif = {
          id: `${selectedMotifType}-${currentSide}-${Date.now()}`,
          motifId: selectedMotifType,
          x,
          y,
          name: customMotif.name,
          size: 0.7,
          threshold: 128,
          flipHorizontal: false,
          flipVertical: false,
          isCustom: true,
          imageData: customMotif.imageData
        };

        setCurrentMotifs(prev => [...prev, newMotif]);
        setSelectedMotifType(null);
      }
    }
  };

  const handleGridMotifDragStart = (motifId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setGridDragging(motifId);
    // setIsDragging(true);
  };

  const handleGridMotifDrag = (gridX: number, gridY: number) => {
    if (gridDragging) {
      // Convert grid coordinates to percentage
      const x = (gridX / gridWidth) * 100;
      const y = (gridY / gridHeight) * 100;

      setCurrentMotifs(prev => prev.map(motif =>
        motif.id === gridDragging ? { ...motif, x, y } : motif
      ));
    }
  };

  const handleGridMotifDragEnd = () => {
    setGridDragging(null);
    // setIsDragging(false);
  };

  const handleGridWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setGridZoom(prev => Math.max(0.5, Math.min(3.0, prev + delta)));
    }
  };

  // Touch event handlers for mobile
  const handleGridTouchStart = (e: React.TouchEvent) => {
    // Handle pinch-to-zoom
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setInitialPinchDistance(distance);
      setInitialPinchZoom(gridZoom);
    }
    // Handle single touch for motif selection
    else if (e.touches.length === 1 && !manualFillMode) {
      const touch = e.touches[0];
      const target = e.target as HTMLElement;

      // Check if we're touching a cell with a motif
      if (target.classList.contains('has-motif')) {
        // Extract grid coordinates from the cell
        const cellIndex = Array.from(target.parentElement?.children || []).indexOf(target);
        if (cellIndex >= 0) {
          const colIndex = cellIndex % gridWidth;
          const rowIndex = Math.floor(cellIndex / gridWidth);

          const side = currentSide;
          const motifs = side === 'front' ? placedMotifs : backSideMotifs;

          // Find motif at this position
          const motifsAtPosition = motifs.filter(motif => {
            const motifGridX = Math.round((motif.x / 100) * gridWidth);
            const motifGridY = Math.round((motif.y / 100) * gridHeight);
            const motifRadius = Math.max(2, Math.round(motif.size * 3));
            return Math.abs(motifGridX - colIndex) <= motifRadius &&
                   Math.abs(motifGridY - rowIndex) <= motifRadius;
          });

          if (motifsAtPosition.length > 0) {
            setGridDragging(motifsAtPosition[0].id);
          }
        }
      }
    }
  };

  const handleGridTouchMove = (e: React.TouchEvent) => {
    // Handle pinch-to-zoom
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scale = distance / initialPinchDistance;
      const newZoom = initialPinchZoom * scale;
      setGridZoom(Math.max(0.5, Math.min(3.0, newZoom)));
    }
    // Handle single touch for motif dragging
    else if (e.touches.length === 1 && gridDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;

      if (target && target.classList.contains('crochet-cell')) {
        const cellIndex = Array.from(target.parentElement?.children || []).indexOf(target);
        if (cellIndex >= 0) {
          const colIndex = cellIndex % gridWidth;
          const rowIndex = Math.floor(cellIndex / gridWidth);
          handleGridMotifDrag(colIndex, rowIndex);
        }
      }
    }
  };

  const handleGridTouchEnd = (e: React.TouchEvent) => {
    // Reset pinch zoom state
    if (e.touches.length < 2) {
      setInitialPinchDistance(null);
    }

    // Reset drag state
    if (e.touches.length === 0) {
      handleGridMotifDragEnd();
    }
  };

  const handleGridDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSide(null);
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      const file = files[0];

      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        // Make this side active
        setCurrentSide(side);

        // Get drop position relative to grid (default to center if can't calculate)
        let x = 50; // Default to center
        let y = 50; // Default to center

        try {
          const rect = e.currentTarget.getBoundingClientRect();
          x = ((e.clientX - rect.left) / rect.width) * 100;
          y = ((e.clientY - rect.top) / rect.height) * 100;
        } catch (error) {
          // Use default center position if calculation fails
        }

        // Process the dropped image
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const imageData = readerEvent.target?.result as string;
          const customMotifId = `dropped-${Date.now()}`;
          const customMotifName = file.name.replace(/\.[^/.]+$/, "");

          const newCustomMotif = {
            id: customMotifId,
            name: customMotifName,
            imageData
          };

          // Add to custom motifs
          setCustomMotifs(prev => [...prev, newCustomMotif]);

          // Create and place motif at drop position
          const newMotif: PlacedMotif = {
            id: `${customMotifId}-${side}-${Date.now()}`,
            motifId: customMotifId,
            x: Math.max(10, Math.min(90, x)), // Keep within reasonable bounds
            y: Math.max(10, Math.min(90, y)),
            name: customMotifName,
            size: 0.7,
            threshold: 128,
            flipHorizontal: false,
            flipVertical: false,
            isCustom: true,
            imageData
          };

          // Add to the correct side
          if (side === 'front') {
            setPlacedMotifs(prev => [...prev, newMotif]);
          } else {
            setBackSideMotifs(prev => [...prev, newMotif]);
          }
        };

        reader.readAsDataURL(file);
      }
    }
  };

  const handleGridDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleGridDragEnter = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setDragOverSide(side);
  };

  const handleGridDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSide(null);
  };

  const renderGrid = (side: 'front' | 'back', pattern: any, motifs: PlacedMotif[]) => {
    // Auto-calculate cell size to fit both grids in available width
    // Assuming ~50% of screen width is available for center panel with 2 grids
    const cellSize = Math.max(8, Math.min(25, 600 / gridWidth));
    const padding = Math.max(4, Math.round(cellSize * 0.15));

    return (
      <div
        className="crochet-grid interactive-grid"
        onDrop={(e) => handleGridDrop(e, side)}
        onDragOver={handleGridDragOver}
        style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
        gap: '0px',
        background: '#e0e0e0',
        padding: `${padding}px`,
        position: 'relative'
      }}>
        {pattern.grid.map((row: boolean[], rowIndex: number) =>
          row.map((isFilled: boolean, colIndex: number) => {
            // Base calculations
            const isEdgeCellBase = isEdgePatternCell(colIndex, rowIndex, side);
            const cellKey = getCellKey(colIndex, rowIndex);
            const manualFillColor = manualFillCells[side].get(cellKey);
            const hasManualFill = manualFillColor !== undefined && manualFillColor !== 'white';

            // Determine if cell should be filled based on motif/edge/manual data
            const baseFilled = isFilled || isEdgeCellBase; // Base fill state (from motif or edge pattern)

            // Apply stitch interpretation: if 'black_open', we invert the visual representation
            const finalFilled = stitchInterpretation === 'black_open' ? !baseFilled : baseFilled;

            // Manual fills should always show with their color, not affected by interpretation toggle
            const isManuallyFilled = hasManualFill;

            // Check if any motif is at this position
            const motifsAtPosition = motifs.filter(motif => {
              const motifGridX = Math.round((motif.x / 100) * gridWidth);
              const motifGridY = Math.round((motif.y / 100) * gridHeight);
              const motifRadius = Math.max(2, Math.round(motif.size * 3));
              return Math.abs(motifGridX - colIndex) <= motifRadius &&
                     Math.abs(motifGridY - rowIndex) <= motifRadius;
            });

            const primaryMotif = motifsAtPosition[0];
            const isActiveSide = currentSide === side;

            return (
              <div
                key={`${side}-${rowIndex}-${colIndex}`}
                className={`crochet-cell interactive-cell ${selectedMotifType && isActiveSide ? 'clickable' : ''} ${motifsAtPosition.length > 0 ? 'has-motif' : ''}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  background: (finalFilled || isManuallyFilled)
                    ? (isManuallyFilled ? getColorValue(manualFillColor!) : getColorValue(fillColor))
                    : '#d3d3d3', // Always grey for open cells
                  border: `1px solid ${getColorValue(fillColor)}`,
                  position: 'relative',
                  cursor: manualFillMode && isActiveSide ? 'pointer' : (selectedMotifType && isActiveSide ? 'crosshair' : (motifsAtPosition.length > 0 && isActiveSide ? 'grab' : 'default')),
                  zIndex: motifsAtPosition.length > 0 ? 2 : 1,
                  opacity: isActiveSide ? 1 : 0.7,
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`${side} - Row ${rowIndex + 1}, Col ${colIndex + 1}: ${finalFilled ? 'Filled' : 'Open'}${isEdgeCellBase ? ' (Edge Pattern)' : ''}${motifsAtPosition.length > 0 ? ` - Contains: ${motifsAtPosition.map(m => m.name).join(', ')}` : ''}`}
                onDrop={(e) => handleGridDrop(e, side)}
                onDragOver={handleGridDragOver}
                onClick={() => {
                  // Make this side active when clicked
                  if (currentSide !== side) {
                    setCurrentSide(side);
                  }

                  if (motifsAtPosition.length > 0 && !manualFillMode) {
                    handleMotifSelect(motifsAtPosition[0].id);
                  } else {
                    handleGridCellClick(colIndex, rowIndex, side);
                  }
                }}
                onMouseDown={(e) => {
                  // Make this side active when interacting
                  if (currentSide !== side) {
                    setCurrentSide(side);
                  }

                  if (motifsAtPosition.length > 0) {
                    handleGridMotifDragStart(motifsAtPosition[0].id, e);
                  }
                }}
                onMouseEnter={() => {
                  if (isActiveSide && gridDragging) {
                    handleGridMotifDrag(colIndex, rowIndex);
                  }
                }}
                onMouseUp={handleGridMotifDragEnd}
              >
              </div>
            );
          })
        ).flat()}
      </div>
    );
  };

  const handleMotifResize = (motifId: string, newSize: number) => {
    const maxSize = getMaxMotifSize();
    const clampedSize = Math.max(0.1, Math.min(maxSize, newSize));
    setCurrentMotifs(prev => prev.map(motif =>
      motif.id === motifId ? { ...motif, size: clampedSize } : motif
    ));

    // Auto-regenerate pattern after resize if not in manual mode
    if (!manualFillMode && getCurrentMotifs().length > 0) {
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }
  };

  const handleMotifThreshold = (motifId: string, newThreshold: number) => {
    const clampedThreshold = Math.max(0, Math.min(255, newThreshold));
    setCurrentMotifs(prev => prev.map(motif =>
      motif.id === motifId ? { ...motif, threshold: clampedThreshold } : motif
    ));

    // Auto-regenerate pattern after threshold change
    if (!manualFillMode && getCurrentMotifs().length > 0) {
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }
  };

  const handleMotifFlip = (motifId: string, direction: 'horizontal' | 'vertical') => {
    setCurrentMotifs(prev => prev.map(motif => {
      if (motif.id === motifId) {
        if (direction === 'horizontal') {
          return { ...motif, flipHorizontal: !motif.flipHorizontal };
        } else {
          return { ...motif, flipVertical: !motif.flipVertical };
        }
      }
      return motif;
    }));

    // Auto-regenerate pattern after flip
    if (!manualFillMode && getCurrentMotifs().length > 0) {
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }
  };

  const handleMotifDuplicate = (motifId: string) => {
    const motifToDuplicate = getCurrentMotifs().find(m => m.id === motifId);
    if (!motifToDuplicate) return;

    // Save current state before making changes
    saveToHistory();

    // Create a duplicate with a new ID and slightly offset position
    const duplicatedMotif: PlacedMotif = {
      ...motifToDuplicate,
      id: `${motifToDuplicate.motifId}-${currentSide}-${Date.now()}`,
      x: Math.min(90, motifToDuplicate.x + 5), // Offset by 5% to the right
      y: Math.min(90, motifToDuplicate.y + 5)  // Offset by 5% down
    };

    setCurrentMotifs(prev => [...prev, duplicatedMotif]);

    // Auto-regenerate pattern
    if (!manualFillMode) {
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }
  };

  const handleMotifRemove = (motifId: string) => {
    // Save current state before making changes
    saveToHistory();

    setCurrentMotifs(prev => prev.filter(motif => motif.id !== motifId));
    if (selectedMotifId === motifId) {
      setSelectedMotifId(null);
    }
  };

  const handleMotifSelect = (motifId: string) => {
    setSelectedMotifId(selectedMotifId === motifId ? null : motifId);
  };

  const handleCopyFrontToBack = () => {
    // Save current state before making changes
    saveToHistory();

    // Copy all front motifs to back with new IDs
    const copiedMotifs = placedMotifs.map(motif => ({
      ...motif,
      id: `${motif.motifId}-back-${Date.now()}-${Math.random()}`
    }));

    setBackSideMotifs(copiedMotifs);

    // Copy manual fills from front to back
    setManualFillCells(prev => ({
      ...prev,
      back: new Map(prev.front)
    }));

    // Switch to back side to show the copied design
    setCurrentSide('back');

    // Auto-regenerate pattern
    if (!manualFillMode) {
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }
  };

  const handleGeneratePattern = async () => {
    // Convert percentage positions to grid coordinates
    const currentMotifs = getCurrentMotifs();
    const gridMotifs = currentMotifs.map(motif => ({
      ...motif,
      gridX: Math.round((motif.x / 100) * gridWidth),
      gridY: Math.round((motif.y / 100) * gridHeight)
    }));

    // Generate filet crochet grid
    const grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));

    // Process each motif
    for (const motif of gridMotifs) {
      // Don't clamp to boundaries - allow motifs to extend outside
      const centerX = motif.gridX;
      const centerY = motif.gridY;

      if (motif.isCustom && motif.imageData) {
        // Convert custom image to pixel art with threshold and flip settings
        await convertImageToPixelArt(
          motif.imageData,
          motif.size,
          centerX,
          centerY,
          grid,
          motif.threshold,
          motif.flipHorizontal || false,
          motif.flipVertical || false
        );
      }
    }

    // Apply manual fills for current side
    const currentManualFills = manualFillCells[currentSide];
    for (const [cellKey, color] of currentManualFills.entries()) {
      const [x, y] = cellKey.split(',').map(Number);
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        // Black cells are filled, white cells are empty (override motif fills)
        grid[y][x] = color !== 'white';
      }
    }

    const filledSquares = grid.flat().filter(Boolean).length;
    const openSquares = gridWidth * gridHeight - filledSquares;

    // Filet crochet calculation:
    // Foundation: (width + 1) × (height + 1) chain stitches for the grid framework
    const foundationStitches = (gridWidth + 1) * (gridHeight + 1);

    // Each filled square requires 1 additional stitch (double crochet)
    const filledStitches = filledSquares;

    // Total stitches = foundation + filled square stitches
    const totalStitches = foundationStitches + filledStitches;

    // Yarn calculation:
    // Grid scaling: Width: 1 cm per square, Height: 0.9 cm per square
    // Foundation chains: 2cm per stitch
    // Filled square stitches: 4cm per stitch
    const gridScaleWidth = 1.0; // 10 grid units = 10 cm (width)
    const gridScaleHeight = 0.9; // 10 grid units = 9 cm (height)
    // Average the scaling for yarn calculation (approximate)
    const avgGridScale = (gridScaleWidth + gridScaleHeight) / 2;
    const foundationYarnLength = foundationStitches * 2 * avgGridScale;
    const filledYarnLength = filledStitches * 4 * avgGridScale;
    const totalYarnLength = foundationYarnLength + filledYarnLength;

    const pattern = {
      id: `pattern-${Date.now()}`,
      stitchInterpretation,
      gridDimensions: `${gridWidth} × ${gridHeight} (${(gridWidth * gridScaleWidth).toFixed(1)} × ${(gridHeight * gridScaleHeight).toFixed(1)} cm)`,
      totalSquares: gridWidth * gridHeight,
      filledSquares,
      openSquares,
      foundationStitches,
      filledStitches,
      totalStitches,
      foundationYarnLength,
      filledYarnLength,
      yarnLength: totalYarnLength,
      skeinsNeeded: Math.ceil(totalYarnLength / 7500), // 75m = 7500cm per skein
      generatedAt: new Date().toLocaleString(),
      grid,
      gridMotifs
    };

    setCurrentPattern(pattern);
  };

  const toggleStitchInterpretation = () => {
    setStitchInterpretation(prev => prev === 'black_filled' ? 'black_open' : 'black_filled');
  };

  const handleExportPattern = async () => {
    const frontPattern = generatedPattern;
    const backPattern = backSidePattern;

    if (!frontPattern && !backPattern) {
      alert('Ingen mønster å eksportere. Vennligst lag et design først.');
      return;
    }

    // Calculate combined yarn requirements
    const totalYarnLength = (frontPattern?.yarnLength || 0) + (backPattern?.yarnLength || 0);
    const totalSkeins = Math.ceil(totalYarnLength / 7500);

    try {
      // Show loading indicator
      setAutoUpdating(true);

      // Generate SVG representations of grids instead of screenshots
      // This is much more efficient and produces better quality
      let frontGridSVG: string | null = null;
      let backGridSVG: string | null = null;

      // Helper function to convert grid to PNG image
      const generateGridPNG = async (grid: boolean[][], width: number, height: number, interpretation: 'black_filled' | 'black_open'): Promise<string> => {
        return new Promise((resolve) => {
          const cellSize = 10; // Size of each cell in pixels
          const marginBottom = 25; // Margin for bottom numbering
          const marginRight = 35; // Margin for right side numbering
          const marginLeft = 10; // Small left margin
          const marginTop = 10; // Small top margin
          const canvas = document.createElement('canvas');
          canvas.width = width * cellSize + marginLeft + marginRight;
          canvas.height = height * cellSize + marginTop + marginBottom;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve('');
            return;
          }

          // Fill background with white
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw grid (offset by left and top margins)
          const gap = 0.5; // Small gap between filled cells
          for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
              const x = marginLeft + col * cellSize;
              const y = marginTop + row * cellSize;

              const isFilled = grid[row][col];
              // Apply interpretation: invert if black_open
              const shouldFill = interpretation === 'black_open' ? !isFilled : isFilled;

              // Fill cell with slight gap for filled cells
              if (shouldFill) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + gap, y + gap, cellSize - gap * 2, cellSize - gap * 2);
              } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x, y, cellSize, cellSize);
              }

              // Draw border
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, cellSize, cellSize);
            }
          }

          // Draw numbering
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Bottom numbering (0-10-20-30 from right to left)
          for (let col = 0; col <= width; col += 10) {
            const x = marginLeft + (width - col) * cellSize; // Start from right
            const y = marginTop + height * cellSize + marginBottom / 2;
            ctx.fillText(col.toString(), x, y);
          }

          // Right side numbering (0-10-20-30 from bottom to top)
          ctx.textAlign = 'left';
          for (let row = 0; row <= height; row += 10) {
            const x = marginLeft + width * cellSize + 8;
            const y = marginTop + (height - row) * cellSize; // Start from bottom
            ctx.fillText(row.toString(), x, y);
          }

          // Convert canvas to PNG data URL
          resolve(canvas.toDataURL('image/png'));
        });
      };

      // Apply edge pattern to grids before generating PNG
      const applyEdgePattern = (grid: boolean[][]): boolean[][] => {
        const newGrid = grid.map(row => [...row]); // Deep copy

        for (let row = 0; row < gridHeight; row++) {
          for (let col = 0; col < gridWidth; col++) {
            if (isEdgePatternCell(col, row, 'front')) {
              newGrid[row][col] = true;
            }
          }
        }

        return newGrid;
      };

      if (frontPattern?.grid) {
        const gridWithEdges = applyEdgePattern(frontPattern.grid);
        frontGridSVG = await generateGridPNG(gridWithEdges, gridWidth, gridHeight, stitchInterpretation);
        console.log('Generated front PNG with edges, length:', frontGridSVG?.length);
      }

      if (backPattern?.grid) {
        const gridWithEdges = applyEdgePattern(backPattern.grid);
        backGridSVG = await generateGridPNG(gridWithEdges, gridWidth, gridHeight, stitchInterpretation);
        console.log('Generated back PNG with edges, length:', backGridSVG?.length);
      }

      console.log('Exporting PDF with:', {
        hasFrontImage: !!frontGridSVG,
        hasBackImage: !!backGridSVG,
        frontImageLength: frontGridSVG?.length,
        backImageLength: backGridSVG?.length
      });

      // Generate PDF with grid SVGs
      const pdfDoc = (
        <PatternPDF
          projectName={project.name}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          totalSkeins={totalSkeins}
          frontGrid={frontPattern?.grid || null}
          backGrid={backPattern?.grid || null}
          stitchInterpretation={stitchInterpretation}
          edgePattern={edgePattern}
          frontGridSVG={frontGridSVG}
          backGridSVG={backGridSVG}
        />
      );

      // Create blob from PDF
      const blob = await pdf(pdfDoc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_oppskrift.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAutoUpdating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setAutoUpdating(false);
      alert('Det oppstod en feil ved generering av PDF. Prøv igjen.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Vennligst velg en bildefil');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const customMotifId = `custom-${Date.now()}`;
      const customMotifName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension

      const newCustomMotif = {
        id: customMotifId,
        name: customMotifName,
        imageData,
        category: 'other' // User-uploaded images go to "Other" by default
      };

      // Append to existing motifs (including library motifs)
      setCustomMotifs(prev => [...prev, newCustomMotif]);
    };

    reader.readAsDataURL(file);

    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const createTextMotif = (text: string) => {
    if (!text.trim()) return;

    // Create a canvas to render text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and font - using Georgia with letter spacing
    const fontSize = 56;
    const padding = 12;
    const letterSpacing = fontSize * 0.15; // 15% letter spacing

    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Measure text width with letter spacing
    let textWidth = 0;
    for (let i = 0; i < text.length; i++) {
      textWidth += ctx.measureText(text[i]).width;
      if (i < text.length - 1) textWidth += letterSpacing;
    }
    const textHeight = fontSize;

    canvas.width = textWidth + (padding * 2);
    canvas.height = textHeight + (padding * 2);

    // Clear and set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Re-set font after canvas resize
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw text with letter spacing
    let x = padding;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Draw stroke
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1.5;
      ctx.strokeText(char, x, padding);

      // Fill text
      ctx.fillStyle = 'black';
      ctx.fillText(char, x, padding);

      x += ctx.measureText(char).width + letterSpacing;
    }

    // Convert to base64
    const imageData = canvas.toDataURL('image/png');
    const textMotifId = `text-${Date.now()}`;

    const newTextMotif = {
      id: textMotifId,
      name: `Text: ${text}`,
      imageData,
      category: 'text'
    };

    setCustomMotifs(prev => [...prev, newTextMotif]);
    setTextInput('');
    setShowTextInput(false);
  };

  const handleResizeStart = (panel: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(panel);

    const handleMouseMove = (e: MouseEvent) => {
      if (panel === 'left') {
        const newWidth = Math.max(200, Math.min(500, e.clientX - 32)); // 32px for margin
        setLeftPanelWidth(newWidth);
      } else if (panel === 'right') {
        const newWidth = Math.max(200, Math.min(500, window.innerWidth - e.clientX - 32));
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  const convertImageToPixelArt = (imageData: string, motifSize: number, gridX: number, gridY: number, grid: boolean[][], threshold: number = 128, flipHorizontal: boolean = false, flipVertical: boolean = false) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve();
          return;
        }

        // Calculate the size in grid cells based on motif size
        const baseSize = Math.max(5, Math.min(100, Math.round(motifSize * 25)));
        const pixelsWide = baseSize;
        const pixelsHigh = baseSize;

        canvas.width = pixelsWide;
        canvas.height = pixelsHigh;

        // Apply flipping transformations
        ctx.save();
        if (flipHorizontal && flipVertical) {
          ctx.translate(pixelsWide, pixelsHigh);
          ctx.scale(-1, -1);
        } else if (flipHorizontal) {
          ctx.translate(pixelsWide, 0);
          ctx.scale(-1, 1);
        } else if (flipVertical) {
          ctx.translate(0, pixelsHigh);
          ctx.scale(1, -1);
        }

        // Draw and resize the image
        ctx.drawImage(img, 0, 0, pixelsWide, pixelsHigh);
        ctx.restore();

        // Get pixel data
        const pixelData = ctx.getImageData(0, 0, pixelsWide, pixelsHigh);
        const data = pixelData.data;

        console.log(`Processing image: ${pixelsWide}x${pixelsHigh} pixels with threshold ${threshold}`);

        // Convert to grid - each pixel becomes one grid cell
        for (let pixelY = 0; pixelY < pixelsHigh; pixelY++) {
          for (let pixelX = 0; pixelX < pixelsWide; pixelX++) {
            const pixelIndex = (pixelY * pixelsWide + pixelX) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const a = data[pixelIndex + 3];

            // Skip transparent pixels
            if (a < 128) continue;

            // Convert to grayscale using proper luminance formula
            const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;

            // Use custom threshold: pixels darker than threshold = filled
            const shouldFill = grayscale < threshold;

            // Map pixel to grid position
            const gridPosX = gridX - Math.floor(pixelsWide / 2) + pixelX;
            const gridPosY = gridY - Math.floor(pixelsHigh / 2) + pixelY;

            // Place in grid if within bounds, using OR logic to merge overlapping motifs
            if (gridPosX >= 0 && gridPosX < gridWidth &&
                gridPosY >= 0 && gridPosY < gridHeight) {
              // Merge with existing content - keep filled spaces from both motifs
              grid[gridPosY][gridPosX] = grid[gridPosY][gridPosX] || shouldFill;
            }
          }
        }

        console.log('Image processing complete');
        resolve();
      };

      img.onerror = () => {
        console.error('Failed to load image');
        resolve();
      };

      img.src = imageData;
    });
  };
  return (
    <div className="design-workspace">
      <header className="workspace-header">
        <div className="workspace-title">
          <h1 data-testid="project-title">{project.name}</h1>
        </div>
        <div className="workspace-actions">
          <button
            className="btn btn-secondary"
            onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScqOCph9RL1wJwa3bglCA-fPsgcGnpMLZXOyG9jt5RRs1ZTpg/viewform?pli=1', '_blank')}
            title="Gi oss tilbakemeldinger på verktøyet"
          >
            Gi oss tilbakemeldinger
          </button>
          <button
            className="btn btn-export"
            onClick={handleExportPattern}
            disabled={(!generatedPattern && !backSidePattern) || autoUpdating}
            title={(generatedPattern || backSidePattern) && !autoUpdating ? "Eksporter veskemønster som tekstfil" : autoUpdating ? "Vent til mønsteret er oppdatert" : "Plasser motiver for å generere mønster"}
          >
            Eksporter oppskrift
          </button>
        </div>
      </header>

      <div
        className="workspace-content"
        style={{
          display: 'grid',
          gridTemplateColumns: `${leftPanelWidth}px 1rem 1fr 1rem ${rightPanelWidth}px`,
          gap: '0',
          padding: '1rem',
          overflow: 'hidden'
        }}
      >
        <aside
          className="motif-panel"
          style={{ width: `${leftPanelWidth}px`, minWidth: `${leftPanelWidth}px` }}
        >
          <h3>Motivbibliotek - TEST DEPLOY</h3>

          {customMotifs.length > 0 && (
            <>
              <div className="category-selector">
                <label htmlFor="category-select">Kategori:</label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-dropdown"
                >
                  <option value="all">Alle motiver</option>
                  <option value="sea">Hav</option>
                  <option value="birds">Fugler</option>
                  <option value="flowers">Blomster</option>
                  <option value="sport">Sport</option>
                  <option value="other">Andre</option>
                </select>
              </div>

              <div className="motif-grid">
                {customMotifs
                  .filter(motif => motif.category !== 'text' && (selectedCategory === 'all' || motif.category === selectedCategory))
                  .map((customMotif) => (
                    <div
                      key={customMotif.id}
                      className={`motif-item ${selectedMotifType === customMotif.id ? 'selected' : ''}`}
                      onClick={() => handleMotifClick(customMotif.id, customMotif.name)}
                      title={customMotif.name}
                    >
                      <div className="motif-preview custom-motif">
                        <img
                          src={customMotif.imageData}
                          alt={customMotif.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* Placed Motifs Section - moved below library */}
          <div className="placed-motifs-library-section">
            <h4>Plasserte motiver</h4>
            {getCurrentMotifs().length > 0 ? (
              <div className="placed-motifs-compact-list">
                {getCurrentMotifs().map((motif) => (
                  <div
                    key={motif.id}
                    className={`placed-motif-compact-item ${selectedMotifId === motif.id ? 'selected' : ''}`}
                    onClick={() => handleMotifSelect(motif.id)}
                    title={motif.name}
                  >
                    {motif.imageData && (
                      <img
                        src={motif.imageData}
                        alt={motif.name}
                        style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                      />
                    )}
                    <span className="motif-compact-name">{motif.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-motifs-compact">Ingen motiver plassert på {currentSide === 'front' ? 'forsiden' : 'baksiden'}</p>
            )}
          </div>

          <div className="upload-section">
            <h4>Egne motiver</h4>

            <div className="motif-creation-buttons">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="motif-upload"
              />
              <label htmlFor="motif-upload" className="upload-button">
                Last opp bilde
              </label>

              <button
                className="upload-button text-button"
                onClick={() => setShowTextInput(!showTextInput)}
              >
                Legg til tekst
              </button>
            </div>

            {showTextInput && (
              <div className="text-input-section">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Skriv inn tekst for motiv..."
                  className="text-input"
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && textInput.trim()) {
                      createTextMotif(textInput);
                    }
                    if (e.key === 'Escape') {
                      setShowTextInput(false);
                      setTextInput('');
                    }
                  }}
                />
                <div className="text-input-actions">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => createTextMotif(textInput)}
                    disabled={!textInput.trim()}
                  >
                    Opprett
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setShowTextInput(false);
                      setTextInput('');
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {/* Text Motifs Display */}
            {customMotifs.filter(m => m.category === 'text').length > 0 && (
              <div className="text-motifs-list">
                <div className="motif-grid">
                  {customMotifs
                    .filter(motif => motif.category === 'text')
                    .map((customMotif) => (
                      <div
                        key={customMotif.id}
                        className={`motif-item ${selectedMotifType === customMotif.id ? 'selected' : ''}`}
                        onClick={() => handleMotifClick(customMotif.id, customMotif.name)}
                        title={customMotif.name}
                      >
                        <div className="motif-preview custom-motif">
                          <img
                            src={customMotif.imageData}
                            alt={customMotif.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="manual-fill-section">
            <h4>Manuelt fylleverktøy</h4>
            <p className="tool-description">Klikk på rutenettceller for å fylle eller tømme dem manuelt</p>

            <div className="manual-fill-controls">
              <button
                className={`btn ${manualFillMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setManualFillMode(!manualFillMode)}
                title={manualFillMode ? "Avslutt manuell fyllmodus" : "Start manuell fyllmodus"}
              >
                {manualFillMode ? 'Avslutt fyllmodus' : 'Start fyllmodus'}
              </button>

              {manualFillMode && (
                <div className="fill-mode-info">
                  <div className="tool-mode-selector">
                    <button
                      className={`btn btn-small ${manualToolMode === 'fill' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setManualToolMode('fill')}
                      title="Fyll tomme celler"
                    >
                      Fyll
                    </button>
                    <button
                      className={`btn btn-small ${manualToolMode === 'clear' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setManualToolMode('clear')}
                      title="Tøm fylte celler"
                    >
                      Tøm
                    </button>
                  </div>
                  <p><small>{manualToolMode === 'fill' ? 'Klikk for å fylle celler' : 'Klikk for å tømme celler'}</small></p>
                </div>
              )}
            </div>

            <div className="manual-fill-actions">
              <button
                className="btn btn-small btn-outline"
                onClick={() => clearManualFills(currentSide)}
                disabled={getCurrentManualFills().size === 0}
                title={`Tøm manuelle fyllinger for ${currentSide === 'front' ? 'forside' : 'bakside'}`}
              >
                Tøm {currentSide === 'front' ? 'forside' : 'bakside'}
              </button>

              <button
                className="btn btn-small btn-outline"
                onClick={() => clearManualFills()}
                disabled={manualFillCells.front.size === 0 && manualFillCells.back.size === 0}
                title="Tøm alle manuelle fyllinger"
              >
                Tøm alle
              </button>
            </div>
          </div>

        </aside>

        {/* Left resize handle */}
        <div
          className={`resize-handle left-handle ${isResizing === 'left' ? 'resizing' : ''}`}
          onMouseDown={(e) => handleResizeStart('left', e)}
          title="Dra for å endre størrelse på motivpanel"
          style={{
            width: '4px',
            background: 'transparent',
            cursor: 'col-resize',
            position: 'relative'
          }}
        />

        <main className="design-canvas" style={{ overflowY: 'auto' }}>
          <div className="grid-container" data-testid="grid-container">
            {true ? (
              <div className="dual-grid-view">
                <div className="grid-controls">
                  <div className="grid-size-info-section">
                    <label>Størrelse:</label>
                    <div className="grid-size-value">{(gridWidth * 1.0).toFixed(0)} * {(gridHeight * 0.9).toFixed(0)} cm</div>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => {
                        const newWidthCm = prompt('Bredde (cm):', (gridWidth * 1.0).toFixed(1));
                        const newHeightCm = prompt('Høyde (cm):', (gridHeight * 0.9).toFixed(1));
                        if (newWidthCm && newHeightCm) {
                          const widthCm = parseFloat(newWidthCm);
                          const heightCm = parseFloat(newHeightCm);
                          if (!isNaN(widthCm) && !isNaN(heightCm) && widthCm >= 8 && widthCm <= 200 && heightCm >= 7.2 && heightCm <= 180) {
                            const newWidth = Math.round(widthCm / 1.0);
                            const newHeight = Math.round(heightCm / 0.9);
                            setGridWidth(newWidth);
                            setGridHeight(newHeight);
                          } else {
                            alert('Bredde må være mellom 8 og 200 cm, høyde må være mellom 7.2 og 180 cm');
                          }
                        }
                      }}
                      title="Endre rutenettets størrelse"
                    >
                      Rediger størrelse
                    </button>
                  </div>

                  <div className="color-picker-section">
                    <label>Farge:</label>
                    <div className="color-options">
                      {(['white', 'red', 'green', 'blue'] as const).map((color) => (
                        <button
                          key={color}
                          className={`color-option ${fillColor === color ? 'selected' : ''}`}
                          onClick={() => updateFillColor(color)}
                          style={{
                            backgroundColor: getColorValue(color),
                            border: color === 'white' ? '2px solid #999' : '2px solid transparent',
                            borderColor: fillColor === color ? '#B4BA8F' : (color === 'white' ? '#999' : 'transparent')
                          }}
                          title={`Bruk ${color === 'white' ? 'hvit' : color === 'red' ? 'rød' : color === 'green' ? 'grønn' : 'blå'} farge`}
                        >
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="edge-pattern-section">
                    <label>Kantmønster:</label>
                    <select
                      value={edgePattern}
                      onChange={(e) => setEdgePattern(e.target.value as any)}
                      className="edge-pattern-select"
                    >
                      <option value="none">Ingen</option>
                      <option value="border-1">Enkel kant</option>
                      <option value="border-2">Dobbel kant</option>
                      <option value="corner-triangles">Hjørnetriangel</option>
                      <option value="checkerboard-edges">Sjakkmønster kant</option>
                      <option value="snake-pattern">Keltisk fletting</option>
                      <option value="stepped-border">Trappekant</option>
                      <option value="checkerboard-2row">Mini sjakkmønster</option>
                    </select>
                  </div>

                  <div className="copy-pattern-section">
                    <label>Kopier:</label>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={handleCopyFrontToBack}
                      title="Kopier forside-design til bakside"
                      disabled={placedMotifs.length === 0}
                    >
                      Forside → bakside
                    </button>
                  </div>

                  <div className="invert-pattern-section">
                    <label>Mønster:</label>
                    <button
                      className="btn btn-small btn-secondary"
                      data-testid="stitch-interpretation-toggle"
                      onClick={toggleStitchInterpretation}
                      title="Bytt fyllte og åpne ruter"
                    >
                      Invertér
                    </button>
                  </div>

                </div>

                <div className="dual-grids-container">
                  {/* Front Grid */}
                  <div className={`grid-side ${currentSide === 'front' ? 'active' : 'inactive'}`}>
                    <div className="grid-side-header">
                      <h4>Forside</h4>
                      <button
                        className="btn btn-small btn-activate"
                        onClick={() => setCurrentSide('front')}
                      >
                        Aktiver
                      </button>
                    </div>

                    <div
                      className="crochet-grid-container"
                      onWheel={handleGridWheel}
                      onDrop={(e) => handleGridDrop(e, 'front')}
                      onDragOver={handleGridDragOver}
                      onDragEnter={(e) => handleGridDragEnter(e, 'front')}
                      onDragLeave={handleGridDragLeave}
                      onTouchStart={handleGridTouchStart}
                      onTouchMove={handleGridTouchMove}
                      onTouchEnd={handleGridTouchEnd}
                      style={{
                        border: currentSide === 'front' ? '3px solid #3498db' : '2px solid #ccc',
                        borderRadius: '4px',
                        background: dragOverSide === 'front' ? '#e8f5e8' : '#f5f5f5',
                        cursor: selectedMotifType && currentSide === 'front' ? 'crosshair' : 'default',
                        touchAction: 'none'
                      }}
                    >
                      {generatedPattern && renderGrid('front', generatedPattern, placedMotifs)}
                    </div>
                  </div>

                  {/* Back Grid */}
                  <div className={`grid-side ${currentSide === 'back' ? 'active' : 'inactive'}`}>
                    <div className="grid-side-header">
                      <h4>Bakside</h4>
                      <button
                        className="btn btn-small btn-activate"
                        onClick={() => setCurrentSide('back')}
                      >
                        Aktiver
                      </button>
                    </div>

                    <div
                      className="crochet-grid-container"
                      onWheel={handleGridWheel}
                      onDrop={(e) => handleGridDrop(e, 'back')}
                      onDragOver={handleGridDragOver}
                      onDragEnter={(e) => handleGridDragEnter(e, 'back')}
                      onDragLeave={handleGridDragLeave}
                      onTouchStart={handleGridTouchStart}
                      onTouchMove={handleGridTouchMove}
                      onTouchEnd={handleGridTouchEnd}
                      style={{
                        border: currentSide === 'back' ? '3px solid #3498db' : '2px solid #ccc',
                        borderRadius: '4px',
                        background: dragOverSide === 'back' ? '#e8f5e8' : '#f5f5f5',
                        cursor: selectedMotifType && currentSide === 'back' ? 'crosshair' : 'default',
                        touchAction: 'none'
                      }}
                    >
                      {backSidePattern && renderGrid('back', backSidePattern, backSideMotifs)}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div
                className="grid-placeholder"
                onDrop={(e) => {
                  // Handle drop on placeholder - pick the front side by default
                  handleGridDrop(e, 'front');
                }}
                onDragOver={handleGridDragOver}
                onDragEnter={(e) => handleGridDragEnter(e, 'front')}
                onDragLeave={handleGridDragLeave}
                style={{
                  background: dragOverSide === 'front' ? '#e8f5e8' : 'transparent',
                  border: dragOverSide === 'front' ? '2px dashed #4CAF50' : '2px dashed transparent',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                <p>Interaktivt rutenett vil vises her etter at motiver er plassert</p>
                <p>Last opp bilder eller lag tekstmotiver fra venstre panel for å starte design</p>
                <p><strong>Du kan også dra og slippe bilder direkte hit!</strong></p>
              </div>
            )}
          </div>
        </main>

        {/* Right resize handle */}
        <div
          className={`resize-handle right-handle ${isResizing === 'right' ? 'resizing' : ''}`}
          onMouseDown={(e) => handleResizeStart('right', e)}
          title="Dra for å endre størrelse på kontrollpanel"
          style={{
            width: '4px',
            background: 'transparent',
            cursor: 'col-resize',
            position: 'relative'
          }}
        />

        {/* Right Panel - Motif Controls */}
        <aside
          className="controls-panel"
          style={{ width: `${rightPanelWidth}px`, minWidth: `${rightPanelWidth}px`, overflow: 'auto' }}
        >
          {/* Motif Controls */}
          <div className="motif-controls-section">
            <h4>Plasserte motiver</h4>
            {getCurrentMotifs().length > 0 ? (
              <div className="motif-controls-list">
                {getCurrentMotifs().map((motif) => {
                  const isActive = selectedMotifId === motif.id;
                  const showFullControls = getCurrentMotifs().length === 1 || isActive;

                  return (
                    <div
                      key={motif.id}
                      className={`motif-control-item ${isActive ? 'selected' : ''} ${!showFullControls ? 'collapsed' : ''}`}
                    >
                      {/* Collapsed header - click to expand */}
                      {!showFullControls && (
                        <div
                          className="motif-collapsed-header"
                          onClick={() => handleMotifSelect(motif.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {motif.imageData && (
                            <img
                              src={motif.imageData}
                              alt={motif.name}
                              style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '4px' }}
                            />
                          )}
                          <span style={{ fontSize: '0.8rem', color: '#6c757d', marginLeft: 'auto' }}>▼</span>
                        </div>
                      )}

                      {/* Full controls - shown when active or only motif */}
                      {showFullControls && (
                        <>
                          <div className="motif-info" onClick={() => handleMotifSelect(motif.id)} style={{ cursor: 'pointer' }}>
                            {motif.imageData && (
                              <div className="motif-thumbnail">
                                <img
                                  src={motif.imageData}
                                  alt={motif.name}
                                  style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #999', borderRadius: '4px' }}
                                  title={motif.name}
                                />
                              </div>
                            )}
                          </div>

                          <div className="motif-size-control">
                            <label>Størrelse:</label>
                            <div className="size-slider-container">
                              <input
                                type="range"
                                min="0.1"
                                max={getMaxMotifSize()}
                                step="0.05"
                                value={motif.size}
                                onChange={(e) => handleMotifResize(motif.id, parseFloat(e.target.value))}
                                className="size-slider"
                                title={`Nåværende størrelse: ${(motif.size * 100).toFixed(0)}%`}
                              />
                            </div>
                          </div>

                          {/* Threshold Control */}
                          <div className="motif-threshold-control">
                            <label>Balanse:</label>
                            <div className="size-slider-container">
                              <input
                                type="range"
                                min="0"
                                max="230"
                                step="5"
                                value={motif.threshold}
                                onChange={(e) => handleMotifThreshold(motif.id, parseInt(e.target.value))}
                                className="size-slider"
                                title={`Terskel: ${motif.threshold} (lavere = mer svart)`}
                              />
                            </div>
                          </div>

                          {/* Flip Controls */}
                          <div className="motif-flip-controls">
                            <label>Vend:</label>
                            <div className="flip-buttons">
                              <button
                                className={`btn btn-small ${motif.flipHorizontal ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleMotifFlip(motif.id, 'horizontal')}
                                title="Vend horisontalt"
                              >
                                Horisontal
                              </button>
                              <button
                                className={`btn btn-small ${motif.flipVertical ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleMotifFlip(motif.id, 'vertical')}
                                title="Vend vertikalt"
                              >
                                Vertikal
                              </button>
                            </div>
                          </div>

                          <div className="motif-action-buttons">
                            <button
                              className="btn btn-small btn-secondary"
                              onClick={() => handleMotifDuplicate(motif.id)}
                              title={`Dupliser ${motif.name} motiv`}
                            >
                              Dupliser
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleMotifRemove(motif.id)}
                              title={`Fjern ${motif.name} motiv`}
                            >
                              Fjern
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-motifs">Ingen motiver plassert på {currentSide === 'front' ? 'forsiden' : 'baksiden'}</p>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};
