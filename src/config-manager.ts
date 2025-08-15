// Configuration Manager for Breathing HUD
// Handles user preferences, accessibility settings, and app configuration

export interface AppearanceConfig {
  reduceMotion: boolean;
  theme: string;
  scale: number;
  opacity: number;
}

export interface BreathingConfig {
  defaultShape: string;
  defaultPattern: string;
  defaultIntensity: number;
  enableSound: boolean;
  sequenceEnabled: boolean;
  currentSequence: string;
  patternCyclingEnabled: boolean;
}

export interface AccessibilityConfig {
  respectSystemReducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export interface HudConfig {
  appearance: AppearanceConfig;
  breathing: BreathingConfig;
  accessibility: AccessibilityConfig;
  editModeScale: number;
  version: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: HudConfig;
  private changeListeners: Array<(config: HudConfig) => void> = [];

  private constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
    this.detectSystemPreferences();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private getDefaultConfig(): HudConfig {
    return {
      appearance: {
        reduceMotion: false,
        theme: 'ocean',
        scale: 1.0,
        opacity: 0.8
      },
      breathing: {
        defaultShape: 'circle',
        defaultPattern: 'zen-simple',
        defaultIntensity: 0.7,
        enableSound: false,
        sequenceEnabled: true,
        currentSequence: 'training-sequence',
        patternCyclingEnabled: true
      },
      accessibility: {
        respectSystemReducedMotion: true,
        highContrast: false,
        largeText: false
      },
      editModeScale: 3,
      version: '1.0.0'
    };
  }

  private detectSystemPreferences() {
    // Detect OS reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const updateReducedMotion = () => {
        if (this.config.accessibility.respectSystemReducedMotion) {
          const wasReducedMotion = this.config.appearance.reduceMotion;
          this.config.appearance.reduceMotion = mediaQuery.matches;
          
          if (wasReducedMotion !== this.config.appearance.reduceMotion) {
            console.log(`System reduced motion preference changed: ${this.config.appearance.reduceMotion}`);
            this.notifyListeners();
          }
        }
      };

      // Set initial value
      updateReducedMotion();

      // Listen for changes
      mediaQuery.addEventListener('change', updateReducedMotion);
    }
  }

  public loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('breathingHudConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.getDefaultConfig(), ...parsed };
        console.log('Configuration loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.config = this.getDefaultConfig();
    }
  }

  public saveConfig(): void {
    try {
      localStorage.setItem('breathingHudConfig', JSON.stringify(this.config));
      console.log('Configuration saved to localStorage');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  public getConfig(): HudConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<HudConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  public updateAppearance(updates: Partial<AppearanceConfig>): void {
    this.config.appearance = { ...this.config.appearance, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  public updateBreathing(updates: Partial<BreathingConfig>): void {
    this.config.breathing = { ...this.config.breathing, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  public updateAccessibility(updates: Partial<AccessibilityConfig>): void {
    this.config.accessibility = { ...this.config.accessibility, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  public isReducedMotionEnabled(): boolean {
    return this.config.appearance.reduceMotion;
  }

  public shouldRespectSystemReducedMotion(): boolean {
    return this.config.accessibility.respectSystemReducedMotion;
  }

  public getEditModeScale(): number {
    return Math.max(1, Math.min(20, this.config.editModeScale));
  }

  public setEditModeScale(scale: number): void {
    this.config.editModeScale = Math.max(1, Math.min(20, scale));
    this.saveConfig();
    this.notifyListeners();
  }

  public onConfigChange(listener: (config: HudConfig) => void): void {
    this.changeListeners.push(listener);
  }

  public removeConfigChangeListener(listener: (config: HudConfig) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }

  public resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.detectSystemPreferences(); // Re-apply system preferences
    this.saveConfig();
    this.notifyListeners();
    console.log('Configuration reset to defaults');
  }

  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      this.config = { ...this.getDefaultConfig(), ...imported };
      this.saveConfig();
      this.notifyListeners();
      console.log('Configuration imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Convenience function to get the singleton instance
export const getConfigManager = () => ConfigManager.getInstance();