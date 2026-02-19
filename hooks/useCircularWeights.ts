import { useMemo, useCallback } from 'react';

export interface MatchWeights {
  skills: number;
  compensation: number;
  culture: number;
}

export interface Point {
  x: number;
  y: number;
}

// Circle geometry constants
export const CIRCLE_CONFIG = {
  center: { x: 150, y: 150 },
  radius: 120,
  viewBox: '0 0 300 300',
} as const;

// Pole positions at 120-degree intervals
export const POLES = {
  skills: { x: 150, y: 30, angle: 270, color: 'var(--accent-coral)', label: 'Skills' },
  compensation: { x: 254, y: 210, angle: 30, color: '#16A34A', label: 'Comp' },
  culture: { x: 46, y: 210, angle: 150, color: '#9333EA', label: 'Culture' },
} as const;

// Snap zone radii
const CENTER_SNAP_RADIUS = 15;
const POLE_SNAP_RADIUS = 20;

// Calculate distance between two points
function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Calculate angle from center to point (0-360, 0 = top, clockwise)
function pointToAngle(p: Point): number {
  const dx = p.x - CIRCLE_CONFIG.center.x;
  const dy = p.y - CIRCLE_CONFIG.center.y;
  // atan2 gives -PI to PI with 0 at right, we want 0 at top
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

// Calculate normalized distance from center (0 = center, 1 = edge)
function pointToDistance(p: Point): number {
  const dist = distance(p, CIRCLE_CONFIG.center);
  return Math.min(1, dist / CIRCLE_CONFIG.radius);
}

// Convert angle and distance to weights using inverse-distance weighting
export function polarToWeights(angle: number, dist: number): MatchWeights {
  // At center (dist=0), return balanced
  if (dist < 0.05) {
    return { skills: 33, compensation: 33, culture: 34 };
  }

  // Calculate angular proximity to each pole (0-1 where 1 = directly at pole)
  const angularProximity = (poleAngle: number) => {
    const diff = Math.abs(angle - poleAngle);
    const normalizedDiff = Math.min(diff, 360 - diff) / 180;
    return Math.pow(1 - normalizedDiff, 2); // Quadratic falloff for smoother feel
  };

  const rawSkills = angularProximity(POLES.skills.angle);
  const rawComp = angularProximity(POLES.compensation.angle);
  const rawCulture = angularProximity(POLES.culture.angle);

  // Apply distance modifier: center = equal, edge = extreme
  const centerWeight = 1 - dist;
  const edgeWeight = dist;

  const skills = (rawSkills * edgeWeight) + (1 / 3 * centerWeight);
  const compensation = (rawComp * edgeWeight) + (1 / 3 * centerWeight);
  const culture = (rawCulture * edgeWeight) + (1 / 3 * centerWeight);

  // Normalize to sum to 100
  const total = skills + compensation + culture;
  const normSkills = Math.round((skills / total) * 100);
  const normComp = Math.round((compensation / total) * 100);
  const normCulture = 100 - normSkills - normComp; // Ensure exact sum of 100

  return {
    skills: normSkills,
    compensation: normComp,
    culture: normCulture,
  };
}

// Convert weights to point position
export function weightsToPosition(weights: MatchWeights): Point {
  const total = weights.skills + weights.compensation + weights.culture;
  if (total === 0) return CIRCLE_CONFIG.center;

  const wS = weights.skills / total;
  const wC = weights.compensation / total;
  const wCu = weights.culture / total;

  // Weighted average of pole positions
  return {
    x: wS * POLES.skills.x + wC * POLES.compensation.x + wCu * POLES.culture.x,
    y: wS * POLES.skills.y + wC * POLES.compensation.y + wCu * POLES.culture.y,
  };
}

// Convert point to weights
export function pointToWeights(p: Point): MatchWeights {
  const angle = pointToAngle(p);
  const dist = pointToDistance(p);
  return polarToWeights(angle, dist);
}

// Clamp point to stay within circle boundary
export function clampToCircle(p: Point): Point {
  const dist = distance(p, CIRCLE_CONFIG.center);
  if (dist <= CIRCLE_CONFIG.radius) return p;

  // Project to edge
  const ratio = CIRCLE_CONFIG.radius / dist;
  return {
    x: CIRCLE_CONFIG.center.x + (p.x - CIRCLE_CONFIG.center.x) * ratio,
    y: CIRCLE_CONFIG.center.y + (p.y - CIRCLE_CONFIG.center.y) * ratio,
  };
}

// Apply magnetic snap zones
export function applyMagneticSnap(p: Point, isDragging: boolean): Point {
  // During drag, use gentle pull; on release, hard snap
  const snapRadius = isDragging ? CENTER_SNAP_RADIUS * 0.5 : CENTER_SNAP_RADIUS;
  const poleSnapRadius = isDragging ? POLE_SNAP_RADIUS * 0.5 : POLE_SNAP_RADIUS;

  // Snap to center
  if (distance(p, CIRCLE_CONFIG.center) < snapRadius) {
    return CIRCLE_CONFIG.center;
  }

  // Snap to poles
  for (const pole of Object.values(POLES)) {
    const polePoint = { x: pole.x, y: pole.y };
    if (distance(p, polePoint) < poleSnapRadius) {
      return polePoint;
    }
  }

  return p;
}

// Magnetic interpolation for smooth "pull" effect during drag
export function applyMagneticPull(p: Point, strength: number = 0.15): Point {
  const snapTargets = [
    { point: CIRCLE_CONFIG.center, radius: CENTER_SNAP_RADIUS * 2 },
    { point: { x: POLES.skills.x, y: POLES.skills.y }, radius: POLE_SNAP_RADIUS * 2 },
    { point: { x: POLES.compensation.x, y: POLES.compensation.y }, radius: POLE_SNAP_RADIUS * 2 },
    { point: { x: POLES.culture.x, y: POLES.culture.y }, radius: POLE_SNAP_RADIUS * 2 },
  ];

  for (const target of snapTargets) {
    const dist = distance(p, target.point);
    if (dist < target.radius && dist > 0) {
      // Interpolate toward target based on proximity
      const pullStrength = strength * (1 - dist / target.radius);
      return {
        x: p.x + (target.point.x - p.x) * pullStrength,
        y: p.y + (target.point.y - p.y) * pullStrength,
      };
    }
  }

  return p;
}

// Hook for using circular weights
export function useCircularWeights(weights: MatchWeights) {
  const position = useMemo(() => weightsToPosition(weights), [weights]);

  const getWeightsFromPoint = useCallback((p: Point, isDragging: boolean = false) => {
    let point = clampToCircle(p);
    if (isDragging) {
      point = applyMagneticPull(point);
    } else {
      point = applyMagneticSnap(point, false);
    }
    return pointToWeights(point);
  }, []);

  return {
    position,
    getWeightsFromPoint,
  };
}
