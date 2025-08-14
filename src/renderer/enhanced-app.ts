import { EnhancedBreathingEngine } from './enhanced-breathing-engine';
import { BreathingShape, BreathingPattern, ThemeConfig, MeditationConfig, UIState } from '../shared/meditation-types';
import { BREATHING_SHAPES, BREATHING_PATTERNS, VISUAL_THEMES } from '../shared/breathing-presets';

console.log('Enhanced HUD App starting...');

class TileControlSystem {
  private breathingEngine: EnhancedBreathingEngine | null = null;
  private uiState: UIState;
  private config: MeditationConfig;
  
  // UI Elements
  private container: HTMLElement | null = null;
  private breathingCanvas: HTMLElement | null = null;
  private controlPanel: HTMLElement | null = null;
  private modeIndicator: HTMLElement | null = null;
  private statusDisplay: HTMLElement | null = null;

  constructor() {
    // Initialize configuration with defaults
    this.config = {
      mode: 'basic',
      currentShape: 'circle',
      currentPattern: 'zen-simple', 
      currentTheme: 'ocean',
      scale: 1.0,
      intensity: 0.7,
      audio: {
        enabled: false,
        volume: 0.5,
        sounds: { chime: false },
        voice: { enabled: false, language: 'en-US', volume: 0.3 }
      },
      availableShapes: ['circle', 'triangle', 'square', 'star', 'heart'],
      availablePatterns: ['zen-simple', 'box-breathing', 'relaxing-478'],
      availableThemes: ['ocean', 'forest', 'sunset', 'moonlight']
    };

    // Initialize UI state
    this.uiState = {
      isPinned: false,
      isControlsVisible: true,
      currentMode: 'basic',
      isTransitioning: false
    };
  }

  async initialize() {
    console.log('Initializing Enhanced Tile Control System...');
    
    // Setup UI elements
    this.setupUIElements();
    
    // Apply initial theme
    this.applyTheme(this.getCurrentTheme());
    
    // Initialize breathing engine
    this.initializeBreathingEngine();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log('Enhanced Tile Control System initialized');
  }

  private setupUIElements() {
    // Get main container
    this.container = document.getElementById('hud-container');
    this.breathingCanvas = document.getElementById('breathing-canvas');
    
    if (!this.container || !this.breathingCanvas) {
      console.error('Required UI elements not found');
      return;
    }

    // Create enhanced control panel
    this.createEnhancedControls();
    
    // Create mode controls (quadrant 3-4 border)
    this.createModeControls();
    
    // Create status display
    this.createStatusDisplay();
    
    // Apply initial mode styling
    this.applyModeStyles();
  }

  private createEnhancedControls() {
    if (!this.container) return;

    // Remove existing basic controls
    const existingControls = this.container.querySelector('.hud-controls');
    if (existingControls) {
      existingControls.remove();
    }

    // Create enhanced control panel (upper right quadrant)
    const controlPanel = document.createElement('div');
    controlPanel.className = 'enhanced-controls';
    controlPanel.innerHTML = `
      <div class="control-row">
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
    `;
    
    this.container.appendChild(controlPanel);
    this.controlPanel = controlPanel;
  }

  private createModeControls() {
    if (!this.container) return;

    // Mode controls at bottom (between quadrants 3-4)
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
    this.modeIndicator = modeControls.querySelector('.mode-display');
  }

  private createStatusDisplay() {
    if (!this.container) return;

    // Enhanced status display
    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'enhanced-status';
    statusDisplay.innerHTML = `
      <div id="phase-indicator">Ready</div>
      <div id="progress-bar"><div class="progress-fill"></div></div>
    `;
    
    this.container.appendChild(statusDisplay);
    this.statusDisplay = statusDisplay;
  }

