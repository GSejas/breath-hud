/**
 * Animation Engine for breathing animations
 * Manages animation loop and timing
 */

import type { BreathingPattern, BreathingPhase } from '../../shared/types/breathing.types';

export interface AnimationCallback {
  onPhaseChange?: (phase: BreathingPhase, progress: number) => void;
  onCycleComplete?: () => void;
}

export class AnimationEngine {
  private isRunning = false;
  private animationId?: number;
  private startTime = 0;
  private currentPhaseIndex = 0;
  private phaseStartTime = 0;
  private currentPattern: BreathingPattern;
  private callbacks: AnimationCallback = {};

  constructor(pattern: BreathingPattern) {
    this.currentPattern = pattern;
  }

  /**
   * Set animation callbacks
   */
  public setCallbacks(callbacks: AnimationCallback): void {
    this.callbacks = callbacks;
  }

  /**
   * Update breathing pattern
   */
  public setPattern(pattern: BreathingPattern): void {
    this.currentPattern = pattern;
    this.resetPhase();
  }

  /**
   * Get current breathing pattern
   */
  public getPattern(): BreathingPattern {
    return this.currentPattern;
  }

  /**
   * Start animation loop
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.phaseStartTime = this.startTime;
    this.currentPhaseIndex = 0;
    this.animate();
  }

  /**
   * Stop animation loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Get animation state
   */
  public isAnimating(): boolean {
    return this.isRunning;
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): BreathingPhase {
    return (
      this.currentPattern.phases[this.currentPhaseIndex] ||
      this.currentPattern.phases[0]
    );
  }

  /**
   * Get current phase progress (0-1)
   */
  public getCurrentPhaseProgress(): number {
    if (!this.isRunning) return 0;
    const currentPhase = this.getCurrentPhase();
    const phaseDurationMs = currentPhase.duration * 1000;
    const phaseElapsed = Date.now() - this.phaseStartTime;
    return Math.min(phaseElapsed / phaseDurationMs, 1.0);
  }

  /**
   * Reset to first phase
   */
  private resetPhase(): void {
    this.currentPhaseIndex = 0;
    this.phaseStartTime = Date.now();
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const now = Date.now();
    const currentPhase = this.getCurrentPhase();
    const phaseDurationMs = currentPhase.duration * 1000;
    const phaseElapsed = now - this.phaseStartTime;
    const phaseProgress = Math.min(phaseElapsed / phaseDurationMs, 1.0);

    // Notify phase change
    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(currentPhase, phaseProgress);
    }

    // Handle phase transition
    if (phaseProgress >= 1.0) {
      const nextPhaseIndex = (this.currentPhaseIndex + 1) % this.currentPattern.phases.length;
      const completedCycle = nextPhaseIndex === 0;

      const timeOverflow = phaseElapsed - phaseDurationMs;

      this.currentPhaseIndex = nextPhaseIndex;
      this.phaseStartTime = now - Math.max(0, timeOverflow);

      console.log(
        `Phase transition: ${currentPhase.name} -> ${this.getCurrentPhase().name}`
      );

      if (completedCycle && this.callbacks.onCycleComplete) {
        this.callbacks.onCycleComplete();
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
