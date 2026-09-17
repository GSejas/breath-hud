import type { BreathingPhase } from './types/breathing.types';

/** The single source of truth for user-facing phase instructions. */
export function getBreathingInstruction(
  phaseName: BreathingPhase['name'],
  nostril?: BreathingPhase['nostril'],
  airway?: BreathingPhase['airway'],
): string {
  const nostrilLabel = nostril && nostril !== 'both' ? ` through ${nostril} nostril` : '';
  const airwayLabel = nostril
    ? nostrilLabel
    : airway
      ? ` through ${airway}`
      : '';

  switch (phaseName) {
    case 'inhale': return `Inhale${airwayLabel}`;
    case 'exhale': return `Exhale${airwayLabel}`;
    case 'hold': return 'Hold';
    case 'pause': return 'Pause';
  }
}
