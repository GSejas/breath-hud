console.log('Enhanced HUD App starting...');

// Import shared modules (Issue #1: Extract types and constants)
import { BreathingSequenceManager } from './managers/sequence-manager';
import { BREATHING_SEQUENCES } from '../shared/breathing-presets';
import type {
  BreathingShape,
  BreathingPattern,
  BreathingPhase,
  BreathingSequence,
  BreathingSequenceStep
} from '../shared/types/breathing.types';
import type { ThemeConfig } from '../shared/types/theme.types';
import { BREATHING_SHAPES, BREATHING_PATTERNS, VISUAL_THEMES } from '../shared/constants';

// Import utility functions (Issue #2: Extract utility functions)
import {
  cubicEaseInOut,
  lerp,
  calculateBreathingValue,
  getPhaseOpacity,
  getPhaseColor,
  isNostrilActive
} from './utils';

// Import controllers (Issue #3: Extract existing controllers)
import { AutoFadeController } from './controllers';

// Import breathing engine
import { EnhancedBreathingEngine } from './engines/enhanced-breathing-engine';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

function readIndex(value: unknown, length: number, fallback = 0): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < length
    ? value
    : fallback;
}

type HudMode = 'zen' | 'basic' | 'advanced';

// Main Tile Control System (browser-compatible)
class TileControlSystem {
  private breathingEngine: EnhancedBreathingEngine | null = null;
  private sequenceManager!: BreathingSequenceManager;
  private autoFadeController!: AutoFadeController;
  private isPinned = false;
  private modeBeforePin: HudMode | null = null;
  private clickThroughTimer: ReturnType<typeof setTimeout> | null = null;
  private currentMode: HudMode = 'basic';
  private currentShapeIndex = 0;
  private currentPatternIndex = 0;
  private currentSequenceIndex = 0;
  private currentThemeIndex = 0;
  private scale = 1.0;
  private intensity = 0.7;
  private isEditMode = false;
  private selectedShapeElement: SVGElement | null = null;
  private shapePosition = { x: 0, y: 0 }; // Relative position from center
  private editModeScale = 1; // Keep edit mode readable without resizing the whole HUD
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private currentSvgElement: SVGElement | null = null;
  private currentCanvasElement: HTMLCanvasElement | null = null;
  private hudSize = 300;
  private readonly minHudSize = 240;
  private readonly maxHudSize = 600;
  private readonly hudSizeStep = 40;
  
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
    this.setMode(this.currentMode);
    const savedHudSize = this.readSavedHudSize();
    if (Number.isFinite(savedHudSize)) {
      this.hudSize = Math.max(this.minHudSize, Math.min(this.maxHudSize, savedHudSize));
    }
    this.applyHudSize();
    if ((window as any).electronAPI?.resize) {
      void (window as any).electronAPI.resize(this.hudSize);
    }
    this.detectReducedMotionPreference(); // Check OS settings
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.initializeBreathingEngine();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    
    // Initialize auto-fade and scale controllers after all UI is set up
    if (this.container) {
      this.autoFadeController = new AutoFadeController(this.container);
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
        <button type="button" id="edit-btn" class="control-btn" title="Edit Mode" aria-label="Open edit mode" aria-pressed="false">✏️</button>
        <button type="button" id="theme-btn" class="control-btn" title="Cycle Theme" aria-label="Change theme">🎨</button>
        <button type="button" id="pin-btn" class="control-btn" title="Pin/Unpin HUD" aria-label="Pin HUD" aria-pressed="false">📌</button>
        <button type="button" id="close-btn" class="control-btn" title="Close HUD" aria-label="Close HUD">✕</button>
      </div>
      <div class="control-row advanced-controls" style="display: none;">
        <button type="button" id="size-down-btn" class="control-btn small" title="Smaller" aria-label="Make HUD smaller">🔽</button>
        <button type="button" id="size-up-btn" class="control-btn small" title="Larger" aria-label="Make HUD larger">🔼</button>
        <button type="button" id="intensity-down-btn" class="control-btn small" title="Less Intense" aria-label="Decrease breathing intensity">➖</button>
        <button type="button" id="intensity-up-btn" class="control-btn small" title="More Intense" aria-label="Increase breathing intensity">➕</button>
      </div>
      <div class="control-row breathing-sliders" style="display: none;">
        <div class="slider-group">
          <label for="base-slider">Base: <span id="base-value">0.6</span></label>
          <input type="range" id="base-slider" aria-label="Base breathing size" min="0.2" max="1.2" step="0.05" value="0.6">
        </div>
        <div class="slider-group">
          <label for="inhale-slider">Inhale: <span id="inhale-value">1.0</span></label>
          <input type="range" id="inhale-slider" aria-label="Inhale maximum size" min="0.6" max="1.8" step="0.05" value="1.0">
        </div>
        <div class="slider-group">
          <label for="exhale-slider">Exhale: <span id="exhale-value">0.4</span></label>
          <input type="range" id="exhale-slider" aria-label="Exhale minimum size" min="0.1" max="0.8" step="0.05" value="0.4">
        </div>
      </div>
      <div class="control-row edit-controls" style="display: none;">
        <button type="button" id="save-config-btn" class="control-btn small" title="Save Config" aria-label="Save configuration">💾</button>
        <button type="button" id="reset-config-btn" class="control-btn small" title="Reset Config" aria-label="Reset configuration">🔄</button>
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
      <button type="button" id="pattern-prev-btn" class="control-btn small" title="Next breathing pattern" aria-label="Next breathing pattern">🔄</button>
      <button type="button" id="sequence-toggle-btn" class="control-btn small" title="Toggle Sequence" aria-label="Start sequence" aria-pressed="false">📋</button>
      <button type="button" id="sequence-next-btn" class="control-btn small" title="Next Sequence" aria-label="Choose next sequence">⏭️</button>
    `;
    
    // 2. Shape Navigation (left side - between Q1/Q3)
    const shapeNavLeft = document.createElement('div');
    shapeNavLeft.className = 'shape-navigation-left';
    shapeNavLeft.innerHTML = `
      <button type="button" id="shape-prev-btn" class="control-btn" title="Previous Shape" aria-label="Previous breathing shape">◀</button>
    `;
    
    // 3. Shape Navigation (right side - between Q2/Q4) 
    const shapeNavRight = document.createElement('div');
    shapeNavRight.className = 'shape-navigation-right';
    shapeNavRight.innerHTML = `
      <button type="button" id="shape-next-btn" class="control-btn" title="Next Shape" aria-label="Next breathing shape">▶</button>
    `;
    
    // 4. Shape/Pattern Display (bottom-center, compact)
    const shapePatternDisplay = document.createElement('div');
    shapePatternDisplay.className = 'shape-pattern-display';
    shapePatternDisplay.innerHTML = `
      <div id="current-shape-name">Circle</div>
      <div id="current-pattern-name">Zen</div>
      <div id="sequence-status" role="status" aria-live="polite">Sequence: Off</div>
    `;
    
    // 5. Mode Button (bottom-right corner)
    const modeButton = document.createElement('div');
    modeButton.className = 'mode-button-corner';
    modeButton.innerHTML = `
      <button type="button" id="mode-btn" class="control-btn mode-btn-compact" aria-label="Change mode">Basic</button>
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
      <div id="phase-indicator" role="status" aria-live="polite">Ready</div>
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
    
    document.getElementById('size-up-btn')?.addEventListener('click', () => this.resizeHUD(this.hudSizeStep));
    document.getElementById('size-down-btn')?.addEventListener('click', () => this.resizeHUD(-this.hudSizeStep));
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
    
    // Setup tooltips
    this.setupTooltips();
  }
  
