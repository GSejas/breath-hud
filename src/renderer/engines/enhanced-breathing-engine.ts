/**
 * Enhanced Breathing Engine - Canvas-based implementation
 * Extracted from app.ts to reduce module size
 */

import type {
  BreathingShape,
  BreathingPattern,
  BreathingPhase,
  BreathingProgress
} from '../../shared/types/breathing.types';

import {
  cubicEaseInOut,
  lerp,
  calculateBreathingValue,
  getPhaseOpacity,
  getPhaseColor
} from '../utils';
import {
  getBreathingArrowAnchor,
  getBreathingArrowPositions,
  getGenericBreathingArrowPositions,
  type BreathingArrowPosition,
} from '../utils/arrow-cues';

// Enhanced Breathing Engine (browser-compatible)
export class EnhancedBreathingEngine {
  private canvas: HTMLElement;
  private isRunning = false;
  private animationId?: number;
  private startTime = 0;
  private currentPhaseIndex = 0;
  private phaseStartTime = 0;
  
  private currentShape: BreathingShape;
  private currentPattern: BreathingPattern;
  public svgElement?: SVGElement;
  public canvasElement?: HTMLCanvasElement;
  public canvasContext?: CanvasRenderingContext2D;
  private arrowCanvas?: HTMLCanvasElement;
  private arrowContext?: CanvasRenderingContext2D | null;
  public shapePosition = { x: 0, y: 0 }; // Exposed for TileControlSystem
  private scale = 1.0;
  private intensity = 0.7;
  private baseSize = 0.6; // Configurable base breathing size
  private inhaleMax = 1.0; // Maximum size during inhale
  private exhaleMin = 0.4; // Minimum size during exhale
  private previousScale = 1.0;
  private previousIntensity = 0.7;
  private previousBreathingValue = 0.6;
  private transitionVelocity = 0;
  private reduceMotion = false;
  
  private onPhaseChange?: (phase: BreathingPhase, progress: number) => void;
  private onProgress?: (progress: BreathingProgress) => void;
  private onCycleComplete?: () => void;
  private lastPhaseChangeKey: string | null = null;

  constructor(canvas: HTMLElement, shape: BreathingShape, pattern: BreathingPattern) {
    this.canvas = canvas;
    this.currentShape = shape;
    this.currentPattern = pattern;
    this.detectReducedMotion();
    this.createShapeElement();
  }

