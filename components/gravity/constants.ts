export const COLORS = {
  skills: {
    primary: 'var(--accent-coral)',
    light: 'var(--accent-coral-bg)',
    text: 'text-accent-coral',
    bg: 'bg-accent-coral',
    bgLight: 'bg-accent-coral-bg',
  },
  compensation: {
    primary: '#16A34A',
    light: '#DCFCE7',
    text: 'text-green-600',
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
  },
  culture: {
    primary: '#9333EA',
    light: '#F3E8FF',
    text: 'text-accent-green',
    bg: 'bg-accent-green',
    bgLight: 'bg-accent-green-bg',
  },
} as const;

export const PRESETS = {
  balanced: { skills: 33, compensation: 33, culture: 34 },
  skillsFirst: { skills: 60, compensation: 20, culture: 20 },
  compensationFirst: { skills: 20, compensation: 60, culture: 20 },
  cultureFirst: { skills: 20, compensation: 20, culture: 60 },
} as const;

export type PresetKey = keyof typeof PRESETS;

export function weightsMatchPreset(
  weights: { skills: number; compensation: number; culture: number },
  preset: { skills: number; compensation: number; culture: number }
): boolean {
  return (
    Math.abs(weights.skills - preset.skills) <= 2 &&
    Math.abs(weights.compensation - preset.compensation) <= 2 &&
    Math.abs(weights.culture - preset.culture) <= 2
  );
}
