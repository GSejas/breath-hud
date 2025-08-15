# API Reference

Technical documentation for Breathing HUD classes, methods, and interfaces.

## Core Classes

### EnhancedBreathingEngine

Main Canvas2D rendering engine for breathing visualization.

#### Constructor
```typescript
class EnhancedBreathingEngine {
  constructor(canvasElement: HTMLCanvasElement)
}
```

#### Properties
```typescript
public shapePosition: { x: number, y: number }
private canvasContext: CanvasRenderingContext2D
private currentValue: number
private baseSize: number
private inhaleMax: number
private exhaleMin: number
```

#### Methods

##### `renderShape(): void`
Renders the current breathing shape with solid fill and glow effects.

**Implementation**:
- Clears canvas with `clearRect()`
- Applies layered shadow effects for glow
- Fills shape with primary theme color
- Adds multiple glow layers (outer, inner, core)

##### `createShapeElement(): HTMLCanvasElement`
Creates and configures the Canvas2D element for rendering.

**Returns**: Configured canvas element with proper dimensions and context

##### `calculateBreathingValue(phase: BreathingPhase, progress: number, intensity: number): number`
Calculates current breathing animation value based on phase and progress.

**Parameters**:
- `phase`: Current breathing phase object
- `progress`: Phase progress (0.0 - 1.0)
- `intensity`: Animation intensity multiplier

**Returns**: Interpolated breathing value for current frame

##### `cubicEaseInOut(t: number): number`
Cubic easing function for smooth breathing transitions.

**Formula**: `t < 0.5 ? 4 * t³ : 1 - Math.pow(-2 * t + 2, 3) / 2`

##### `lerp(start: number, end: number, factor: number): number`
Linear interpolation with velocity-based smoothing.

**Parameters**:
- `start`: Starting value
- `end`: Target value  
- `factor`: Interpolation factor (0.0 - 1.0)

### ConfigManager

Singleton configuration management system.

#### Singleton Access
```typescript
const config = ConfigManager.getInstance();
```

#### Configuration Interfaces

##### `HudConfig`
```typescript
interface HudConfig {
  appearance: AppearanceConfig;
  breathing: BreathingConfig;
  accessibility: AccessibilityConfig;
  editModeScale: number;
  version: string;
}
```

##### `AppearanceConfig`
```typescript
interface AppearanceConfig {
  reduceMotion: boolean;      // Accessibility: reduced motion
  theme: string;              // Color theme identifier
  scale: number;              // UI scale factor (0.5-2.0)
  opacity: number;            // Window opacity (0.1-1.0)
}
```

##### `BreathingConfig`
```typescript
interface BreathingConfig {
  defaultShape: string;       // Initial breathing shape
  defaultPattern: string;     // Initial breathing pattern
  defaultIntensity: number;   // Animation intensity (0.1-1.0)
  enableSound: boolean;       // Audio cues enabled
}
```

#### Methods

##### `getConfig(): HudConfig`
Returns deep copy of current configuration.

##### `updateConfig(updates: Partial<HudConfig>): void`
Updates configuration with partial changes and triggers save/notify.

##### `saveConfig(): void`
Persists configuration to localStorage.

##### `loadConfig(): void`
Loads configuration from localStorage with fallback to defaults.

##### `onConfigChange(listener: (config: HudConfig) => void): void`
Registers configuration change listener.

##### `isReducedMotionEnabled(): boolean`
Returns current reduced motion state (OS + manual settings).

## Data Structures

### Breathing Types

#### `BreathingShape`
```typescript
interface BreathingShape {
  id: string;
  name: string;
  type: 'circle' | 'triangle' | 'square' | 'star' | 'heart' | 'lotus';
  svgPath?: string;
  description: string;
}
```

#### `BreathingPattern`
```typescript
interface BreathingPattern {
  id: string;
  name: string;
  type: 'relaxing' | 'active' | 'flow';
  phases: BreathingPhase[];
  duration: number;
}
```

#### `BreathingPhase`
```typescript
interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'pause';
  duration: number;        // Phase duration in seconds
  intensity: number;       // Phase intensity multiplier
}
```

### Theme System

