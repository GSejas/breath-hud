import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  pin: () => ipcRenderer.invoke('window:pin'),
  unpin: () => ipcRenderer.invoke('window:unpin'),
  setClickThrough: (enabled: boolean) => ipcRenderer.invoke('window:set-click-through', enabled),

  // Configuration
  loadConfig: () => ipcRenderer.invoke('config:load'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),

  // Breathing controls
  startBreathing: (pattern: string) => ipcRenderer.invoke('breathing:start', pattern),
  stopBreathing: () => ipcRenderer.invoke('breathing:stop'),
  
  // Breathing engine API - proxied through main process
  createBreathingEngine: () => ipcRenderer.invoke('breathing:create-engine'),
  createSvgRenderer: (element: any) => ipcRenderer.invoke('breathing:create-renderer'),
  getPresets: () => ipcRenderer.invoke('breathing:get-presets'),

  // Event listeners
  onSettingsChanged: (callback: (settings: any) => void) => {
    ipcRenderer.on('settings:changed', (_event, settings) => callback(settings));
  },

  onBreathingStateChanged: (callback: (state: any) => void) => {
    ipcRenderer.on('breathing:state-changed', (_event, state) => callback(state));
  },

  // HUD hotkey events
  onAttention: (callback: () => void) => {
    ipcRenderer.on('hud:attention', () => callback());
  },
  onAttentionEnd: (callback: () => void) => {
    ipcRenderer.on('hud:attention:end', () => callback());
  },
  onTogglePin: (callback: () => void) => {
    ipcRenderer.on('hud:toggle-pin', () => callback());
  },
});

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: {
      minimize: () => Promise<void>;
      close: () => Promise<void>;
      pin: () => Promise<void>;
      unpin: () => Promise<void>;
      setClickThrough: (enabled: boolean) => Promise<void>;
      loadConfig: () => Promise<any>;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<void>;
      startBreathing: (pattern: string) => Promise<void>;
      stopBreathing: () => Promise<void>;
      onSettingsChanged: (callback: (settings: any) => void) => void;
      onBreathingStateChanged: (callback: (state: any) => void) => void;
      onAttention: (callback: () => void) => void;
      onAttentionEnd: (callback: () => void) => void;
      onTogglePin: (callback: () => void) => void;
    };
  }
}
