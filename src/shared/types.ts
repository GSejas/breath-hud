/**
 * HUD Type Definitions
 * Complete interfaces for all HUD components to ensure proper testing
 */

import { BrowserWindow } from 'electron';

// Configuration Interfaces
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

// Main Process Interfaces
export interface IHudApplication {
  getMainWindow(): BrowserWindow | null;
  createWindow(): void;
  registerShortcuts(): void;
  setupAppEvents(): void;
  setupIPC(): void;
  // Additional methods for testing
  initialize?(): Promise<void>;
  showWindow?(): Promise<void>;
  hideWindow?(): Promise<void>;
  togglePin?(): Promise<void>;
  setAttentionMode?(enabled: boolean): Promise<void>;
  startBreathing?(pattern: string): Promise<void>;
  stopBreathing?(): Promise<void>;
  getBreathingState?(): BreathingState;
  isPinnedMode?(): boolean;
  cleanup?(): Promise<void>;
}

export interface HudWindowOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  alwaysOnTop?: boolean;
  frame?: boolean;
  transparent?: boolean;
  resizable?: boolean;
}

export interface BreathingState {
  isBreathing: boolean;
  pattern: string;
  phase?: 'inhale' | 'hold' | 'exhale' | 'rest';
  duration?: number;
}

// IPC Handler Interfaces
export interface IIPCHandlers {
  setupIPCHandlers(hudApp: IHudApplication): void;
}

export interface IPCWindowControls {
  minimize: () => Promise<{ success: boolean }>;
  close: () => Promise<{ success: boolean }>;
  pin: () => Promise<{ success: boolean }>;
  unpin: () => Promise<{ success: boolean }>;
  setClickThrough: (enabled: boolean) => Promise<{ success: boolean }>;
}

export interface IPCConfigHandlers {
  loadConfig: () => Promise<HudConfig>;
}

// Renderer Process Interfaces
export interface IRendererApp {
  loadConfig(): Promise<void>;
  applyConfigStyling(): void;
  togglePin(): Promise<void>;
  updateStatus(): void;
  closeHUD(): Promise<void>;
  initializeApp(): Promise<void>;
}

export interface RendererConfig {
  appearance: {
    unpinned: {
      background: string;
      border: string;
      opacity: number;
    };
    pinned: {
      background: string;
      border: string;
      opacity: number;
    };
    shape: {
      color: string;
      glow: string;
    };
  };
  breathing: {
    animationDuration: string;
    scaleMin: number;
    scaleMax: number;
    opacityMin: number;
    opacityMax: number;
  };
}

// Preload Bridge Interfaces
export interface ElectronAPI {
  // Window controls
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  pin: () => Promise<void>;
  unpin: () => Promise<void>;
  setClickThrough: (enabled: boolean) => Promise<void>;

  // Configuration
  loadConfig: () => Promise<HudConfig>;

  // Settings
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<void>;

  // Breathing controls
  startBreathing: (pattern: string) => Promise<void>;
  stopBreathing: () => Promise<void>;

  // Event listeners
  onSettingsChanged: (callback: (settings: any) => void) => void;
  onBreathingStateChanged: (callback: (state: any) => void) => void;
  onAttention: (callback: () => void) => void;
  onAttentionEnd: (callback: () => void) => void;
  onTogglePin: (callback: () => void) => void;
}

// UI Elements Interfaces
export interface HudUIElements {
  getContainer(): any;
  getPinButton(): any;
  getBreathingCircle(): any;
  getStatusText(): any;
  getCloseButton(): any;
  initializeElements(): void;
  applyUnpinnedStyles(): void;
  applyPinnedStyles(): void;
  setupEventListeners(): void;
  updateStatusText(text: string): void;
  setBreathingAnimation(enabled: boolean): void;
  getStyles(): HudStyles;
}

export interface HudStyles {
  unpinned: {
    background: string;
    border: string;
    opacity: number;
  };
  pinned: {
    background: string;
    border: string;
    opacity: number;
  };
}

// Preload Bridge Interfaces
export interface IPreloadBridge {
  exposeAPI(): void;
  getAPI(): ElectronAPI;
}

// Test Utilities
export interface MockElectronAPI extends Partial<ElectronAPI> {
  // Helper for testing
  _triggerEvent: (event: string, ...args: any[]) => void;
  _reset: () => void;
}

export interface TestHudConfig extends Partial<HudConfig> {
  // Minimal valid config for testing
}

// Global Shortcut Interfaces
export interface GlobalShortcutHandlers {
  attention: () => void; // Ctrl+Alt+B
  togglePin: () => void; // Ctrl+Alt+P
  showHide: () => void; // Ctrl+Alt+H
}

// CSS Variable Mappings
export interface CSSVariables {
  '--hud-background': string;
  '--hud-border': string;
  '--hud-opacity': string;
  '--shape-color': string;
  '--shape-glow': string;
}

// Animation State
export interface AnimationState {
  isPinned: boolean;
  isAttentionActive: boolean;
  breathingDuration: string;
  scaleRange: [number, number];
  opacityRange: [number, number];
}

// Event Handler Types
export type HotKeyEventHandler = () => void;
export type ConfigChangeHandler = (config: HudConfig) => void;
export type PinStateHandler = (isPinned: boolean) => void;
export type AttentionHandler = () => void;

// Error Types
export class HudConfigError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'HudConfigError';
  }
}

export class HudIPCError extends Error {
  constructor(
    message: string,
    public readonly channel?: string
  ) {
    super(message);
    this.name = 'HudIPCError';
  }
}

export class HudWindowError extends Error {
  constructor(
    message: string,
    public readonly windowId?: number
  ) {
    super(message);
    this.name = 'HudWindowError';
  }
}
