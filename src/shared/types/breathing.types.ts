/**
 * Core breathing-related type definitions
 */

export interface BreathingShape {
  id: string;
  name: string;
  type: 'circle' | 'triangle' | 'square' | 'star' | 'heart' | 'lotus';
  svgPath?: string;
  description: string;
}

export interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'pause';
  duration: number;
  intensity: number;
  /** Optional creator-authored route. Omitted means the user may choose. */
  airway?: 'nose' | 'mouth';
  nostril?: 'left' | 'right' | 'both';
}

export interface BreathingPattern {
  id: string;
  name: string;
  type: 'relaxing' | 'active' | 'flow' | 'custom';
  phases: BreathingPhase[];
  duration: number;
  isNostrilBreathing?: boolean;
}

/**
 * Renderer-facing snapshot of the active phase.
 *
 * The engine owns timing; UI projections consume this immutable snapshot so
 * they do not duplicate phase or cycle calculations.
 */
export interface BreathingProgress {
  patternId: string;
  phaseIndex: number;
  phaseCount: number;
  phaseName: BreathingPhase['name'];
  airway?: BreathingPhase['airway'];
  nostril?: BreathingPhase['nostril'];
  phaseProgress: number;
  phaseRemainingMs: number;
  cycleProgress: number;
}

export interface BreathingSequenceStep {
  pattern: BreathingPattern;
  repetitions: number;
  description: string;
}

export interface BreathingSequence {
  id: string;
  name: string;
  description: string;
  steps: BreathingSequenceStep[];
  loop: boolean;
}
