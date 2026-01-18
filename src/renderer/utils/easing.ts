/**
 * Mathematical easing functions for smooth animations
 */

/**
 * Cubic ease-in-out easing function
 * Provides smooth acceleration and deceleration
 */
export function cubicEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Smooth dampening for velocity-based animations
 */
export function damp(current: number, target: number, smoothing: number): number {
  return lerp(current, target, smoothing);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Quadratic ease-in function
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Quadratic ease-out function
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Exponential ease-out for bouncy effects
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
