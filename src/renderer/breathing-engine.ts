import { BreathingShape, BreathingPattern, BreathingPhase, MeditationConfig, ThemeConfig } from '../shared/meditation-types';

export class EnhancedBreathingEngine {
  private canvas: HTMLElement;
  private isRunning = false;
  private animationId?: number;
  private startTime = 0;
  private currentPhaseIndex = 0;
  private phaseStartTime = 0;
  
  private config: MeditationConfig;
  private currentShape: BreathingShape;
  private currentPattern: BreathingPattern;
  private currentTheme?: ThemeConfig;
  private svgElement?: SVGElement;
  
  private onPhaseChange?: (phase: BreathingPhase, progress: number) => void;

  constructor(
    canvas: HTMLElement, 
    config: MeditationConfig,
    shape: BreathingShape,
    pattern: BreathingPattern
  ) {
    this.canvas = canvas;
    this.config = config;
    this.currentShape = shape;
    this.currentPattern = pattern;
    this.createShapeElement();
  }

  setPhaseChangeCallback(callback: (phase: BreathingPhase, progress: number) => void) {
    this.onPhaseChange = callback;
  }

  updateShape(shape: BreathingShape) {
    this.currentShape = shape;
    this.createShapeElement();
  }

  updatePattern(pattern: BreathingPattern) {
    this.currentPattern = pattern;
    this.resetPhase();
  }

  updateConfig(config: MeditationConfig) {
    this.config = config;
    this.applyConfigToShape();
  }

  updateTheme(theme: ThemeConfig) {
    this.currentTheme = theme;
    this.applyThemeToShape();
  }

  private createShapeElement() {
    // Clear existing shape
    this.canvas.innerHTML = '';
    
    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);';
    
    // Create gradient definitions
    const defs = this.createGradientDefinitions();
    svg.appendChild(defs);
    
    // Create shape element
    const shapeElement = this.createShapeGeometry();
    
    // Apply initial styling
    this.applyShapeStyles(shapeElement);
    
    svg.appendChild(shapeElement);
    this.canvas.appendChild(svg);
    this.svgElement = svg;
    
    this.applyConfigToShape();
  }

  private createGradientDefinitions(): SVGDefsElement {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Radial gradient for solid shapes
    const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    radialGradient.setAttribute('id', 'breathingRadialGradient');
    radialGradient.setAttribute('cx', '50%');
    radialGradient.setAttribute('cy', '50%');
    radialGradient.setAttribute('r', '50%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'var(--theme-accent)');
    stop1.setAttribute('stop-opacity', '0.9');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '70%');
    stop2.setAttribute('stop-color', 'var(--theme-primary)');
    stop2.setAttribute('stop-opacity', '0.6');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'var(--theme-primary)');
    stop3.setAttribute('stop-opacity', '0.1');
    
    radialGradient.appendChild(stop1);
    radialGradient.appendChild(stop2);
    radialGradient.appendChild(stop3);
    defs.appendChild(radialGradient);
    
    return defs;
  }

  private createShapeGeometry(): SVGElement {
    let shapeElement: SVGElement;
    
    switch (this.currentShape.type) {
      case 'circle':
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shapeElement.setAttribute('cx', '100');
        shapeElement.setAttribute('cy', '100');
        shapeElement.setAttribute('r', '60');
        break;
        
      default:
        // Use SVG path for complex shapes
        shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shapeElement.setAttribute('d', this.currentShape.svgPath || 'M100,100 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0');
        break;
    }
    
    shapeElement.setAttribute('class', 'breathing-shape');
    return shapeElement;
  }

  private applyShapeStyles(shapeElement: SVGElement) {
    const isGradientMode = this.currentTheme?.effects.gradient ?? false;
    
    if (isGradientMode) {
      shapeElement.setAttribute('fill', 'url(#breathingRadialGradient)');
      shapeElement.setAttribute('stroke', 'var(--theme-accent)');
      shapeElement.setAttribute('stroke-width', '2.5');
      shapeElement.setAttribute('filter', 'drop-shadow(0 0 8px var(--theme-primary))');
    } else {
      shapeElement.setAttribute('fill', 'none');
      shapeElement.setAttribute('stroke', 'var(--theme-primary)');
      shapeElement.setAttribute('stroke-width', '3.5');
    }
  }

  private applyConfigToShape() {
    if (!this.svgElement) return;
    
    // Apply scale from config
    const scale = this.config.scale;
    this.svgElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
    // Apply theme colors via CSS variables
    this.canvas.style.setProperty('--shape-primary', 'var(--theme-primary)');
    this.canvas.style.setProperty('--shape-secondary', 'var(--theme-secondary)');
  }

  private applyThemeToShape() {
    if (!this.svgElement || !this.currentTheme) return;
    
    const shapeElement = this.svgElement.querySelector('.breathing-shape') as SVGElement;
    if (shapeElement) {
      this.applyShapeStyles(shapeElement);
    }
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
    const phaseElapsed = (now - this.phaseStartTime) / 1000;
    const phaseProgress = Math.min(phaseElapsed / currentPhase.duration, 1.0);

    // Calculate breathing values
    const intensity = currentPhase.intensity * this.config.intensity;
    const breathingValue = this.calculateBreathingValue(currentPhase, phaseProgress, intensity);

    // Apply animation to shape
    this.animateShape(breathingValue, currentPhase, phaseProgress);

    // Call phase change callback
    if (this.onPhaseChange) {
      this.onPhaseChange(currentPhase, phaseProgress);
    }

    // Check if phase is complete
    if (phaseProgress >= 1.0) {
      this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.currentPattern.phases.length;
      this.phaseStartTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private calculateBreathingValue(phase: BreathingPhase, progress: number, intensity: number): number {
    switch (phase.name) {
      case 'inhale':
        // Smooth ease-in for inhale
        const inhaleValue = Math.sin((progress * Math.PI) / 2);
        return 0.6 + (inhaleValue * intensity * 0.4);
        
      case 'hold':
        return 0.6 + (intensity * 0.4);
        
      case 'exhale':
        // Smooth ease-out for exhale
        const exhaleValue = Math.cos((progress * Math.PI) / 2);
        return 0.6 + (exhaleValue * intensity * 0.4);
        
      case 'pause':
        return 0.6;
        
      default:
        return 0.6;
    }
  }

  private animateShape(breathingValue: number, phase: BreathingPhase, progress: number) {
    if (!this.svgElement) return;
    
    const shapeElement = this.svgElement.querySelector('.breathing-shape') as SVGElement;
    if (!shapeElement) return;

    // Apply breathing scale
    const baseScale = this.config.scale;
    const animatedScale = baseScale * breathingValue;
    this.svgElement.style.transform = `translate(-50%, -50%) scale(${animatedScale})`;

    // Apply opacity changes
    const baseOpacity = 0.8;
    const pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.2);
    shapeElement.style.opacity = pulseOpacity.toString();

    // Apply phase-based color changes
    this.applyPhaseColors(shapeElement, phase, progress);
  }

  private applyPhaseColors(element: SVGElement, phase: BreathingPhase, progress: number) {
    // Phase-based color transitions
    switch (phase.name) {
      case 'inhale':
        element.style.stroke = 'var(--theme-primary)';
        break;
      case 'hold':
        element.style.stroke = 'var(--theme-accent)';
        break;
      case 'exhale':
        element.style.stroke = 'var(--theme-secondary)';
        break;
      case 'pause':
        element.style.stroke = 'var(--theme-primary)';
        element.style.opacity = '0.4';
        break;
    }
  }
}