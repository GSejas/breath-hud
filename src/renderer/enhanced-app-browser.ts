console.log('Enhanced HUD App starting...');

// Browser-compatible enhanced breathing system (no imports)

// Import config manager (will be bundled)
// Note: In real implementation, this would be properly imported
// For browser compatibility, the config manager is inlined below

// Type definitions (inline)
interface BreathingShape {
  id: string;
  name: string;
  type: 'circle' | 'triangle' | 'square' | 'star' | 'heart' | 'lotus';
  svgPath?: string;
  description: string;
}

interface BreathingPattern {
  id: string;
  name: string;
  type: 'relaxing' | 'active' | 'flow';
  phases: BreathingPhase[];
  duration: number;
}

interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'pause';
  duration: number;
  intensity: number;
}

interface BreathingSequenceStep {
  pattern: BreathingPattern;
  repetitions: number;
  description: string;
}

interface BreathingSequence {
  id: string;
  name: string;
  description: string;
  steps: BreathingSequenceStep[];
  loop: boolean;
}

interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  effects: {
    glow: boolean;
    pulse: boolean;
    gradient: boolean;
  };
}

// Inline presets (browser-compatible)
const BREATHING_SHAPES: BreathingShape[] = [
  {
    id: 'circle',
    name: 'Circle',
    type: 'circle',
    description: 'Classic circular breathing'
  },
  {
    id: 'triangle',
    name: 'Triangle', 
    type: 'triangle',
    svgPath: 'M100,20 L180,160 L20,160 Z',
    description: 'Sharp focus breathing'
  },
  {
    id: 'square',
    name: 'Square',
    type: 'square', 
    svgPath: 'M40,40 L160,40 L160,160 L40,160 Z',
    description: 'Box breathing visualization'
  },
  {
    id: 'star',
    name: 'Star',
    type: 'star',
    svgPath: 'M100,20 L112,68 L160,68 L122,100 L135,148 L100,120 L65,148 L78,100 L40,68 L88,68 Z',
    description: 'Energy breathing'
  },
  {
    id: 'heart',
    name: 'Heart',
    type: 'heart',
    svgPath: 'M100,160 C100,160 60,120 60,90 C60,70 80,50 100,60 C120,50 140,70 140,90 C140,120 100,160 100,160 Z',
    description: 'Loving-kindness breathing'
  }
];

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'zen-simple',
    name: 'Zen',
    type: 'relaxing',
    duration: 8,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.5 },
      { name: 'exhale', duration: 4, intensity: 0.2 }
    ]
  },
  {
    id: 'box-breathing',
    name: 'Box',
    type: 'active',
    duration: 16,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.7 },
      { name: 'hold', duration: 4, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.3 },
      { name: 'pause', duration: 4, intensity: 0.0 }
    ]
  },
  {
    id: 'relaxing-478',
    name: '4-7-8',
    type: 'relaxing',
    duration: 19,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.8 },
      { name: 'hold', duration: 7, intensity: 1.0 },
      { name: 'exhale', duration: 8, intensity: 0.4 }
    ]
  },
  {
    id: 'rest-breath',
    name: 'Rest',
    type: 'relaxing',
    duration: 12,
    phases: [
      { name: 'inhale', duration: 3, intensity: 0.3 },
      { name: 'exhale', duration: 5, intensity: 0.2 },
      { name: 'pause', duration: 4, intensity: 0.0 }
    ]
  },
  {
    id: 'hold-release',
    name: 'Hold & Release',
    type: 'active',
    duration: 20,
    phases: [
      { name: 'inhale', duration: 6, intensity: 0.9 },
      { name: 'hold', duration: 10, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.1 }
    ]
  },
  {
    id: 'normal-breath',
    name: 'Natural',
    type: 'flow',
    duration: 6,
    phases: [
      { name: 'inhale', duration: 3, intensity: 0.6 },
      { name: 'exhale', duration: 3, intensity: 0.3 }
    ]
  }
];

const BREATHING_SEQUENCES: BreathingSequence[] = [
  {
    id: 'training-sequence',
    name: 'Training Session',
    description: '25 box breaths, rest, hold & release, natural breathing, repeat',
    loop: true,
    steps: [
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'box-breathing')!,
        repetitions: 25,
        description: '25 Box Breathing rounds (4-4-4-4)'
      },
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'rest-breath')!,
        repetitions: 5,
        description: '5 Rest breaths'
      },
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'hold-release')!,
        repetitions: 10,
        description: '10 Hold & Release rounds'
      },
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'normal-breath')!,
        repetitions: 15,
        description: '15 Natural breathing rounds'
      }
    ]
  },
  {
    id: 'relaxation-sequence',
    name: 'Deep Relaxation',
    description: '4-7-8 breathing with rest periods',
    loop: true,
    steps: [
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'relaxing-478')!,
        repetitions: 20,
        description: '20 rounds of 4-7-8 breathing'
      },
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'rest-breath')!,
        repetitions: 8,
        description: '8 Rest breaths'
      }
    ]
  },
  {
    id: 'focus-sequence',
    name: 'Focus Training',
    description: 'Box breathing for concentration',
    loop: true,
    steps: [
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'box-breathing')!,
        repetitions: 50,
        description: '50 Box Breathing rounds for focus'
      },
      {
        pattern: BREATHING_PATTERNS.find(p => p.id === 'normal-breath')!,
        repetitions: 10,
        description: '10 Natural recovery breaths'
      }
    ]
  }
];

const VISUAL_THEMES: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: 'rgba(74, 144, 226, 0.8)',
      secondary: 'rgba(100, 200, 255, 0.6)',
      background: 'rgba(0, 50, 100, 0.1)',
      accent: 'rgba(150, 220, 255, 1.0)'
    },
    effects: { glow: true, pulse: true, gradient: true }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: 'rgba(76, 175, 80, 0.8)',
      secondary: 'rgba(139, 195, 74, 0.6)',
      background: 'rgba(27, 94, 32, 0.1)',
      accent: 'rgba(200, 230, 201, 1.0)'
    },
    effects: { glow: true, pulse: false, gradient: true }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: 'rgba(255, 112, 67, 0.8)',
      secondary: 'rgba(255, 183, 77, 0.6)',
      background: 'rgba(191, 54, 12, 0.1)',
      accent: 'rgba(255, 224, 178, 1.0)'
    },
    effects: { glow: true, pulse: true, gradient: true }
  }
];

// Breathing Sequence Manager
class BreathingSequenceManager {
  private currentSequence: BreathingSequence | null = null;
  private currentStepIndex = 0;
  private currentRepetition = 0;
  private isSequenceActive = false;
  private onPatternChange?: (pattern: BreathingPattern, stepInfo: string) => void;
  
  constructor() {
    // Initialize with default sequence
    this.setSequence(BREATHING_SEQUENCES[0]);
  }
  
  public setSequence(sequence: BreathingSequence): void {
    this.currentSequence = sequence;
    this.currentStepIndex = 0;
    this.currentRepetition = 0;
    console.log(`Sequence set: ${sequence.name}`);
  }
  
