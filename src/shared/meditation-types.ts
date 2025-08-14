// Enhanced breathing meditation system types

export interface BreathingShape {
  id: string;
  name: string;
  type: 'circle' | 'triangle' | 'square' | 'star' | 'heart' | 'lotus';
  svgPath?: string;
  description: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  type: 'relaxing' | 'active' | 'flow' | 'custom';
  phases: BreathingPhase[];
  description: string;
  duration: number; // total cycle time in seconds
}

export interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'pause';
  duration: number; // in seconds
  intensity: number; // 0-1 scale
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  effects: {
    glow: boolean;
    pulse: boolean;
    gradient: boolean;
  };
}

export interface AudioConfig {
  enabled: boolean;
  volume: number; // 0-1
  sounds: {
    inhale?: string;
    exhale?: string;
    chime?: boolean;
  };
  voice: {
    enabled: boolean;
    language: string;
    volume: number;
  };
}

export interface MeditationConfig {
  mode: 'zen' | 'basic' | 'advanced' | 'config';
  currentShape: string;
  currentPattern: string;
  currentTheme: string;
  scale: number; // 0.5-2.0 size multiplier
  intensity: number; // 0-1 breathing intensity
  audio: AudioConfig;
  availableShapes: string[];
  availablePatterns: string[];
  availableThemes: string[];
}

export interface UIState {
  isPinned: boolean;
  isControlsVisible: boolean;
  currentMode: 'zen' | 'basic' | 'advanced' | 'config';
  isTransitioning: boolean;
}