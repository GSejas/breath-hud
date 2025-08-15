# Configuration Guide

Complete reference for all configuration options and settings.

## Configuration Files

### `user-config.json` (User Settings)
Primary configuration file for user customizations:

```json
{
  "editModeScale": 3,
  "description": "User configuration for Breathing HUD",
  "features": {
    "editModeScale": {
      "description": "Scale multiplier when entering edit mode (1-20)",
      "default": 3,
      "min": 1,
      "max": 20
    }
  }
}
```

### `enhanced-hud-config.json` (Application Settings)
System-level configuration for window and behavior:

```json
{
  "window": {
    "width": 300,
    "height": 300,
    "transparent": true,
    "alwaysOnTop": true,
    "frame": false,
    "resizable": true
  },
  "appearance": {
    "background": "rgba(0, 0, 0, 0.8)",
    "borderColor": "rgba(255, 255, 255, 0.3)",
    "opacity": 1.0
  }
}
```

## Configuration System

### ConfigManager Class
The application uses a centralized configuration system:

```typescript
import { ConfigManager } from './config-manager';

const config = ConfigManager.getInstance();
const currentConfig = config.getConfig();
```

### Configuration Interfaces

#### AppearanceConfig
```typescript
interface AppearanceConfig {
  reduceMotion: boolean;      // Accessibility: reduced motion
  theme: string;              // Color theme identifier  
  scale: number;              // UI scale factor (0.5-2.0)
  opacity: number;            // Window opacity (0.1-1.0)
}
```

#### BreathingConfig  
```typescript
interface BreathingConfig {
  defaultShape: string;       // Initial breathing shape
  defaultPattern: string;     // Initial breathing pattern
  defaultIntensity: number;   // Animation intensity (0.1-1.0)
  enableSound: boolean;       // Audio cues enabled
}
```

#### AccessibilityConfig
```typescript
interface AccessibilityConfig {
  respectSystemReducedMotion: boolean;  // Follow OS settings
  highContrast: boolean;                // Enhanced contrast mode
  largeText: boolean;                   // Larger text sizing
}
```

## Breathing Parameters

### Real-time Configuration (Advanced Mode)

#### Base Size
- **Range**: 0.2 - 1.2
- **Default**: 0.6
- **Description**: Neutral size of breathing circle
- **Effect**: Starting point for breathing animation

#### Inhale Maximum
- **Range**: 0.4 - 2.0  
- **Default**: 1.0
- **Description**: Maximum expansion during inhale phase
- **Effect**: Peak size of breathing circle

#### Exhale Minimum
- **Range**: 0.1 - 1.0
- **Default**: 0.3
- **Description**: Minimum contraction during exhale phase
- **Effect**: Smallest size of breathing circle

### Configuration Validation
```typescript
// Base size constraints
const baseSize = Math.max(0.2, Math.min(1.2, value));

// Inhale max must be >= base size
const inhaleMax = Math.max(baseSize, Math.min(2.0, value));

// Exhale min must be <= base size  
const exhaleMin = Math.max(0.1, Math.min(baseSize, value));
```

## Accessibility Settings

### Reduced Motion
**System Detection**:
```typescript
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const respectSystemSetting = config.accessibility.respectSystemReducedMotion;

if (respectSystemSetting && mediaQuery.matches) {
  // Apply reduced motion alternatives
  config.appearance.reduceMotion = true;
}
```

**Manual Override**:
```typescript
config.updateAppearance({ reduceMotion: true });
```

### High Contrast Mode
```typescript
config.updateAccessibility({ 
  highContrast: true,
  largeText: true 
});
```

## Theme Configuration

### Built-in Themes
```typescript
const themes = {
  ocean: {
    primary: "rgba(74, 144, 226, 0.8)",
    secondary: "rgba(100, 200, 255, 0.6)", 
    accent: "rgba(150, 220, 255, 1.0)",
    background: "rgba(0, 50, 100, 0.1)"
  },
  forest: {
    primary: "rgba(76, 175, 80, 0.8)",
    secondary: "rgba(129, 199, 132, 0.6)",
    accent: "rgba(165, 214, 167, 1.0)",
    background: "rgba(27, 94, 32, 0.1)"
  }
};
```

### Custom Theme Creation
```typescript
const customTheme = {
  primary: "rgba(255, 64, 129, 0.8)",     // Main breathing circle color
  secondary: "rgba(255, 138, 101, 0.6)",  // Secondary UI elements
  accent: "rgba(255, 171, 64, 1.0)",      // Highlights and accents
  background: "rgba(66, 66, 66, 0.1)"     // Background tint
};

config.updateAppearance({ theme: 'custom' });
```

## Mode-Specific Settings

### Edit Mode Configuration
```json
{
  "editModeScale": 3,
  "editMode": {
    "dragSensitivity": 1.0,
    "snapToGrid": false,
    "gridSize": 10,
    "showHelpers": true
  }
}
```

### Zen Mode Settings
```typescript
const zenConfig = {
  autoHideDelay: 300,        // ms before hiding controls
  showHintDot: true,         // Show subtle control hint
  hintPulseDuration: 3000,   // ms for hint animation
  allowHover: true           // Enable hover to reveal
};
```

### Advanced Mode Features
```typescript
const advancedConfig = {
  showSliders: true,         // Show breathing parameter sliders
  showDebugInfo: false,      // Display performance metrics
  enableHotkeys: true,       // Keyboard shortcuts
  showTooltips: true         // Help text on hover
};
```

## Storage and Persistence

### LocalStorage Structure
```typescript
const storageKey = 'breathingHudConfig';
const savedConfig = {
  appearance: { /* AppearanceConfig */ },
  breathing: { /* BreathingConfig */ },
  accessibility: { /* AccessibilityConfig */ },
  editModeScale: 3,
  version: "1.0.0",
  lastModified: "2025-01-15T10:30:00Z"
};
```

### Configuration Loading Order
1. **Default Configuration**: Built-in sensible defaults
2. **System Preferences**: OS accessibility settings
3. **Saved Configuration**: LocalStorage user preferences  
4. **File Configuration**: JSON configuration files
5. **Runtime Updates**: Real-time slider adjustments

### Backup and Export
```typescript
// Export current configuration
const configManager = ConfigManager.getInstance();
const exportedConfig = configManager.exportConfig();

// Import configuration from backup
const success = configManager.importConfig(backupConfigString);
```

## Performance Settings

### Animation Quality
```typescript
const performanceConfig = {
  targetFPS: 60,             // Desired frame rate
  adaptiveQuality: true,     // Auto-adjust based on performance
  maxFrameTime: 16.67,       // Max ms per frame (60fps)
  backgroundFPS: 30          // Reduced rate when not focused
};
```

### Resource Limits
```typescript
const resourceLimits = {
  maxCanvasSize: 1024,       // Maximum canvas dimensions
  maxAnimationLayers: 3,     // Concurrent animations
  memoryThreshold: 100,      // MB before cleanup
  gcInterval: 30000          // ms between garbage collection hints
};
```

## Troubleshooting

### Reset Configuration
```typescript
const configManager = ConfigManager.getInstance();
configManager.resetToDefaults();
```

### Configuration Validation
```typescript
// Check if configuration is valid
const isValid = configManager.validateConfig(userConfig);

// Get validation errors
const errors = configManager.getValidationErrors(userConfig);
```

### Debug Configuration
```typescript
// Enable debug mode
config.updateConfig({ debug: true });

// Log current configuration
console.log('Current config:', config.getConfig());

// Monitor configuration changes
config.onConfigChange((newConfig) => {
  console.log('Config updated:', newConfig);
});
```