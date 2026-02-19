import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sliders } from 'lucide-react';
import { MatchWeights } from '../hooks/useCircularWeights';
import { useIsMobile } from '../hooks/useMediaQuery';
import GravityCircle from './gravity/GravityCircle';
import GravityPresets from './gravity/GravityPresets';
import { COLORS, PRESETS } from './gravity/constants';

// Re-export for backwards compatibility
export type { MatchWeights };

interface FluidGravityFilterProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}

// Shift weight toward one dimension (for keyboard navigation)
function shiftWeight(weights: MatchWeights, dimension: keyof MatchWeights, amount: number): MatchWeights {
  const newValue = Math.max(0, Math.min(100, weights[dimension] + amount));
  const diff = newValue - weights[dimension];

  const others = (['skills', 'compensation', 'culture'] as const).filter((k) => k !== dimension);
  const otherTotal = others.reduce((sum, k) => sum + weights[k], 0);

  if (otherTotal === 0) {
    return { ...weights, [dimension]: newValue };
  }

  const result = { ...weights, [dimension]: newValue };
  for (const key of others) {
    const ratio = weights[key] / otherTotal;
    result[key] = Math.max(0, Math.round(weights[key] - diff * ratio));
  }

  const sum = result.skills + result.compensation + result.culture;
  if (sum !== 100) {
    result.culture += 100 - sum;
  }

  return result;
}

// Get dominant color tint based on weights
function getDominantTint(weights: MatchWeights): string {
  const max = Math.max(weights.skills, weights.compensation, weights.culture);
  const threshold = 45; // Only show tint if clearly dominant

  if (max < threshold) return 'transparent';

  const intensity = Math.min((max - threshold) / 55, 1) * 0.08; // Max 8% opacity

  if (weights.skills === max) return `rgba(37, 99, 235, ${intensity})`; // Blue
  if (weights.compensation === max) return `rgba(22, 163, 74, ${intensity})`; // Green
  return `rgba(147, 51, 234, ${intensity})`; // Purple
}

// Weight bars - responsive sizing
const WeightBars: React.FC<{ weights: MatchWeights; compact?: boolean }> = ({ weights, compact = false }) => (
  <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'} w-full`}>
    <div className="flex items-center gap-3">
      <span className={`${compact ? 'text-[10px] w-12' : 'text-xs w-16'} font-semibold text-muted`}>Skills</span>
      <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2.5'} bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${COLORS.skills.bg} rounded-full`}
          initial={false}
          animate={{ width: `${weights.skills}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <span className={`${compact ? 'text-xs w-10' : 'text-sm w-12'} font-black ${COLORS.skills.text} text-right`}>{weights.skills}%</span>
    </div>
    <div className="flex items-center gap-3">
      <span className={`${compact ? 'text-[10px] w-12' : 'text-xs w-16'} font-semibold text-muted`}>Comp</span>
      <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2.5'} bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${COLORS.compensation.bg} rounded-full`}
          initial={false}
          animate={{ width: `${weights.compensation}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <span className={`${compact ? 'text-xs w-10' : 'text-sm w-12'} font-black ${COLORS.compensation.text} text-right`}>{weights.compensation}%</span>
    </div>
    <div className="flex items-center gap-3">
      <span className={`${compact ? 'text-[10px] w-12' : 'text-xs w-16'} font-semibold text-muted`}>Culture</span>
      <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2.5'} bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${COLORS.culture.bg} rounded-full`}
          initial={false}
          animate={{ width: `${weights.culture}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <span className={`${compact ? 'text-xs w-10' : 'text-sm w-12'} font-black ${COLORS.culture.text} text-right`}>{weights.culture}%</span>
    </div>
  </div>
);

// Sparkline header (collapsed state)
const SparklineHeader: React.FC<{
  weights: MatchWeights;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ weights, isExpanded, onToggle }) => (
  <motion.div
    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
    onClick={onToggle}
    whileTap={{ scale: 0.995 }}
  >
    <div className="bg-accent-coral-bg p-1.5 rounded-lg flex-shrink-0">
      <Sliders className="w-4 h-4 text-accent-coral" />
    </div>

    {/* Label - visible when collapsed */}
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 hidden sm:block">Match Priority</span>

    <GravityCircle
      weights={weights}
      size="sm"
      interactive={false}
      showLabels={false}
    />

    <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS.skills.bgLight} ${COLORS.skills.text} whitespace-nowrap`}>
        {weights.skills}%
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS.compensation.bgLight} ${COLORS.compensation.text} whitespace-nowrap`}>
        {weights.compensation}%
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS.culture.bgLight} ${COLORS.culture.text} whitespace-nowrap`}>
        {weights.culture}%
      </span>
    </div>

    <motion.div
      className="flex-shrink-0 text-gray-400 dark:text-gray-500"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </motion.div>
  </motion.div>
);

// Desktop slimline drawer
const DesktopDrawer: React.FC<{
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}> = ({ weights, onChange, onReset }) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const STEP = 5;
      let newWeights: MatchWeights | null = null;

      switch (e.key) {
        case 'ArrowUp': newWeights = shiftWeight(weights, 'skills', STEP); break;
        case 'ArrowDown': newWeights = shiftWeight(weights, 'skills', -STEP); break;
        case 'ArrowLeft': newWeights = shiftWeight(weights, 'culture', STEP); break;
        case 'ArrowRight': newWeights = shiftWeight(weights, 'compensation', STEP); break;
        case '1': newWeights = PRESETS.balanced; break;
        case '2': newWeights = PRESETS.skillsFirst; break;
        case '3': newWeights = PRESETS.compensationFirst; break;
        case '4': newWeights = PRESETS.cultureFirst; break;
        default: return;
      }

      if (newWeights) {
        e.preventDefault();
        onChange(newWeights);
      }
    },
    [weights, onChange]
  );

  return (
    <motion.div
      className="px-6 py-4 flex items-center justify-between gap-8"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Circle */}
      <div className="flex-shrink-0">
        <GravityCircle
          weights={weights}
          onChange={onChange}
          size="md"
          interactive={true}
          showLabels={true}
        />
      </div>

      {/* Weight bars - takes available space */}
      <div className="flex-1 max-w-md">
        <WeightBars weights={weights} />
      </div>

      {/* Presets */}
      <div className="flex-shrink-0">
        <GravityPresets weights={weights} onChange={onChange} variant="ghost" />
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-accent-coral transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </motion.div>
  );
};

