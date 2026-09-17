/**
 * Available breathing patterns
 */

import type { BreathingPattern } from '../types/breathing.types';

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'zen-simple',
    name: 'Zen',
    type: 'relaxing',
    duration: 8,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.5 },
      { name: 'exhale', duration: 4, intensity: 0.2 }
    ]
  },
  {
    id: 'box-breathing',
    name: 'Box',
    type: 'active',
    duration: 16,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.7 },
      { name: 'hold', duration: 4, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.3 },
      { name: 'pause', duration: 4, intensity: 0.0 }
    ]
  },
  {
    id: 'relaxing-478',
    name: '4-7-8',
    type: 'relaxing',
    duration: 19,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.8 },
      { name: 'hold', duration: 7, intensity: 1.0 },
      { name: 'exhale', duration: 8, intensity: 0.4 }
    ]
  },
  {
    id: 'rest-breath',
    name: 'Rest',
    type: 'relaxing',
    duration: 12,
    phases: [
      { name: 'inhale', duration: 3, intensity: 0.3 },
      { name: 'exhale', duration: 5, intensity: 0.2 },
      { name: 'pause', duration: 4, intensity: 0.0 }
    ]
  },
  {
    id: 'hold-release',
    name: 'Hold & Release',
    type: 'active',
    duration: 20,
    phases: [
      { name: 'inhale', duration: 6, intensity: 0.9 },
      { name: 'hold', duration: 10, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.1 }
    ]
  },
  {
    id: 'normal-breath',
    name: 'Natural',
    type: 'flow',
    duration: 6,
    phases: [
      { name: 'inhale', duration: 3, intensity: 0.6 },
      { name: 'exhale', duration: 3, intensity: 0.3 }
    ]
  },
  {
    id: 'triangle-444',
    name: '4-4-4',
    type: 'active',
    duration: 12,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.7 },
      { name: 'hold', duration: 4, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.3 }
    ]
  },
  {
    id: 'simple-48',
    name: '4-8',
    type: 'relaxing',
    duration: 12,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.6 },
      { name: 'exhale', duration: 8, intensity: 0.3 }
    ]
  },
  {
    id: 'alternate-nostril',
    name: 'Nostril',
    type: 'flow',
    duration: 24,
    isNostrilBreathing: true,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.7, airway: 'nose', nostril: 'left' },
      { name: 'exhale', duration: 4, intensity: 0.3, airway: 'nose', nostril: 'right' },
      { name: 'inhale', duration: 4, intensity: 0.7, airway: 'nose', nostril: 'right' },
      { name: 'exhale', duration: 4, intensity: 0.3, airway: 'nose', nostril: 'left' },
      { name: 'inhale', duration: 4, intensity: 0.7, airway: 'nose', nostril: 'both' },
      { name: 'exhale', duration: 4, intensity: 0.3, airway: 'nose', nostril: 'both' }
    ]
  }
];
