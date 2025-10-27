'use client';

import React, { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { PatternPDF } from './PatternPDF';
import { LanguageSwitcher } from './LanguageSwitcher';
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
  const { t, i18n } = useTranslation('common');
  const [projectName, setProjectName] = useState<string>(project.name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [showExportNameDialog, setShowExportNameDialog] = useState<boolean>(false);
  const [exportName, setExportName] = useState<string>(projectName);
  const [placedMotifs, setPlacedMotifs] = useState<PlacedMotif[]>([]);
  const [selectedMotifType, setSelectedMotifType] = useState<string | null>(null);
  const [generatedPattern, setGeneratedPattern] = useState<any>(null);
  const [stitchInterpretation, setStitchInterpretation] = useState<'black_filled' | 'black_open'>('black_filled');
  const [gridType, setGridType] = useState<'åpent' | 'tett'>('åpent');
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
  const [gridZoom, setGridZoom] = useState<number>(1.0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [backSideMotifs, setBackSideMotifs] = useState<PlacedMotif[]>([]);
  const [backSidePattern, setBackSidePattern] = useState<any>(null);
  const [dragOverSide, setDragOverSide] = useState<'front' | 'back' | null>(null);

  // Touch/pinch zoom state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1.25);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileMotifPanel, setShowMobileMotifPanel] = useState<boolean>(false);
  const [showMobileControlPanel, setShowMobileControlPanel] = useState<boolean>(false);

  // Mobile motif control
  const [mobileSelectedMotif, setMobileSelectedMotif] = useState<string | null>(null);
  const [showMotifControlModal, setShowMotifControlModal] = useState<boolean>(false);
  const [isDraggingMotif, setIsDraggingMotif] = useState<boolean>(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number} | null>(null);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [initialPinchSize, setInitialPinchSize] = useState<number>(1);

  const [manualFillMode, setManualFillMode] = useState<boolean>(false);
  const [manualFillCells, setManualFillCells] = useState<{front: Map<string, string>, back: Map<string, string>}>({
    front: new Map<string, string>(),
    back: new Map<string, string>()
  });
  const [manualToolMode, setManualToolMode] = useState<'fill' | 'clear'>('fill');
  const [fillColor, setFillColor] = useState<'white' | 'red' | 'green' | 'blue'>('red');
  const [edgePattern, setEdgePattern] = useState<'none' | 'border-1' | 'border-2' | 'corner-triangles' | 'checkerboard-edges' | 'snake-pattern' | 'stepped-border' | 'checkerboard-2row'>('border-1');

  // Improved yarn calculation based on empirical data
  const calculateYarnRequired = (widthCm: number, heightCm: number, type: 'åpent' | 'tett') => {
    const area = widthCm * heightCm; // cm²
    // Consumption rates based on real finished bag data (g/cm²)
    const consumptionRate = type === 'tett' ? 0.209 : 0.194;
    const grams = area * consumptionRate;
    const skeinsNeeded = Math.ceil(grams / 50); // For 50g skeins
    return { grams, skeinsNeeded };
  };
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

  // Mobile detection with resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // On mobile, auto-open control modal for the newly placed motif
    if (isMobile) {
      setMobileSelectedMotif(newMotif.id);
      setShowMotifControlModal(true);
    }
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
    // Auto-calculate cell size to fit screen
    // On mobile: use most of viewport width (90vw)
    // On desktop: use available panel width
    let cellSize: number;
    let padding: number;

    if (isMobile) {
      // Calculate to fit within screen width
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
      // Account for: mobile-design-workspace padding (1rem * 2 = 32px) + mobile-grid-container padding (1rem * 2 = 32px)
      const availableWidth = viewportWidth - 64;

      // Calculate cell size that fits, accounting for grid padding
      const tempCellSize = availableWidth / gridWidth;
      const tempPadding = Math.max(4, Math.round(tempCellSize * 0.15));
      const gridPaddingTotal = tempPadding * 2;

      // Final cell size that ensures grid + padding fits in available width
      cellSize = Math.max(8, Math.min(25, (availableWidth - gridPaddingTotal) / gridWidth));
      padding = Math.max(4, Math.round(cellSize * 0.15));

      // Limit zoom on mobile
      const effectiveZoom = Math.min(gridZoom, 1.0);
      cellSize = cellSize * effectiveZoom;
    } else {
      // Desktop: ~50% of screen width for center panel with 2 grids
      const baseCellSize = Math.max(8, Math.min(25, 600 / gridWidth));
      cellSize = baseCellSize * gridZoom;
      padding = Math.max(4, Math.round(cellSize * 0.15));
    }

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
                    if (isMobile) {
                      // On mobile, open control modal
                      setMobileSelectedMotif(motifsAtPosition[0].id);
                      setShowMotifControlModal(true);
                    } else {
                      // On desktop, use the sidebar selection
                      handleMotifSelect(motifsAtPosition[0].id);
                    }
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

  // Mobile motif touch handlers
  const handleMotifTouchStart = (e: React.TouchEvent, motifId: string) => {
    if (!isMobile) return;

    // If already selected, start long-press timer for drag
    if (mobileSelectedMotif === motifId && e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });

      const timer = setTimeout(() => {
        setIsDraggingMotif(true);
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 1000); // 1 second long press

      setLongPressTimer(timer);
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to resize
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setInitialPinchDistance(distance);

      const motif = getCurrentMotifs().find(m => m.id === motifId);
      if (motif) {
        setInitialPinchSize(motif.size);
      }
      setIsPinching(true);
    }
  };

  const handleMotifTouchMove = (e: React.TouchEvent, motifId: string) => {
    if (!isMobile) return;

    // Handle pinch-to-resize
    if (isPinching && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (initialPinchDistance) {
        const scale = currentDistance / initialPinchDistance;
        const newSize = Math.max(0.1, Math.min(getMaxMotifSize(), initialPinchSize * scale));
        handleMotifResize(motifId, newSize);
      }
      return;
    }

    // Handle drag
    if (isDraggingMotif && touchStartPos && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;

      // Cancel long-press if moved too much before timer finished
      if (longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Update motif position
      const motif = getCurrentMotifs().find(m => m.id === motifId);
      if (motif) {
        // Convert pixel movement to percentage
        const gridElement = e.currentTarget.closest('.crochet-grid');
        if (gridElement) {
          const gridRect = gridElement.getBoundingClientRect();
          const deltaXPercent = (deltaX / gridRect.width) * 100;
          const deltaYPercent = (deltaY / gridRect.height) * 100;

          const newX = Math.max(-50, Math.min(150, motif.x + deltaXPercent));
          const newY = Math.max(-50, Math.min(150, motif.y + deltaYPercent));

          setCurrentMotifs(prev => prev.map(m =>
            m.id === motifId ? { ...m, x: newX, y: newY } : m
          ));

          setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        }
      }
    }
  };

  const handleMotifTouchEnd = (motifId: string) => {
    if (!isMobile) return;

    // Clear long-press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // End drag mode
    if (isDraggingMotif) {
      setIsDraggingMotif(false);
      // Regenerate pattern after drag
      setTimeout(() => {
        handleGeneratePattern();
      }, 100);
    }

    // End pinch mode
    if (isPinching) {
      setIsPinching(false);
      setInitialPinchDistance(null);
    }

    setTouchStartPos(null);

    // If this was just a tap (not drag/pinch), select motif and show control
    if (!isDraggingMotif && !isPinching) {
      setMobileSelectedMotif(motifId);
      setShowMotifControlModal(true);
    }
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

    // Improved yarn calculation based on empirical data from finished bags
    // Uses actual bag dimensions (width × height in cm) and grid type
    const gridScaleWidth = 1.0; // 10 grid units = 10 cm (width)
    const gridScaleHeight = 0.9; // 10 grid units = 9 cm (height)
    const widthCm = gridWidth * gridScaleWidth;
    const heightCm = gridHeight * gridScaleHeight;

    const yarnCalc = calculateYarnRequired(widthCm, heightCm, gridType);

    const pattern = {
      id: `pattern-${Date.now()}`,
      stitchInterpretation,
      gridType,
      gridDimensions: `${gridWidth} × ${gridHeight} (${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm)`,
      totalSquares: gridWidth * gridHeight,
      filledSquares,
      openSquares,
      foundationStitches,
      filledStitches,
      totalStitches,
      yarnGrams: yarnCalc.grams,
      skeinsNeeded: yarnCalc.skeinsNeeded,
      generatedAt: new Date().toLocaleString(),
      grid,
      gridMotifs
    };

    setCurrentPattern(pattern);
  };

  const toggleStitchInterpretation = () => {
    setStitchInterpretation(prev => prev === 'black_filled' ? 'black_open' : 'black_filled');
  };

  const handleExportPattern = () => {
    console.log('🎯 Export button clicked!');
    const frontPattern = generatedPattern;
    const backPattern = backSidePattern;

    console.log('Pattern check:', {
      hasFrontPattern: !!frontPattern,
      hasBackPattern: !!backPattern
    });

    if (!frontPattern && !backPattern) {
      console.log('❌ No pattern to export');
      alert('Ingen mønster å eksportere. Vennligst lag et design først.');
      return;
    }

    // Update export name from current project name
    setExportName(projectName);
    // Show name dialog
    setShowExportNameDialog(true);
  };

  const handleConfirmExport = async (nameForExport: string) => {
    console.log('✅ Starting PDF export with name:', nameForExport);
    const frontPattern = generatedPattern;
    const backPattern = backSidePattern;

    // Calculate combined yarn requirements using improved area-based formula
    const gridScaleWidth = 1.0;
    const gridScaleHeight = 0.9;
    const widthCm = gridWidth * gridScaleWidth;
    const heightCm = gridHeight * gridScaleHeight;

    let totalSkeins = 0;
    let totalGrams = 0;

    if (frontPattern) {
      const frontYarn = calculateYarnRequired(widthCm, heightCm, gridType);
      totalGrams += frontYarn.grams;
      totalSkeins += frontYarn.skeinsNeeded;
    }

    if (backPattern) {
      const backYarn = calculateYarnRequired(widthCm, heightCm, gridType);
      totalGrams += backYarn.grams;
      totalSkeins += backYarn.skeinsNeeded;
    }

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
          projectName={nameForExport}
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
      link.download = `${nameForExport.replace(/[^a-zA-Z0-9]/g, '_')}_oppskrift.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Track PDF export event in Plausible
      if (typeof window !== 'undefined' && (window as any).plausible) {
        console.log('🎯 Plausible: Tracking PDF Export event');
        (window as any).plausible('PDF Export', {
          props: {
            projectName: nameForExport,
            gridSize: `${gridWidth}x${gridHeight}`,
            hasFront: !!frontPattern,
            hasBack: !!backPattern
          }
        });
        console.log('✅ Plausible: PDF Export event sent');
      } else {
        console.warn('⚠️ Plausible not loaded - event not tracked');
      }

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
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
                if (e.key === 'Escape') {
                  setProjectName(projectName);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="project-name-input"
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                border: 'none',
                background: 'transparent',
                padding: '0',
                fontFamily: 'inherit',
                width: '100%'
              }}
            />
          ) : (
            <h1
              data-testid="project-title"
              onClick={() => setIsEditingName(true)}
              style={{ cursor: 'pointer', margin: 0 }}
            >
              {projectName}
            </h1>
          )}
        </div>
        <div className="workspace-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const feedbackForm = i18n.language === 'en'
                ? 'https://docs.google.com/forms/d/e/1FAIpQLSfauXfua_1riWKDomPCHUxAW6rlreHRayEbcwl18MVfG0xdvA/viewform?usp=publish-editor'
                : 'https://docs.google.com/forms/d/e/1FAIpQLScqOCph9RL1wJwa3bglCA-fPsgcGnpMLZXOyG9jt5RRs1ZTpg/viewform?pli=1';
              window.open(feedbackForm, '_blank');
            }}
            title={t('workspace.feedback')}
          >
            {t('workspace.feedback')}
          </button>
          <button
            className="btn btn-export"
            onClick={handleExportPattern}
            disabled={(!generatedPattern && !backSidePattern) || autoUpdating}
            title={(generatedPattern || backSidePattern) && !autoUpdating ? t('workspace.export') : autoUpdating ? t('workspace.exportDisabled') : t('workspace.exportNoPattern')}
          >
            {t('workspace.export')}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Layout - New Mockup Design */}
      {isMobile ? (
        <div className="mobile-design-workspace">
          {/* Mobile Header: Project name + dimensions + Revider button */}
          <div className="mobile-header-row">
            <div className="mobile-project-info">
              <span className="mobile-project-name">{project.name}</span>
              <span className="mobile-project-dims">{t('workspace.dimensions')} {project.width} *{project.height} cm</span>
            </div>
            <button
              className="btn-mobile-green"
              onClick={() => {
                const newWidthCm = prompt(t('workspace.resizePromptWidth'), (gridWidth * 1.0).toFixed(1));
                const newHeightCm = prompt(t('workspace.resizePromptHeight'), (gridHeight * 0.9).toFixed(1));
                if (newWidthCm && newHeightCm) {
                  const widthCm = parseFloat(newWidthCm);
                  const heightCm = parseFloat(newHeightCm);
                  if (!isNaN(widthCm) && !isNaN(heightCm) && widthCm >= 8 && widthCm <= 200 && heightCm >= 7.2 && heightCm <= 180) {
                    const newWidth = Math.round(widthCm / 1.0);
                    const newHeight = Math.round(heightCm / 0.9);
                    setGridWidth(newWidth);
                    setGridHeight(newHeight);
                  } else {
                    alert(t('workspace.resizeError'));
                  }
                }
              }}
            >
              {t('workspace.resizeButton')}
            </button>
          </div>

          {/* Garn (Color picker) row */}
          <div className="mobile-control-row">
            <label>{t('workspace.yarn')}</label>
            <div className="mobile-color-circles">
              <div
                className={`color-circle ${fillColor === 'green' ? 'selected' : ''}`}
                style={{ background: getColorValue('green') }}
                onClick={() => updateFillColor('green')}
              ></div>
              <div
                className={`color-circle ${fillColor === 'white' ? 'selected' : ''}`}
                style={{ background: getColorValue('white'), border: '2px solid #ddd' }}
                onClick={() => updateFillColor('white')}
              ></div>
              <div
                className={`color-circle ${fillColor === 'red' ? 'selected' : ''}`}
                style={{ background: getColorValue('red') }}
                onClick={() => updateFillColor('red')}
              ></div>
              <div
                className={`color-circle ${fillColor === 'blue' ? 'selected' : ''}`}
                style={{ background: getColorValue('blue') }}
                onClick={() => updateFillColor('blue')}
              ></div>
            </div>
          </div>

          {/* Bord + Invertér row */}
          <div className="mobile-control-row">
            <div className="mobile-row-group">
              <label>{t('grid.border')}</label>
              <button
                className="btn-mobile-green"
                onClick={() => {
                  const patterns = ['none', 'border-1', 'border-2', 'corner-triangles', 'checkerboard-edges', 'snake-pattern', 'stepped-border', 'checkerboard-2row'] as const;
                  const currentIndex = patterns.indexOf(edgePattern);
                  const nextIndex = (currentIndex + 1) % patterns.length;
                  setEdgePattern(patterns[nextIndex]);
                }}
              >
                {edgePattern === 'none' ? t('borderPatterns.none') :
                 edgePattern === 'border-1' ? t('borderPatterns.simple') :
                 edgePattern === 'border-2' ? t('borderPatterns.double') :
                 edgePattern === 'corner-triangles' ? t('borderPatterns.cornerTriangle') :
                 edgePattern === 'checkerboard-edges' ? t('borderPatterns.checkerboard') :
                 edgePattern === 'snake-pattern' ? t('borderPatterns.celticWeave') :
                 edgePattern === 'stepped-border' ? t('borderPatterns.stairStep') :
                 t('borderPatterns.miniCheckerboard')}
              </button>
            </div>
            <button className="btn-mobile-green" onClick={toggleStitchInterpretation}>
              {t('grid.invert')}
            </button>
          </div>

          {/* Forside/Bakside Toggle */}
          <div className="mobile-side-toggle">
            <button
              className={`btn-mobile-toggle ${currentSide === 'front' ? 'active' : ''}`}
              onClick={() => setCurrentSide('front')}
            >
              {t('grid.front')}
            </button>
            <button
              className={`btn-mobile-toggle ${currentSide === 'back' ? 'active' : ''}`}
              onClick={() => setCurrentSide('back')}
            >
              {t('grid.back')}
            </button>
          </div>

          {/* Single Grid View */}
          <div className="mobile-grid-container">
            {currentSide === 'front' ? (
              generatedPattern && renderGrid('front', generatedPattern, placedMotifs)
            ) : (
              backSidePattern && renderGrid('back', backSidePattern, backSideMotifs)
            )}
          </div>

          {/* Motif Section */}
          <div className="mobile-motif-section">
            <div className="mobile-section-header">
              <span>{t('motifs.library')}</span>
            </div>

            <div className="mobile-category-row">
              <label>{t('motifs.category')}</label>
              <button
                className="btn-mobile-category"
                onClick={() => {
                  const categories = ['all', 'flowers', 'sea', 'birds', 'sport', 'other'];
                  const currentIndex = categories.indexOf(selectedCategory);
                  const nextIndex = (currentIndex + 1) % categories.length;
                  setSelectedCategory(categories[nextIndex]);
                }}
              >
                {selectedCategory === 'flowers' ? t('motifs.categories.flowers') :
                 selectedCategory === 'sea' ? t('motifs.categories.sea') :
                 selectedCategory === 'birds' ? t('motifs.categories.birds') :
                 selectedCategory === 'sport' ? t('motifs.categories.sport') :
                 selectedCategory === 'other' ? t('motifs.categories.other') : t('motifs.categories.all')}
              </button>
            </div>

            {/* Motif Grid */}
            <div className="mobile-motif-grid">
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

            {/* Upload and Text Buttons */}
            <div className="mobile-action-buttons">
              <button
                className="btn-mobile-green"
                onClick={() => setShowTextInput(!showTextInput)}
              >
                {t('motifs.addText')}
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="motif-upload-mobile"
              />
              <label htmlFor="motif-upload-mobile" className="btn-mobile-green">
                {t('motifs.uploadMotif')}
              </label>
            </div>

            {/* Text input (if shown) */}
            {showTextInput && (
              <div className="text-input-section">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('motifs.textPlaceholder')}
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
                    {t('motifs.create')}
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setShowTextInput(false);
                      setTextInput('');
                    }}
                  >
                    {t('motifs.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Display created text and uploaded motifs (exclude library motifs) */}
            {customMotifs.filter(m => !m.id.startsWith('library-')).length > 0 && (
              <div className="mobile-custom-motifs">
                <h4 className="mobile-section-title">{t('motifs.custom')}</h4>
                <div className="mobile-motif-grid">
                  {customMotifs
                    .filter(customMotif => !customMotif.id.startsWith('library-'))
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
                        <span className="motif-name">{customMotif.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Motif Control Compact Panel */}
          {showMotifControlModal && mobileSelectedMotif && (() => {
            const motif = getCurrentMotifs().find(m => m.id === mobileSelectedMotif);
            if (!motif) return null;

            return (
              <div className="mobile-motif-panel">
                {/* Position Controls */}
                <div className="mobile-position-controls">
                  <div className="position-grid">
                    <button className="pos-btn" onClick={() => {
                      setCurrentMotifs(prev => prev.map(m =>
                        m.id === motif.id ? { ...m, y: Math.max(-50, m.y - 5) } : m
                      ));
                      setTimeout(() => handleGeneratePattern(), 100);
                    }}>↑</button>
                    <button className="pos-btn" onClick={() => {
                      setCurrentMotifs(prev => prev.map(m =>
                        m.id === motif.id ? { ...m, x: Math.max(-50, m.x - 5) } : m
                      ));
                      setTimeout(() => handleGeneratePattern(), 100);
                    }}>←</button>
                    <button className="pos-btn" onClick={() => {
                      setCurrentMotifs(prev => prev.map(m =>
                        m.id === motif.id ? { ...m, x: Math.min(150, m.x + 5) } : m
                      ));
                      setTimeout(() => handleGeneratePattern(), 100);
                    }}>→</button>
                    <button className="pos-btn" onClick={() => {
                      setCurrentMotifs(prev => prev.map(m =>
                        m.id === motif.id ? { ...m, y: Math.min(150, m.y + 5) } : m
                      ));
                      setTimeout(() => handleGeneratePattern(), 100);
                    }}>↓</button>
                  </div>
                </div>

                {/* Compact Controls */}
                <div className="mobile-compact-controls">
                  <div className="compact-row">
                    <span className="compact-label">{t('motifs.size')}</span>
                    <input
                      type="range"
                      min="0.1"
                      max={getMaxMotifSize()}
                      step="0.05"
                      value={motif.size}
                      onChange={(e) => handleMotifResize(motif.id, parseFloat(e.target.value))}
                      className="compact-slider"
                    />
                    <span className="compact-value">{(motif.size * 100).toFixed(0)}%</span>
                  </div>

                  <div className="compact-row">
                    <span className="compact-label">{t('motifs.threshold')}</span>
                    <input
                      type="range"
                      min="0"
                      max="230"
                      step="5"
                      value={motif.threshold}
                      onChange={(e) => handleMotifThreshold(motif.id, parseInt(e.target.value))}
                      className="compact-slider"
                    />
                  </div>

                  <div className="compact-row">
                    <button
                      className={`compact-btn ${motif.flipHorizontal ? 'active' : ''}`}
                      onClick={() => handleMotifFlip(motif.id, 'horizontal')}
                    >
                      ↔
                    </button>
                    <button
                      className={`compact-btn ${motif.flipVertical ? 'active' : ''}`}
                      onClick={() => handleMotifFlip(motif.id, 'vertical')}
                    >
                      ↕
                    </button>
                    <button
                      className="compact-btn"
                      onClick={() => {
                        handleMotifDuplicate(motif.id);
                        setShowMotifControlModal(false);
                        setMobileSelectedMotif(null);
                      }}
                    >
                      {t('motifs.duplicate')}
                    </button>
                    <button
                      className="compact-btn danger"
                      onClick={() => {
                        handleMotifRemove(motif.id);
                        setShowMotifControlModal(false);
                        setMobileSelectedMotif(null);
                      }}
                    >
                      {t('motifs.remove')}
                    </button>
                    <button
                      className="compact-btn close"
                      onClick={() => {
                        setShowMotifControlModal(false);
                        setMobileSelectedMotif(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="workspace-content">
        {/* Left Panel - Motif Library */}
        <aside
          className="motif-panel"
          style={{ width: `${leftPanelWidth}px`, minWidth: `${leftPanelWidth}px`, overflow: 'auto' }}
        >
          <h3>{t('motifs.library')}</h3>

          {customMotifs.length > 0 && (
            <>
              <div className="category-selector">
                <label htmlFor="category-select">{t('motifs.category')}</label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-dropdown"
                >
                  <option value="all">{t('motifs.categories.all')}</option>
                  <option value="sea">{t('motifs.categories.sea')}</option>
                  <option value="birds">{t('motifs.categories.birds')}</option>
                  <option value="flowers">{t('motifs.categories.flowers')}</option>
                  <option value="sport">{t('motifs.categories.sport')}</option>
                  <option value="other">{t('motifs.categories.other')}</option>
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

          <div className="upload-section">
            <h4>{t('motifs.custom')}</h4>

            <div className="motif-creation-buttons">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="motif-upload"
              />
              <label htmlFor="motif-upload" className="upload-button">
                {t('motifs.uploadImage')}
              </label>

              <button
                className="upload-button text-button"
                onClick={() => setShowTextInput(!showTextInput)}
              >
                {t('motifs.addText')}
              </button>
            </div>

            {showTextInput && (
              <div className="text-input-section">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('motifs.textPlaceholder')}
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
            <h4>{t('grid.manual')}</h4>
            <p className="tool-description">{t('grid.manualDescription')}</p>

            <div className="manual-fill-controls">
              <button
                className={`btn ${manualFillMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setManualFillMode(!manualFillMode)}
                title={manualFillMode ? t('grid.endFillMode') : t('grid.startFillMode')}
              >
                {manualFillMode ? t('grid.endFillMode') : t('grid.startFillMode')}
              </button>

              {manualFillMode && (
                <div className="fill-mode-info">
                  <div className="tool-mode-selector">
                    <button
                      className={`btn btn-small ${manualToolMode === 'fill' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setManualToolMode('fill')}
                      title={t('grid.fillEmpty')}
                    >
                      {t('grid.fill')}
                    </button>
                    <button
                      className={`btn btn-small ${manualToolMode === 'clear' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setManualToolMode('clear')}
                      title={t('grid.emptyFilled')}
                    >
                      {t('grid.empty')}
                    </button>
                  </div>
                  <p><small>{manualToolMode === 'fill' ? t('grid.fillInstruction') : t('grid.emptyInstruction')}</small></p>
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
                    <label>{t('motifs.size')}</label>
                    <div className="grid-size-value">{(gridWidth * 1.0).toFixed(0)} * {(gridHeight * 0.9).toFixed(0)} cm</div>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => {
                        const newWidthCm = prompt(t('workspace.resizePromptWidth'), (gridWidth * 1.0).toFixed(1));
                        const newHeightCm = prompt(t('workspace.resizePromptHeight'), (gridHeight * 0.9).toFixed(1));
                        if (newWidthCm && newHeightCm) {
                          const widthCm = parseFloat(newWidthCm);
                          const heightCm = parseFloat(newHeightCm);
                          if (!isNaN(widthCm) && !isNaN(heightCm) && widthCm >= 8 && widthCm <= 200 && heightCm >= 7.2 && heightCm <= 180) {
                            const newWidth = Math.round(widthCm / 1.0);
                            const newHeight = Math.round(heightCm / 0.9);
                            setGridWidth(newWidth);
                            setGridHeight(newHeight);
                          } else {
                            alert(t('workspace.resizeError'));
                          }
                        }
                      }}
                      title={t('workspace.editDimensions')}
                    >
                      {t('workspace.resizeButton')}
                    </button>
                  </div>

                  <div className="color-picker-section">
                    <label>{t('workspace.yarn')}</label>
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
                          title={`Use ${t(`colors.${color}`)} color`}
                        >
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="edge-pattern-section">
                    <label>{t('grid.border')}</label>
                    <select
                      value={edgePattern}
                      onChange={(e) => setEdgePattern(e.target.value as any)}
                      className="edge-pattern-select"
                    >
                      <option value="none">{t('borderPatterns.none')}</option>
                      <option value="border-1">{t('borderPatterns.simple')}</option>
                      <option value="border-2">{t('borderPatterns.double')}</option>
                      <option value="corner-triangles">{t('borderPatterns.cornerTriangle')}</option>
                      <option value="checkerboard-edges">{t('borderPatterns.checkerboard')}</option>
                      <option value="snake-pattern">{t('borderPatterns.celticWeave')}</option>
                      <option value="stepped-border">{t('borderPatterns.stairStep')}</option>
                      <option value="checkerboard-2row">{t('borderPatterns.miniCheckerboard')}</option>
                    </select>
                  </div>

                  <div className="copy-pattern-section">
                    <label>{t('grid.copyFrontToBack')}</label>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={handleCopyFrontToBack}
                      title={t('grid.copyFrontToBack')}
                      disabled={placedMotifs.length === 0}
                    >
                      {t('grid.copyButton')}
                    </button>
                  </div>

                  <div className="invert-pattern-section">
                    <label>{t('grid.pattern')}</label>
                    <button
                      className="btn btn-small btn-secondary"
                      data-testid="stitch-interpretation-toggle"
                      onClick={toggleStitchInterpretation}
                      title={t('grid.invertPattern')}
                    >
                      {t('grid.invert')}
                    </button>
                  </div>

                  <div className="grid-zoom-section">
                    <label>Zoom: {(gridZoom * 100).toFixed(0)}%</label>
                    <div className="zoom-slider-container">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setGridZoom(prev => Math.max(0.5, prev - 0.1))}
                        disabled={gridZoom <= 0.5}
                        title="Zoom ut"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={gridZoom}
                        onChange={(e) => setGridZoom(parseFloat(e.target.value))}
                        className="zoom-slider"
                        title={`Zoom: ${(gridZoom * 100).toFixed(0)}%`}
                      />
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setGridZoom(prev => Math.min(3.0, prev + 0.1))}
                        disabled={gridZoom >= 3.0}
                        title="Zoom inn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                <div className="dual-grids-container">
                  {/* Front Grid */}
                  <div className={`grid-side ${currentSide === 'front' ? 'active' : 'inactive'}`}>
                    <div className="grid-side-header">
                      <h4>{t('grid.front')}</h4>
                      <button
                        className="btn btn-small btn-activate"
                        onClick={() => setCurrentSide('front')}
                      >
                        {t('grid.activate')}
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
                      <h4>{t('grid.back')}</h4>
                      <button
                        className="btn btn-small btn-activate"
                        onClick={() => setCurrentSide('back')}
                      >
                        {t('grid.activate')}
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
                <p>{t('grid.placeholder')}</p>
                <p>{t('grid.placeholderUpload')}</p>
                <p><strong>{t('grid.placeholderDrag')}</strong></p>
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
            <h4>{t('motifs.placed')}</h4>
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
                            <label>{t('motifs.size')}</label>
                            <div className="size-slider-container">
                              <input
                                type="range"
                                min="0.1"
                                max={getMaxMotifSize()}
                                step="0.05"
                                value={motif.size}
                                onChange={(e) => handleMotifResize(motif.id, parseFloat(e.target.value))}
                                className="size-slider"
                                title={`${t('motifs.size')} ${(motif.size * 100).toFixed(0)}%`}
                              />
                            </div>
                          </div>

                          {/* Threshold Control */}
                          <div className="motif-threshold-control">
                            <label>{t('motifs.threshold')}</label>
                            <div className="size-slider-container">
                              <input
                                type="range"
                                min="0"
                                max="230"
                                step="5"
                                value={motif.threshold}
                                onChange={(e) => handleMotifThreshold(motif.id, parseInt(e.target.value))}
                                className="size-slider"
                                title={`${t('motifs.threshold')} ${motif.threshold}`}
                              />
                            </div>
                          </div>

                          {/* Flip Controls */}
                          <div className="motif-flip-controls">
                            <label>{t('motifs.flip')}</label>
                            <div className="flip-buttons">
                              <button
                                className={`btn btn-small ${motif.flipHorizontal ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleMotifFlip(motif.id, 'horizontal')}
                                title={t('motifs.flipHorizontal')}
                              >
                                {t('motifs.flipHorizontal')}
                              </button>
                              <button
                                className={`btn btn-small ${motif.flipVertical ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleMotifFlip(motif.id, 'vertical')}
                                title={t('motifs.flipVertical')}
                              >
                                {t('motifs.flipVertical')}
                              </button>
                            </div>
                          </div>

                          <div className="motif-action-buttons">
                            <button
                              className="btn btn-small btn-secondary"
                              onClick={() => handleMotifDuplicate(motif.id)}
                              title={`${t('motifs.duplicate')} ${motif.name}`}
                            >
                              {t('motifs.duplicate')}
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleMotifRemove(motif.id)}
                              title={`${t('motifs.remove')} ${motif.name}`}
                            >
                              {t('motifs.remove')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-motifs">{t('grid.noMotifsOnSide', { side: currentSide === 'front' ? t('grid.front') : t('grid.back') })}</p>
            )}
          </div>
        </aside>

      </div>
      )}

      {/* Export Name Dialog Modal */}
      {showExportNameDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Enter Project Name</h2>
            <input
              type="text"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmExport(exportName || 'Untitled Design');
                  setShowExportNameDialog(false);
                }
              }}
              autoFocus
              placeholder="Project name..."
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExportNameDialog(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleConfirmExport(exportName || 'Untitled Design');
                  setShowExportNameDialog(false);
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#B4BA8F',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
