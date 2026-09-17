import type { BreathingPhase } from '../../shared/types/breathing.types';

export interface BreathingArrowPosition {
  x: number;
  y: number;
  inwardDirection: 'up' | 'down' | 'left' | 'right';
  outwardDirection: 'up' | 'down' | 'left' | 'right';
}

export interface BreathingShapePosition {
  x: number;
  y: number;
}

/**
 * Keep decorative arrow cues anchored to the same translated shape center as
 * the breathing renderer.
 */
export function getBreathingArrowAnchor(
  position: BreathingShapePosition,
  canvasCenter = 100,
): { centerX: number; centerY: number } {
  return {
    centerX: canvasCenter + position.x,
    centerY: canvasCenter + position.y,
  };
}

/**
 * Maps semantic nostril airflow to canvas arrow positions.
 * Keeping this pure makes the direction contract independently testable.
 */
export function getBreathingArrowPositions(
  nostril: NonNullable<BreathingPhase['nostril']>,
  centerX: number,
  centerY: number,
  radius: number
): BreathingArrowPosition[] {
  const left: BreathingArrowPosition = {
    x: centerX - radius,
    y: centerY,
    inwardDirection: 'right',
    outwardDirection: 'left',
  };
  const right: BreathingArrowPosition = {
    x: centerX + radius,
    y: centerY,
    inwardDirection: 'left',
    outwardDirection: 'right',
  };

  if (nostril === 'left') return [left];
  if (nostril === 'right') return [right];
  return [left, right];
}

/**
 * Generic breathing uses vertical cues only. Horizontal cues are reserved for
 * explicit left/right nostril airflow so they cannot be mistaken for a
 * navigation affordance.
 */
export function getGenericBreathingArrowPositions(
  centerX: number,
  centerY: number,
  radius: number,
): BreathingArrowPosition[] {
  return [
    {
      x: centerX,
      y: centerY - radius,
      inwardDirection: 'down',
      outwardDirection: 'up',
    },
    {
      x: centerX,
      y: centerY + radius,
      inwardDirection: 'up',
      outwardDirection: 'down',
    },
  ];
}