  private setupTooltips() {
    const tooltipMap: {[key: string]: string} = {
      'pin-btn': 'Pin HUD: enable click-through (Ctrl+Alt+P)',
      'close-btn': 'Close HUD',
      'theme-btn': 'Cycle Theme',
      'edit-btn': 'Toggle Edit Mode',
      'size-up-btn': 'Increase Size',
      'size-down-btn': 'Decrease Size',
      'intensity-up-btn': 'Increase Intensity',
      'intensity-down-btn': 'Decrease Intensity',
      'shape-prev-btn': 'Previous Shape (←)',
      'shape-next-btn': 'Next Shape (→)',
      'pattern-prev-btn': 'Next breathing pattern (Arrow Up)',
      'sequence-toggle-btn': 'Start/Stop Sequence',
      'sequence-next-btn': 'Next Sequence',
      'mode-btn': 'Cycle Mode (Basic/Advanced/Zen)',
    };

    // Keep hover help aligned with the actual handlers and current mode model.
    // The mode selector is independent from the Edit overlay.
    Object.assign(tooltipMap, {
      'edit-btn': 'Toggle Edit overlay: drag or nudge the shape',
      'size-up-btn': 'Increase HUD size by 40px',
      'size-down-btn': 'Decrease HUD size by 40px',
      'intensity-up-btn': 'Increase breathing intensity by 0.1',
      'intensity-down-btn': 'Decrease breathing intensity by 0.1',
      'sequence-toggle-btn': 'Start or stop the selected sequence',
      'sequence-next-btn': 'Choose the next sequence',
      'save-config-btn': 'Save layout and breathing settings',
      'reset-config-btn': 'Reset saved settings to defaults',
      'base-slider': 'Base breathing size: 0.2 to 1.2',
      'inhale-slider': 'Inhale maximum size: 0.6 to 1.8',
      'exhale-slider': 'Exhale minimum size: 0.1 to 0.8',
    });

    Object.entries(tooltipMap).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        this.addTooltip(element, text);
      }
    });
  }
  
  private addTooltip(element: HTMLElement, text: string) {
    let tooltip: HTMLDivElement | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;

    const showTooltip = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = text;
      document.body.appendChild(tooltip);

      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Position tooltip above button by default
      let top = rect.top - tooltipRect.height - 8;
      let left = rect.left + (rect.width - tooltipRect.width) / 2;
      
      // Adjust if tooltip would go off screen
      if (top < 0) {
        top = rect.bottom + 8;
        tooltip.classList.add('bottom');
      } else {
        tooltip.classList.add('top');
      }
      
      if (left < 5) left = 5;
      if (left + tooltipRect.width > window.innerWidth - 5) {
        left = window.innerWidth - tooltipRect.width - 5;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      // Trigger show animation
      requestAnimationFrame(() => {
        tooltip?.classList.add('show');
      });
    };

    const hideTooltip = () => {
      if (tooltip) {
        tooltip.classList.remove('show');
        hideTimeout = setTimeout(() => {
          tooltip?.remove();
          tooltip = null;
        }, 200);
      }
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
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

      const target = event.target as HTMLElement | null;
      if (
        event.defaultPrevented ||
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLButtonElement
      ) {
        return;
      }
      
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
    const modes: HudMode[] = ['zen', 'basic', 'advanced'];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
  }

  private setMode(mode: HudMode) {
    this.currentMode = mode;
    this.container?.classList.remove('zen-mode', 'basic-mode', 'advanced-mode');
    this.container?.classList.add(`${mode}-mode`);
    this.applyModePresentation();
    this.updateModeDisplay();
    this.updateEditButton();
  }

  private applyModePresentation() {
    switch (this.currentMode) {
      case 'zen':
        this.setControlsVisibility(true);
        this.restoreAllButtons();
        this.hideAdvancedControls();
        this.hideDebugConsole();
        break;
      case 'basic':
        this.setBasicControlsVisibility(true);
        this.hideAdvancedControls();
        this.hideDebugConsole();
        break;
      case 'advanced':
        this.setControlsVisibility(true);
        this.restoreAllButtons();
        this.showAdvancedControls();
        this.hideDebugConsole();
        break;
    }

    if (this.isEditMode) {
      this.applyEditPresentation();
    } else {
      this.container?.classList.remove('edit-mode');
      this.hideEditControls();
      this.deselectShape();
      this.scaleForEditMode(false);
    }
  }

  private applyEditPresentation() {
    this.setControlsVisibility(true);
    this.restoreAllButtons();
    this.showAdvancedControls();
    this.showEditControls();
    this.showDebugConsole();
    this.container?.classList.add('edit-mode');
    this.scaleForEditMode(true);
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
          if (button.id === 'close-btn' || button.id === 'pin-btn' || button.id === 'edit-btn') {
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
    if (sequences.length < 2) {
      this.updateSequenceDisplay();
      return;
    }

    this.currentSequenceIndex = (this.currentSequenceIndex + 1) % sequences.length;
    
    const newSequence = sequences[this.currentSequenceIndex];
    this.sequenceManager.setSequence(newSequence);
    
    if (this.sequenceManager.isActive()) {
      this.sequenceManager.startSequence();
    } else {
      this.sequenceManager.previewSequence();
    }
    
    this.updateDisplays();
    console.log(`Switched to sequence: ${newSequence.name}`);
  }

  private cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % VISUAL_THEMES.length;
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
  }

  private async resizeHUD(delta: number) {
    const previousSize = this.hudSize;
    const nextSize = Math.max(
      this.minHudSize,
      Math.min(this.maxHudSize, this.hudSize + delta),
    );

    if (nextSize === this.hudSize) return;

    this.hudSize = nextSize;
    this.applyHudSize();

    try {
      if ((window as any).electronAPI?.resize) {
        await (window as any).electronAPI.resize(this.hudSize);
      }
      localStorage.setItem('breathingHudWindowSize', String(this.hudSize));
    } catch (error) {
      this.hudSize = previousSize;
      this.applyHudSize();
      console.error('Failed to resize HUD:', error);
      this.showNotification('Unable to resize HUD');
      return;
    }

    this.debugLog(`HUD size: ${this.hudSize}px`);
  }

  private applyHudSize() {
    if (!this.container) return;

    this.container.style.width = `${this.hudSize}px`;
    this.container.style.height = `${this.hudSize}px`;
    this.container.style.setProperty('--hud-scale', (this.hudSize / 300).toFixed(3));

    // Keep the central figure and status text proportional while resizing.
    // Edit-mode zoom is layered on top of this base HUD scale.
    this.scaleForEditMode(this.isEditMode);
  }

  private readSavedHudSize(): number {
    try {
      const saved = Number(localStorage.getItem('breathingHudWindowSize'));
      return Number.isFinite(saved) ? saved : NaN;
    } catch (error) {
      console.warn('Failed to read saved HUD size:', error);
      return NaN;
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

  private async togglePin() {
    const nextPinned = !this.isPinned;
    this.cancelPendingClickThrough();

    try {
      if (nextPinned) {
        this.modeBeforePin = this.currentMode;
        this.isPinned = true;
        this.setMode('zen');
        this.updatePinButton();
        this.autoFadeController?.updatePinStatus(true);

        // Let the current click finish before enabling click-through.
        this.clickThroughTimer = setTimeout(() => {
          this.clickThroughTimer = null;
          if (!this.isPinned) return;

          void this.enableClickThrough().catch((error) => {
            this.handlePinFailure(error);
          });
        }, 100);
        return;
      }

      await this.disableClickThrough();
      this.isPinned = false;
      const modeToRestore = this.modeBeforePin;
      this.modeBeforePin = null;
      if (modeToRestore) this.setMode(modeToRestore);
      this.updatePinButton();
      this.autoFadeController?.updatePinStatus(false);
    } catch (error) {
      this.handlePinFailure(error, nextPinned);
    }
  }

  private cancelPendingClickThrough() {
    if (this.clickThroughTimer !== null) {
      clearTimeout(this.clickThroughTimer);
      this.clickThroughTimer = null;
    }
  }

  private handlePinFailure(error: unknown, requestedPinned = true) {
    console.error(`Failed to ${requestedPinned ? 'pin' : 'unpin'} HUD:`, error);
    this.cancelPendingClickThrough();
    const modeToRestore = this.modeBeforePin;

    if (requestedPinned) {
      this.isPinned = false;
      if (modeToRestore) this.setMode(modeToRestore);
      this.modeBeforePin = null;
    } else {
      // Failed unpin: remain pinned and keep the pinned Zen presentation.
      this.isPinned = true;
      this.setMode('zen');
    }

    this.updatePinButton();
    this.autoFadeController?.updatePinStatus(this.isPinned);
    this.showNotification(`Unable to ${requestedPinned ? 'pin' : 'unpin'} HUD`);
  }

  private async enableClickThrough(): Promise<void> {
    if ((window as any).electronAPI?.setClickThrough) {
      await (window as any).electronAPI.setClickThrough(true);
    }
  }

  private async disableClickThrough(): Promise<void> {
    this.cancelPendingClickThrough();
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
      const modeName = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
      modeBtn.textContent = modeName;
      modeBtn.setAttribute('aria-label', `Change mode; current mode: ${modeName}`);
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
    const sequences = this.sequenceManager.getAvailableSequences();
    const sequenceStatusEl = document.getElementById('sequence-status');
    if (sequenceStatusEl) {
      if (this.sequenceManager.isActive()) {
        const info = this.sequenceManager.getSequenceInfo();
        sequenceStatusEl.textContent = `Sequence: ${info}`;
      } else {
        const currentSequence = sequences[this.currentSequenceIndex];
        sequenceStatusEl.textContent = currentSequence
          ? `Sequence: ${currentSequence.name} (Off)`
          : 'Sequence: None';
      }
    }

    const nextSequenceBtn = document.getElementById('sequence-next-btn') as HTMLButtonElement | null;
    if (nextSequenceBtn) {
      const hasNextSequence = sequences.length > 1;
      nextSequenceBtn.disabled = !hasNextSequence;
      nextSequenceBtn.title = hasNextSequence ? 'Choose next sequence' : 'No other sequences available';
      nextSequenceBtn.setAttribute('aria-label', nextSequenceBtn.title);
    }

    // Update sequence toggle button appearance
    const sequenceBtn = document.getElementById('sequence-toggle-btn');
    if (sequenceBtn) {
      sequenceBtn.textContent = this.sequenceManager.isActive() ? '⏸️' : '📋';
      sequenceBtn.title = this.sequenceManager.isActive() ? 'Stop Sequence' : 'Start Sequence';
      sequenceBtn.setAttribute(
        'aria-label',
        this.sequenceManager.isActive() ? 'Stop sequence' : 'Start sequence',
      );
      sequenceBtn.setAttribute('aria-pressed', String(this.sequenceManager.isActive()));
    }
  }

  private updatePinButton() {
    const pinBtn = document.getElementById('pin-btn');
    if (pinBtn) {
      pinBtn.textContent = this.isPinned ? '📍' : '📌';
      pinBtn.classList.toggle('pinned', this.isPinned);
      pinBtn.setAttribute('aria-label', this.isPinned ? 'Unpin HUD' : 'Pin HUD');
      pinBtn.setAttribute('aria-pressed', String(this.isPinned));
    }
  }

  private updateEditButton() {
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.textContent = this.isEditMode ? '✅' : '✏️';
      editBtn.classList.toggle('active', this.isEditMode);
      editBtn.setAttribute('aria-label', this.isEditMode ? 'Exit edit mode' : 'Open edit mode');
      editBtn.setAttribute('aria-pressed', String(this.isEditMode));
    }
  }

  private toggleEditMode() {
    if (this.isEditMode) {
      // Edit is an overlay, so return to the current base mode.
      this.isEditMode = false;
      this.saveConfig();
      this.container?.classList.remove('edit-mode');
      this.applyModePresentation();
    } else {
      // Enter edit without changing Zen, Basic, or Advanced.
      this.isEditMode = true;
      this.debugLog('Entering edit mode...');
      this.applyEditPresentation();
      this.debugLog('Edit mode enabled - drag shapes to move them');
    }

    this.updateModeDisplay();
    this.updateEditButton();
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
      intensity: this.intensity,
      mode: this.currentMode,
      shapePosition: this.shapePosition,
      breathingParams: {
        baseSize: this.baseSize,
        inhaleMax: this.inhaleMax,
        exhaleMin: this.exhaleMin
      },
      hudSize: this.hudSize,
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
        const parsedConfig: unknown = JSON.parse(savedConfig);
        const config = isRecord(parsedConfig) ? parsedConfig : {};
        const savedMode = config.mode;
        const modes: HudMode[] = ['zen', 'basic', 'advanced'];
        const savedPosition = isRecord(config.shapePosition) ? config.shapePosition : {};
        const breathingParams = isRecord(config.breathingParams) ? config.breathingParams : {};
        
        // Apply saved configuration
        this.currentShapeIndex = readIndex(config.currentShape, BREATHING_SHAPES.length);
        this.currentPatternIndex = readIndex(config.currentPattern, BREATHING_PATTERNS.length);
        this.currentThemeIndex = readIndex(config.currentTheme, VISUAL_THEMES.length);
        this.intensity = clampNumber(config.intensity, 0.1, 1.0, 0.7);
        this.currentMode = typeof savedMode === 'string' && modes.includes(savedMode as HudMode)
          ? savedMode as HudMode
          : 'basic';
        this.shapePosition = {
          x: clampNumber(savedPosition.x, -80, 80, 0),
          y: clampNumber(savedPosition.y, -80, 80, 0),
        };
        
        // Load breathing parameters
        this.baseSize = clampNumber(breathingParams.baseSize, 0.1, 1.5, 0.6);
        this.inhaleMax = Math.max(
          this.baseSize,
          clampNumber(breathingParams.inhaleMax, this.baseSize, 2.0, 1.0),
        );
        this.exhaleMin = Math.min(
          this.baseSize,
          clampNumber(breathingParams.exhaleMin, 0.1, this.baseSize, 0.4),
        );

        if (typeof config.hudSize === 'number') {
          this.hudSize = clampNumber(config.hudSize, this.minHudSize, this.maxHudSize, this.hudSize);
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
    this.intensity = 0.7;
    this.shapePosition = { x: 0, y: 0 };
    this.baseSize = 0.6;
    this.inhaleMax = 1.0;
    this.exhaleMin = 0.4;
    this.hudSize = 300;
    
    // Clear local storage
    localStorage.removeItem('breathingHudConfig');
    localStorage.removeItem('breathingHudWindowSize');
    
    // Apply defaults
    this.updateShape();
    this.updatePattern();
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.updateDisplays();
    this.updateSliderValues();
    this.updateBreathingParams();
    this.applyShapePosition();
    this.applyHudSize();
    if ((window as any).electronAPI?.resize) {
      void (window as any).electronAPI.resize(this.hudSize);
    }
    
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
        this.editModeScale = clampNumber(config.editModeScale, 1, 1.25, 1);
        this.debugLog(`User config loaded: edit scale ${this.editModeScale}x`);
        return;
      }

      // Set default if no config found
      this.editModeScale = 1;
      this.debugLog(`Using default edit scale: ${this.editModeScale}x`);
      
      // Save default config for future use
      this.saveUserConfig();
    } catch (error) {
      console.error('Failed to load user configuration:', error);
      this.editModeScale = 1;
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

    const hudScale = this.hudSize / 300;
    const editScale = enable ? clampNumber(this.editModeScale, 1, 1.25, 1) : 1;
    const scale = hudScale * editScale;
    
    // Instead of scaling the whole container, scale the central breathing area
    const centralTile = document.querySelector('.central-breathing-tile') as HTMLElement;
    
    if (enable && centralTile) {
      // Keep edit mode at a safe, bounded zoom. The HUD resize controls are
      // responsible for changing the window size; edit mode should not make
      // text and controls overflow the window.
      centralTile.style.transform = `translate(-50%, -50%) scale(${scale})`;
      centralTile.style.transformOrigin = 'center center';
      this.debugLog(`Edit mode zoom: ${editScale}x; HUD scale: ${hudScale.toFixed(2)}x`);
    } else if (centralTile) {
      // Reset to normal size
      centralTile.style.transform = 'translate(-50%, -50%) scale(var(--hud-scale, 1))';
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

  private showNotification(message: string) {
    const notification = document.createElement('div');
    notification.setAttribute('role', 'status');
    notification.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
    `;
    notification.textContent = message;

    if (this.container) {
      this.container.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
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
      this.updatePhaseDisplay(phase.name, progress, phase.nostril);
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

  private updatePhaseDisplay(phaseName: string, progress: number, nostril?: 'left' | 'right' | 'both') {
    const phaseIndicator = document.getElementById('phase-indicator');
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    const nostrilIndicator = document.getElementById('nostril-indicator');

    if (phaseIndicator) {
      phaseIndicator.textContent = phaseName.charAt(0).toUpperCase() + phaseName.slice(1);
    }

    // Update nostril indicator
    if (nostrilIndicator) {
      const currentPattern = BREATHING_PATTERNS[this.currentPatternIndex];
      if (currentPattern.isNostrilBreathing && nostril) {
        nostrilIndicator.style.display = 'flex';
        const leftSpan = nostrilIndicator.querySelector('.nostril-left') as HTMLElement;
        const rightSpan = nostrilIndicator.querySelector('.nostril-right') as HTMLElement;

        if (leftSpan && rightSpan) {
          leftSpan.className = `nostril-left ${nostril === 'left' || nostril === 'both' ? 'active' : 'inactive'}`;
          rightSpan.className = `nostril-right ${nostril === 'right' || nostril === 'both' ? 'active' : 'inactive'}`;
        }
      } else {
        nostrilIndicator.style.display = 'none';
      }
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
