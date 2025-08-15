# 🫁 Enhanced Breathing HUD - Quick Guide

## 🚀 Launch Commands
```bash
npm run dev           # Simple version
npm run dev:enhanced  # Full tile control system
```

## 🎛️ Control Layout (ASCII)

```
╔═══════════════════════════════════╗
║                   │ 🔊🎨📌✕      ║  ← Basic Controls
║     ⭕ BREATHING   │               ║
║      ANIMATION     │ 🔽🔼➖➕      ║  ← Advanced Controls
║                   │ (Advanced     ║    (Mode: Advanced)
║                   │  Mode Only)   ║
╠═══════════════════════════════════╣
║ ◀ SHAPE ▶    │  MODE SWITCH      ║
║   Circle     │    [Basic]        ║  ← Mode Controls
║   Pattern    │                   ║
╚═══════════════════════════════════╝
           Phase • Progress
```

## 🎮 Controls Quick Reference

### **Top Right Quadrant**
```
🔊 Audio (toggle)
🎨 Theme (cycle Ocean→Forest→Sunset)  
📌 Pin (📌→📍 = Zen mode)
✕ Close
```

### **Advanced Controls (Advanced Mode Only)**
```
🔽🔼 Size (0.5x → 2.0x scale)
➖➕ Intensity (breathing depth)
```

### **Bottom Controls**
```
◀ ▶  Shape cycling
MODE Switch between: Zen → Basic → Advanced
```

## 🌟 Available Shapes
```
⭕ Circle    - Classic smooth breathing
🔺 Triangle  - Sharp focus, 3-point concentration  
⬜ Square    - Box breathing visualization
✨ Star      - Energy breathing, radiating
💖 Heart     - Loving-kindness meditation
🪷 Lotus     - Spiritual awakening
```

## 🫁 Breathing Patterns
```
😌 Zen      - Simple 4-4 rhythm
📦 Box      - 4-4-4-4 structured breathing  
😴 4-7-8    - Relaxing sleep pattern
```

## 🎨 Visual Themes
```
🌊 Ocean    - Blues with glow
🌲 Forest   - Greens, natural
🌅 Sunset   - Warm oranges/yellows
```

## ⌨️ Keyboard Shortcuts (When Unpinned)
```
← →  Previous/Next Shape
↑ ↓  Previous/Next Pattern (Advanced)
```

## 🧘 Mode Guide

### **Zen Mode** (📍 Pinned)
```
╔═══════════════╗
║ •     ⭕       ║  ← Breathing shape + hint dot
║               ║    Semi-transparent
║    Inhale     ║    Click-through enabled
║   ▓▓▓▓░░░░    ║    Progress bar in center
║               ║    HOVER to show controls!
╚═══════════════╝
```

### **Basic Mode** (Default)
```
╔═══════════════════════════════════╗
║               │ 🔊🎨📌✕          ║
║      ⭕       │                   ║
║               │                   ║
╠═══════════════════════════════════╣
║ ◀ Circle ▶   │  [Basic]          ║
║   Zen        │                   ║
╚═══════════════════════════════════╝
```

### **Advanced Mode** (Full Controls)
```
╔═══════════════════════════════════╗
║               │ 🔊🎨📌✕          ║
║      ⭕       │ 🔽🔼➖➕          ║
║               │                   ║
╠═══════════════════════════════════╣
║ ◀ Circle ▶   │  [Advanced]       ║
║   Zen        │                   ║
╚═══════════════════════════════════╝
```

## 🎯 Quick Start Workflow

1. **Launch**: `npm run dev:enhanced`
2. **Choose Shape**: Click ◀ ▶ to find your preferred shape
3. **Pick Theme**: Click 🎨 to cycle themes  
4. **Adjust**: Switch to Advanced mode for size/intensity
5. **Focus**: Click 📌 to pin → enters Zen mode for meditation

## 🔧 Troubleshooting

- **Controls overlapping**: Try different window size
- **Animation jerky**: Shapes should transition smoothly (if not, bug to fix)
- **No response**: Check DevTools console for errors
- **Pin not working**: Electron click-through may need permission

---
*Breathe deeply. The interface fades away, leaving only rhythm and awareness.*