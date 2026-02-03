import React, { useRef, useState, useCallback } from 'react';
import { Target, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

// Re-export for backwards compatibility
export interface MatchWeights {
  skills: number;
  compensation: number;
  culture: number;
}

interface Props {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}

interface Point {
  x: number;
  y: number;
}

// Triangle vertices in SVG coordinates
const VERTICES = {
  skills: { x: 150, y: 20 },       // Top - Blue
  compensation: { x: 280, y: 230 }, // Bottom right - Green
  culture: { x: 20, y: 230 }        // Bottom left - Purple
};

const CENTROID = { x: 150, y: 160 };

// Preset configurations
const PRESETS = {
  balanced: { skills: 33, compensation: 33, culture: 34 },
  skillsFirst: { skills: 60, compensation: 20, culture: 20 },
  compensationFirst: { skills: 20, compensation: 60, culture: 20 },
  cultureFirst: { skills: 20, compensation: 20, culture: 60 }
} as const;

// Convert barycentric weights to cartesian point
function weightsToPoint(weights: MatchWeights): Point {
  const total = weights.skills + weights.compensation + weights.culture;
  if (total === 0) return CENTROID;

  const wSkills = weights.skills / total;
  const wComp = weights.compensation / total;
  const wCulture = weights.culture / total;

  return {
    x: wSkills * VERTICES.skills.x + wComp * VERTICES.compensation.x + wCulture * VERTICES.culture.x,
    y: wSkills * VERTICES.skills.y + wComp * VERTICES.compensation.y + wCulture * VERTICES.culture.y
  };
}

// Convert cartesian point to barycentric weights using cross-product area method
function pointToWeights(p: Point): MatchWeights {
  const { skills: A, compensation: B, culture: C } = VERTICES;

  // Calculate areas using cross product
  const areaTotal = Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y));
  const areaSkills = Math.abs((B.x - p.x) * (C.y - p.y) - (C.x - p.x) * (B.y - p.y));
  const areaComp = Math.abs((C.x - p.x) * (A.y - p.y) - (A.x - p.x) * (C.y - p.y));
  const areaCulture = Math.abs((A.x - p.x) * (B.y - p.y) - (B.x - p.x) * (A.y - p.y));

  const rawSkills = areaSkills / areaTotal;
  const rawComp = areaComp / areaTotal;
  const rawCulture = areaCulture / areaTotal;

  // Normalize to sum to 100
  const sum = rawSkills + rawComp + rawCulture;
  const skills = Math.round((rawSkills / sum) * 100);
  const compensation = Math.round((rawComp / sum) * 100);
  const culture = 100 - skills - compensation; // Ensure exact sum of 100

  return { skills, compensation, culture };
}

// Check if point is inside triangle using barycentric method
function isInsideTriangle(p: Point): boolean {
  const { skills: A, compensation: B, culture: C } = VERTICES;

  const sign = (p1: Point, p2: Point, p3: Point) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

  const d1 = sign(p, A, B);
  const d2 = sign(p, B, C);
  const d3 = sign(p, C, A);

  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(hasNeg && hasPos);
}

// Clamp point to nearest position inside triangle
function clampToTriangle(p: Point): Point {
  if (isInsideTriangle(p)) return p;

  // Project to nearest edge
  const edges = [
    { a: VERTICES.skills, b: VERTICES.compensation },
    { a: VERTICES.compensation, b: VERTICES.culture },
    { a: VERTICES.culture, b: VERTICES.skills }
  ];

  let nearestPoint = CENTROID;
  let minDist = Infinity;

  for (const edge of edges) {
    const projected = projectToSegment(p, edge.a, edge.b);
    const dist = distance(p, projected);
    if (dist < minDist) {
      minDist = dist;
      nearestPoint = projected;
    }
  }

  return nearestPoint;
}

// Project point onto line segment
function projectToSegment(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;

  if (len2 === 0) return a;

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));

  return { x: a.x + t * dx, y: a.y + t * dy };
}

// Calculate distance between two points
function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Apply snap zones
function applySnap(p: Point): Point {
  const CENTER_SNAP_RADIUS = 15;
  const VERTEX_SNAP_RADIUS = 20;

  // Snap to center
  if (distance(p, CENTROID) < CENTER_SNAP_RADIUS) {
    return CENTROID;
  }

  // Snap to vertices
  for (const [, vertex] of Object.entries(VERTICES)) {
    if (distance(p, vertex) < VERTEX_SNAP_RADIUS) {
      return vertex;
    }
  }

  return p;
}

// Check if weights match a preset
function weightsMatchPreset(weights: MatchWeights, preset: MatchWeights): boolean {
  return Math.abs(weights.skills - preset.skills) <= 2 &&
         Math.abs(weights.compensation - preset.compensation) <= 2 &&
         Math.abs(weights.culture - preset.culture) <= 2;
}

// Shift weight toward one dimension
function shiftWeight(weights: MatchWeights, dimension: keyof MatchWeights, amount: number): MatchWeights {
  const total = weights.skills + weights.compensation + weights.culture;
  const newValue = Math.max(0, Math.min(100, weights[dimension] + amount));
  const diff = newValue - weights[dimension];

  const others = (['skills', 'compensation', 'culture'] as const).filter(k => k !== dimension);
  const otherTotal = others.reduce((sum, k) => sum + weights[k], 0);

  if (otherTotal === 0) {
    return { ...weights, [dimension]: newValue };
  }

  const result = { ...weights, [dimension]: newValue };
  for (const key of others) {
    const ratio = weights[key] / otherTotal;
    result[key] = Math.max(0, Math.round(weights[key] - diff * ratio));
  }

  // Ensure sum is exactly 100
  const sum = result.skills + result.compensation + result.culture;
  if (sum !== 100) {
    result.culture += (100 - sum);
  }

  return result;
}

