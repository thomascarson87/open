import React, { useRef, useState, useCallback } from 'react';
import {
  MatchWeights,
  Point,
  CIRCLE_CONFIG,
  POLES,
  weightsToPosition,
  pointToWeights,
  clampToCircle,
  applyMagneticSnap,
  applyMagneticPull,
} from '../../hooks/useCircularWeights';

interface GravityCircleProps {
  weights: MatchWeights;
  onChange?: (weights: MatchWeights) => void;
  size?: 'sm' | 'sm-md' | 'md' | 'lg';
  interactive?: boolean;
  showLabels?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 40,
  'sm-md': 140,
  md: 200,
  lg: 280,
};

const GravityCircle: React.FC<GravityCircleProps> = ({
  weights,
  onChange,
  size = 'lg',
  interactive = true,
  showLabels = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentPoint = weightsToPosition(weights);
  const pixelSize = SIZE_MAP[size];

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
    if (!interactive || !onChange) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      let clamped = clampToCircle(pt);
      clamped = applyMagneticPull(clamped);
      onChange(pointToWeights(clamped));
    }
  }, [interactive, onChange, getSVGPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !onChange) return;

    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      let clamped = clampToCircle(pt);
      clamped = applyMagneticPull(clamped);
      onChange(pointToWeights(clamped));
    }
  }, [isDragging, onChange, getSVGPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !onChange) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    const pt = getSVGPoint(e.clientX, e.clientY);
    if (pt) {
      const clamped = clampToCircle(pt);
      const snapped = applyMagneticSnap(clamped, false);
      onChange(pointToWeights(snapped));
    }
  }, [interactive, onChange, getSVGPoint]);

  // Calculate heatmap intensities with enhanced visibility
  // Use quadratic scaling for more dramatic effect at higher weights
  const skillsIntensity = Math.pow(weights.skills / 100, 1.5);
  const compIntensity = Math.pow(weights.compensation / 100, 1.5);
  const cultureIntensity = Math.pow(weights.culture / 100, 1.5);

  const isSmall = size === 'sm';
  const isCompact = size === 'sm' || size === 'sm-md';
  const puckRadius = isSmall ? 5 : isCompact ? (isDragging ? 12 : 10) : (isDragging ? 16 : 14);
  const poleRadius = isSmall ? 3 : isCompact ? 6 : 8;

  return (
    <svg
      ref={svgRef}
      viewBox={CIRCLE_CONFIG.viewBox}
      width={pixelSize}
      height={pixelSize}
      className={`${interactive ? 'touch-none select-none cursor-pointer' : ''} ${className}`}
      role={interactive ? 'slider' : 'img'}
      aria-label="Match priority circle"
      aria-valuetext={interactive ? `Skills ${weights.skills}%, Compensation ${weights.compensation}%, Culture ${weights.culture}%` : undefined}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
      onPointerCancel={interactive ? handlePointerUp : undefined}
    >
      <defs>
        {/* Glassmorphic background filter */}
        <filter id="glass-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>

        {/* Dynamic heatmap gradients - positioned at each pole with enhanced visibility */}
        <radialGradient id="skills-glow" cx={POLES.skills.x / 300} cy={POLES.skills.y / 300} r="0.6">
          <stop offset="0%" stopColor={POLES.skills.color} stopOpacity={skillsIntensity * 0.6} />
          <stop offset="40%" stopColor={POLES.skills.color} stopOpacity={skillsIntensity * 0.3} />
          <stop offset="80%" stopColor={POLES.skills.color} stopOpacity={skillsIntensity * 0.1} />
          <stop offset="100%" stopColor={POLES.skills.color} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="comp-glow" cx={POLES.compensation.x / 300} cy={POLES.compensation.y / 300} r="0.6">
          <stop offset="0%" stopColor={POLES.compensation.color} stopOpacity={compIntensity * 0.6} />
          <stop offset="40%" stopColor={POLES.compensation.color} stopOpacity={compIntensity * 0.3} />
          <stop offset="80%" stopColor={POLES.compensation.color} stopOpacity={compIntensity * 0.1} />
          <stop offset="100%" stopColor={POLES.compensation.color} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="culture-glow" cx={POLES.culture.x / 300} cy={POLES.culture.y / 300} r="0.6">
          <stop offset="0%" stopColor={POLES.culture.color} stopOpacity={cultureIntensity * 0.6} />
          <stop offset="40%" stopColor={POLES.culture.color} stopOpacity={cultureIntensity * 0.3} />
          <stop offset="80%" stopColor={POLES.culture.color} stopOpacity={cultureIntensity * 0.1} />
          <stop offset="100%" stopColor={POLES.culture.color} stopOpacity="0" />
        </radialGradient>

        {/* Puck shadow */}
        <filter id="puck-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
        </filter>

        {/* Outer glow for puck when dragging */}
        <filter id="puck-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Circle background with glassmorphic effect */}
      <circle
        cx={CIRCLE_CONFIG.center.x}
        cy={CIRCLE_CONFIG.center.y}
        r={CIRCLE_CONFIG.radius}
        fill="white"
        fillOpacity="0.6"
        stroke="#E5E7EB"
        strokeWidth={isSmall ? 1 : 2}
      />

      {/* Heatmap layers */}
      <circle
        cx={CIRCLE_CONFIG.center.x}
        cy={CIRCLE_CONFIG.center.y}
        r={CIRCLE_CONFIG.radius}
        fill="url(#skills-glow)"
        className="transition-opacity duration-200"
      />
      <circle
        cx={CIRCLE_CONFIG.center.x}
        cy={CIRCLE_CONFIG.center.y}
        r={CIRCLE_CONFIG.radius}
        fill="url(#comp-glow)"
        className="transition-opacity duration-200"
      />
      <circle
        cx={CIRCLE_CONFIG.center.x}
        cy={CIRCLE_CONFIG.center.y}
        r={CIRCLE_CONFIG.radius}
        fill="url(#culture-glow)"
        className="transition-opacity duration-200"
      />

      {/* Center marker */}
      {!isCompact && (
        <circle
          cx={CIRCLE_CONFIG.center.x}
          cy={CIRCLE_CONFIG.center.y}
          r="4"
          fill="#9CA3AF"
          opacity="0.4"
        />
      )}

      {/* Pole markers */}
      <circle cx={POLES.skills.x} cy={POLES.skills.y} r={poleRadius} fill={POLES.skills.color} />
      <circle cx={POLES.compensation.x} cy={POLES.compensation.y} r={poleRadius} fill={POLES.compensation.color} />
      <circle cx={POLES.culture.x} cy={POLES.culture.y} r={poleRadius} fill={POLES.culture.color} />

      {/* Pole labels */}
      {showLabels && !isSmall && (
        <>
          <text
            x={POLES.skills.x}
            y={POLES.skills.y - (isCompact ? 10 : 16)}
            textAnchor="middle"
            className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-bold fill-blue-600 uppercase`}
          >
            Skills
          </text>
          <text
            x={POLES.compensation.x + (isCompact ? 8 : 12)}
            y={POLES.compensation.y + (isCompact ? 4 : 6)}
            textAnchor="start"
            className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-bold fill-green-600 uppercase`}
          >
            Comp
          </text>
          <text
            x={isCompact ? 8 : 5}
            y={POLES.culture.y + (isCompact ? 4 : 6)}
            textAnchor="start"
            className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-bold fill-purple-600 uppercase`}
          >
            Culture
          </text>
        </>
      )}

      {/* Draggable puck */}
      <g className={isDragging ? '' : 'transition-all duration-150'}>
        <circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={puckRadius}
          fill="white"
          stroke="#3B82F6"
          strokeWidth={isSmall ? 1.5 : 3}
          filter={isDragging ? 'url(#puck-glow)' : 'url(#puck-shadow)'}
        />
        {!isSmall && (
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={isDragging ? 5 : 4}
            fill="#3B82F6"
          />
        )}
      </g>
    </svg>
  );
};

export default GravityCircle;
