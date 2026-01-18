import {
  calculateBreathingValue,
  getPhaseOpacity,
  getPhaseColor,
  isNostrilActive,
  validateBreathingParams
} from '../breathing';
import type { BreathingPhase } from '../../../shared/types/breathing.types';

describe('Breathing Utilities', () => {
  const mockPhases = {
    inhale: { name: 'inhale', duration: 4, intensity: 0.7 } as BreathingPhase,
    hold: { name: 'hold', duration: 4, intensity: 1.0 } as BreathingPhase,
    exhale: { name: 'exhale', duration: 4, intensity: 0.3 } as BreathingPhase,
    pause: { name: 'pause', duration: 4, intensity: 0.0 } as BreathingPhase,
    nostrilLeft: {
      name: 'inhale',
      duration: 4,
      intensity: 0.7,
      nostril: 'left'
    } as BreathingPhase
  };

  describe('calculateBreathingValue', () => {
    it('should return baseSize at phase start', () => {
      const value = calculateBreathingValue(mockPhases.inhale, 0, 0.6, 1.0, 0.4);
      expect(value).toBeCloseTo(0.6, 1);
    });

    it('should return inhaleMax at inhale end', () => {
      const value = calculateBreathingValue(mockPhases.inhale, 1.0, 0.6, 1.0, 0.4);
      expect(value).toBeCloseTo(1.0, 1);
    });

    it('should return exhaleMin at exhale end', () => {
      const value = calculateBreathingValue(mockPhases.exhale, 1.0, 0.6, 1.0, 0.4);
      expect(value).toBeCloseTo(0.4, 1);
    });

    it('should maintain hold phase value', () => {
      const value1 = calculateBreathingValue(mockPhases.hold, 0, 0.6, 1.0, 0.4);
      const value2 = calculateBreathingValue(mockPhases.hold, 0.5, 0.6, 1.0, 0.4);
      expect(value1).toBeCloseTo(value2, 1);
    });

    it('should maintain pause phase value', () => {
      const value1 = calculateBreathingValue(mockPhases.pause, 0, 0.6, 1.0, 0.4);
      const value2 = calculateBreathingValue(mockPhases.pause, 0.5, 0.6, 1.0, 0.4);
      expect(value1).toBeCloseTo(value2, 1);
    });
  });

  describe('getPhaseOpacity', () => {
    it('should return lower opacity for pause phase', () => {
      const opacityPause = getPhaseOpacity(mockPhases.pause, 0.5);
      const opacityInhale = getPhaseOpacity(mockPhases.inhale, 0.5);
      expect(opacityPause).toBeLessThan(opacityInhale);
    });

    it('should reduce motion when enabled', () => {
      const normalOpacity = getPhaseOpacity(mockPhases.inhale, 0.5, false);
      const reducedOpacity = getPhaseOpacity(mockPhases.inhale, 0.5, true);
      expect(Math.abs(normalOpacity - reducedOpacity)).toBeGreaterThan(0.05);
    });
  });

  describe('getPhaseColor', () => {
    const colors = {
      primary: 'rgba(74, 144, 226, 0.8)',
      secondary: 'rgba(100, 200, 255, 0.6)',
      accent: 'rgba(150, 220, 255, 1.0)'
    };

    it('should return primary for inhale', () => {
      const color = getPhaseColor(
        mockPhases.inhale,
        colors.primary,
        colors.secondary,
        colors.accent
      );
      expect(color).toBe(colors.primary);
    });

    it('should return accent for hold', () => {
      const color = getPhaseColor(
        mockPhases.hold,
        colors.primary,
        colors.secondary,
        colors.accent
      );
      expect(color).toBe(colors.accent);
    });

    it('should return secondary for exhale', () => {
      const color = getPhaseColor(
        mockPhases.exhale,
        colors.primary,
        colors.secondary,
        colors.accent
      );
      expect(color).toBe(colors.secondary);
    });
  });

  describe('isNostrilActive', () => {
    it('should detect left nostril', () => {
      expect(
        isNostrilActive(mockPhases.nostrilLeft, 'left')
      ).toBe(true);
    });

    it('should return false for right nostril', () => {
      expect(
        isNostrilActive(mockPhases.nostrilLeft, 'right')
      ).toBe(false);
    });

    it('should detect both nostrils', () => {
      const bothPhase = {
        ...mockPhases.nostrilLeft,
        nostril: 'both'
      } as BreathingPhase;
      expect(isNostrilActive(bothPhase, 'left')).toBe(true);
      expect(isNostrilActive(bothPhase, 'right')).toBe(true);
    });
  });

  describe('validateBreathingParams', () => {
    it('should clamp baseSize between 0.1 and 1.5', () => {
      let result = validateBreathingParams(0, 1.0, 0.4);
      expect(result.baseSize).toBe(0.1);

      result = validateBreathingParams(2.0, 1.0, 0.4);
      expect(result.baseSize).toBe(1.5);

      result = validateBreathingParams(0.6, 1.0, 0.4);
      expect(result.baseSize).toBe(0.6);
    });

    it('should ensure inhaleMax >= baseSize', () => {
      const result = validateBreathingParams(0.8, 0.5, 0.4);
      expect(result.inhaleMax).toBeGreaterThanOrEqual(result.baseSize);
    });

    it('should ensure exhaleMin <= baseSize', () => {
      const result = validateBreathingParams(0.6, 1.0, 0.8);
      expect(result.exhaleMin).toBeLessThanOrEqual(result.baseSize);
    });
  });
});
