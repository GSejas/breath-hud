# Enhanced Tile Control System

## 🎯 Overview

The Enhanced Breathing HUD implements a comprehensive tile-based control system with multiple meditation modes, breathing shapes, patterns, and visual themes. This system follows your design philosophy that "life is meditation" and provides a visual guide for active meditation practice.

## 🚀 How to Run

```bash
# Basic version (simple breathing circle)
npm run dev

# Enhanced version (full tile control system)  
npm run dev:enhanced
```

## 🎛️ Four Control Modes

### 1. **Zen Mode** (📍 Pinned)
- **Purpose**: Pure meditation focus, no distractions
- **UI**: Minimal interface, semi-transparent, click-through enabled
- **Usage**: Perfect for flow state and deep breathing practice
- **Controls**: Hidden, only breathing shape visible

### 2. **Basic Mode** (Default)
- **Purpose**: Shape and pattern cycling with essential controls
- **UI**: Clean interface with shape/pattern navigation
- **Controls**: Shape cycling (◀▶), pattern selection, pin, close
- **Usage**: Daily meditation practice with variety

### 3. **Advanced Mode**
- **Purpose**: Full customization and fine-tuning
- **UI**: All controls visible including size/intensity adjustments  
- **Controls**: Everything from Basic + size (🔽🔼), intensity (➖➕), audio (🔊), themes (🎨)
- **Usage**: Personalization and experimentation

### 4. **Config Mode** *(Future Implementation)*
- **Purpose**: Deep configuration and preset management
- **UI**: Configuration panel overlay
- **Usage**: Creating custom patterns and managing presets

## 🔄 UI Layout (Quadrant System)

```
+---------------+
| BREATHING     | CONTROLS
| SHAPE    ⭕   | 🎨📌✕
+-------+-------+
| MODE  | ◀ ▶  |
| ◀ ▶   | THEME |  
+---------------+
```

**Quadrant Breakdown:**
- **Q1-Q2 (Top)**: Breathing canvas with animated shapes
- **Q2 (Upper Right)**: Control panel (audio, theme, pin, close)
- **Q3-Q4 (Bottom)**: Mode controls and shape/pattern cycling
- **Status Bar**: Phase indicator and progress bar

## 🌟 Available Shapes

1. **Circle** - Classic smooth breathing (default)
2. **Triangle** - Sharp focus breathing, three-point concentration
3. **Square** - Box breathing visualization, structured and balanced  
4. **Star** - Energy breathing, radiating vitality
5. **Heart** - Loving-kindness breathing, heart-centered meditation
6. **Lotus** - Spiritual breathing, awakening and growth

## 🫁 Breathing Patterns

### Relaxing Patterns
- **Zen Simple** (4-4): Minimal zen practice
- **4-7-8 Relaxing**: Calming for stress relief and sleep

### Active Patterns  
- **Box Breathing** (4-4-4-4): Equal timing for focus and clarity
- **3-2-1 Energizing**: Quick pattern for alertness

### Flow Patterns
- **Natural Flow**: Organic rhythm following natural patterns

## 🎨 Visual Themes

1. **Ocean** - Blues with glow and pulse effects
2. **Forest** - Greens with natural gradients  
3. **Sunset** - Warm oranges and yellows with glow
4. **Moonlight** - Purples with ethereal glow
5. **Minimal** - Clean white/gray, no effects

## 🎮 Controls & Interactions

### Mouse Controls
- **Left/Right Arrows**: Cycle shapes
- **Up/Down** (Advanced): Cycle patterns  
- **Mode Button**: Switch between Zen/Basic/Advanced
- **Pin Button** (📌/📍): Toggle pin mode
- **Theme Button** (🎨): Cycle visual themes
- **Size Controls** (🔽🔼): Adjust breathing shape size
- **Intensity Controls** (➖➕): Adjust breathing intensity

### Keyboard Shortcuts *(When Unpinned)*
- **← →**: Previous/Next shape
- **↑ ↓**: Previous/Next pattern  
- **Space**: Toggle breathing (future)
- **P**: Toggle pin mode
- **T**: Cycle themes

### Global Hotkeys *(Planned)*
- **Ctrl+Alt+B**: Bring attention (flash/focus)
- **Ctrl+Alt+P**: Toggle pin mode
- **Ctrl+Alt+H**: Show/hide HUD

## ⚙️ Configuration System

The enhanced system uses `enhanced-hud-config.json` for comprehensive configuration:

```json
{
  "meditation": {
    "defaultMode": "basic",
    "defaultShape": "circle", 
    "defaultPattern": "zen-simple",
    "defaultTheme": "ocean",
    "availableShapes": ["circle", "triangle", "square", "star", "heart", "lotus"],
    "availablePatterns": ["zen-simple", "box-breathing", "relaxing-478"],
    "availableThemes": ["ocean", "forest", "sunset", "moonlight", "minimal"]
  },
  "audio": {
    "enabled": false,
    "sounds": { "chime": false },
    "voice": { "enabled": false }
  },
  "advanced": {
    "scaleRange": { "min": 0.5, "max": 2.0 },
    "intensityRange": { "min": 0.1, "max": 1.0 }
  }
}
```

## 🏗️ Technical Architecture

### File Structure
```
src/
├── shared/
│   ├── meditation-types.ts    # Type definitions
│   └── breathing-presets.ts   # Shapes, patterns, themes
├── renderer/  
│   ├── enhanced-app.ts        # Main tile control system
│   ├── enhanced-breathing-engine.ts # Advanced animation engine
│   └── enhanced-index.html    # Enhanced UI layout
```

### Key Classes
- **TileControlSystem**: Main coordination class
- **EnhancedBreathingEngine**: Advanced shape animation
- **UIState**: State management for modes and transitions
- **MeditationConfig**: Configuration management

## 🔄 State Transitions

```
Normal → Basic → Advanced → Config → Zen → Normal
                    ↓
                Pin/Unpin
                    ↓
              Click-through Mode
```

## 🎯 Usage Scenarios

### Daily Practice
1. Start in **Basic Mode** 
2. Choose your preferred shape (Circle, Heart, etc.)
3. Select breathing pattern (Zen, Box, 4-7-8)
4. Pin when ready to focus (enters Zen Mode)

### Deep Meditation
1. **Zen Mode** with click-through
2. Lotus or Heart shape
3. Natural Flow or 4-7-8 pattern  
4. Ocean or Moonlight theme

### Energy Work
1. **Advanced Mode** for full control
2. Star shape with Energizing 3-2-1 pattern
3. Sunset theme with high intensity
4. Adjust size and breathing intensity in real-time

### Focused Work Sessions
1. Pin the HUD (Zen Mode)
2. Simple Circle with Box Breathing  
3. Minimal theme to avoid distraction
4. Background breathing guide while working

## 🚀 Future Enhancements

- **Audio Integration**: Voice guidance, chimes, nature sounds
- **Custom Patterns**: User-created breathing rhythms  
- **Progress Tracking**: Session duration, pattern usage
- **Biometric Integration**: Heart rate variability sync
- **Community Sharing**: Share custom shapes/patterns
- **Guided Sessions**: Structured meditation programs

---

*The Enhanced Tile Control System transforms breathing meditation from a simple animation into a comprehensive mindfulness tool, supporting both beginners and advanced practitioners in their journey toward greater awareness and calm.*