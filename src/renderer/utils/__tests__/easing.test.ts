import {
  cubicEaseInOut,
  lerp,
  damp,
  clamp,
  easeInQuad,
  easeOutQuad,
  easeOutExpo
} from '../easing';

describe('Easing Functions', () => {
  describe('cubicEaseInOut', () => {
    it('should return 0 at start', () => {
      expect(cubicEaseInOut(0)).toBe(0);
    });

    it('should return 1 at end', () => {
      expect(cubicEaseInOut(1)).toBe(1);
    });

    it('should return 0.5 at midpoint', () => {
      expect(Math.abs(cubicEaseInOut(0.5) - 0.5)).toBeLessThan(0.01);
    });

    it('should have smooth acceleration', () => {
      const start = cubicEaseInOut(0.1);
      const mid = cubicEaseInOut(0.2);
      expect(mid - start).toBeLessThan(0.1);
    });
  });

  describe('lerp', () => {
    it('should return start at factor 0', () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it('should return end at factor 1', () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });

    it('should return midpoint at factor 0.5', () => {
      expect(lerp(10, 20, 0.5)).toBe(15);
    });

    it('should extrapolate beyond bounds', () => {
      expect(lerp(10, 20, 1.5)).toBe(25);
    });
  });

  describe('damp', () => {
    it('should return current at factor 0', () => {
      expect(damp(5, 10, 0)).toBe(5);
    });

    it('should return target at factor 1', () => {
      expect(damp(5, 10, 1)).toBe(10);
    });
  });

  describe('clamp', () => {
    it('should return value when within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min when value is too low', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max when value is too high', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('easeInQuad', () => {
    it('should accelerate from 0', () => {
      expect(easeInQuad(0)).toBe(0);
      expect(easeInQuad(0.5)).toBeLessThan(0.5);
      expect(easeInQuad(1)).toBe(1);
    });
  });

  describe('easeOutQuad', () => {
    it('should decelerate to 1', () => {
      expect(easeOutQuad(0)).toBe(0);
      expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
      expect(easeOutQuad(1)).toBe(1);
    });
  });

  describe('easeOutExpo', () => {
    it('should handle 0 and 1', () => {
      expect(easeOutExpo(0)).toBe(0);
      expect(easeOutExpo(1)).toBe(1);
    });

    it('should be exponential', () => {
      const mid = easeOutExpo(0.5);
      expect(mid).toBeGreaterThan(0.8);
    });
  });
});
