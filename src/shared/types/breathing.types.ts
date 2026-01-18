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