#### `ThemeConfig`
```typescript
interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;       // Main breathing shape color
    secondary: string;     // Secondary UI elements
    background: string;    // Background tint
    accent: string;        // Highlights and accents
  };
  effects: {
    glow: boolean;         // Enable glow effects
    pulse: boolean;        // Enable pulse animations
    gradient: boolean;     // Enable gradient effects
  };
}
```

## Animation System

### Breathing Calculation Pipeline

1. **Phase Detection**: Determine current breathing phase based on time
2. **Progress Calculation**: Calculate 0-1 progress within current phase
3. **Easing Application**: Apply cubic easing for natural feel
4. **Value Interpolation**: Calculate target breathing value
5. **Smoothing**: Apply velocity-based lerp for continuity
6. **Rendering**: Update canvas with new value

### Frame Loop
```typescript
private animate(): void {
  this.animationId = requestAnimationFrame(() => {
    this.updateBreathingValue();    // Calculate new value
    this.renderShape();             // Render to canvas
    this.updatePhaseDisplay();      // Update UI indicators
    this.animate();                 // Schedule next frame
  });
}
```

### Performance Metrics
```typescript
interface PerformanceMetrics {
  fps: number;              // Current frames per second
  frameTime: number;        // Time per frame (ms)
  memoryUsage: number;      // Estimated memory usage (MB)
  canvasOperations: number; // Canvas operations per frame
}
```

## Canvas2D Rendering

### Glow Effect Implementation
```typescript
// Layered shadow technique for glow
ctx.save();

// Outer glow
ctx.shadowColor = primaryColor;
ctx.shadowBlur = 25;
ctx.fill();

// Inner glow  
ctx.shadowColor = accentColor;
ctx.shadowBlur = 15;
ctx.fill();

// Core brightness
ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
ctx.shadowBlur = 8;
ctx.fill();

ctx.restore();
```

### Shape Rendering Pipeline
1. **Canvas Preparation**: Clear canvas and save context
2. **Color Setup**: Extract theme colors from CSS variables
3. **Path Creation**: Generate shape path (circle, star, etc.)
4. **Glow Rendering**: Apply multiple shadow layers
5. **Fill Operation**: Solid fill with current breathing value
6. **Context Restoration**: Restore canvas state

## Event System

### IPC Communication (Electron)

#### Main → Renderer
```typescript
// Window management
ipcRenderer.on('window-focus', () => { /* handle focus */ });
ipcRenderer.on('window-blur', () => { /* handle blur */ });
```

#### Renderer → Main
```typescript
// Request click-through mode
await ipcRenderer.invoke('set-click-through', true);

// Request window close
await ipcRenderer.invoke('close-window');
```

### DOM Events

#### Slider Updates
```typescript
document.getElementById('base-slider')?.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  this.updateBaseSize(value);
});
```

#### Mode Switching
```typescript
document.getElementById('mode-btn')?.addEventListener('click', () => {
  this.cycleModes();
  this.updateModeDisplay();
});
```

## Error Handling

### Canvas Context Validation
```typescript
public renderShape(): void {
  if (!this.canvasContext || !this.canvasElement) {
    console.warn('Canvas not available for rendering');
    return;
  }
  // ... render logic
}
```

### Configuration Validation
```typescript
private validateConfig(config: Partial<HudConfig>): boolean {
  try {
    // Validate appearance settings
    if (config.appearance?.scale && 
        (config.appearance.scale < 0.5 || config.appearance.scale > 2.0)) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}
```

## Memory Management

### Animation Cleanup
```typescript
public cleanup(): void {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  
  // Remove event listeners
  this.removeEventListeners();
  
  // Clear canvas context
  if (this.canvasContext) {
    this.canvasContext.clearRect(0, 0, 
      this.canvasElement.width, this.canvasElement.height);
  }
}
```

### Configuration Persistence
```typescript
// Automatic save on changes
private notifyListeners(): void {
  this.saveConfig(); // Persist immediately
  this.changeListeners.forEach(listener => {
    try {
      listener(this.getConfig());
    } catch (error) {
      console.error('Error in config listener:', error);
    }
  });
}
```