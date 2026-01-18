/**
 * Configuration Service
 * Handles loading and caching of configuration files (hud-config.json, enhanced-hud-config.json, user-config.json)
 * Provides unified access to app configuration with fallback chain: user > enhanced > default
 */

export interface ConfigData {
  breathing?: {
    defaultPattern?: string;
    defaultShape?: string;
    defaultTheme?: string;
  };
  ui?: {
    defaultScale?: number;
    autoFade?: boolean;
    fadeDelay?: number;
  };
  [key: string]: unknown;
}

export class ConfigService {
  private config: ConfigData = {};
  private cache: Map<string, ConfigData> = new Map();
  private loadTime: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  constructor() {
    this.initializeConfig();
  }

  /**
   * Initialize configuration by loading default config
   */
  private initializeConfig(): void {
    this.config = this.getDefaultConfig();
    this.loadTime = Date.now();
  }

  /**
   * Load configuration from file
   * @param configPath Path to config file (e.g., 'hud-config.json')
   * @returns Promise<ConfigData>
   */
  async loadConfig(configPath: string): Promise<ConfigData> {
    // Check cache first
    if (this.cache.has(configPath)) {
      const cached = this.cache.get(configPath);
      if (Date.now() - this.loadTime < this.CACHE_DURATION) {
        return cached!;
      }
    }

    try {
      // In production, would use ipcRenderer or fetch
      const response = await fetch(`/configs/${configPath}`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${configPath}`);
      }

      const config = await response.json() as ConfigData;
      this.cache.set(configPath, config);
      return config;
    } catch (error) {
      console.warn(`Failed to load ${configPath}, using defaults`, error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Merge configurations with override chain
   * @param configs Array of configs to merge [base, ...overrides]
   * @returns Merged configuration
   */
  mergeConfigs(...configs: ConfigData[]): ConfigData {
    const merged: ConfigData = {};

    for (const config of configs) {
      for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const existing = merged[key];
          merged[key] = { ...(typeof existing === 'object' && existing !== null ? existing : {}), ...value };
        } else {
          merged[key] = value;
        }
      }
    }

    return merged;
  }

  /**
   * Get configuration value by path (e.g., 'breathing.defaultPattern')
   * @param path Dot-separated path
   * @returns Configuration value or undefined
   */
  get(path: string): unknown {
    const keys = path.split('.');
    let current: unknown = this.config;

    for (const key of keys) {
      if (typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Set configuration value by path
   * @param path Dot-separated path
   * @param value Value to set
   */
  set(path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) return;

    let current: unknown = this.config;

    for (const key of keys) {
      if (!(key in (current as Record<string, unknown>))) {
        (current as Record<string, unknown>)[key] = {};
      }
      current = (current as Record<string, unknown>)[key];
    }

    (current as Record<string, unknown>)[lastKey] = value;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadTime = 0;
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.config = this.getDefaultConfig();
    this.clearCache();
  }

  /**
   * Get current configuration
   */
  getConfig(): ConfigData {
    return { ...this.config };
  }

  /**
   * Set entire configuration
   * @param config Full configuration object
   */
  setConfig(config: ConfigData): void {
    this.config = { ...config };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ConfigData {
    return {
      breathing: {
        defaultPattern: 'zen',
        defaultShape: 'circle',
        defaultTheme: 'ocean'
      },
      ui: {
        defaultScale: 1,
        autoFade: true,
        fadeDelay: 3000
      }
    };
  }

  /**
   * Check if config has value
   * @param path Dot-separated path
   */
  has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  /**
   * Get config section (e.g., 'breathing')
   * @param section Section name
   */
  getSection(section: string): ConfigData | undefined {
    return this.get(section) as ConfigData | undefined;
  }
}