  private detectReducedMotion() {
    // Detect OS reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion = mediaQuery.matches;
      
      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        this.reduceMotion = e.matches;
        console.log(`Reduced motion preference changed: ${this.reduceMotion}`);
      });
    }
  }

  setPhaseChangeCallback(callback: (phase: BreathingPhase, progress: number) => void) {
    this.onPhaseChange = callback;
  }

  /**
   * Subscribe to the authoritative phase/cycle snapshot used by UI views.
   */
  setProgressCallback(callback: (progress: BreathingProgress) => void) {
    this.onProgress = callback;
  }

  setCycleCompleteCallback(callback: () => void) {
    this.onCycleComplete = callback;
  }

  updateShape(shape: BreathingShape) {
    this.currentShape = shape;
    // Smooth transition by keeping current animation state
    const wasRunning = this.isRunning;
    const currentTime = this.getCurrentAnimationTime();
    
    this.createShapeElement();
    
    // Resume animation from where we left off for smooth transition
    if (wasRunning) {
      this.restoreAnimationState(currentTime);
    }
  }

  private getCurrentAnimationTime(): number {
    if (!this.isRunning) return 0;
    const now = Date.now();
    const currentPhase = this.getCurrentPhase();
    const phaseElapsed = (now - this.phaseStartTime) / 1000;
    return Math.min(phaseElapsed / currentPhase.duration, 1.0);
  }

  private restoreAnimationState(phaseProgress: number) {
    const currentPhase = this.getCurrentPhase();
    const elapsedMs = phaseProgress * currentPhase.duration * 1000;
    this.phaseStartTime = Date.now() - elapsedMs;
  }

  updatePattern(pattern: BreathingPattern) {
    this.currentPattern = pattern;
    this.resetPhase();
    this.lastPhaseChangeKey = null;
  }

  setPattern(pattern: BreathingPattern) {
    this.updatePattern(pattern);
  }

  updateScale(scale: number) {
    this.scale = scale;
  }

  updateIntensity(intensity: number) {
    this.intensity = intensity;
  }

  setReducedMotion(enabled: boolean) {
    this.reduceMotion = enabled;
    console.log(`Reduced motion manually set to: ${enabled}`);
  }

  getReducedMotion(): boolean {
    return this.reduceMotion;
  }

  updateBreathingParams(baseSize: number, inhaleMax: number, exhaleMin: number) {
    this.baseSize = Math.max(0.1, Math.min(1.5, baseSize));
    this.inhaleMax = Math.max(this.baseSize, Math.min(2.0, inhaleMax));
    this.exhaleMin = Math.max(0.1, Math.min(this.baseSize, exhaleMin));
    console.log(`Breathing params updated - Base: ${this.baseSize}, Inhale: ${this.inhaleMax}, Exhale: ${this.exhaleMin}`);
  }

  getBreathingParams() {
    return {
      baseSize: this.baseSize,
      inhaleMax: this.inhaleMax,
      exhaleMin: this.exhaleMin
    };
  }

  private createShapeElement() {
    this.canvas.innerHTML = '';
    
    // Create arrow canvas layer (behind main canvas)
    this.arrowCanvas = document.createElement('canvas');
    this.arrowCanvas.width = 200;
    this.arrowCanvas.height = 200;
    this.arrowCanvas.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;';
    this.canvas.appendChild(this.arrowCanvas);
    this.arrowContext = this.arrowCanvas.getContext('2d');
    
    // Create canvas element for better performance
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer;';
    canvas.className = 'breathing-canvas';
    
    this.canvas.appendChild(canvas);
    this.canvasElement = canvas;
    this.canvasContext = canvas.getContext('2d') || undefined;

    if (!this.arrowContext || !this.canvasContext) {
      this.canvas.innerHTML = '';
      throw new Error('Canvas rendering context is unavailable');
    }

    // Initial render
    this.renderShape();
  }

  public renderShape() {
    if (!this.canvasContext || !this.canvasElement) return;
    
    const ctx = this.canvasContext;
    const canvas = this.canvasElement;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim();
    const accentColor = computedStyle.getPropertyValue('--theme-accent').trim();
    
    // Apply current scale and position
    const centerX = 100 + this.shapePosition.x;
    const centerY = 100 + this.shapePosition.y;
    const baseRadius = 60;
    
    // Create glowing effect with multiple shadow layers
    ctx.save();
    
    // Outer glow (largest, most transparent)
    ctx.shadowColor = primaryColor || 'rgba(74, 144, 226, 0.8)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Set fill style - gradient if theme gradient is enabled, otherwise solid
    const container = document.getElementById('hud-container');
    const isGradientTheme = container?.classList.contains('theme-gradient');
    if (isGradientTheme) {
      // Create radial gradient for glowing effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
      gradient.addColorStop(0, accentColor || 'rgba(150, 220, 255, 1.0)'); // Bright center
      gradient.addColorStop(0.6, primaryColor || 'rgba(74, 144, 226, 0.8)'); // Main color
      gradient.addColorStop(1, 'rgba(74, 144, 226, 0.2)'); // Fade to transparent edge
      ctx.fillStyle = gradient;
    } else {
      // Solid color fill
      ctx.fillStyle = primaryColor || 'rgba(74, 144, 226, 0.8)';
    }
    
    // Render different shapes
    ctx.beginPath();
    
    if (this.currentShape.type === 'circle') {
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    } else {
      this.renderPathShape(ctx, centerX, centerY, baseRadius);
    }
    
    // Fill the shape (solid)
    ctx.fill();
    
    // Add inner glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = accentColor || 'rgba(150, 220, 255, 1.0)';
    ctx.fill();
    
    // Add core bright center
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
    
    ctx.restore();
  }

  private renderPathShape(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, baseRadius: number) {
    const scale = baseRadius / 60; // Normalize to base radius
    
    switch (this.currentShape.type) {
      case 'triangle':
        ctx.moveTo(centerX, centerY - baseRadius);
        ctx.lineTo(centerX + baseRadius * 0.866, centerY + baseRadius * 0.5);
        ctx.lineTo(centerX - baseRadius * 0.866, centerY + baseRadius * 0.5);
        ctx.closePath();
        break;
        
      case 'square':
        const half = baseRadius * 0.707; // Square inscribed in circle
        ctx.rect(centerX - half, centerY - half, half * 2, half * 2);
        break;
        
      case 'star':
        this.renderStar(ctx, centerX, centerY, baseRadius);
        break;
        
      case 'heart':
        this.renderHeart(ctx, centerX, centerY, baseRadius);
        break;
        
      default:
        // Fallback to circle
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        break;
    }
  }

  private renderStar(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    ctx.moveTo(centerX, centerY - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      const x = centerX + Math.cos(rot) * outerRadius;
      const y = centerY + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      
      const x2 = centerX + Math.cos(rot) * innerRadius;
      const y2 = centerY + Math.sin(rot) * innerRadius;
      ctx.lineTo(x2, y2);
      rot += step;
    }
    
    ctx.lineTo(centerX, centerY - outerRadius);
    ctx.closePath();
  }

  private renderHeart(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    const scale = radius / 60;
    const width = 60 * scale;
    const height = 50 * scale;
    
    ctx.moveTo(centerX, centerY + height * 0.3);
    ctx.bezierCurveTo(
      centerX, centerY - height * 0.1,
      centerX - width * 0.5, centerY - height * 0.5,
      centerX - width * 0.25, centerY - height * 0.1
    );
    ctx.bezierCurveTo(
      centerX - width * 0.1, centerY - height * 0.3,
      centerX + width * 0.1, centerY - height * 0.3,
      centerX + width * 0.25, centerY - height * 0.1
    );
    ctx.bezierCurveTo(
      centerX + width * 0.5, centerY - height * 0.5,
      centerX, centerY - height * 0.1,
      centerX, centerY + height * 0.3
    );
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.phaseStartTime = this.startTime;
    this.currentPhaseIndex = 0;
    this.lastPhaseChangeKey = null;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private resetPhase() {
    this.currentPhaseIndex = 0;
    this.phaseStartTime = Date.now();
  }

  private getCurrentPhase(): BreathingPhase {
    return this.currentPattern.phases[this.currentPhaseIndex] || this.currentPattern.phases[0];
  }

  private animate() {
    if (!this.isRunning) return;

    const now = Date.now();
    const currentPhase = this.getCurrentPhase();
    
    // Ensure durations are treated as seconds (convert to milliseconds for timing)
    const phaseDurationMs = currentPhase.duration * 1000;
    const phaseElapsed = now - this.phaseStartTime;
    const phaseProgress = Math.min(phaseElapsed / phaseDurationMs, 1.0);

    const intensity = currentPhase.intensity * this.intensity;
    const breathingValue = this.animate_calculateBreathingValue(currentPhase, phaseProgress, intensity);

    this.animateShape(breathingValue, currentPhase, phaseProgress);
    this.renderArrows(currentPhase, phaseProgress);

    if (this.onProgress) {
      this.onProgress(this.createProgressSnapshot(currentPhase, phaseProgress));
    }

    const phaseChangeKey = `${this.currentPattern.id}:${this.currentPhaseIndex}`;
    if (this.onPhaseChange && phaseChangeKey !== this.lastPhaseChangeKey) {
      this.onPhaseChange(currentPhase, phaseProgress);
      this.lastPhaseChangeKey = phaseChangeKey;
    }

    // Phase transition with smooth continuity
    if (phaseProgress >= 1.0) {
      const nextPhaseIndex = (this.currentPhaseIndex + 1) % this.currentPattern.phases.length;
      const nextPhase = this.currentPattern.phases[nextPhaseIndex];
      
      // Check if we completed a full cycle (returning to first phase)
      const completedCycle = nextPhaseIndex === 0;
      
      // Smooth transition: carry over any timing excess to next phase
      const timeOverflow = phaseElapsed - phaseDurationMs;
      
      this.currentPhaseIndex = nextPhaseIndex;
      this.phaseStartTime = now - Math.max(0, timeOverflow);
      
      // Log phase transitions for debugging timing consistency
      console.log(`Phase transition: ${currentPhase.name} -> ${nextPhase.name} (duration: ${currentPhase.duration}s)`);
      
      // Notify cycle completion if we returned to first phase
      if (completedCycle && this.onCycleComplete) {
        this.onCycleComplete();
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private animate_calculateBreathingValue(phase: BreathingPhase, progress: number, intensity: number): number {
    // Use imported calculateBreathingValue utility
    const value = calculateBreathingValue(
      phase,
      progress,
      this.baseSize,
      this.inhaleMax,
      this.exhaleMin
    );

    // Apply phase/global intensity around the neutral base size. This keeps
    // the setting meaningful without changing the timing contract.
    const normalizedIntensity = Math.max(0, Math.min(1, intensity));
    const intensityAdjustedValue = this.baseSize + ((value - this.baseSize) * normalizedIntensity);

    // Apply reduced motion: if enabled, reduce animation smoothness
    if (this.reduceMotion) {
      // For reduced motion, use simple linear interpolation with dampened movement
      const dampedTarget = this.baseSize + ((intensityAdjustedValue - this.baseSize) * 0.3); // Reduce movement by 70%
      return lerp(this.previousBreathingValue, dampedTarget, 0.1);
    }

    // Normal smooth transition with velocity-based lerping
    const velocityFactor = Math.abs(intensityAdjustedValue - this.previousBreathingValue) * 0.05;
    const lerpFactor = Math.max(0.02, Math.min(0.15, 0.08 + velocityFactor));
    
    const smoothValue = lerp(this.previousBreathingValue, intensityAdjustedValue, lerpFactor);
    this.previousBreathingValue = smoothValue;
    
    return smoothValue;
  }

  private animateShape(breathingValue: number, phase: BreathingPhase, progress: number) {
    if (!this.canvasContext || !this.canvasElement) return;

    const ctx = this.canvasContext;
    const canvas = this.canvasElement;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || 'rgba(74, 144, 226, 0.8)';
    const secondaryColor = computedStyle.getPropertyValue('--theme-secondary').trim() || 'rgba(100, 200, 255, 0.6)';
    const accentColor = computedStyle.getPropertyValue('--theme-accent').trim() || 'rgba(150, 220, 255, 1.0)';

    // Apply current scale and breathing animation
    const animatedScale = this.scale * breathingValue;
    const centerX = 100 + this.shapePosition.x;
    const centerY = 100 + this.shapePosition.y;
    const baseRadius = 60 * animatedScale;

    // Apply opacity with pulse effect (reduce for reduced motion)
    const baseOpacity = phase.name === 'pause' ? 0.4 : 0.8;
    let pulseOpacity: number;

    if (this.reduceMotion) {
      pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.05);
    } else {
      pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.2);
    }

    // Check if this is a nostril breathing pattern
    if (this.currentPattern.isNostrilBreathing && phase.nostril) {
      this.renderNostrilShape(ctx, centerX, centerY, baseRadius, phase, pulseOpacity, primaryColor, secondaryColor, accentColor);
    } else {
      // Normal single-color rendering
      let strokeColor = primaryColor;
      switch (phase.name) {
        case 'inhale':
          strokeColor = primaryColor;
          break;
        case 'hold':
          strokeColor = accentColor;
          break;
        case 'exhale':
          strokeColor = secondaryColor;
          break;
        case 'pause':
          strokeColor = primaryColor;
          break;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = pulseOpacity;

      ctx.beginPath();
      if (this.currentShape.type === 'circle') {
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      } else {
        this.renderPathShapeAnimated(ctx, centerX, centerY, baseRadius);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  private renderNostrilShape(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    phase: BreathingPhase,
    baseOpacity: number,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) {
    const nostril = phase.nostril;
    const leftActive = nostril === 'left' || nostril === 'both';
    const rightActive = nostril === 'right' || nostril === 'both';

    // Determine colors based on phase
    let activeColor = primaryColor;
    if (phase.name === 'hold') activeColor = accentColor;
    if (phase.name === 'exhale') activeColor = secondaryColor;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Render left half
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, centerX, 200); // Clip to left half
    ctx.clip();

    ctx.beginPath();
    ctx.globalAlpha = leftActive ? baseOpacity : baseOpacity * 0.25;
    ctx.strokeStyle = leftActive ? activeColor : 'rgba(100, 100, 100, 0.4)';

    if (leftActive) {
      // Add glow for active nostril
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 15;
    }

    if (this.currentShape.type === 'circle') {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else {
      this.renderPathShapeAnimated(ctx, centerX, centerY, radius);
    }
    ctx.stroke();
    ctx.restore();

    // Render right half
    ctx.save();
    ctx.beginPath();
    ctx.rect(centerX, 0, 200, 200); // Clip to right half
    ctx.clip();

    ctx.beginPath();
    ctx.globalAlpha = rightActive ? baseOpacity : baseOpacity * 0.25;
    ctx.strokeStyle = rightActive ? activeColor : 'rgba(100, 100, 100, 0.4)';

    if (rightActive) {
      // Add glow for active nostril
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 15;
    }

    if (this.currentShape.type === 'circle') {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else {
      this.renderPathShapeAnimated(ctx, centerX, centerY, radius);
    }
    ctx.stroke();
    ctx.restore();

    // Draw center dividing line
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX, centerY + radius + 10);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = 1.0;
  }

  private renderPathShapeAnimated(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    switch (this.currentShape.type) {
      case 'triangle':
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX + radius * 0.866, centerY + radius * 0.5);
        ctx.lineTo(centerX - radius * 0.866, centerY + radius * 0.5);
        ctx.closePath();
        break;
        
      case 'square':
        const half = radius * 0.707;
        ctx.rect(centerX - half, centerY - half, half * 2, half * 2);
        break;
        
      case 'star':
        this.renderStar(ctx, centerX, centerY, radius);
        break;
        
      case 'heart':
        this.renderHeart(ctx, centerX, centerY, radius);
        break;
        
      default:
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        break;
    }
  }

  private renderArrows(phase: BreathingPhase, progress: number) {
    if (!this.arrowContext || !this.arrowCanvas) return;

    // Clear arrow canvas
    this.arrowContext.clearRect(0, 0, this.arrowCanvas.width, this.arrowCanvas.height);

    // Determine arrow direction based on phase
    const direction = phase.name === 'inhale' ? 'in' : phase.name === 'exhale' ? 'out' : null;
    if (!direction) return;

    // Reduced motion keeps the directional cue visible but static.
    const maxOpacity = phase.nostril ? 0.65 : 0.45;
    const fade = progress < 0.3 ? progress / 0.3 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
    const opacity = this.reduceMotion ? maxOpacity : maxOpacity * fade;
    if (opacity < 0.1) return;

    const computedStyle = getComputedStyle(document.documentElement);
    const arrowColor = computedStyle
      .getPropertyValue(phase.name === 'inhale' ? '--theme-primary' : '--theme-secondary')
      .trim() || (phase.name === 'inhale' ? 'rgb(100, 200, 255)' : 'rgb(200, 100, 255)');

    // Center of canvas
    const { centerX, centerY } = getBreathingArrowAnchor(this.shapePosition);
    const radius = 70; // Distance from center where arrows appear

    const positions: BreathingArrowPosition[] = phase.nostril
      ? getBreathingArrowPositions(phase.nostril, centerX, centerY, radius)
      : getGenericBreathingArrowPositions(centerX, centerY, radius);

    for (const pos of positions) {
      if (direction === 'in') {
        // Inhale: arrows point inward toward center
        this.drawArrowAtPosition(pos.x, pos.y, pos.inwardDirection, arrowColor, opacity);
      } else {
        // Exhale: arrows point outward from center
        this.drawArrowAtPosition(pos.x, pos.y, pos.outwardDirection, arrowColor, opacity);
      }
    }
  }

  private createProgressSnapshot(phase: BreathingPhase, phaseProgress: number): BreathingProgress {
    const phaseCount = this.currentPattern.phases.length;
    const completedDuration = this.currentPattern.phases
      .slice(0, this.currentPhaseIndex)
      .reduce((total, current) => total + current.duration, 0);
    const cycleDuration = this.currentPattern.phases
      .reduce((total, current) => total + current.duration, 0);
    const safeCycleDuration = cycleDuration > 0 ? cycleDuration : 1;
    const safePhaseProgress = Math.max(0, Math.min(1, phaseProgress));

    return {
      patternId: this.currentPattern.id,
      phaseIndex: this.currentPhaseIndex,
      phaseCount,
      phaseName: phase.name,
      airway: phase.airway,
      nostril: phase.nostril,
      phaseProgress: safePhaseProgress,
      phaseRemainingMs: Math.max(0, (phase.duration * (1 - safePhaseProgress)) * 1000),
      cycleProgress: Math.max(
        0,
        Math.min(1, (completedDuration + (phase.duration * safePhaseProgress)) / safeCycleDuration)
      ),
    };
  }

  private drawArrowAtPosition(
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    color: string,
    opacity: number
  ): void {
    if (!this.arrowContext) return;

    const ctx = this.arrowContext;
    const arrowSize = 6;
    const lineLength = 14;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const positions = {
      up: {
        lineStart: { x, y: y + lineLength / 2 },
        lineEnd: { x, y: y - lineLength / 2 },
        arrowTip: { x, y: y - lineLength / 2 },
        arrowBase1: { x: x - arrowSize / 2, y: y - lineLength / 2 + arrowSize },
        arrowBase2: { x: x + arrowSize / 2, y: y - lineLength / 2 + arrowSize },
      },
      down: {
        lineStart: { x, y: y - lineLength / 2 },
        lineEnd: { x, y: y + lineLength / 2 },
        arrowTip: { x, y: y + lineLength / 2 },
        arrowBase1: { x: x - arrowSize / 2, y: y + lineLength / 2 - arrowSize },
        arrowBase2: { x: x + arrowSize / 2, y: y + lineLength / 2 - arrowSize },
      },
      left: {
        lineStart: { x: x + lineLength / 2, y },
        lineEnd: { x: x - lineLength / 2, y },
        arrowTip: { x: x - lineLength / 2, y },
        arrowBase1: { x: x - lineLength / 2 + arrowSize, y: y - arrowSize / 2 },
        arrowBase2: { x: x - lineLength / 2 + arrowSize, y: y + arrowSize / 2 },
      },
      right: {
        lineStart: { x: x - lineLength / 2, y },
        lineEnd: { x: x + lineLength / 2, y },
        arrowTip: { x: x + lineLength / 2, y },
        arrowBase1: { x: x + lineLength / 2 - arrowSize, y: y - arrowSize / 2 },
        arrowBase2: { x: x + lineLength / 2 - arrowSize, y: y + arrowSize / 2 },
      },
    };

    const pos = positions[direction];

    // Draw line
    ctx.beginPath();
    ctx.moveTo(pos.lineStart.x, pos.lineStart.y);
    ctx.lineTo(pos.lineEnd.x, pos.lineEnd.y);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(pos.arrowBase1.x, pos.arrowBase1.y);
    ctx.lineTo(pos.arrowTip.x, pos.arrowTip.y);
    ctx.lineTo(pos.arrowBase2.x, pos.arrowBase2.y);
    ctx.stroke();

    ctx.restore();
  }

  // Canvas rendering handles colors directly - this method is no longer needed
}