  public startSequence(): void {
    if (!this.currentSequence) return;
    
    this.isSequenceActive = true;
    this.currentStepIndex = 0;
    this.currentRepetition = 0;
    
    const firstStep = this.currentSequence.steps[0];
    this.notifyPatternChange(firstStep.pattern, this.getStepInfo());
    
    console.log(`Sequence started: ${this.currentSequence.name}`);
  }
  
  public stopSequence(): void {
    this.isSequenceActive = false;
    console.log('Sequence stopped');
  }
  
  public onBreathingCycleComplete(): void {
    if (!this.isSequenceActive || !this.currentSequence) return;
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    this.currentRepetition++;
    
    console.log(`Completed rep ${this.currentRepetition}/${currentStep.repetitions} of ${currentStep.pattern.name}`);
    
    // Check if current step is complete
    if (this.currentRepetition >= currentStep.repetitions) {
      this.advanceToNextStep();
    }
  }
  
  private advanceToNextStep(): void {
    if (!this.currentSequence) return;
    
    this.currentStepIndex++;
    this.currentRepetition = 0;
    
    // Check if sequence is complete
    if (this.currentStepIndex >= this.currentSequence.steps.length) {
      if (this.currentSequence.loop) {
        // Restart sequence
        this.currentStepIndex = 0;
        console.log(`Sequence loop: restarting ${this.currentSequence.name}`);
      } else {
        // End sequence
        this.stopSequence();
        return;
      }
    }
    
    const nextStep = this.currentSequence.steps[this.currentStepIndex];
    this.notifyPatternChange(nextStep.pattern, this.getStepInfo());
    
    console.log(`Advanced to step: ${nextStep.description}`);
  }
  
  private getStepInfo(): string {
    if (!this.currentSequence) return '';
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    const stepNumber = this.currentStepIndex + 1;
    const totalSteps = this.currentSequence.steps.length;
    
    return `Step ${stepNumber}/${totalSteps}: ${currentStep.description} (${this.currentRepetition}/${currentStep.repetitions})`;
  }
  
  public getCurrentPattern(): BreathingPattern | null {
    if (!this.isSequenceActive || !this.currentSequence) return null;
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    return currentStep.pattern;
  }
  
  public getSequenceInfo(): string {
    if (!this.currentSequence) return 'No sequence';
    
    if (!this.isSequenceActive) {
      return `${this.currentSequence.name} (stopped)`;
    }
    
    return this.getStepInfo();
  }
  
  public onPatternChangeCallback(callback: (pattern: BreathingPattern, stepInfo: string) => void): void {
    this.onPatternChange = callback;
  }
  
  private notifyPatternChange(pattern: BreathingPattern, stepInfo: string): void {
    if (this.onPatternChange) {
      this.onPatternChange(pattern, stepInfo);
    }
  }
  
  public getAvailableSequences(): BreathingSequence[] {
    return BREATHING_SEQUENCES;
  }
  
  public isActive(): boolean {
    return this.isSequenceActive;
  }
}

