/**
 * UI Builder for constructing and managing HTML elements
 * Handles all DOM element creation and initial setup
 */

import type { BreathingShape, BreathingPattern } from '../../shared/types/breathing.types';
import { BREATHING_SHAPES, BREATHING_PATTERNS, VISUAL_THEMES } from '../../shared/constants';

export class UIBuilder {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Build complete UI structure
   */
  public buildUI(): {
    canvas: HTMLElement;
    controls: HTMLElement;
    display: HTMLElement;
    tooltip: HTMLElement;
  } {
    this.container.innerHTML = '';
    this.container.className = 'breathing-hud-container';

    const canvas = this.createCanvasContainer();
    const controls = this.createControlsPanel();
    const display = this.createDisplayPanel();
    const tooltip = this.createTooltip();

    this.container.appendChild(canvas);
    this.container.appendChild(controls);
    this.container.appendChild(display);
    this.container.appendChild(tooltip);

    return { canvas, controls, display, tooltip };
  }

  /**
   * Create canvas container
   */
  private createCanvasContainer(): HTMLElement {
    const canvas = document.createElement('div');
    canvas.id = 'breathing-canvas-container';
    canvas.className = 'canvas-container';
    canvas.style.cssText =
      'position: relative; width: 300px; height: 300px; margin: 0 auto;';
    return canvas;
  }

  /**
   * Create controls panel with all buttons
   */
  private createControlsPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'controls-panel';
    panel.className = 'controls-panel';

    const buttonConfigs = [
      { id: 'play-btn', text: '▶ Play', title: 'Start breathing exercise' },
      { id: 'stop-btn', text: '⏹ Stop', title: 'Stop breathing exercise' },
      { id: 'settings-btn', text: '⚙ Settings', title: 'Open settings' },
      { id: 'pin-btn', text: '📌 Pin', title: 'Pin interface (always visible)' }
    ];

    buttonConfigs.forEach(config => {
      const btn = document.createElement('button');
      btn.id = config.id;
      btn.textContent = config.text;
      btn.title = config.title;
      btn.className = 'control-btn';
      panel.appendChild(btn);
    });

    return panel;
  }

  /**
   * Create display panel showing current info
   */
  private createDisplayPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'display-panel';
    panel.className = 'display-panel';

    const displays = [
      { id: 'phase-display', label: 'Phase:' },
      { id: 'shape-display', label: 'Shape:' },
      { id: 'pattern-display', label: 'Pattern:' },
      { id: 'scale-display', label: 'Scale:' }
    ];

    displays.forEach(display => {
      const row = document.createElement('div');
      row.className = 'display-row';

      const label = document.createElement('span');
      label.className = 'display-label';
      label.textContent = display.label;

      const value = document.createElement('span');
      value.id = display.id;
      value.className = 'display-value';
      value.textContent = '—';

      row.appendChild(label);
      row.appendChild(value);
      panel.appendChild(row);
    });

    return panel;
  }

  /**
   * Create tooltip element for help text
   */
  private createTooltip(): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip hidden';
    tooltip.style.cssText = `
      position: absolute;
      bottom: -50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    `;
    return tooltip;
  }

  /**
   * Create shape selector dropdown
   */
  public createShapeSelector(): HTMLElement {
    const select = document.createElement('select');
    select.id = 'shape-selector';
    select.className = 'shape-selector';

    BREATHING_SHAPES.forEach(shape => {
      const option = document.createElement('option');
      option.value = shape.id;
      option.textContent = shape.name;
      option.title = shape.description;
      select.appendChild(option);
    });

    return select;
  }

  /**
   * Create pattern selector dropdown
   */
  public createPatternSelector(): HTMLElement {
    const select = document.createElement('select');
    select.id = 'pattern-selector';
    select.className = 'pattern-selector';

    BREATHING_PATTERNS.forEach(pattern => {
      const option = document.createElement('option');
      option.value = pattern.id;
      option.textContent = pattern.name;

      select.appendChild(option);
    });

    return select;
  }

  /**
   * Create theme selector dropdown
   */
  public createThemeSelector(): HTMLElement {
    const select = document.createElement('select');
    select.id = 'theme-selector';
    select.className = 'theme-selector';

    VISUAL_THEMES.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      select.appendChild(option);
    });

    return select;
  }

  /**
   * Get element by ID
   */
  public getElement(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  /**
   * Get multiple elements by IDs
   */
  public getElements(...ids: string[]): Map<string, HTMLElement> {
    const elements = new Map<string, HTMLElement>();
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) elements.set(id, el);
    });
    return elements;
  }
}