const TriangleMatchPriority: React.FC<Props> = ({ weights, onChange, onReset }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentPoint = weightsToPoint(weights);

  const getSVGPoint = useCallback((clientX: number, clientY: number): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      const clamped = clampToTriangle(pt);
      const newWeights = pointToWeights(clamped);
      onChange(newWeights);
    }
  }, [getSVGPoint, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;

    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      const clamped = clampToTriangle(pt);
      const newWeights = pointToWeights(clamped);
      onChange(newWeights);
    }
  }, [isDragging, getSVGPoint, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Apply snap on release
    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      const clamped = clampToTriangle(pt);
      const snapped = applySnap(clamped);
      const newWeights = pointToWeights(snapped);
      onChange(newWeights);
    }
  }, [getSVGPoint, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const STEP = 5;
    let newWeights: MatchWeights | null = null;

    switch (e.key) {
      case 'ArrowUp':
        newWeights = shiftWeight(weights, 'skills', STEP);
        break;
      case 'ArrowDown':
        newWeights = shiftWeight(weights, 'skills', -STEP);
        break;
      case 'ArrowLeft':
        newWeights = shiftWeight(weights, 'culture', STEP);
        break;
      case 'ArrowRight':
        newWeights = shiftWeight(weights, 'compensation', STEP);
        break;
      case '1':
        newWeights = PRESETS.balanced;
        break;
      case '2':
        newWeights = PRESETS.skillsFirst;
        break;
      case '3':
        newWeights = PRESETS.compensationFirst;
        break;
      case '4':
        newWeights = PRESETS.cultureFirst;
        break;
      default:
        return;
    }

    if (newWeights) {
      e.preventDefault();
      onChange(newWeights);
    }
  }, [weights, onChange]);

  const activePreset = Object.entries(PRESETS).find(([, preset]) =>
    weightsMatchPreset(weights, preset)
  )?.[0] || null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 sticky top-20 z-30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">What Matters Most to You?</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Drag the point to prioritize your feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-top-2 duration-300">
          {/* Triangle SVG */}
          <div className="flex-1 flex justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 300 260"
              className="w-full max-w-[280px] h-auto touch-none select-none cursor-pointer"
              role="slider"
              aria-label="Match priority triangle"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={weights.skills}
              aria-valuetext={`Skills ${weights.skills}%, Compensation ${weights.compensation}%, Culture ${weights.culture}%`}
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="triangle-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
                  <stop offset="50%" stopColor="#16A34A" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#9333EA" stopOpacity="0.08" />
                </linearGradient>
                <filter id="point-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                </filter>
              </defs>

              {/* Triangle fill */}
              <polygon
                points="150,20 280,230 20,230"
                fill="url(#triangle-gradient)"
                stroke="#E5E7EB"
                strokeWidth="2"
              />

              {/* Grid lines to center */}
              <line x1="150" y1="20" x2="150" y2="160" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="280" y1="230" x2="150" y2="160" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="20" y1="230" x2="150" y2="160" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />

              {/* Vertex markers */}
              <circle cx={VERTICES.skills.x} cy={VERTICES.skills.y} r="6" fill="#2563EB" />
              <circle cx={VERTICES.compensation.x} cy={VERTICES.compensation.y} r="6" fill="#16A34A" />
              <circle cx={VERTICES.culture.x} cy={VERTICES.culture.y} r="6" fill="#9333EA" />

              {/* Vertex labels */}
              <text x={VERTICES.skills.x} y={VERTICES.skills.y - 14} textAnchor="middle" className="text-[10px] font-bold fill-blue-600 uppercase">
                Skills
              </text>
              <text x={VERTICES.compensation.x + 8} y={VERTICES.compensation.y + 4} textAnchor="start" className="text-[10px] font-bold fill-green-600 uppercase">
                Comp
              </text>
              <text x={VERTICES.culture.x - 8} y={VERTICES.culture.y + 4} textAnchor="end" className="text-[10px] font-bold fill-purple-600 uppercase">
                Culture
              </text>

              {/* Center marker */}
              <circle cx={CENTROID.x} cy={CENTROID.y} r="3" fill="#9CA3AF" opacity="0.5" />

              {/* Draggable point */}
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r={isDragging ? 14 : 12}
                fill="white"
                stroke="#3B82F6"
                strokeWidth="3"
                filter="url(#point-shadow)"
                className="transition-all duration-150"
              />
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="4"
                fill="#3B82F6"
              />
            </svg>
          </div>

          {/* Weight display and presets */}
          <div className="flex flex-col gap-4 min-w-[200px]">
            {/* Weight bars */}
            <div className="space-y-3">
              {/* Skills */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Skills Match</span>
                  <span className="text-sm font-black text-blue-600">{weights.skills}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${weights.skills}%` }}
                  />
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Compensation</span>
                  <span className="text-sm font-black text-green-600">{weights.compensation}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-200"
                    style={{ width: `${weights.compensation}%` }}
                  />
                </div>
              </div>

              {/* Culture */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Culture Fit</span>
                  <span className="text-sm font-black text-purple-600">{weights.culture}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-200"
                    style={{ width: `${weights.culture}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => onChange(PRESETS.balanced)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePreset === 'balanced'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => onChange(PRESETS.skillsFirst)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePreset === 'skillsFirst'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                Skills-First
              </button>
              <button
                onClick={() => onChange(PRESETS.compensationFirst)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePreset === 'compensationFirst'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                Comp-First
              </button>
              <button
                onClick={() => onChange(PRESETS.cultureFirst)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePreset === 'cultureFirst'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Culture-First
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-gray-400 text-center mt-1">
              Use arrow keys or click presets
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriangleMatchPriority;
