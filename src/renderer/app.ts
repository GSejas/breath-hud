console.log('Enhanced HUD App starting...');

// Import shared modules (Issue #1: Extract types and constants)
import { BreathingSequenceManager } from './managers/sequence-manager';
import { BREATHING_SEQUENCES } from '../shared/breathing-presets';
import type {
  BreathingShape,
  BreathingPattern,
  BreathingSequence,
  BreathingSequenceStep,
} from '../shared/types/breathing.types';
import type { EditorDraft, EditorFrame } from '../shared/types/editor.types';
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
import { BreathingStatusView } from './ui/breathing-status';
import { SystemEditor } from './ui/system-editor';
import { AudioCueService } from './services/audio-cue-service';

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

function isEditorFrame(value: unknown): value is EditorFrame {
  return value === 'glass' || value === 'outline' || value === 'soft' || value === 'quiet';
}

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
  private currentFrame: EditorFrame = 'glass';
  private intensity = 0.7;
  private shapePosition = { x: 0, y: 0 }; // Relative position from center
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
  private breathingStatusView: BreathingStatusView | null = null;
  private fallbackEditor: SystemEditor | null = null;
  private readonly audioCueService = new AudioCueService();
  private audioEnabled = false;

  async initialize() {
    console.log('Initializing Enhanced Tile Control System...');
    
    // Initialize sequence manager
    this.sequenceManager = new BreathingSequenceManager();
    this.setupSequenceCallbacks();
    
    this.setupUIElements();
    this.loadConfig(); // Load saved configuration
    this.audioCueService.setConfig({ enabled: this.audioEnabled, volume: 1 });
    this.updateAudioButton();
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
    this.applyFrame(this.currentFrame);
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
    controlPanel.setAttribute('role', 'toolbar');
    controlPanel.setAttribute('aria-label', 'HUD controls');
    controlPanel.innerHTML = `
      <div class="control-row">
        <button type="button" id="audio-btn" class="control-btn" title="Turn sound on" aria-label="Turn sound on" aria-pressed="false"><span aria-hidden="true">&#x1F507;</span></button>
        <button type="button" id="edit-btn" class="control-btn" title="Open minimal editor" aria-label="Open minimal editor" aria-pressed="false">✏️</button>
        <button type="button" id="theme-btn" class="control-btn" title="Cycle Theme" aria-label="Change theme">🎨</button>
        <button type="button" id="pin-btn" class="control-btn" title="Pin/Unpin HUD" aria-label="Pin HUD" aria-pressed="false">📌</button>
        <button type="button" id="close-btn" class="control-btn" title="Hide HUD" aria-label="Hide HUD">✕</button>
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
    
    // 2. Shape/Pattern Display (bottom-center, compact)
    const shapePatternDisplay = document.createElement('div');
    shapePatternDisplay.className = 'shape-pattern-display';
    shapePatternDisplay.innerHTML = `
      <div id="current-shape-name">Circle</div>
      <div id="current-pattern-name">Zen</div>
      <div id="sequence-status" role="status" aria-live="polite">Sequence: Off</div>
    `;
    
    // 3. Mode Button (bottom-right corner)
    const modeButton = document.createElement('div');
    modeButton.className = 'mode-button-corner';
    modeButton.innerHTML = `
      <button type="button" id="mode-btn" class="control-btn mode-btn-compact" aria-label="Change mode">Basic</button>
    `;
    
    // Append all new containers
    this.container.appendChild(sequenceControls);
    this.container.appendChild(shapePatternDisplay);
    this.container.appendChild(modeButton);
  }

  private createStatusDisplay() {
    const centralTile = document.querySelector('.central-breathing-tile');
    if (!centralTile) return;

    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'enhanced-status';
    this.breathingStatusView = new BreathingStatusView(statusDisplay);
    this.breathingStatusView.showLoading();

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
    document.getElementById('audio-btn')?.addEventListener('click', () => this.toggleAudio());
    document.getElementById('edit-btn')?.addEventListener('click', () => void this.openEditor());
    
    document.getElementById('size-up-btn')?.addEventListener('click', () => this.resizeHUD(this.hudSizeStep));
    document.getElementById('size-down-btn')?.addEventListener('click', () => this.resizeHUD(-this.hudSizeStep));
    document.getElementById('intensity-up-btn')?.addEventListener('click', () => this.adjustIntensity(0.1));
    document.getElementById('intensity-down-btn')?.addEventListener('click', () => this.adjustIntensity(-0.1));
    
    // Breathing sliders
    document.getElementById('base-slider')?.addEventListener('input', (e) => this.updateBaseSize((e.target as HTMLInputElement).value));
    document.getElementById('inhale-slider')?.addEventListener('input', (e) => this.updateInhaleMax((e.target as HTMLInputElement).value));
    document.getElementById('exhale-slider')?.addEventListener('input', (e) => this.updateExhaleMin((e.target as HTMLInputElement).value));
    
    document.getElementById('mode-btn')?.addEventListener('click', () => this.cycleMode());

    // Pattern and sequence controls
    document.getElementById('pattern-prev-btn')?.addEventListener('click', () => this.cyclePattern());
    document.getElementById('sequence-toggle-btn')?.addEventListener('click', () => this.toggleSequence());
    document.getElementById('sequence-next-btn')?.addEventListener('click', () => this.nextSequence());

    // Handle hover events for zen mode click-through
    this.setupZenModeHover();
    
    // Setup tooltips
    this.setupTooltips();

    const api = (window as Window & {
      electronAPI?: { onEditorDraftApplied?: (callback: (draft: EditorDraft) => void) => void };
    }).electronAPI;
    api?.onEditorDraftApplied?.((draft) => this.applyEditorDraft(draft));
  }
  
  private setupTooltips() {
    const tooltipMap: {[key: string]: string} = {
      'pin-btn': 'Pin HUD: enable click-through (Ctrl+Alt+P)',
      'close-btn': 'Hide HUD',
      'theme-btn': 'Cycle Theme',
      'audio-btn': 'Enable tonal breathing cues',
      'edit-btn': 'Open minimal editor (Ctrl+Alt+E)',
      'size-up-btn': 'Increase Size',
      'size-down-btn': 'Decrease Size',
      'intensity-up-btn': 'Increase Intensity',
      'intensity-down-btn': 'Decrease Intensity',
      'pattern-prev-btn': 'Next breathing pattern (Arrow Up)',
      'sequence-toggle-btn': 'Start/Stop Sequence',
      'sequence-next-btn': 'Next Sequence',
      'mode-btn': 'Cycle Mode (Basic/Advanced/Zen)',
    };

    // Keep hover help aligned with the actual handlers and current mode model.
    // The mode selector is independent from the Edit overlay.
    Object.assign(tooltipMap, {
      'edit-btn': 'Open the minimal editor for shape, pattern, theme, motion, and position',
      'size-up-btn': 'Increase HUD size by 40px',
      'size-down-btn': 'Decrease HUD size by 40px',
      'intensity-up-btn': 'Increase breathing intensity by 0.1',
      'intensity-down-btn': 'Decrease breathing intensity by 0.1',
      'sequence-toggle-btn': 'Start or stop the selected sequence',
      'sequence-next-btn': 'Choose the next sequence',
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
      
      switch (event.key) {
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

  }

  private setControlsVisibility(visible: boolean) {
    const controlPanel = document.querySelector('.enhanced-controls') as HTMLElement;
    
    if (controlPanel) controlPanel.style.display = visible ? 'block' : 'none';
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
          if (button.id === 'close-btn' || button.id === 'pin-btn' || button.id === 'edit-btn' || button.id === 'audio-btn') {
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
      // Apply saved position to new shape
      this.applyShapePositionToEngine();
    }
    this.updateDisplays();
  }

  private updatePattern() {
    const newPattern = BREATHING_PATTERNS[this.currentPatternIndex];
    if (!newPattern) {
      this.breathingStatusView?.showEmpty('No breathing pattern is available');
      return;
    }

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
    // Keep the central figure and status text proportional while resizing.
    this.container.style.setProperty('--hud-scale', (this.hudSize / 300).toFixed(3));
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
    this.audioCueService.stop();
    if ((window as any).electronAPI?.close) {
      await (window as any).electronAPI.close();
    }
  }

  private toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    this.audioCueService.setConfig({ enabled: this.audioEnabled, volume: 1 });
    this.updateAudioButton();
    this.saveConfig(false);
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

  private applyFrame(frame: EditorFrame): void {
    this.currentFrame = frame;
    this.container?.classList.remove('frame-glass', 'frame-outline', 'frame-soft', 'frame-quiet');
    this.container?.classList.add(`frame-${frame}`);
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
      const pattern = BREATHING_PATTERNS[this.currentPatternIndex];
      if (!pattern) return;
      patternNameEl.textContent = pattern.name;
      this.breathingStatusView?.setPattern(pattern);
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

  private updateAudioButton() {
    const audioButton = document.getElementById('audio-btn');
    if (!audioButton) return;

    audioButton.textContent = this.audioEnabled ? '\u{1F50A}' : '\u{1F507}';
    const label = this.audioEnabled ? 'Turn sound off' : 'Turn sound on';
    audioButton.setAttribute('aria-label', label);
    audioButton.setAttribute('title', label);
    audioButton.setAttribute('aria-pressed', String(this.audioEnabled));
    audioButton.classList.toggle('active', this.audioEnabled);
  }

  private updateEditButton() {
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.textContent = '✏️';
      editBtn.classList.remove('active');
      editBtn.setAttribute('aria-label', 'Open minimal editor');
      editBtn.setAttribute('aria-pressed', 'false');
    }
  }

  private async openEditor(): Promise<void> {
    const api = (window as Window & {
      electronAPI?: { openEditor?: () => Promise<{ success: boolean }> };
    }).electronAPI;
    if (api?.openEditor) {
      await api.openEditor();
      return;
    }

    // Browser fallback keeps the editor inspectable outside Electron.
    const shell = document.getElementById('editor-shell');
    if (!shell) return;
    if (!this.fallbackEditor) {
      this.fallbackEditor = new SystemEditor(shell, (draft) => this.applyEditorDraft(draft));
      this.fallbackEditor.initialize();
    } else {
      this.fallbackEditor.open();
    }
  }

  private applyEditorDraft(draft: EditorDraft): void {
    const shapeIndex = BREATHING_SHAPES.findIndex((shape) => shape.id === draft.shapeId);
    const patternIndex = BREATHING_PATTERNS.findIndex((pattern) => pattern.id === draft.patternId);
    const themeIndex = VISUAL_THEMES.findIndex((theme) => theme.id === draft.themeId);
    if (shapeIndex < 0 || patternIndex < 0 || themeIndex < 0) {
      console.error('Editor draft references an unknown catalog item');
      return;
    }

    this.currentShapeIndex = shapeIndex;
    this.currentPatternIndex = patternIndex;
    this.currentThemeIndex = themeIndex;
    this.applyFrame(draft.frame);
    this.intensity = draft.intensity;
    this.baseSize = draft.baseSize;
    this.inhaleMax = draft.inhaleMax;
    this.exhaleMin = draft.exhaleMin;
    this.hudSize = draft.hudSize;
    this.shapePosition = { ...draft.shapePosition };

    this.updateShape();
    this.updatePattern();
    this.applyTheme(VISUAL_THEMES[this.currentThemeIndex]);
    this.updateBreathingParams();
    this.updateSliderValues();
    this.applyShapePositionToEngine();
    this.applyHudSize();
    void (window as any).electronAPI?.resize?.(this.hudSize);
    this.saveConfig();
    this.debugLog('Minimal editor changes applied');
  }

  private saveConfig(showNotification = true) {
    const config = {
      currentShape: this.currentShapeIndex,
      currentPattern: this.currentPatternIndex,
      currentTheme: this.currentThemeIndex,
      frame: this.currentFrame,
      intensity: this.intensity,
      mode: this.currentMode,
      shapePosition: this.shapePosition,
      breathingParams: {
        baseSize: this.baseSize,
        inhaleMax: this.inhaleMax,
        exhaleMin: this.exhaleMin
      },
      hudSize: this.hudSize,
      audioEnabled: this.audioEnabled,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('breathingHudConfig', JSON.stringify(config));
      console.log('Configuration saved:', config);
      if (showNotification) this.showSaveNotification();
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
        this.currentFrame = isEditorFrame(config.frame) ? config.frame : 'glass';
        this.intensity = clampNumber(config.intensity, 0.1, 1.0, 0.7);
        this.currentMode = typeof savedMode === 'string' && modes.includes(savedMode as HudMode)
          ? savedMode as HudMode
          : 'basic';
        this.audioEnabled = typeof config.audioEnabled === 'boolean' ? config.audioEnabled : false;
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
        this.applyFrame(this.currentFrame);
        this.updateDisplays();
        this.updateSliderValues();
        this.updateAudioButton();
        
        console.log('Configuration loaded:', config);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
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
      this.breathingStatusView?.showError('Breathing visualization could not start');
      return;
    }

    const currentShape = BREATHING_SHAPES[this.currentShapeIndex];
    const currentPattern = BREATHING_PATTERNS[this.currentPatternIndex];
    if (!currentShape || !currentPattern) {
      this.breathingStatusView?.showEmpty('No breathing pattern is available');
      return;
    }

    // Bind the status sink to the selected pattern before the first animation
    // frame. This matters after loading a persisted non-default pattern.
    this.breathingStatusView?.setPattern(currentPattern);
    this.breathingStatusView?.setRuntimeState('loading');

    try {
      this.audioCueService.stop();
      this.breathingEngine?.stop();
      this.breathingEngine = new EnhancedBreathingEngine(
        this.breathingCanvas,
        currentShape,
        currentPattern
      );
      this.applyShapePositionToEngine();

      this.breathingEngine.setProgressCallback((progress) => {
        this.breathingStatusView?.render(progress);
      });

      this.breathingEngine.setPhaseChangeCallback((phase) => {
        this.audioCueService.playPhase(phase);
      });

      // Connect sequence manager to breathing cycles
      this.breathingEngine.setCycleCompleteCallback(() => {
        if (this.sequenceManager.isActive()) {
          this.sequenceManager.onBreathingCycleComplete();
          this.updateDisplays(); // Update sequence status display
        }
      });

      this.breathingEngine.start();
      console.log('Enhanced breathing engine initialized and started');
    } catch (error) {
      console.error('Failed to initialize breathing engine:', error);
      this.breathingStatusView?.showError('Breathing visualization could not start');
    }
  }
}

// The editor uses the same renderer bundle but a separate BrowserWindow query
// mode, so the transparent HUD engine is never started in the editor window.
const isEditorWindow = new URLSearchParams(window.location.search).get('view') === 'editor';

if (isEditorWindow) {
  const initializeEditor = () => {
    const shell = document.getElementById('editor-shell');
    if (!shell) {
      console.error('Minimal editor shell not found');
      return;
    }
    new SystemEditor(shell).initialize();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEditor, { once: true });
  } else {
    initializeEditor();
  }
} else {
  const tileSystem = new TileControlSystem();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tileSystem.initialize(), { once: true });
  } else {
    void tileSystem.initialize();
  }
}
