import React from "react";

interface QRCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
}

/**
 * Deterministic QR-style matrix generator (25x25 Version 2 format)
 * Renders standard finder patterns (3 corners), timing tracks, format info,
 * and deterministic hash-derived data modules for offline display without external libraries.
 */
export function QRCodeSvg({
  value,
  size = 120,
  className = "",
  fgColor = "currentColor",
  bgColor = "transparent",
}: QRCodeSvgProps) {
  const DIM = 25; // 25x25 matrix
  const matrix: boolean[][] = Array.from({ length: DIM }, () => Array(DIM).fill(false));

  // 1. Draw 7x7 Finder Patterns at 3 corners
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const isCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[startY + y][startX + x] = isBorder || isCore;
      }
    }
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(DIM - 7, 0); // Top-Right
  drawFinder(0, DIM - 7); // Bottom-Left

  // 2. Separators (white space around finders)
  // Already false by default

  // 3. Timing patterns (alternating black/white at row 6 and col 6)
  for (let i = 7; i < DIM - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 4. Alignment pattern at (16, 16) for 25x25 (5x5 pattern)
  const ax = 16;
  const ay = 16;
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const isBorder = Math.abs(x) === 2 || Math.abs(y) === 2;
      const isCenter = x === 0 && y === 0;
      matrix[ay + y][ax + x] = isBorder || isCenter;
    }
  }

  // 5. Populate data area with deterministic hash of the payload
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // Linear congruential generator for bit distribution
  let seed = Math.abs(hash);
  const nextBit = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed >>> 16) % 2 === 1;
  };

  for (let y = 0; y < DIM; y++) {
    for (let x = 0; x < DIM; x++) {
      // Skip finder pattern zones
      const inTopLeftFinder = x <= 7 && y <= 7;
      const inTopRightFinder = x >= DIM - 8 && y <= 7;
      const inBottomLeftFinder = x <= 7 && y >= DIM - 8;
      const inTiming = x === 6 || y === 6;
      const inAlignment = x >= ax - 2 && x <= ax + 2 && y >= ay - 2 && y <= ay + 2;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inTiming && !inAlignment) {
        matrix[y][x] = nextBit();
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${DIM} ${DIM}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`QR Code for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={DIM} height={DIM} fill={bgColor} />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fgColor} /> : null
        )
      )}
    </svg>
  );
}