// Tile Scale Controller for expandable functionality
class TileScaleController {
  private currentScale: number = 1.0;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 3.0;
  private readonly SCALE_STEP = 0.1;
  private container: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.loadSavedScale();
    this.applyScale();
  }
  
  public scaleUp(): void {
    const newScale = Math.min(this.MAX_SCALE, this.currentScale + this.SCALE_STEP);
    this.setScale(newScale);
  }
  
  public scaleDown(): void {
    const newScale = Math.max(this.MIN_SCALE, this.currentScale - this.SCALE_STEP);
    this.setScale(newScale);
  }
  
  public resetScale(): void {
    this.setScale(1.0);
  }
  
  public setScale(scale: number): void {
    this.currentScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
    this.applyScale();
    this.saveScale();
    
    console.log(`Tile scaled to: ${(this.currentScale * 100).toFixed(0)}%`);
  }
  
  public getScale(): number {
    return this.currentScale;
  }
  
  public setPresetScale(preset: number): void {
    // Preset scales: 1=0.5x, 2=0.7x, 3=1.0x, 4=1.3x, 5=1.6x, 6=2.0x, 7=2.3x, 8=2.6x, 9=3.0x
    const presets = [0.5, 0.7, 1.0, 1.3, 1.6, 2.0, 2.3, 2.6, 3.0];
    if (preset >= 1 && preset <= 9) {
      this.setScale(presets[preset - 1]);
    }
  }
  
  private applyScale(): void {
    if (this.container) {
      this.container.style.setProperty('--hud-scale', this.currentScale.toString());
      this.container.classList.add('scalable');
      
      // Update the scale for counter-scaling fixed controls
      this.container.style.setProperty('--inverse-scale', (1 / this.currentScale).toString());
    }
  }
  
  private saveScale(): void {
    try {
      localStorage.setItem('breathingHudScale', this.currentScale.toString());
    } catch (error) {
      console.warn('Failed to save scale preference:', error);
    }
  }
  
  private loadSavedScale(): void {
    try {
      const saved = localStorage.getItem('breathingHudScale');
      if (saved) {
        const scale = parseFloat(saved);
        if (!isNaN(scale) && scale >= this.MIN_SCALE && scale <= this.MAX_SCALE) {
          this.currentScale = scale;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved scale:', error);
    }
  }
  
  public getScaleInfo(): string {
    const percentage = Math.round(this.currentScale * 100);
    const size = Math.round(300 * this.currentScale);
    return `${percentage}% (${size}×${size}px)`;
  }
}

// Auto-Fade Controller for hover behavior
class AutoFadeController {
  private fadeTimer: NodeJS.Timeout | null = null;
  private container: HTMLElement;
  private readonly FADE_DELAY = 3000; // 3 seconds
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.setupFadeListeners();
  }
  
  private setupFadeListeners() {
    // Show on hover
    this.container.addEventListener('mouseenter', () => {
      if (!this.isPinned()) {
        this.showInterface();
        this.clearFadeTimer();
      }
    });
    
    // Start fade timer on mouse leave
    this.container.addEventListener('mouseleave', () => {
      if (!this.isPinned()) {
        this.startFadeTimer();
      }
    });
    
    // Cancel fade if controls are clicked
    this.container.addEventListener('click', (e) => {
      if (e.target instanceof HTMLButtonElement) {
        this.clearFadeTimer();
        this.showInterface();
        // Start new timer after click
        setTimeout(() => {
          if (!this.isPinned()) {
            this.startFadeTimer();
          }
        }, 100);
      }
    });
  }
  
  private startFadeTimer() {
    this.clearFadeTimer();
    this.fadeTimer = setTimeout(() => {
      this.fadeInterface();
    }, this.FADE_DELAY);
  }
  
  private clearFadeTimer() {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
  
  private showInterface() {
    this.container.classList.remove('auto-faded');
  }
  
  private fadeInterface() {
    if (!this.isPinned()) {
      this.container.classList.add('auto-faded');
    }
  }
  
  private isPinned(): boolean {
    return this.container.classList.contains('pinned');
  }
  
  // Public method to force show (for debugging)
  public forceShow() {
    this.clearFadeTimer();
    this.showInterface();
  }
  
  // Public method to update pin status
  public updatePinStatus(isPinned: boolean) {
    if (isPinned) {
      this.clearFadeTimer();
      this.showInterface();
    } else {
      this.startFadeTimer();
    }
  }
}

// Enhanced Breathing Engine (browser-compatible)
class EnhancedBreathingEngine {
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
  private onCycleComplete?: () => void;

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
    
    // Create canvas element for better performance
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer;';
    canvas.className = 'breathing-canvas';
    
    this.canvas.appendChild(canvas);
    this.canvasElement = canvas;
    this.canvasContext = canvas.getContext('2d') || undefined;
    
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
    
    // Set fill style for solid shape
    ctx.fillStyle = primaryColor || 'rgba(74, 144, 226, 0.8)';
    
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
    const breathingValue = this.calculateBreathingValue(currentPhase, phaseProgress, intensity);

    this.animateShape(breathingValue, currentPhase, phaseProgress);

    if (this.onPhaseChange) {
      this.onPhaseChange(currentPhase, phaseProgress);
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

  private calculateBreathingValue(phase: BreathingPhase, progress: number, intensity: number): number {
    let targetValue: number;
    
    // Calculate target value based on phase using configurable parameters
    switch (phase.name) {
      case 'inhale':
        // Smooth cubic easing from base to inhale max
        const inhaleEase = this.cubicEaseInOut(progress);
        targetValue = this.baseSize + (inhaleEase * (this.inhaleMax - this.baseSize));
        break;
      case 'hold':
        // Stay at inhale max during hold
        targetValue = this.inhaleMax;
        break;
      case 'exhale':
        // Smooth cubic easing from inhale max to exhale min
        const exhaleEase = this.cubicEaseInOut(progress);
        targetValue = this.inhaleMax - (exhaleEase * (this.inhaleMax - this.exhaleMin));
        break;
      case 'pause':
        // Stay at exhale min during pause
        targetValue = this.exhaleMin;
        break;
      default:
        targetValue = this.baseSize;
        break;
    }

    // Apply reduced motion: if enabled, reduce animation smoothness
    if (this.reduceMotion) {
      // For reduced motion, use simple linear interpolation with dampened movement
      const dampedTarget = this.baseSize + ((targetValue - this.baseSize) * 0.3); // Reduce movement by 70%
      return this.lerp(this.previousBreathingValue, dampedTarget, 0.1);
    }

    // Normal smooth transition with velocity-based lerping
    const velocityFactor = Math.abs(targetValue - this.previousBreathingValue) * 0.05;
    const lerpFactor = Math.max(0.02, Math.min(0.15, 0.08 + velocityFactor));
    
    const smoothValue = this.lerp(this.previousBreathingValue, targetValue, lerpFactor);
    this.previousBreathingValue = smoothValue;
    
    return smoothValue;
  }

  private cubicEaseInOut(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  private animateShape(breathingValue: number, phase: BreathingPhase, progress: number) {
    if (!this.canvasContext || !this.canvasElement) return;
    
    const ctx = this.canvasContext;
    const canvas = this.canvasElement;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current colors from CSS variables and apply phase colors
    const computedStyle = getComputedStyle(document.documentElement);
    let strokeColor = computedStyle.getPropertyValue('--theme-primary').trim();
    
    // Apply phase-specific colors
    switch (phase.name) {
      case 'inhale':
        strokeColor = computedStyle.getPropertyValue('--theme-primary').trim();
        break;
      case 'hold':
        strokeColor = computedStyle.getPropertyValue('--theme-accent').trim();
        break;
      case 'exhale':
        strokeColor = computedStyle.getPropertyValue('--theme-secondary').trim();
        break;
      case 'pause':
        strokeColor = computedStyle.getPropertyValue('--theme-primary').trim();
        break;
    }
    
    // Apply current scale and breathing animation
    const animatedScale = this.scale * breathingValue;
    const centerX = 100 + this.shapePosition.x;
    const centerY = 100 + this.shapePosition.y;
    const baseRadius = 60 * animatedScale;
    
    // Apply opacity with pulse effect (reduce for reduced motion)
    const baseOpacity = phase.name === 'pause' ? 0.4 : 0.8;
    let pulseOpacity: number;
    
    if (this.reduceMotion) {
      // Minimal opacity variation for reduced motion
      pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.05);
    } else {
      // Normal pulse effect
      pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.2);
    }
    
    ctx.strokeStyle = strokeColor || 'rgba(74, 144, 226, 0.8)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = pulseOpacity;
    
    // Render the shape
    ctx.beginPath();
    
    if (this.currentShape.type === 'circle') {
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    } else {
      this.renderPathShapeAnimated(ctx, centerX, centerY, baseRadius);
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1.0; // Reset alpha
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

  // Canvas rendering handles colors directly - this method is no longer needed
}

// Main Tile Control System (browser-compatible)
class TileControlSystem {
  private breathingEngine: EnhancedBreathingEngine | null = null;
  private sequenceManager!: BreathingSequenceManager;
  private autoFadeController!: AutoFadeController;
  private scaleController!: TileScaleController;
  private isPinned = false;
  private currentMode: 'zen' | 'basic' | 'advanced' | 'edit' = 'basic';
  private currentShapeIndex = 0;
  private currentPatternIndex = 0;
  private currentSequenceIndex = 0;
  private currentThemeIndex = 0;
  private scale = 1.0;
  private intensity = 0.7;
  private isEditMode = false;
  private selectedShapeElement: SVGElement | null = null;
  private shapePosition = { x: 0, y: 0 }; // Relative position from center
  private editModeScale = 3; // Configurable scale multiplier for edit mode (reduced from 10)
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private currentSvgElement: SVGElement | null = null;
  private currentCanvasElement: HTMLCanvasElement | null = null;
  
  // Breathing parameters
  private baseSize = 0.6;
  private inhaleMax = 1.0;
  private exhaleMin = 0.4;
  
  private container: HTMLElement | null = null;
  private breathingCanvas: HTMLElement | null = null;
  private debugConsole: HTMLElement | null = null;

  async initialize() {
    console.log('Initializing Enhanced Tile Control System...');
    
    // Initialize sequence manager
    this.sequenceManager = new BreathingSequenceManager();
    this.setupSequenceCallbacks();
    
    this.setupUIElements();
    this.loadUserConfig(); // Load user feature flags
    this.loadConfig(); // Load saved configuration
    this.detectReducedMotionPreference(); // Check OS settings
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.initializeBreathingEngine();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    
    // Initialize auto-fade and scale controllers after all UI is set up
    if (this.container) {
      this.autoFadeController = new AutoFadeController(this.container);
      this.scaleController = new TileScaleController(this.container);
    }

    console.log('Enhanced Tile Control System initialized');
  }

  private setupSequenceCallbacks() {
    // Set up sequence manager callbacks
    this.sequenceManager.onPatternChangeCallback((pattern: BreathingPattern, stepInfo: string) => {
      // Update current pattern when sequence changes it
      const patternIndex = BREATHING_PATTERNS.findIndex(p => p.id === pattern.id);
      if (patternIndex !== -1) {
        this.currentPatternIndex = patternIndex;
        
        // Update breathing engine with new pattern
        if (this.breathingEngine) {
          this.breathingEngine.setPattern(pattern);
        }
        
        // Update UI display
        this.updateDisplays();
        
        console.log(`Sequence changed pattern to: ${pattern.name}`);
        console.log(`Step info: ${stepInfo}`);
      }
    });
  }

  private detectReducedMotionPreference() {
    // Detect OS reduced motion and apply to breathing engine
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const updateReducedMotion = () => {
        if (this.breathingEngine) {
          this.breathingEngine.setReducedMotion(mediaQuery.matches);
        }
        this.debugLog(`System reduced motion: ${mediaQuery.matches}`);
      };

      // Set initial value
      updateReducedMotion();

      // Listen for changes
      mediaQuery.addEventListener('change', updateReducedMotion);
    }
  }

  private setupUIElements() {
    this.container = document.getElementById('hud-container');
    this.breathingCanvas = document.querySelector('.breathing-shape-container') as HTMLElement;
    
    if (!this.container || !this.breathingCanvas) {
      console.error('Required UI elements not found');
      return;
    }

    this.createEnhancedControls();
    this.createNewControlContainers();
    this.createStatusDisplay();
    this.createDebugConsole();
    this.updateDisplays();
  }

  private createEnhancedControls() {
    if (!this.container) return;

    const existingControls = this.container.querySelector('.hud-controls');
    if (existingControls) {
      existingControls.remove();
    }

    const controlPanel = document.createElement('div');
    controlPanel.className = 'enhanced-controls';
    controlPanel.innerHTML = `
      <div class="control-row">
        <button id="edit-btn" class="control-btn" title="Edit Mode">✏️</button>
        <button id="audio-btn" class="control-btn" title="Toggle Audio">🔊</button>
        <button id="theme-btn" class="control-btn" title="Cycle Theme">🎨</button>
        <button id="pin-btn" class="control-btn" title="Pin/Unpin HUD">📌</button>
        <button id="close-btn" class="control-btn" title="Close HUD">✕</button>
      </div>
      <div class="control-row advanced-controls" style="display: none;">
        <button id="size-down-btn" class="control-btn small" title="Smaller">🔽</button>
        <button id="size-up-btn" class="control-btn small" title="Larger">🔼</button>
        <button id="intensity-down-btn" class="control-btn small" title="Less Intense">➖</button>
        <button id="intensity-up-btn" class="control-btn small" title="More Intense">➕</button>
      </div>
      <div class="control-row breathing-sliders" style="display: none;">
        <div class="slider-group">
          <label>Base: <span id="base-value">0.6</span></label>
          <input type="range" id="base-slider" min="0.2" max="1.2" step="0.05" value="0.6">
        </div>
        <div class="slider-group">
          <label>Inhale: <span id="inhale-value">1.0</span></label>
          <input type="range" id="inhale-slider" min="0.6" max="1.8" step="0.05" value="1.0">
        </div>
        <div class="slider-group">
          <label>Exhale: <span id="exhale-value">0.4</span></label>
          <input type="range" id="exhale-slider" min="0.1" max="0.8" step="0.05" value="0.4">
        </div>
      </div>
      <div class="control-row edit-controls" style="display: none;">
        <button id="save-config-btn" class="control-btn small" title="Save Config">💾</button>
        <button id="reset-config-btn" class="control-btn small" title="Reset Config">🔄</button>
      </div>
    `;
    
    this.container.appendChild(controlPanel);
  }

  private createNewControlContainers() {
    if (!this.container) return;

    // 1. Sequence Controls (top-right, below main controls)
    const sequenceControls = document.createElement('div');
    sequenceControls.className = 'sequence-controls';
    sequenceControls.innerHTML = `
      <button id="pattern-prev-btn" class="control-btn small" title="Cycle Pattern">🔄</button>
      <button id="sequence-toggle-btn" class="control-btn small" title="Toggle Sequence">📋</button>
      <button id="sequence-next-btn" class="control-btn small" title="Next Sequence">⏭️</button>
    `;
    
    // 2. Shape Navigation (left side - between Q1/Q3)
    const shapeNavLeft = document.createElement('div');
    shapeNavLeft.className = 'shape-navigation-left';
    shapeNavLeft.innerHTML = `
      <button id="shape-prev-btn" class="control-btn" title="Previous Shape">◀</button>
    `;
    
    // 3. Shape Navigation (right side - between Q2/Q4) 
    const shapeNavRight = document.createElement('div');
    shapeNavRight.className = 'shape-navigation-right';
    shapeNavRight.innerHTML = `
      <button id="shape-next-btn" class="control-btn" title="Next Shape">▶</button>
    `;
    
    // 4. Shape/Pattern Display (bottom-center, compact)
    const shapePatternDisplay = document.createElement('div');
    shapePatternDisplay.className = 'shape-pattern-display';
    shapePatternDisplay.innerHTML = `
      <div id="current-shape-name">Circle</div>
      <div id="current-pattern-name">Zen</div>
      <div id="sequence-status">Sequence: Off</div>
    `;
    
    // 5. Mode Button (bottom-right corner)
    const modeButton = document.createElement('div');
    modeButton.className = 'mode-button-corner';
    modeButton.innerHTML = `
      <button id="mode-btn" class="control-btn mode-btn-compact">Basic</button>
    `;
    
    // Append all new containers
    this.container.appendChild(sequenceControls);
    this.container.appendChild(shapeNavLeft);
    this.container.appendChild(shapeNavRight);
    this.container.appendChild(shapePatternDisplay);
    this.container.appendChild(modeButton);
  }

  private createStatusDisplay() {
    const centralTile = document.querySelector('.central-breathing-tile');
    if (!centralTile) return;

    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'enhanced-status';
    statusDisplay.innerHTML = `
      <div id="phase-indicator">Ready</div>
      <div id="progress-bar"><div class="progress-fill"></div></div>
    `;
    
    // Append to central tile instead of main container
    centralTile.appendChild(statusDisplay);
  }

  private createDebugConsole() {
    if (!this.container) return;

    const debugConsole = document.createElement('div');
    debugConsole.className = 'debug-console';
    debugConsole.innerHTML = `
      <div class="debug-header">Debug Console</div>
      <div id="debug-output"></div>
    `;
    
    this.container.appendChild(debugConsole);
    this.debugConsole = debugConsole;
    this.debugLog('Enhanced HUD initialized');
  }

  private debugLog(message: string) {
    if (!this.debugConsole) return;
    
    const output = this.debugConsole.querySelector('#debug-output');
    if (output) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = 'debug-entry';
      logEntry.textContent = `[${timestamp}] ${message}`;
      output.appendChild(logEntry);
      
      // Keep only last 5 entries
      const entries = output.querySelectorAll('.debug-entry');
      if (entries.length > 5) {
        entries[0].remove();
      }
      
      // Auto-scroll to bottom
      output.scrollTop = output.scrollHeight;
    }
  }

  private setupEventListeners() {
    document.getElementById('pin-btn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('close-btn')?.addEventListener('click', () => this.closeHUD());
    document.getElementById('theme-btn')?.addEventListener('click', () => this.cycleTheme());
    document.getElementById('edit-btn')?.addEventListener('click', () => this.toggleEditMode());
    
    document.getElementById('size-up-btn')?.addEventListener('click', () => this.adjustScale(0.1));
    document.getElementById('size-down-btn')?.addEventListener('click', () => this.adjustScale(-0.1));
    document.getElementById('intensity-up-btn')?.addEventListener('click', () => this.adjustIntensity(0.1));
    document.getElementById('intensity-down-btn')?.addEventListener('click', () => this.adjustIntensity(-0.1));
    
    // Breathing sliders
    document.getElementById('base-slider')?.addEventListener('input', (e) => this.updateBaseSize((e.target as HTMLInputElement).value));
    document.getElementById('inhale-slider')?.addEventListener('input', (e) => this.updateInhaleMax((e.target as HTMLInputElement).value));
    document.getElementById('exhale-slider')?.addEventListener('input', (e) => this.updateExhaleMin((e.target as HTMLInputElement).value));
    
    document.getElementById('shape-prev-btn')?.addEventListener('click', () => this.previousShape());
    document.getElementById('shape-next-btn')?.addEventListener('click', () => this.nextShape());
    document.getElementById('mode-btn')?.addEventListener('click', () => this.cycleMode());

    // Pattern and sequence controls
    document.getElementById('pattern-prev-btn')?.addEventListener('click', () => this.cyclePattern());
    document.getElementById('sequence-toggle-btn')?.addEventListener('click', () => this.toggleSequence());
    document.getElementById('sequence-next-btn')?.addEventListener('click', () => this.nextSequence());

    // Edit mode controls
    document.getElementById('save-config-btn')?.addEventListener('click', () => this.saveConfig());
    document.getElementById('reset-config-btn')?.addEventListener('click', () => this.resetConfig());

    // Handle hover events for zen mode click-through
    this.setupZenModeHover();
    this.setupShapeClickHandlers();
  }

  private setupZenModeHover() {
    if (!this.container) return;

    // Mouse enter on container - disable click-through temporarily
    this.container.addEventListener('mouseenter', async () => {
      if (this.isPinned) {
        await this.disableClickThrough();
      }
    });

    // Mouse leave on container - re-enable click-through  
    this.container.addEventListener('mouseleave', async () => {
      if (this.isPinned) {
        setTimeout(async () => {
          await this.enableClickThrough();
        }, 200); // Small delay for smooth interaction
      }
    });
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (this.isPinned) return;
      
      // Edit mode controls
      if (this.isEditMode) {
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            this.deselectShape();
            this.debugLog('Shape deselected');
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (this.selectedShapeElement) {
              this.moveSelectedShape(-5, 0);
            } else {
              this.previousShape();
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (this.selectedShapeElement) {
              this.moveSelectedShape(5, 0);
            } else {
              this.nextShape();
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            if (this.selectedShapeElement) {
              this.moveSelectedShape(0, -5);
            } else {
              this.nextPattern();
            }
            break;
          case 'ArrowDown':
            event.preventDefault();
            if (this.selectedShapeElement) {
              this.moveSelectedShape(0, 5);
            } else {
              this.previousPattern();
            }
            break;
        }
      } else {
        // Normal mode controls
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            this.previousShape();
            break;
          case 'ArrowRight':
            event.preventDefault();
            this.nextShape();
            break;
          case 'ArrowUp':
            event.preventDefault();
            this.nextPattern();
            break;
          case 'ArrowDown':
            event.preventDefault();
            this.previousPattern();
            break;
        }
      }
    });
  }

  private cycleMode() {
    const modes = ['zen', 'basic', 'advanced', 'edit'] as const;
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
  }

  private setMode(mode: typeof this.currentMode) {
    this.currentMode = mode;
    
    switch (mode) {
      case 'zen':
        this.hideDebugConsole();
        this.deselectShape();
        this.scaleForEditMode(false);
        this.container?.classList.add('zen-mode');
        this.container?.classList.remove('basic-mode', 'advanced-mode', 'edit-mode');
        this.isEditMode = false;
        break;
      case 'basic':
        this.setBasicControlsVisibility(true);
        this.hideAdvancedControls();
        this.hideEditControls();
        this.hideDebugConsole();
        this.deselectShape();
        this.scaleForEditMode(false);
        this.container?.classList.remove('zen-mode', 'advanced-mode', 'edit-mode');
        this.container?.classList.add('basic-mode');
        this.isEditMode = false;
        break;
      case 'advanced':
        this.setControlsVisibility(true);
        this.restoreAllButtons();
        this.showAdvancedControls();
        this.hideEditControls();
        this.hideDebugConsole();
        this.deselectShape();
        this.scaleForEditMode(false);
        this.container?.classList.remove('zen-mode', 'basic-mode', 'edit-mode');
        this.container?.classList.add('advanced-mode');
        this.isEditMode = false;
        break;
      case 'edit':
        this.debugLog('Entering edit mode...');
        this.setControlsVisibility(true);
        this.restoreAllButtons();
        this.showAdvancedControls();
        this.showEditControls();
        this.showDebugConsole();
        this.hideModeControls();
        this.container?.classList.remove('zen-mode', 'basic-mode', 'advanced-mode');
        this.container?.classList.add('edit-mode');
        this.isEditMode = true;
        this.scaleForEditMode(true);
        this.debugLog('Edit mode enabled - drag shapes to move them');
        break;
    }
    
    this.updateModeDisplay();
    this.updateEditButton();
  }

  private setControlsVisibility(visible: boolean) {
    const controlPanel = document.querySelector('.enhanced-controls') as HTMLElement;
    
    if (controlPanel) controlPanel.style.display = visible ? 'block' : 'none';
    // Mode controls are handled separately via showModeControls/hideModeControls
  }

  private setBasicControlsVisibility(visible: boolean) {
    // In basic mode, only show minimal controls needed for mode switching
    const controlPanel = document.querySelector('.enhanced-controls') as HTMLElement;
    
    if (controlPanel) {
      if (visible) {
        controlPanel.style.display = 'block';
        // Hide individual buttons except mode-related ones
        const buttons = controlPanel.querySelectorAll('.control-btn');
        buttons.forEach((btn) => {
          const button = btn as HTMLElement;
          if (button.id === 'close-btn' || button.id === 'pin-btn') {
            button.style.display = 'flex'; // Keep essential controls
          } else {
            button.style.display = 'none'; // Hide other controls
          }
        });
      } else {
        controlPanel.style.display = 'none';
      }
    }
  }

  private showAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    const slidersRow = document.querySelector('.breathing-sliders') as HTMLElement;
    if (advancedRow) advancedRow.style.display = 'flex';
    if (slidersRow) slidersRow.style.display = 'flex';
  }

  private hideAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    const slidersRow = document.querySelector('.breathing-sliders') as HTMLElement;
    if (advancedRow) advancedRow.style.display = 'none';
    if (slidersRow) slidersRow.style.display = 'none';
  }

  private showEditControls() {
    const editRow = document.querySelector('.edit-controls') as HTMLElement;
    if (editRow) editRow.style.display = 'flex';
  }

  private hideEditControls() {
    const editRow = document.querySelector('.edit-controls') as HTMLElement;
    if (editRow) editRow.style.display = 'none';
  }

  private showDebugConsole() {
    if (this.debugConsole) {
      this.debugConsole.style.display = 'block';
    }
  }

  private hideDebugConsole() {
    if (this.debugConsole) {
      this.debugConsole.style.display = 'none';
    }
  }

  private showModeControls() {
    const modeControls = document.querySelector('.mode-controls') as HTMLElement;
    if (modeControls) modeControls.style.display = 'flex';
  }

  private hideModeControls() {
    const modeControls = document.querySelector('.mode-controls') as HTMLElement;
    if (modeControls) modeControls.style.display = 'none';
  }

  private restoreAllButtons() {
    // Restore visibility of all buttons that may have been hidden in basic mode
    const controlPanel = document.querySelector('.enhanced-controls') as HTMLElement;
    if (controlPanel) {
      const buttons = controlPanel.querySelectorAll('.control-btn');
      buttons.forEach((btn) => {
        const button = btn as HTMLElement;
        button.style.display = 'flex'; // Show all buttons
      });
    }
  }

  private nextShape() {
    this.currentShapeIndex = (this.currentShapeIndex + 1) % BREATHING_SHAPES.length;
    this.updateShape();
  }

  private previousShape() {
    this.currentShapeIndex = (this.currentShapeIndex - 1 + BREATHING_SHAPES.length) % BREATHING_SHAPES.length;
    this.updateShape();
  }

  private nextPattern() {
    this.currentPatternIndex = (this.currentPatternIndex + 1) % BREATHING_PATTERNS.length;
    this.updatePattern();
  }

  private previousPattern() {
    this.currentPatternIndex = (this.currentPatternIndex - 1 + BREATHING_PATTERNS.length) % BREATHING_PATTERNS.length;
    this.updatePattern();
  }

  private updateShape() {
    const newShape = BREATHING_SHAPES[this.currentShapeIndex];
    if (this.breathingEngine) {
      this.breathingEngine.updateShape(newShape);
      // Update canvas reference after shape change
      this.currentSvgElement = this.breathingEngine.svgElement || null;
      this.currentCanvasElement = this.breathingEngine.canvasElement || null;
      // Apply saved position to new shape
      this.applyShapePositionToEngine();
    }
    this.updateDisplays();
  }

  private updatePattern() {
    const newPattern = BREATHING_PATTERNS[this.currentPatternIndex];
    if (this.breathingEngine) {
      this.breathingEngine.updatePattern(newPattern);
    }
    this.updateDisplays();
  }

  private cyclePattern() {
    if (this.sequenceManager.isActive()) {
      // If sequence is active, stop it first
      this.sequenceManager.stopSequence();
    }
    
    this.currentPatternIndex = (this.currentPatternIndex + 1) % BREATHING_PATTERNS.length;
    this.updatePattern();
  }

  private toggleSequence() {
    if (this.sequenceManager.isActive()) {
      this.sequenceManager.stopSequence();
      console.log('Sequence stopped');
    } else {
      this.sequenceManager.startSequence();
      console.log('Sequence started');
    }
    this.updateDisplays();
  }

  private nextSequence() {
    const sequences = this.sequenceManager.getAvailableSequences();
    this.currentSequenceIndex = (this.currentSequenceIndex + 1) % sequences.length;
    
    const newSequence = sequences[this.currentSequenceIndex];
    this.sequenceManager.setSequence(newSequence);
    
    if (this.sequenceManager.isActive()) {
      this.sequenceManager.startSequence();
    }
    
    this.updateDisplays();
    console.log(`Switched to sequence: ${newSequence.name}`);
  }

  private cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % VISUAL_THEMES.length;
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
  }

  private adjustScale(delta: number) {
    this.scale = Math.max(0.5, Math.min(2.0, this.scale + delta));
    if (this.breathingEngine) {
      this.breathingEngine.updateScale(this.scale);
    }
  }

  private adjustIntensity(delta: number) {
    this.intensity = Math.max(0.1, Math.min(1.0, this.intensity + delta));
    if (this.breathingEngine) {
      this.breathingEngine.updateIntensity(this.intensity);
    }
  }

  private updateBaseSize(value: string) {
    this.baseSize = parseFloat(value);
    this.updateBreathingParams();
    this.updateSliderDisplay('base', this.baseSize);
    this.debugLog(`Base size: ${this.baseSize}`);
  }

  private updateInhaleMax(value: string) {
    this.inhaleMax = Math.max(this.baseSize, parseFloat(value));
    this.updateBreathingParams();
    this.updateSliderDisplay('inhale', this.inhaleMax);
    this.debugLog(`Inhale max: ${this.inhaleMax}`);
  }

  private updateExhaleMin(value: string) {
    this.exhaleMin = Math.min(this.baseSize, parseFloat(value));
    this.updateBreathingParams();
    this.updateSliderDisplay('exhale', this.exhaleMin);
    this.debugLog(`Exhale min: ${this.exhaleMin}`);
  }

  private updateBreathingParams() {
    if (this.breathingEngine) {
      this.breathingEngine.updateBreathingParams(this.baseSize, this.inhaleMax, this.exhaleMin);
    }
  }

  private updateSliderDisplay(type: string, value: number) {
    const display = document.getElementById(`${type}-value`);
    if (display) {
      display.textContent = value.toFixed(2);
    }
  }

  private togglePin() {
    this.isPinned = !this.isPinned;
    
    if (this.isPinned) {
      this.setMode('zen');
      // Delay click-through to allow CSS hover to work
      setTimeout(() => {
        this.enableClickThrough();
      }, 100);
    } else {
      this.setMode('basic');
      this.disableClickThrough();
    }
    
    this.updatePinButton();
    
    // Update auto-fade controller pin status
    if (this.autoFadeController) {
      this.autoFadeController.updatePinStatus(this.isPinned);
    }
  }

  private async enableClickThrough() {
    if ((window as any).electronAPI?.setClickThrough) {
      await (window as any).electronAPI.setClickThrough(true);
    }
  }

  private async disableClickThrough() {
    if ((window as any).electronAPI?.setClickThrough) {
      await (window as any).electronAPI.setClickThrough(false);
    }
  }

  private async closeHUD() {
    if ((window as any).electronAPI?.close) {
      await (window as any).electronAPI.close();
    }
  }

  private applyTheme(theme: ThemeConfig) {
    if (!this.container) return;
    
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    
    this.container.classList.toggle('theme-glow', theme.effects.glow);
    this.container.classList.toggle('theme-pulse', theme.effects.pulse);
    this.container.classList.toggle('theme-gradient', theme.effects.gradient);
  }

  private updateDisplays() {
    this.updateShapeDisplay();
    this.updatePatternDisplay();
    this.updateSequenceDisplay();
    this.updateModeDisplay();
  }

  private updateModeDisplay() {
    const modeBtn = document.getElementById('mode-btn');
    if (modeBtn) {
      modeBtn.textContent = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
    }
  }

  private updateShapeDisplay() {
    const shapeNameEl = document.getElementById('current-shape-name');
    if (shapeNameEl) {
      shapeNameEl.textContent = BREATHING_SHAPES[this.currentShapeIndex].name;
    }
  }

  private updatePatternDisplay() {
    const patternNameEl = document.getElementById('current-pattern-name');
    if (patternNameEl) {
      patternNameEl.textContent = BREATHING_PATTERNS[this.currentPatternIndex].name;
    }
  }

  private updateSequenceDisplay() {
    const sequenceStatusEl = document.getElementById('sequence-status');
    if (sequenceStatusEl) {
      if (this.sequenceManager.isActive()) {
        const info = this.sequenceManager.getSequenceInfo();
        sequenceStatusEl.textContent = `Sequence: ${info}`;
      } else {
        const sequences = this.sequenceManager.getAvailableSequences();
        const currentSequence = sequences[this.currentSequenceIndex];
        sequenceStatusEl.textContent = `Sequence: ${currentSequence.name} (Off)`;
      }
    }

    // Update sequence toggle button appearance
    const sequenceBtn = document.getElementById('sequence-toggle-btn');
    if (sequenceBtn) {
      sequenceBtn.textContent = this.sequenceManager.isActive() ? '⏸️' : '📋';
      sequenceBtn.title = this.sequenceManager.isActive() ? 'Stop Sequence' : 'Start Sequence';
    }
  }

  private updatePinButton() {
    const pinBtn = document.getElementById('pin-btn');
    if (pinBtn) {
      pinBtn.textContent = this.isPinned ? '📍' : '📌';
      pinBtn.classList.toggle('pinned', this.isPinned);
    }
  }

  private updateEditButton() {
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.textContent = this.isEditMode ? '✅' : '✏️';
      editBtn.classList.toggle('active', this.isEditMode);
    }
  }

  private toggleEditMode() {
    if (this.isEditMode) {
      // Exit edit mode - save config and return to previous mode
      this.saveConfig();
      this.setMode('basic');
    } else {
      // Enter edit mode
      this.setMode('edit');
    }
  }

  private setupShapeClickHandlers() {
    // Add drag handlers to breathing shapes in edit mode
    if (this.breathingCanvas) {
      this.breathingCanvas.addEventListener('mousedown', (event) => {
        if (!this.isEditMode) return;
        
        const target = event.target as HTMLElement;
        if (target && (target.classList.contains('breathing-canvas') || target.tagName === 'CANVAS')) {
          this.startDrag(target, event);
          event.preventDefault();
          event.stopPropagation();
        }
      });

      document.addEventListener('mousemove', (event) => {
        if (this.isDragging) {
          this.handleDrag(event);
          event.preventDefault();
        }
      });

      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.endDrag();
        }
      });
    }
  }

  private startDrag(element: HTMLElement, event: MouseEvent) {
    this.isDragging = true;
    
    // Calculate drag offset from current mouse position to element center
    const rect = element.getBoundingClientRect();
    this.dragOffset.x = event.clientX - (rect.left + rect.width / 2);
    this.dragOffset.y = event.clientY - (rect.top + rect.height / 2);
    
    this.debugLog(`Started dragging: ${BREATHING_SHAPES[this.currentShapeIndex].name}`);
  }

  private handleDrag(event: MouseEvent) {
    if (!this.isDragging) return;

    // Convert mouse position to canvas coordinates
    const canvas = this.currentCanvasElement || this.breathingEngine?.canvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = ((event.clientX - this.dragOffset.x - rect.left) / rect.width) * 200;
    const canvasY = ((event.clientY - this.dragOffset.y - rect.top) / rect.height) * 200;

    // Update shape position (relative to canvas center at 100,100)
    this.shapePosition.x = canvasX - 100;
    this.shapePosition.y = canvasY - 100;

    // Constrain movement within reasonable bounds
    this.shapePosition.x = Math.max(-80, Math.min(80, this.shapePosition.x));
    this.shapePosition.y = Math.max(-80, Math.min(80, this.shapePosition.y));

    // Sync position to breathing engine for immediate update
    if (this.breathingEngine) {
      this.breathingEngine.shapePosition.x = this.shapePosition.x;
      this.breathingEngine.shapePosition.y = this.shapePosition.y;
    }
    
    this.debugLog(`Dragging to: (${this.shapePosition.x.toFixed(1)}, ${this.shapePosition.y.toFixed(1)})`);
  }

  private endDrag() {
    this.isDragging = false;
    this.debugLog(`Shape position: (${this.shapePosition.x.toFixed(1)}, ${this.shapePosition.y.toFixed(1)})`);
  }

  private updateShapePosition() {
    // Canvas handles position automatically during rendering
    // No need to manually update position for canvas-based shapes
  }

  private applyPositionToShape(shapeElement: any) {
    // Canvas rendering handles position automatically
    // This method is no longer needed for canvas-based shapes
  }

  private deselectShape() {
    this.isDragging = false;
  }

  private moveSelectedShape(deltaX: number, deltaY: number) {
    // Keep keyboard movement for fine-tuning
    this.shapePosition.x += deltaX;
    this.shapePosition.y += deltaY;

    // Constrain movement within container bounds
    this.shapePosition.x = Math.max(-80, Math.min(80, this.shapePosition.x));
    this.shapePosition.y = Math.max(-80, Math.min(80, this.shapePosition.y));

    // Update the actual breathing engine's shape
    this.breathingEngine?.updateShape(BREATHING_SHAPES[this.currentShapeIndex]);
    this.debugLog(`Keyboard moved shape to: (${this.shapePosition.x}, ${this.shapePosition.y})`);
  }

  private saveConfig() {
    const config = {
      currentShape: this.currentShapeIndex,
      currentPattern: this.currentPatternIndex,
      currentTheme: this.currentThemeIndex,
      scale: this.scale,
      intensity: this.intensity,
      mode: this.currentMode,
      shapePosition: this.shapePosition,
      breathingParams: {
        baseSize: this.baseSize,
        inhaleMax: this.inhaleMax,
        exhaleMin: this.exhaleMin
      },
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('breathingHudConfig', JSON.stringify(config));
      console.log('Configuration saved:', config);
      this.showSaveNotification();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('breathingHudConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Apply saved configuration
        this.currentShapeIndex = config.currentShape || 0;
        this.currentPatternIndex = config.currentPattern || 0;
        this.currentThemeIndex = config.currentTheme || 0;
        this.scale = config.scale || 1.0;
        this.intensity = config.intensity || 0.7;
        this.shapePosition = config.shapePosition || { x: 0, y: 0 };
        
        // Load breathing parameters
        if (config.breathingParams) {
          this.baseSize = config.breathingParams.baseSize || 0.6;
          this.inhaleMax = config.breathingParams.inhaleMax || 1.0;
          this.exhaleMin = config.breathingParams.exhaleMin || 0.4;
        }
        
        // Update visuals
        this.updateShape();
        this.updatePattern();
        this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
        this.updateDisplays();
        this.updateSliderValues();
        this.applyShapePosition();
        
        console.log('Configuration loaded:', config);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  private resetConfig() {
    // Reset to defaults
    this.currentShapeIndex = 0;
    this.currentPatternIndex = 0;
    this.currentThemeIndex = 0;
    this.scale = 1.0;
    this.intensity = 0.7;
    this.shapePosition = { x: 0, y: 0 };
    this.baseSize = 0.6;
    this.inhaleMax = 1.0;
    this.exhaleMin = 0.4;
    
    // Clear local storage
    localStorage.removeItem('breathingHudConfig');
    
    // Apply defaults
    this.updateShape();
    this.updatePattern();
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.updateDisplays();
    this.updateSliderValues();
    this.updateBreathingParams();
    this.applyShapePosition();
    
    console.log('Configuration reset to defaults');
    this.debugLog('Configuration reset to defaults');
  }

  private updateSliderValues() {
    // Update slider positions and displays
    const baseSlider = document.getElementById('base-slider') as HTMLInputElement;
    const inhaleSlider = document.getElementById('inhale-slider') as HTMLInputElement;
    const exhaleSlider = document.getElementById('exhale-slider') as HTMLInputElement;
    
    if (baseSlider) baseSlider.value = this.baseSize.toString();
    if (inhaleSlider) inhaleSlider.value = this.inhaleMax.toString();
    if (exhaleSlider) exhaleSlider.value = this.exhaleMin.toString();
    
    this.updateSliderDisplay('base', this.baseSize);
    this.updateSliderDisplay('inhale', this.inhaleMax);
    this.updateSliderDisplay('exhale', this.exhaleMin);
  }

  private applyShapePosition() {
    // Shape position is now applied directly to SVG elements during creation
    // This method ensures the breathing engine recreates with correct position
    if (this.breathingEngine) {
      this.breathingEngine.updateShape(BREATHING_SHAPES[this.currentShapeIndex]);
      this.applyShapePositionToEngine();
    }
  }

  private applyShapePositionToEngine() {
    // Canvas position is applied automatically during rendering
    // Force a re-render to show the new position
    if (this.breathingEngine) {
      // Sync position to breathing engine
      this.breathingEngine.shapePosition.x = this.shapePosition.x;
      this.breathingEngine.shapePosition.y = this.shapePosition.y;
      this.breathingEngine.renderShape();
    }
  }

  private loadUserConfig() {
    try {
      // Try to load from localStorage first (runtime config)
      const userConfig = localStorage.getItem('breathingHudUserConfig');
      if (userConfig) {
        const config = JSON.parse(userConfig);
        this.editModeScale = Math.max(1, Math.min(20, config.editModeScale || 3));
        this.debugLog(`User config loaded: edit scale ${this.editModeScale}x`);
        return;
      }

      // Set default if no config found
      this.editModeScale = 3;
      this.debugLog(`Using default edit scale: ${this.editModeScale}x`);
      
      // Save default config for future use
      this.saveUserConfig();
    } catch (error) {
      console.error('Failed to load user configuration:', error);
      this.editModeScale = 10;
    }
  }

  private saveUserConfig() {
    try {
      const config = {
        editModeScale: this.editModeScale,
        timestamp: Date.now()
      };
      localStorage.setItem('breathingHudUserConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save user configuration:', error);
    }
  }

  private scaleForEditMode(enable: boolean) {
    if (!this.container) return;

    const scale = enable ? this.editModeScale : 1;
    
    // Instead of scaling the whole container, scale the central breathing area
    const centralTile = document.querySelector('.central-breathing-tile') as HTMLElement;
    
    if (enable && centralTile) {
      // Scale up the breathing area for edit mode
      centralTile.style.transform = `translate(-50%, -50%) scale(${scale})`;
      centralTile.style.transformOrigin = 'center center';
      this.debugLog(`Central breathing area scaled to ${scale}x for edit mode`);
    } else if (centralTile) {
      // Reset to normal size
      centralTile.style.transform = 'translate(-50%, -50%)';
      centralTile.style.transformOrigin = '';
      this.debugLog('Central breathing area reset to normal size');
    }
    
    // Scale debug console proportionally
    if (this.debugConsole) {
      const debugHeight = enable ? `${120}px` : '120px'; // Keep debug console normal size
      const fontSize = enable ? `10px` : '10px';
      this.debugConsole.style.height = debugHeight;
      this.debugConsole.style.fontSize = fontSize;
    }
  }

  private showSaveNotification() {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
    `;
    notification.textContent = 'Configuration Saved ✓';
    
    if (this.container) {
      this.container.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 2000);
    }
  }

  private initializeBreathingEngine() {
    if (!this.breathingCanvas) {
      console.error('Breathing canvas not found');
      return;
    }

    const currentShape = BREATHING_SHAPES[this.currentShapeIndex];
    const currentPattern = BREATHING_PATTERNS[this.currentPatternIndex];
    
    this.breathingEngine = new EnhancedBreathingEngine(
      this.breathingCanvas,
      currentShape,
      currentPattern
    );

    this.breathingEngine.setPhaseChangeCallback((phase, progress) => {
      this.updatePhaseDisplay(phase.name, progress);
    });

    // Connect sequence manager to breathing cycles
    this.breathingEngine.setCycleCompleteCallback(() => {
      if (this.sequenceManager.isActive()) {
        this.sequenceManager.onBreathingCycleComplete();
        this.updateDisplays(); // Update sequence status display
      }
    });

    // Store reference to the canvas for drag operations
    this.currentSvgElement = this.breathingEngine.svgElement || null;
    this.currentCanvasElement = this.breathingEngine.canvasElement || null;

    this.breathingEngine.start();
    console.log('Enhanced breathing engine initialized and started');
  }

  private updatePhaseDisplay(phaseName: string, progress: number) {
    const phaseIndicator = document.getElementById('phase-indicator');
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    
    if (phaseIndicator) {
      phaseIndicator.textContent = phaseName.charAt(0).toUpperCase() + phaseName.slice(1);
    }
    
    if (progressFill) {
      let fillProgress: number;
      let fillColor: string;
      
      // Calculate fill progress and color based on phase
      switch (phaseName.toLowerCase()) {
        case 'inhale':
          // Fill up during inhale (0% to 100%)
          fillProgress = progress * 100;
          fillColor = 'var(--theme-primary)';
          break;
          
        case 'hold':
          // Stay filled during hold (100%)
          fillProgress = 100;
          fillColor = 'var(--theme-accent)';
          break;
          
        case 'exhale':
          // Empty out during exhale (100% to 0%)
          fillProgress = (1 - progress) * 100;
          fillColor = 'var(--theme-secondary)';
          break;
          
        case 'pause':
          // Stay empty during pause (0%)
          fillProgress = 0;
          fillColor = 'var(--theme-primary)';
          break;
          
        default:
          fillProgress = progress * 100;
          fillColor = 'var(--theme-primary)';
          break;
      }
      
      progressFill.style.width = `${fillProgress}%`;
      progressFill.style.background = fillColor;
      
      // Remove previous phase classes and add current phase class
      progressFill.className = 'progress-fill';
      progressFill.classList.add(phaseName.toLowerCase());
      
      // Add breathing-specific transition timing
      if (phaseName.toLowerCase() === 'hold' || phaseName.toLowerCase() === 'pause') {
        progressFill.style.transition = 'background 0.3s ease';
      } else {
        progressFill.style.transition = 'width 0.1s ease, background 0.3s ease';
      }
    }
  }
}

// Initialize the enhanced tile control system
const tileSystem = new TileControlSystem();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tileSystem.initialize());
} else {
  tileSystem.initialize();
}