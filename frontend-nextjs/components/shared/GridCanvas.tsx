/**
 * Grid canvas component for displaying the crochet pattern
 */

import React, { useRef, useEffect } from 'react';

interface GridCanvasProps {
  width: number;
  height: number;
  pattern?: Map<string, string> | null;
  manualFills?: Map<string, string>;
  zoom?: number;
  cellSize?: number;
  onCellClick?: (row: number, col: number) => void;
  placeholder?: string;
  showPlaceholder?: boolean;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  width,
  height,
  pattern,
  manualFills,
  zoom = 1.0,
  cellSize = 20,
  onCellClick,
  placeholder,
  showPlaceholder = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsWide = Math.round(width);
  const cellsHigh = Math.round(height);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actualCellSize = cellSize * zoom;
    canvas.width = cellsWide * actualCellSize;
    canvas.height = cellsHigh * actualCellSize;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let i = 0; i <= cellsWide; i++) {
      ctx.beginPath();
      ctx.moveTo(i * actualCellSize, 0);
      ctx.lineTo(i * actualCellSize, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i <= cellsHigh; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * actualCellSize);
      ctx.lineTo(canvas.width, i * actualCellSize);
      ctx.stroke();
    }

    // Draw pattern cells
    if (pattern && pattern.size > 0) {
      const colorMap: Record<string, string> = {
        black: '#000000',
        white: '#ffffff',
        red: '#ff0000',
        green: '#00cc00',
        blue: '#0066ff',
      };

      pattern.forEach((color, key) => {
        const [row, col] = key.split('-').map(Number);
        const fillColor = colorMap[color] || '#000000';
        ctx.fillStyle = fillColor;
        ctx.fillRect(col * actualCellSize + 1, row * actualCellSize + 1, actualCellSize - 2, actualCellSize - 2);
      });
    }

    // Draw manual fills
    if (manualFills && manualFills.size > 0) {
      const colorMap: Record<string, string> = {
        white: '#ffffff',
        red: '#ffcccc',
        green: '#ccffcc',
        blue: '#ccccff',
      };

      manualFills.forEach((color, key) => {
        const [row, col] = key.split('-').map(Number);
        const fillColor = colorMap[color] || '#cccccc';
        ctx.fillStyle = fillColor;
        ctx.fillRect(col * actualCellSize + 1, row * actualCellSize + 1, actualCellSize - 2, actualCellSize - 2);
      });
    }
  }, [cellsWide, cellsHigh, pattern, manualFills, zoom, cellSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const actualCellSize = cellSize * zoom;
    const col = Math.floor(x / actualCellSize);
    const row = Math.floor(y / actualCellSize);

    if (row >= 0 && row < cellsHigh && col >= 0 && col < cellsWide) {
      onCellClick(row, col);
    }
  };

  if (showPlaceholder && !pattern) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '400px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          color: '#999',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <p>{placeholder}</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: onCellClick ? 'crosshair' : 'default',
        backgroundColor: 'white',
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
};
