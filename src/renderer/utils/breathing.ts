/**
 * Breathing calculation and phase management utilities
 */

import type { BreathingPhase } from '../../shared/types/breathing.types';
import { cubicEaseInOut } from './easing';

/**
 * Calculate current breathing animation value based on phase and progress
 */
export function calculateBreathingValue(
  phase: BreathingPhase,
  progress: number,
  baseSize: number,
  inhaleMax: number,
  exhaleMin: number
): number {
  let targetValue: number;

  switch (phase.name) {
    case 'inhale':
      // Smooth cubic easing from base to inhale max
      const inhaleEase = cubicEaseInOut(progress);
      targetValue = baseSize + inhaleEase * (inhaleMax - baseSize);
      break;

    case 'hold':
      // Stay at inhale max during hold
      targetValue = inhaleMax;
      break;

    case 'exhale':
      // Smooth cubic easing from inhale max to exhale min
      const exhaleEase = cubicEaseInOut(progress);
      targetValue = inhaleMax - exhaleEase * (inhaleMax - exhaleMin);
      break;

    case 'pause':
      // Stay at exhale min during pause
      targetValue = exhaleMin;
      break;

    default:
      targetValue = baseSize;
      break;
  }

  return targetValue;
}

/**
 * Get opacity value for a breathing phase
 */
export function getPhaseOpacity(
  phase: BreathingPhase,
  progress: number,
  reduceMotion: boolean = false
): number {
  const baseOpacity = phase.name === 'pause' ? 0.4 : 0.8;

  if (reduceMotion) {
    return baseOpacity + Math.sin(progress * Math.PI) * 0.05;
  } else {
    return baseOpacity + Math.sin(progress * Math.PI) * 0.2;
  }
}

/**
 * Get stroke color for a breathing phase
 */
export function getPhaseColor(
  phase: BreathingPhase,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): string {
  switch (phase.name) {
    case 'inhale':
      return primaryColor;
    case 'hold':
      return accentColor;
    case 'exhale':
      return secondaryColor;
    case 'pause':
      return primaryColor;
    default:
      return primaryColor;
  }
}

/**
 * Determine if a phase is active for nostril breathing
 */
export function isNostrilActive(
  phase: BreathingPhase,
  nostril: 'left' | 'right' | 'both'
): boolean {
  if (!phase.nostril) return false;
  return phase.nostril === nostril || phase.nostril === 'both';
}

/**
 * Validate breathing parameters
 */
export function validateBreathingParams(
  baseSize: number,
  inhaleMax: number,
  exhaleMin: number
): {
  baseSize: number;
  inhaleMax: number;
  exhaleMin: number;
} {
  return {
    baseSize: Math.max(0.1, Math.min(1.5, baseSize)),
    inhaleMax: Math.max(baseSize, Math.min(2.0, inhaleMax)),
    exhaleMin: Math.max(0.1, Math.min(baseSize, exhaleMin))
  };
}
