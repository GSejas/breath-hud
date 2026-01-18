/**
 * Theme Controller
 * Manages application themes and CSS variables
 */

import type { StateManager } from '../../services';

export interface ThemeVariables {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export class ThemeController {
  private currentTheme: string = 'ocean';
  private themes: Map<string, Partial<ThemeVariables>> = new Map();
  private stateManager: StateManager | null = null;

  constructor() {
    this.initializeBuiltInThemes();
  }

  /**
   * Set state manager for updates
   */
  setStateManager(manager: StateManager): void {
    this.stateManager = manager;
  }

  /**
   * Switch to a theme by name
   */
  switchTheme(name: string): void {
    if (!this.themes.has(name)) {
      console.warn(`Theme "${name}" not found`);
      return;
    }

    this.currentTheme = name;
    const variables = this.themes.get(name);
    if (variables) {
      this.applyThemeVariables(variables);
    }

    if (this.stateManager) {
      this.stateManager.update('currentTheme', name);
    }
  }

  /**
   * Apply theme variables to document
   */
  applyThemeVariables(variables: Partial<ThemeVariables>): void {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }

  /**
   * Register a custom theme
   */
  registerTheme(name: string, variables: Partial<ThemeVariables>): void {
    this.themes.set(name, variables);
  }

  /**
   * Get all available theme names
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Get theme variables by name
   */
  getThemeVariables(name: string): Partial<ThemeVariables> | null {
    return this.themes.get(name) || null;
  }

  /**
   * Get current theme name
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Initialize built-in themes
   */
  private initializeBuiltInThemes(): void {
    this.themes.set('ocean', this.getOceanTheme());
    this.themes.set('forest', this.getForestTheme());
    this.themes.set('sunset', this.getSunsetTheme());
    this.themes.set('moonlight', this.getMoonlightTheme());
    this.themes.set('minimal', this.getMinimalTheme());
  }

  private getOceanTheme(): Partial<ThemeVariables> {
    return {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155'
    };
  }

  private getForestTheme(): Partial<ThemeVariables> {
    return {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#4ade80',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155'
    };
  }

  private getSunsetTheme(): Partial<ThemeVariables> {
    return {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155'
    };
  }

  private getMoonlightTheme(): Partial<ThemeVariables> {
    return {
      primary: '#818cf8',
      secondary: '#6366f1',
      accent: '#a5b4fc',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155'
    };
  }

  private getMinimalTheme(): Partial<ThemeVariables> {
    return {
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      border: '#e2e8f0'
    };
  }
}