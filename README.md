# Breathing HUD

A high-performance, accessible breathing meditation overlay for Windows, macOS, and Linux.

## Overview

Breathing HUD is an Electron-based meditation companion that provides a clean, customizable breathing visualization overlay. Built with Canvas2D rendering for optimal performance and full accessibility support.

### Key Features

- **Canvas2D Rendering**: 60fps performance optimized for all hardware
- **Accessibility First**: Respects OS reduced-motion and accessibility settings  
- **Multiple Modes**: Zen, Basic, and Advanced interaction modes
- **Configurable Breathing**: Real-time adjustment of inhale/exhale parameters
- **Phase Visualization**: Color-coded progress bar with breathing cycle phases
- **Pinnable Overlay**: Click-through mode for background meditation

## Quick Start

### Installation

```bash
# Clone and setup
git clone <repository-url>
cd breathing-hud
npm install

# Build and run
npm run build
npm start
```

### Basic Usage

1. **Launch**: Run `npm start` to open the breathing HUD
2. **Choose Mode**: Click mode buttons (Z/B/A) for Zen/Basic/Advanced
3. **Pin for Background**: Click pin button (📌) for click-through overlay
4. **Customize**: Use Advanced mode sliders for breathing control

## Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Zen** | Minimal interface, auto-hidden controls | Distraction-free meditation |
| **Basic** | Standard controls, shape/pattern selection | Balanced experience |
| **Advanced** | Full parameter control with sliders | Customization and tuning |

## Quick Configuration

### Breathing Parameters (Advanced Mode)
- **Base Size**: Neutral breathing circle size (0.2-1.2)
- **Inhale Max**: Maximum expansion during inhale (0.4-2.0) 
- **Exhale Min**: Minimum contraction during exhale (0.1-1.0)

### Phase Bar
- **Inhale**: Blue gradient, fills 0% → 100%
- **Hold**: Accent color with pulse effect, stays at 100%
- **Exhale**: Gradient to secondary, empties 100% → 0%
- **Pause**: Minimal styling, stays at 0%

## Architecture

```
src/
├── renderer/
│   ├── enhanced-app-browser.ts    # Canvas2D breathing engine
│   └── enhanced-index.html        # UI layout and styling
├── config-manager.ts              # Configuration system
└── main/                          # Electron main process
```

## Performance

- **Rendering**: Canvas2D with optimized animation loops
- **Memory**: ~50MB RAM usage typical
- **CPU**: Minimal impact during background operation
- **Accessibility**: Auto-detects and respects OS preferences

## Documentation

- [**Features Guide**](docs/FEATURES.md) - Complete feature documentation
- [**Configuration**](docs/CONFIGURATION.md) - All config options and examples
- [**Development**](docs/DEVELOPMENT.md) - Setup, build, and contribution guide
- [**API Reference**](docs/API.md) - Technical implementation details

## Version Comparison

### Enhanced Version (Current)
✅ Canvas2D rendering  
✅ Accessibility support  
✅ Configurable breathing parameters  
✅ Phase-based progress visualization  
✅ Multiple interaction modes  

### Simple Version (Legacy)
⚪ SVG rendering  
⚪ Basic pin functionality  
⚪ Fixed breathing pattern  

## Requirements

- **Windows**: 10, 11
- **macOS**: 10.14+  
- **Linux**: Ubuntu 18.04+, Fedora 28+
- **Node.js**: 16+ recommended

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, use the GitHub issue tracker.