// Mobile bottom sheet
const MobileBottomSheet: React.FC<{
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
  onClose: () => void;
}> = ({ weights, onChange, onReset, onClose }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);

  return (
    <>
      {/* Backdrop - clicking closes */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: getDominantTint(weights) }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragStart={() => setIsDraggingSheet(true)}
        onDragEnd={(_, info) => {
          setIsDraggingSheet(false);
          if (info.offset.y > 80 || info.velocity.y > 500) onClose();
        }}
      >
        <div className="bg-white dark:bg-surface/95 backdrop-blur-xl">
          {/* Drag handle with swipe hint */}
          <div className="flex flex-col items-center pt-2 pb-1">
            <motion.div
              className={`w-12 h-1.5 rounded-full transition-colors ${isDraggingSheet ? 'bg-gray-400' : 'bg-gray-300'}`}
              animate={{ scaleX: isDraggingSheet ? 1.2 : 1 }}
            />
            <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Swipe down to close</span>
          </div>

          {/* Content - more compact */}
          <div className="px-5 pb-6 pt-2">
            <div className="flex flex-col items-center gap-3">
              {/* Circle - medium size on mobile */}
              <GravityCircle
                weights={weights}
                onChange={onChange}
                size="md"
                interactive={true}
                showLabels={true}
              />

              {/* Weight bars */}
              <div className="w-full max-w-xs">
                <WeightBars weights={weights} compact />
              </div>

              {/* Presets - 2x2 grid */}
              <div className="w-full max-w-xs">
                <GravityPresets weights={weights} onChange={onChange} variant="ghost" />
              </div>

              {/* Reset */}
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-accent-coral transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const FluidGravityFilter: React.FC<FluidGravityFilterProps> = ({
  weights,
  onChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on scroll (desktop only)
  useEffect(() => {
    if (!isExpanded || isMobile) return;

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      if (delta > 50) {
        setIsExpanded(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded, isMobile]);

  // Close on click outside (desktop only)
  useEffect(() => {
    if (!isExpanded || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isMobile]);

  const dominantTint = getDominantTint(weights);

  return (
    <div ref={containerRef} className="sticky top-20 z-30 mb-6">
      {/* Main container with gradient tint */}
      <motion.div
        className="rounded-2xl border border-border/50 overflow-hidden shadow-lg"
        style={{ backgroundColor: dominantTint }}
        animate={{ backgroundColor: dominantTint }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-surface/85 backdrop-blur-md">
          {/* Sparkline header - always visible */}
          <SparklineHeader
            weights={weights}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />

          {/* Desktop: Slimline drawer */}
          {!isMobile && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-border"
                >
                  <DesktopDrawer
                    weights={weights}
                    onChange={onChange}
                    onReset={onReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Mobile: Bottom sheet */}
      {isMobile && (
        <AnimatePresence>
          {isExpanded && (
            <MobileBottomSheet
              weights={weights}
              onChange={onChange}
              onReset={onReset}
              onClose={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default FluidGravityFilter;
