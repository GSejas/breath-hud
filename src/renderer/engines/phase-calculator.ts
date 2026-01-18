/**
 * Phase Calculator for breathing phase calculations
 * Handles breathing value calculations based on phases and progress
 */

import { lerp, clamp } from '../utils/easing';
import { calculateBreathingValue, validateBreathingParams } from '../utils/breathing';
import type { BreathingPhase } from '../../shared/types/breathing.types';

export interface BreathingParams {
  baseSize: number;
  inhaleMax: number;
  exhaleMin: number;
}

export class PhaseCalculator {
  private baseSize = 0.6;
  private inhaleMax = 1.0;
  private exhaleMin = 0.4;
  private previousBreathingValue = 0.6;
  private reduceMotion = false;

  constructor() {
    this.detectReducedMotion();
  }

  /**
   * Detect OS reduced motion preference
   */
  private detectReducedMotion(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion = mediaQuery.matches;

      mediaQuery.addEventListener('change', (e) => {
        this.reduceMotion = e.matches;
        console.log(`Reduced motion preference changed: ${this.reduceMotion}`);
      });
    }
  }

  /**
   * Update breathing parameters
   */
  public setBreathingParams(params: Partial<BreathingParams>): void {
    if (params.baseSize !== undefined) this.baseSize = params.baseSize;
    if (params.inhaleMax !== undefined) this.inhaleMax = params.inhaleMax;
    if (params.exhaleMin !== undefined) this.exhaleMin = params.exhaleMin;

    const validated = validateBreathingParams(this.baseSize, this.inhaleMax, this.exhaleMin);
    this.baseSize = validated.baseSize;
    this.inhaleMax = validated.inhaleMax;
    this.exhaleMin = validated.exhaleMin;

    console.log(
      `Breathing params updated - Base: ${this.baseSize}, Inhale: ${this.inhaleMax}, Exhale: ${this.exhaleMin}`
    );
  }

  /**
   * Get current breathing parameters
   */
  public getBreathingParams(): BreathingParams {
    return {
      baseSize: this.baseSize,
      inhaleMax: this.inhaleMax,
      exhaleMin: this.exhaleMin
    };
  }

  /**
   * Set reduced motion preference
   */
  public setReducedMotion(enabled: boolean): void {
    this.reduceMotion = enabled;
    console.log(`Reduced motion manually set to: ${enabled}`);
  }

  /**
   * Get reduced motion preference
   */
  public isReducedMotion(): boolean {
    return this.reduceMotion;
  }

  /**
   * Calculate current breathing value
   */
  public calculateValue(phase: BreathingPhase, progress: number): number {
    const value = calculateBreathingValue(
      phase,
      progress,
      this.baseSize,
      this.inhaleMax,
      this.exhaleMin
    );

    if (this.reduceMotion) {
      const dampedTarget = this.baseSize + (value - this.baseSize) * 0.3;
      return lerp(this.previousBreathingValue, dampedTarget, 0.1);
    }

    const velocityFactor = Math.abs(value - this.previousBreathingValue) * 0.05;
    const lerpFactor = Math.max(0.02, Math.min(0.15, 0.08 + velocityFactor));

    const smoothValue = lerp(this.previousBreathingValue, value, lerpFactor);
    this.previousBreathingValue = smoothValue;

    return smoothValue;
  }

  /**
   * Reset breathing value tracker
   */
  public reset(): void {
    this.previousBreathingValue = this.baseSize;
  }
}
