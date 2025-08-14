console.log('Enhanced HUD App starting...');

// Browser-compatible enhanced breathing system (no imports)

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
  private svgElement?: SVGElement;
  private scale = 1.0;
  private intensity = 0.7;
  
  private onPhaseChange?: (phase: BreathingPhase, progress: number) => void;

  constructor(canvas: HTMLElement, shape: BreathingShape, pattern: BreathingPattern) {
    this.canvas = canvas;
    this.currentShape = shape;
    this.currentPattern = pattern;
    this.createShapeElement();
  }

  setPhaseChangeCallback(callback: (phase: BreathingPhase, progress: number) => void) {
    this.onPhaseChange = callback;
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

  updateScale(scale: number) {
    this.scale = scale;
  }

  updateIntensity(intensity: number) {
    this.intensity = intensity;
  }

  private createShapeElement() {
    this.canvas.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);';
    
    let shapeElement: SVGElement;
    
    if (this.currentShape.type === 'circle') {
      shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      shapeElement.setAttribute('cx', '100');
      shapeElement.setAttribute('cy', '100');
      shapeElement.setAttribute('r', '60');
    } else {
      shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shapeElement.setAttribute('d', this.currentShape.svgPath || 'M100,100 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0');
    }
    
    shapeElement.setAttribute('fill', 'none');
    shapeElement.setAttribute('stroke', 'var(--theme-primary)');
    shapeElement.setAttribute('stroke-width', '2');
    shapeElement.setAttribute('class', 'breathing-shape');
    
    svg.appendChild(shapeElement);
    this.canvas.appendChild(svg);
    this.svgElement = svg;
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

    const intensity = currentPhase.intensity * this.intensity;
    const breathingValue = this.calculateBreathingValue(currentPhase, phaseProgress, intensity);

    this.animateShape(breathingValue, currentPhase, phaseProgress);

    if (this.onPhaseChange) {
      this.onPhaseChange(currentPhase, phaseProgress);
    }

    if (phaseProgress >= 1.0) {
      this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.currentPattern.phases.length;
      this.phaseStartTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private calculateBreathingValue(phase: BreathingPhase, progress: number, intensity: number): number {
    switch (phase.name) {
      case 'inhale':
        const inhaleValue = Math.sin((progress * Math.PI) / 2);
        return 0.6 + (inhaleValue * intensity * 0.4);
      case 'hold':
        return 0.6 + (intensity * 0.4);
      case 'exhale':
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

    const animatedScale = this.scale * breathingValue;
    this.svgElement.style.transform = `translate(-50%, -50%) scale(${animatedScale})`;

    const baseOpacity = 0.8;
    const pulseOpacity = baseOpacity + (Math.sin(progress * Math.PI) * 0.2);
    shapeElement.style.opacity = pulseOpacity.toString();

    this.applyPhaseColors(shapeElement, phase);
  }

  private applyPhaseColors(element: SVGElement, phase: BreathingPhase) {
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

// Main Tile Control System (browser-compatible)
class TileControlSystem {
  private breathingEngine: EnhancedBreathingEngine | null = null;
  private isPinned = false;
  private currentMode: 'zen' | 'basic' | 'advanced' | 'edit' = 'basic';
  private currentShapeIndex = 0;
  private currentPatternIndex = 0;
  private currentThemeIndex = 0;
  private scale = 1.0;
  private intensity = 0.7;
  private isEditMode = false;
  
  private container: HTMLElement | null = null;
  private breathingCanvas: HTMLElement | null = null;

  async initialize() {
    console.log('Initializing Enhanced Tile Control System...');
    
    this.setupUIElements();
    this.loadConfig(); // Load saved configuration
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.initializeBreathingEngine();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();

    console.log('Enhanced Tile Control System initialized');
  }

  private setupUIElements() {
    this.container = document.getElementById('hud-container');
    this.breathingCanvas = document.querySelector('.breathing-shape-container') as HTMLElement;
    
    if (!this.container || !this.breathingCanvas) {
      console.error('Required UI elements not found');
      return;
    }

    this.createEnhancedControls();
    this.createModeControls();
    this.createStatusDisplay();
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
      <div class="control-row edit-controls" style="display: none;">
        <button id="save-config-btn" class="control-btn small" title="Save Config">💾</button>
        <button id="reset-config-btn" class="control-btn small" title="Reset Config">🔄</button>
      </div>
    `;
    
    this.container.appendChild(controlPanel);
  }

  private createModeControls() {
    if (!this.container) return;

    const modeControls = document.createElement('div');
    modeControls.className = 'mode-controls';
    modeControls.innerHTML = `
      <button id="shape-prev-btn" class="mode-btn" title="Previous Shape">◀</button>
      <div class="mode-display">
        <div id="current-shape-name">Circle</div>
        <div id="current-pattern-name">Zen</div>
      </div>
      <button id="shape-next-btn" class="mode-btn" title="Next Shape">▶</button>
      <div class="mode-switcher">
        <button id="mode-btn" class="mode-switch-btn">Basic</button>
      </div>
    `;
    
    this.container.appendChild(modeControls);
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

  private setupEventListeners() {
    document.getElementById('pin-btn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('close-btn')?.addEventListener('click', () => this.closeHUD());
    document.getElementById('theme-btn')?.addEventListener('click', () => this.cycleTheme());
    document.getElementById('edit-btn')?.addEventListener('click', () => this.toggleEditMode());
    
    document.getElementById('size-up-btn')?.addEventListener('click', () => this.adjustScale(0.1));
    document.getElementById('size-down-btn')?.addEventListener('click', () => this.adjustScale(-0.1));
    document.getElementById('intensity-up-btn')?.addEventListener('click', () => this.adjustIntensity(0.1));
    document.getElementById('intensity-down-btn')?.addEventListener('click', () => this.adjustIntensity(-0.1));
    
    document.getElementById('shape-prev-btn')?.addEventListener('click', () => this.previousShape());
    document.getElementById('shape-next-btn')?.addEventListener('click', () => this.nextShape());
    document.getElementById('mode-btn')?.addEventListener('click', () => this.cycleMode());

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
        this.container?.classList.add('zen-mode');
        this.container?.classList.remove('basic-mode', 'advanced-mode', 'edit-mode');
        this.isEditMode = false;
        break;
      case 'basic':
        this.setControlsVisibility(true);
        this.hideAdvancedControls();
        this.hideEditControls();
        this.container?.classList.remove('zen-mode', 'advanced-mode', 'edit-mode');
        this.container?.classList.add('basic-mode');
        this.isEditMode = false;
        break;
      case 'advanced':
        this.setControlsVisibility(true);
        this.showAdvancedControls();
        this.hideEditControls();
        this.container?.classList.remove('zen-mode', 'basic-mode', 'edit-mode');
        this.container?.classList.add('advanced-mode');
        this.isEditMode = false;
        break;
      case 'edit':
        this.setControlsVisibility(true);
        this.showAdvancedControls();
        this.showEditControls();
        this.container?.classList.remove('zen-mode', 'basic-mode', 'advanced-mode');
        this.container?.classList.add('edit-mode');
        this.isEditMode = true;
        break;
    }
    
    this.updateModeDisplay();
    this.updateEditButton();
  }

  private setControlsVisibility(visible: boolean) {
    const controlPanel = document.querySelector('.enhanced-controls') as HTMLElement;
    const modeControls = document.querySelector('.mode-controls') as HTMLElement;
    
    if (controlPanel) controlPanel.style.display = visible ? 'block' : 'none';
    if (modeControls) modeControls.style.display = visible ? 'flex' : 'none';
  }

  private showAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    if (advancedRow) advancedRow.style.display = 'flex';
  }

  private hideAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    if (advancedRow) advancedRow.style.display = 'none';
  }

  private showEditControls() {
    const editRow = document.querySelector('.edit-controls') as HTMLElement;
    if (editRow) editRow.style.display = 'flex';
  }

  private hideEditControls() {
    const editRow = document.querySelector('.edit-controls') as HTMLElement;
    if (editRow) editRow.style.display = 'none';
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
    // Add click handlers to breathing shapes in edit mode
    if (this.breathingCanvas) {
      this.breathingCanvas.addEventListener('click', (event) => {
        if (!this.isEditMode) return;
        
        // Cycle to next shape when clicked in edit mode
        this.nextShape();
        event.stopPropagation();
      });
    }
  }

  private saveConfig() {
    const config = {
      currentShape: this.currentShapeIndex,
      currentPattern: this.currentPatternIndex,
      currentTheme: this.currentThemeIndex,
      scale: this.scale,
      intensity: this.intensity,
      mode: this.currentMode,
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
        
        // Update visuals
        this.updateShape();
        this.updatePattern();
        this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
        this.updateDisplays();
        
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
    
    // Clear local storage
    localStorage.removeItem('breathingHudConfig');
    
    // Apply defaults
    this.updateShape();
    this.updatePattern();
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.updateDisplays();
    
    console.log('Configuration reset to defaults');
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
      progressFill.style.width = `${progress * 100}%`;
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