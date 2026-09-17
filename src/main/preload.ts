import { contextBridge, ipcRenderer } from 'electron';
import type { EditorDraft } from '../shared/types/editor.types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  pin: () => ipcRenderer.invoke('window:pin'),
  unpin: () => ipcRenderer.invoke('window:unpin'),
  setClickThrough: (enabled: boolean) => ipcRenderer.invoke('window:set-click-through', enabled),
  resize: (size: number) => ipcRenderer.invoke('window:resize', size),

  // Minimal editor window and draft bridge
  openEditor: () => ipcRenderer.invoke('editor:open'),
  closeEditor: () => ipcRenderer.invoke('editor:close'),
  saveEditorDraft: (draft: EditorDraft) => ipcRenderer.invoke('editor:save-draft', draft),

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
  onEditorDraftApplied: (callback: (draft: EditorDraft) => void) => {
    ipcRenderer.on('hud:editor-draft-applied', (_event, draft) => callback(draft));
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
      resize: (size: number) => Promise<{ success: boolean; width: number; height: number }>;
      openEditor: () => Promise<{ success: boolean }>;
      closeEditor: () => Promise<{ success: boolean }>;
      saveEditorDraft: (draft: EditorDraft) => Promise<{ success: boolean; draft: EditorDraft }>;
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
      onEditorDraftApplied: (callback: (draft: EditorDraft) => void) => void;
    };
  }
}
