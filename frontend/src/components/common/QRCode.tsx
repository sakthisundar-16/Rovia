import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Lightweight, deterministic 2D SVG QR Code pattern generator
export const QRCode: React.FC<QRCodeProps> = ({ value, size = 160, className = '' }) => {
  const gridSize = 21; // 21x21 QR Matrix
  const cellSize = size / gridSize;

  // Simple hashing algorithm to create a unique matrix pattern from input value
  const generateMatrix = (str: string) => {
    const matrix: boolean[][] = Array(gridSize)
      .fill(false)
      .map(() => Array(gridSize).fill(false));

    // Add standard QR Finder Patterns (Corners)
    const addFinder = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[row + r][col + c] = true;
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, 14);
    addFinder(14, 0);

    // Timing patterns
    for (let i = 8; i < 13; i += 2) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }

    // Data payload simulation based on string hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder areas
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= 13) ||
          (r >= 13 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }

        const seed = (r * 31 + c * 17 + Math.abs(hash)) % 100;
        matrix[r][c] = seed > 42;
      }
    }

    return matrix;
  };

  const matrix = generateMatrix(value);

  return (
    <div className={`inline-block bg-white p-2 rounded-xl border border-gray-200 shadow-md ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
      <div className="text-[9px] font-mono text-center text-gray-500 font-bold mt-1 tracking-tighter uppercase truncate max-w-[150px] mx-auto">
        {value}
      </div>
    </div>
  );
};