  private setupEventListeners() {
    // Enhanced control buttons
    document.getElementById('pin-btn')?.addEventListener('click', () => this.togglePin());
    document.getElementById('close-btn')?.addEventListener('click', () => this.closeHUD());
    document.getElementById('audio-btn')?.addEventListener('click', () => this.toggleAudio());
    document.getElementById('theme-btn')?.addEventListener('click', () => this.cycleTheme());
    
    // Size controls
    document.getElementById('size-up-btn')?.addEventListener('click', () => this.adjustScale(0.1));
    document.getElementById('size-down-btn')?.addEventListener('click', () => this.adjustScale(-0.1));
    
    // Intensity controls
    document.getElementById('intensity-up-btn')?.addEventListener('click', () => this.adjustIntensity(0.1));
    document.getElementById('intensity-down-btn')?.addEventListener('click', () => this.adjustIntensity(-0.1));
    
    // Shape cycling
    document.getElementById('shape-prev-btn')?.addEventListener('click', () => this.previousShape());
    document.getElementById('shape-next-btn')?.addEventListener('click', () => this.nextShape());
    
    // Mode switching
    document.getElementById('mode-btn')?.addEventListener('click', () => this.cycleMode());
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (this.uiState.isPinned) return; // No shortcuts when pinned
      
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
        case ' ':
          event.preventDefault();
          this.toggleBreathing();
          break;
      }
    });
  }

  // Mode Management
  private cycleMode() {
    const modes = ['zen', 'basic', 'advanced', 'config'] as const;
    const currentIndex = modes.indexOf(this.config.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
  }

  private setMode(mode: typeof this.config.mode) {
    if (this.uiState.isTransitioning) return;
    
    this.uiState.isTransitioning = true;
    this.config.mode = mode;
    this.uiState.currentMode = mode;
    
    // Apply mode-specific UI changes
    this.applyModeStyles();
    this.updateModeDisplay();
    
    // Mode-specific logic
    switch (mode) {
      case 'zen':
        this.enterZenMode();
        break;
      case 'basic':
        this.enterBasicMode();
        break;
      case 'advanced':
        this.enterAdvancedMode();
        break;
      case 'config':
        this.enterConfigMode();
        break;
    }
    
    setTimeout(() => {
      this.uiState.isTransitioning = false;
    }, 300);
  }

  private enterZenMode() {
    // Minimal interface, focus on breathing
    this.setControlsVisibility(false);
    if (this.container) {
      this.container.classList.add('zen-mode');
    }
  }

  private enterBasicMode() {
    // Shape and pattern controls visible
    this.setControlsVisibility(true);
    this.hideAdvancedControls();
    if (this.container) {
      this.container.classList.remove('zen-mode', 'advanced-mode', 'config-mode');
      this.container.classList.add('basic-mode');
    }
  }

  private enterAdvancedMode() {
    // All controls visible
    this.setControlsVisibility(true);
    this.showAdvancedControls();
    if (this.container) {
      this.container.classList.remove('zen-mode', 'basic-mode', 'config-mode');
      this.container.classList.add('advanced-mode');
    }
  }

  private enterConfigMode() {
    // Configuration interface (placeholder for now)
    console.log('Config mode - would show configuration panel');
    this.setMode('advanced'); // Fall back to advanced for now
  }

  private applyModeStyles() {
    if (!this.container) return;
    
    // Remove all mode classes
    this.container.classList.remove('zen-mode', 'basic-mode', 'advanced-mode', 'config-mode');
    
    // Add current mode class
    this.container.classList.add(`${this.config.mode}-mode`);
  }

  private setControlsVisibility(visible: boolean) {
    this.uiState.isControlsVisible = visible;
    
    if (this.controlPanel) {
      this.controlPanel.style.display = visible ? 'block' : 'none';
    }
    
    const modeControls = document.querySelector('.mode-controls') as HTMLElement;
    if (modeControls) {
      modeControls.style.display = visible ? 'flex' : 'none';
    }
  }

  private showAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    if (advancedRow) {
      advancedRow.style.display = 'flex';
    }
  }

  private hideAdvancedControls() {
    const advancedRow = document.querySelector('.advanced-controls') as HTMLElement;
    if (advancedRow) {
      advancedRow.style.display = 'none';
    }
  }

  // Shape Management
  private getCurrentShape(): BreathingShape {
    return BREATHING_SHAPES.find(s => s.id === this.config.currentShape) || BREATHING_SHAPES[0];
  }

  private getCurrentPattern(): BreathingPattern {
    return BREATHING_PATTERNS.find(p => p.id === this.config.currentPattern) || BREATHING_PATTERNS[0];
  }

  private getCurrentTheme(): ThemeConfig {
    return VISUAL_THEMES.find(t => t.id === this.config.currentTheme) || VISUAL_THEMES[0];
  }

  private nextShape() {
    const availableShapes = this.config.availableShapes;
    const currentIndex = availableShapes.indexOf(this.config.currentShape);
    const nextIndex = (currentIndex + 1) % availableShapes.length;
    this.setShape(availableShapes[nextIndex]);
  }

  private previousShape() {
    const availableShapes = this.config.availableShapes;
    const currentIndex = availableShapes.indexOf(this.config.currentShape);
    const previousIndex = (currentIndex - 1 + availableShapes.length) % availableShapes.length;
    this.setShape(availableShapes[previousIndex]);
  }

  private setShape(shapeId: string) {
    this.config.currentShape = shapeId;
    const newShape = this.getCurrentShape();
    
    if (this.breathingEngine) {
      this.breathingEngine.updateShape(newShape);
    }
    
    this.updateShapeDisplay();
  }

  private nextPattern() {
    const availablePatterns = this.config.availablePatterns;
    const currentIndex = availablePatterns.indexOf(this.config.currentPattern);
    const nextIndex = (currentIndex + 1) % availablePatterns.length;
    this.setPattern(availablePatterns[nextIndex]);
  }

  private previousPattern() {
    const availablePatterns = this.config.availablePatterns;
    const currentIndex = availablePatterns.indexOf(this.config.currentPattern);
    const previousIndex = (currentIndex - 1 + availablePatterns.length) % availablePatterns.length;
    this.setPattern(availablePatterns[previousIndex]);
  }

  private setPattern(patternId: string) {
    this.config.currentPattern = patternId;
    const newPattern = this.getCurrentPattern();
    
    if (this.breathingEngine) {
      this.breathingEngine.updatePattern(newPattern);
    }
    
    this.updatePatternDisplay();
  }

  // Control Functions
  private togglePin() {
    this.uiState.isPinned = !this.uiState.isPinned;
    
    if (this.uiState.isPinned) {
      this.setMode('zen');
      this.enableClickThrough();
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

  private toggleAudio() {
    this.config.audio.enabled = !this.config.audio.enabled;
    this.updateAudioButton();
  }

  private cycleTheme() {
    const availableThemes = this.config.availableThemes;
    const currentIndex = availableThemes.indexOf(this.config.currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    this.config.currentTheme = availableThemes[nextIndex];
    
    this.applyTheme(this.getCurrentTheme());
  }

  private adjustScale(delta: number) {
    this.config.scale = Math.max(0.5, Math.min(2.0, this.config.scale + delta));
    if (this.breathingEngine) {
      this.breathingEngine.updateConfig(this.config);
    }
  }

  private adjustIntensity(delta: number) {
    this.config.intensity = Math.max(0.1, Math.min(1.0, this.config.intensity + delta));
    if (this.breathingEngine) {
      this.breathingEngine.updateConfig(this.config);
    }
  }

  private toggleBreathing() {
    if (this.breathingEngine) {
      // Toggle breathing engine (would need to add this method)
      console.log('Toggle breathing');
    }
  }

  private async closeHUD() {
    if ((window as any).electronAPI?.close) {
      await (window as any).electronAPI.close();
    }
  }

  // Visual Updates
  private applyTheme(theme: ThemeConfig) {
    if (!this.container) return;
    
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    
    // Apply effects
    this.container.classList.toggle('theme-glow', theme.effects.glow);
    this.container.classList.toggle('theme-pulse', theme.effects.pulse);
    this.container.classList.toggle('theme-gradient', theme.effects.gradient);
  }

  private updateModeDisplay() {
    const modeBtn = document.getElementById('mode-btn');
    if (modeBtn) {
      modeBtn.textContent = this.config.mode.charAt(0).toUpperCase() + this.config.mode.slice(1);
    }
  }

  private updateShapeDisplay() {
    const shapeNameEl = document.getElementById('current-shape-name');
    if (shapeNameEl) {
      shapeNameEl.textContent = this.getCurrentShape().name;
    }
  }

  private updatePatternDisplay() {
    const patternNameEl = document.getElementById('current-pattern-name');
    if (patternNameEl) {
      patternNameEl.textContent = this.getCurrentPattern().name;
    }
  }

  private updatePinButton() {
    const pinBtn = document.getElementById('pin-btn');
    if (pinBtn) {
      pinBtn.textContent = this.uiState.isPinned ? '📍' : '📌';
      pinBtn.classList.toggle('pinned', this.uiState.isPinned);
    }
  }

  private updateAudioButton() {
    const audioBtn = document.getElementById('audio-btn');
    if (audioBtn) {
      audioBtn.textContent = this.config.audio.enabled ? '🔊' : '🔇';
    }
  }

  private initializeBreathingEngine() {
    if (!this.breathingCanvas) {
      console.error('Breathing canvas not found');
      return;
    }

    const currentShape = this.getCurrentShape();
    const currentPattern = this.getCurrentPattern();
    
    this.breathingEngine = new EnhancedBreathingEngine(
      this.breathingCanvas,
      this.config,
      currentShape,
      currentPattern
    );

    // Setup phase change callback for UI updates
    this.breathingEngine.setPhaseChangeCallback((phase, progress) => {
      this.updatePhaseDisplay(phase.name, progress);
    });

    // Start breathing animation
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