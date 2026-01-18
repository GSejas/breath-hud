/**
 * Theme configuration type definitions
 */

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
