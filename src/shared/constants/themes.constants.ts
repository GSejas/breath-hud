/**
 * Available visual themes
 */

import type { ThemeConfig } from '../types/theme.types';

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
    effects: { glow: true, pulse: false, gradient: false }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: 'rgba(76, 175, 80, 0.8)',
      secondary: 'rgba(129, 199, 132, 0.6)',
      background: 'rgba(27, 94, 32, 0.1)',
      accent: 'rgba(165, 214, 167, 1.0)'
    },
    effects: { glow: true, pulse: false, gradient: false }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: 'rgba(255, 152, 0, 0.8)',
      secondary: 'rgba(255, 167, 38, 0.6)',
      background: 'rgba(230, 124, 15, 0.1)',
      accent: 'rgba(255, 204, 188, 1.0)'
    },
    effects: { glow: true, pulse: true, gradient: true }
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    colors: {
      primary: 'rgba(156, 39, 176, 0.8)',
      secondary: 'rgba(186, 104, 200, 0.6)',
      background: 'rgba(75, 0, 130, 0.1)',
      accent: 'rgba(206, 146, 213, 1.0)'
    },
    effects: { glow: true, pulse: true, gradient: false }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(200, 200, 200, 0.6)',
      background: 'rgba(50, 50, 50, 0.1)',
      accent: 'rgba(230, 230, 230, 1.0)'
    },
    effects: { glow: false, pulse: false, gradient: false }
  }
];
