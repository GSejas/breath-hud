import { readFileSync } from 'fs';
import { join } from 'path';

export interface HudConfig {
  appearance: {
    theme: string;
    opacity: number;
    pinnedOpacity: number;
    background: string;
    pinnedBackground: string;
    borderColor: string;
    pinnedBorderColor: string;
  };
  window: {
    width: number;
    height: number;
    transparent: boolean;
    alwaysOnTop: boolean;
    position: {
      x: number;
      y: number;
    };
  };
  breathing: {
    shape: {
      color: string;
      glowColor: string;
      pinnedColor: string;
      size: number;
    };
    animation: {
      duration: string;
      easing: string;
    };
  };
  controls: {
    pinButton: {
      size: number;
      normalColor: string;
      pinnedColor: string;
      hoverScale: number;
    };
  };
}

export class ConfigManager {
  private static config: HudConfig | null = null;

  public static loadConfig(): HudConfig {
    if (this.config) return this.config;

    try {
      const configPath = join(__dirname, '../../hud-config.json');
      const configData = readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('Loaded HUD config from file');
      return this.config!;
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      return this.getDefaultConfig();
    }
  }

  private static getDefaultConfig(): HudConfig {
    return {
      appearance: {
        theme: 'dark',
        opacity: 0.8,
        pinnedOpacity: 0.3,
        background: 'rgba(0, 0, 0, 0.8)',
        pinnedBackground: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        pinnedBorderColor: 'rgba(255, 255, 255, 0.1)',
      },
      window: {
        width: 300,
        height: 300,
        transparent: true,
        alwaysOnTop: true,
        position: { x: 100, y: 100 },
      },
      breathing: {
        shape: {
          color: 'rgba(74, 144, 226, 0.8)',
          glowColor: 'rgba(74, 144, 226, 0.4)',
          pinnedColor: 'rgba(74, 144, 226, 0.3)',
          size: 100,
        },
        animation: {
          duration: '4s',
          easing: 'ease-in-out',
        },
      },
      controls: {
        pinButton: {
          size: 20,
          normalColor: 'rgba(255, 255, 255, 0.7)',
          pinnedColor: 'rgba(255, 215, 0, 0.9)',
          hoverScale: 1.1,
        },
      },
    };
  }
}
