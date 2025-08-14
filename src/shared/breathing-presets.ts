import { BreathingShape, BreathingPattern, ThemeConfig } from './meditation-types';

// Breathing Shapes Collection
export const BREATHING_SHAPES: BreathingShape[] = [
  {
    id: 'circle',
    name: 'Circle',
    type: 'circle',
    description: 'Classic circular breathing - smooth and continuous'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    type: 'triangle',
    svgPath: 'M100,20 L180,160 L20,160 Z',
    description: 'Sharp focus breathing - three-point concentration'
  },
  {
    id: 'square',
    name: 'Square',
    type: 'square',
    svgPath: 'M40,40 L160,40 L160,160 L40,160 Z',
    description: 'Box breathing visualization - structured and balanced'
  },
  {
    id: 'star',
    name: 'Star',
    type: 'star',
    svgPath: 'M100,20 L112,68 L160,68 L122,100 L135,148 L100,120 L65,148 L78,100 L40,68 L88,68 Z',
    description: 'Energy breathing - radiating vitality'
  },
  {
    id: 'heart',
    name: 'Heart',
    type: 'heart',
    svgPath: 'M100,160 C100,160 60,120 60,90 C60,70 80,50 100,60 C120,50 140,70 140,90 C140,120 100,160 100,160 Z',
    description: 'Loving-kindness breathing - heart-centered meditation'
  },
  {
    id: 'lotus',
    name: 'Lotus',
    type: 'lotus',
    svgPath: 'M100,50 C80,50 70,70 80,90 L90,100 L100,80 L110,100 L120,90 C130,70 120,50 100,50 Z M70,90 C50,90 40,110 50,130 L100,110 L50,130 C40,110 50,90 70,90 Z M130,90 C150,90 160,110 150,130 L100,110 L150,130 C160,110 150,90 130,90 Z',
    description: 'Lotus breathing - spiritual awakening and growth'
  }
];

// Breathing Patterns Collection
export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'relaxing-478',
    name: '4-7-8 Relaxing',
    type: 'relaxing',
    description: 'Calming pattern for stress relief and sleep preparation',
    duration: 19,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.8 },
      { name: 'hold', duration: 7, intensity: 1.0 },
      { name: 'exhale', duration: 8, intensity: 0.4 }
    ]
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    type: 'active',
    description: 'Equal timing pattern for focus and clarity',
    duration: 16,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.7 },
      { name: 'hold', duration: 4, intensity: 1.0 },
      { name: 'exhale', duration: 4, intensity: 0.3 },
      { name: 'pause', duration: 4, intensity: 0.0 }
    ]
  },
  {
    id: 'energizing-321',
    name: '3-2-1 Energizing',
    type: 'active',
    description: 'Quick energizing pattern for alertness',
    duration: 6,
    phases: [
      { name: 'inhale', duration: 3, intensity: 0.9 },
      { name: 'hold', duration: 2, intensity: 1.0 },
      { name: 'exhale', duration: 1, intensity: 0.2 }
    ]
  },
  {
    id: 'flow-natural',
    name: 'Natural Flow',
    type: 'flow',
    description: 'Organic breathing rhythm following natural patterns',
    duration: 12,
    phases: [
      { name: 'inhale', duration: 5, intensity: 0.6 },
      { name: 'pause', duration: 1, intensity: 0.9 },
      { name: 'exhale', duration: 6, intensity: 0.3 }
    ]
  },
  {
    id: 'zen-simple',
    name: 'Zen Breathing',
    type: 'relaxing',
    description: 'Minimal zen practice - just breathe',
    duration: 8,
    phases: [
      { name: 'inhale', duration: 4, intensity: 0.5 },
      { name: 'exhale', duration: 4, intensity: 0.2 }
    ]
  }
];

// Visual Themes Collection  
export const VISUAL_THEMES: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: 'rgba(74, 144, 226, 0.8)',
      secondary: 'rgba(100, 200, 255, 0.6)',
      background: 'rgba(0, 50, 100, 0.1)',
      accent: 'rgba(150, 220, 255, 1.0)'
    },
    effects: {
      glow: true,
      pulse: true,
      gradient: true
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: 'rgba(76, 175, 80, 0.8)',
      secondary: 'rgba(139, 195, 74, 0.6)',
      background: 'rgba(27, 94, 32, 0.1)',
      accent: 'rgba(200, 230, 201, 1.0)'
    },
    effects: {
      glow: true,
      pulse: false,
      gradient: true
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: 'rgba(255, 112, 67, 0.8)',
      secondary: 'rgba(255, 183, 77, 0.6)',
      background: 'rgba(191, 54, 12, 0.1)',
      accent: 'rgba(255, 224, 178, 1.0)'
    },
    effects: {
      glow: true,
      pulse: true,
      gradient: true
    }
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    colors: {
      primary: 'rgba(187, 134, 252, 0.8)',
      secondary: 'rgba(224, 176, 255, 0.6)',
      background: 'rgba(74, 20, 140, 0.1)',
      accent: 'rgba(243, 229, 245, 1.0)'
    },
    effects: {
      glow: true,
      pulse: true,
      gradient: false
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(200, 200, 200, 0.6)',
      background: 'rgba(0, 0, 0, 0.1)',
      accent: 'rgba(255, 255, 255, 1.0)'
    },
    effects: {
      glow: false,
      pulse: false,
      gradient: false
    }
  }
];