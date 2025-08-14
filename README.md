# Breathing HUD

A minimal desktop overlay application for breathing meditation, built with Electron and TypeScript.

## Overview

Breathing HUD provides a clean, distraction-free breathing guide that overlays on your desktop. It features:

- **Desktop Overlay**: Always-on-top window that doesn't interfere with your work
- **Pin Mode**: Click-through mode when pinned, allowing you to work underneath
- **Simple Animation**: Clean circle animation that grows and shrinks with your breath
- **Minimal Architecture**: Simplified build system following 2025 TypeScript + Electron best practices
- **Clean UI**: Modern glass-like interface with breathing circle animation

## Quick Start

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the HUD
npm start

# Development mode (auto-rebuild)
npm run dev
```

## Features

### Simple Breathing Animation
- **Animated Circle**: Smooth breathing circle that pulses in sync with your breath
- **Visual Cues**: Color and opacity changes guide your breathing rhythm
- **Non-intrusive**: Minimalist design that doesn't distract from your work

### Pin Mode
When pinned, the HUD becomes semi-transparent and allows click-through to applications underneath. Click the pin button to toggle between active and pinned modes.

## Configuration

The HUD reads configuration from `hud-config.json`. Example:

```json
{
  "window": {
    "width": 300,
    "height": 300,
    "position": { "x": 100, "y": 100 },
    "transparent": true,
    "alwaysOnTop": true
  },
  "appearance": {
    "background": "rgba(0, 0, 0, 0.8)",
    "borderColor": "rgba(255, 255, 255, 0.5)",
    "opacity": 1.0,
    "pinnedBackground": "rgba(0, 0, 0, 0.1)",
    "pinnedBorderColor": "rgba(255, 255, 255, 0.1)",
    "pinnedOpacity": 0.3
  },
  "breathing": {
    "shape": {
      "color": "rgba(74, 144, 226, 0.8)",
      "glowColor": "rgba(74, 144, 226, 0.4)"
    },
    "animation": {
      "duration": "4s"
    }
  }
}
```

## Architecture

### Simplified Build System (2025 Best Practices)

This project follows modern Electron + TypeScript best practices:

- **Single `tsconfig.json`**: Unified TypeScript configuration
- **Simple build process**: Just `tsc` compilation, no complex bundling
- **Direct HTML loading**: HTML files loaded directly from source, no copying
- **Clean separation**: Main/renderer/shared structure maintained

### Core Components

- **Main Process** (`src/main/`): Electron main process, window management
- **Renderer Process** (`src/renderer/`): UI and simple breathing animation
- **Shared** (`src/shared/`): Common types and configuration management

### Simple Animation Engine

Lightweight breathing animation using:
- **SVG Graphics**: Vector-based circle animation
- **RequestAnimationFrame**: Smooth 60fps animation loop
- **Math.sin()**: Natural breathing rhythm calculation
- **Zero Dependencies**: Pure DOM APIs, no external libraries

## Building for Distribution

```bash
# Clean previous builds
npm run clean

# Build application
npm run build

# Package for current platform
npm run package

# Create distributable
npm run dist
```

Built applications will be in the `release/` directory.

## Development

### Project Structure
```
src/
├── main/           # Electron main process
│   ├── main.ts     # Application entry point
│   ├── ipc-handlers.ts # IPC communication
│   └── preload.ts  # Preload script
├── renderer/       # UI and rendering  
│   ├── app.ts      # Main UI logic & breathing animation
│   └── index.html  # HUD interface
└── shared/         # Common utilities
    ├── config-manager.ts # Configuration loading
    └── types.ts    # Shared type definitions

dist/              # Build output (TypeScript compiled to JS)
```

### Key Files
- `src/main/main.ts`: Application entry point and window management
- `src/renderer/app.ts`: UI logic and breathing animation engine
- `src/renderer/index.html`: HUD interface with modern CSS styling
- `src/shared/config-manager.ts`: Configuration file management

## Technology Stack

- **Electron**: Desktop application framework
- **TypeScript**: Type-safe JavaScript
- **SVG**: Vector graphics for breathing animation
- **Web APIs**: Audio Context, Performance, RequestAnimationFrame

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the build and functionality
5. Submit a pull request

## Support

For issues and feature requests, please use the GitHub issue tracker.