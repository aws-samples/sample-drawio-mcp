// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file layoutOptimizer.js
 * @description Layout optimization algorithms
 */

/**
 * Check if two rectangles overlap
 */
function isOverlapping(rect1, rect2) {
  return !(
    rect1.x + (rect1.width || 100) < rect2.x ||
    rect2.x + (rect2.width || 100) < rect1.x ||
    rect1.y + (rect1.height || 50) < rect2.y ||
    rect2.y + (rect2.height || 50) < rect1.y
  );
}

/**
 * Calculate overlap area
 */
function calculateOverlapArea(rect1, rect2) {
  const x1 = Math.max(rect1.x, rect2.x);
  const y1 = Math.max(rect1.y, rect2.y);
  const x2 = Math.min(
    rect1.x + (rect1.width || 100),
    rect2.x + (rect2.width || 100),
  );
  const y2 = Math.min(
    rect1.y + (rect1.height || 50),
    rect2.y + (rect2.height || 50),
  );

  if (x2 > x1 && y2 > y1) {
    return (x2 - x1) * (y2 - y1);
  }
  return 0;
}

/**
 * Detect overlapping cells
 */
export function detectOverlaps(cells) {
  const overlaps = [];

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i];
      const b = cells[j];

      if (isOverlapping(a.geometry, b.geometry)) {
        overlaps.push({
          cell1: a.id,
          cell2: b.id,
          overlap: calculateOverlapArea(a.geometry, b.geometry),
        });
      }
    }
  }

  return overlaps;
}

/**
 * Resolve overlaps by moving cells
 */
export function resolveOverlaps(cells, minSpacing = 20) {
  const adjustments = [];
  const overlaps = detectOverlaps(cells);

  if (overlaps.length === 0) {
    return adjustments;
  }

  overlaps.forEach((overlap) => {
    const cell1 = cells.find((c) => c.id === overlap.cell1);
    const cell2 = cells.find((c) => c.id === overlap.cell2);

    if (!cell1 || !cell2) return;

    const g1 = cell1.geometry;
    const g2 = cell2.geometry;

    const c1x = g1.x + (g1.width || 100) / 2;
    const c1y = g1.y + (g1.height || 50) / 2;
    const c2x = g2.x + (g2.width || 100) / 2;
    const c2y = g2.y + (g2.height || 50) / 2;

    const dx = c2x - c1x;
    const dy = c2y - c1y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) {
      adjustments.push({
        cellId: cell2.id,
        newX: g2.x + minSpacing,
        newY: g2.y + minSpacing,
      });
    } else {
      const moveDistance = minSpacing / 2;
      const unitX = dx / dist;
      const unitY = dy / dist;

      adjustments.push({
        cellId: cell1.id,
        newX: g1.x - unitX * moveDistance,
        newY: g1.y - unitY * moveDistance,
      });

      adjustments.push({
        cellId: cell2.id,
        newX: g2.x + unitX * moveDistance,
        newY: g2.y + unitY * moveDistance,
      });
    }
  });

  return adjustments;
}

/**
 * Calculate optimal spacing for cells
 */
export function analyzeSpacing(cells) {
  if (cells.length < 2) {
    return { average: 0, min: 0, max: 0, variance: 0 };
  }

  const distances = [];

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const g1 = cells[i].geometry;
      const g2 = cells[j].geometry;

      const c1x = g1.x + (g1.width || 100) / 2;
      const c1y = g1.y + (g1.height || 50) / 2;
      const c2x = g2.x + (g2.width || 100) / 2;
      const c2y = g2.y + (g2.height || 50) / 2;

      const dist = Math.sqrt((c2x - c1x) ** 2 + (c2y - c1y) ** 2);
      distances.push(dist);
    }
  }

  const average = distances.reduce((a, b) => a + b, 0) / distances.length;
  const min = Math.min(...distances);
  const max = Math.max(...distances);
  const variance =
    distances.reduce((sum, d) => sum + (d - average) ** 2, 0) /
    distances.length;

  return { average, min, max, variance, stdDev: Math.sqrt(variance) };
}

/**
 * Balance layout by adjusting positions
 */
export function balanceLayout(cells, targetSpacing = 100) {
  const adjustments = [];

  if (cells.length < 2) {
    return adjustments;
  }

  let centerX = 0;
  let centerY = 0;

  cells.forEach((cell) => {
    const g = cell.geometry;
    centerX += g.x + (g.width || 100) / 2;
    centerY += g.y + (g.height || 50) / 2;
  });

  centerX /= cells.length;
  centerY /= cells.length;

  cells.forEach((cell) => {
    const g = cell.geometry;
    const cx = g.x + (g.width || 100) / 2;
    const cy = g.y + (g.height || 50) / 2;

    const dx = cx - centerX;
    const dy = cy - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const targetDist = targetSpacing;
      const scale = targetDist / dist;

      const newCx = centerX + dx * scale;
      const newCy = centerY + dy * scale;

      adjustments.push({
        cellId: cell.id,
        newX: newCx - (g.width || 100) / 2,
        newY: newCy - (g.height || 50) / 2,
      });
    }
  });

  return adjustments;
}

/**
 * Optimize layout using force-directed algorithm
 */
export function optimizeWithForces(cells, edges, options = {}) {
  const {
    iterations = 50,
    repulsionStrength = 1000,
    attractionStrength = 0.1,
    damping = 0.9,
  } = options;

  const velocities = cells.map(() => ({ vx: 0, vy: 0 }));
  const positions = cells.map((c) => ({
    id: c.id,
    x: c.geometry.x + (c.geometry.width || 100) / 2,
    y: c.geometry.y + (c.geometry.height || 50) / 2,
  }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsive forces
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 0) {
          const force = repulsionStrength / distSq;
          const fx = (dx / Math.sqrt(distSq)) * force;
          const fy = (dy / Math.sqrt(distSq)) * force;

          velocities[i].vx -= fx;
          velocities[i].vy -= fy;
          velocities[j].vx += fx;
          velocities[j].vy += fy;
        }
      }
    }

    // Attractive forces
    edges.forEach((edge) => {
      const i = positions.findIndex((p) => p.id === edge.source);
      const j = positions.findIndex((p) => p.id === edge.target);

      if (i >= 0 && j >= 0) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const force = attractionStrength * dist;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          velocities[i].vx += fx;
          velocities[i].vy += fy;
          velocities[j].vx -= fx;
          velocities[j].vy -= fy;
        }
      }
    });

    // Update positions
    positions.forEach((pos, i) => {
      pos.x += velocities[i].vx;
      pos.y += velocities[i].vy;

      velocities[i].vx *= damping;
      velocities[i].vy *= damping;
    });
  }

  const adjustments = [];
  positions.forEach((pos, i) => {
    const cell = cells[i];
    const g = cell.geometry;

    adjustments.push({
      cellId: cell.id,
      newX: pos.x - (g.width || 100) / 2,
      newY: pos.y - (g.height || 50) / 2,
    });
  });

  return adjustments;
}
