# Development Guide

Complete guide for setting up, building, and contributing to Breathing HUD.

## Quick Setup

### Prerequisites
- **Node.js**: 16+ (18+ recommended)
- **npm**: 7+ (included with Node.js)
- **Git**: For version control
- **TypeScript**: Installed globally (optional)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd breathing-hud

# Install dependencies
npm install

# Build application
npm run build

# Start development
npm start
```

## Project Structure

```
breathing-hud/
├── src/                     # Source code
│   ├── main/               # Electron main process
│   │   ├── main.ts         # Application entry point
│   │   ├── ipc-handlers.ts # Inter-process communication
│   │   └── preload.ts      # Preload script for renderer
│   ├── renderer/           # UI and rendering
│   │   ├── enhanced-app-browser.ts  # Canvas2D breathing engine
│   │   ├── enhanced-index.html      # UI layout and styling
│   │   ├── app.ts          # Simple version UI logic
│   │   └── index.html      # Simple version layout
│   ├── shared/             # Common utilities
│   │   ├── types.ts        # Shared type definitions
│   │   └── breathing-presets.ts  # Breathing patterns
│   └── config-manager.ts   # Configuration system
├── dist/                   # Compiled JavaScript output
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
└── package.json           # Node.js dependencies and scripts
```

## Build System

### TypeScript Configuration
Single `tsconfig.json` for unified compilation:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Build Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc && electron dist/main/main.js",
    "dev:enhanced": "tsc && electron dist/main/main.js --enhanced",
    "start": "npm run build && electron dist/main/main.js",
    "clean": "rimraf dist",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  }
}
```

## Development Workflows

### Running Different Versions

#### Enhanced Version (Recommended)
```bash
npm run dev:enhanced
# or
npm start -- --enhanced
```

Features:
- Canvas2D rendering engine
- Advanced breathing controls
- Multiple interaction modes
- Real-time configuration

#### Simple Version (Legacy)
```bash
npm run dev
```

Features:
- SVG-based rendering
- Basic pin functionality
- Minimal interface

### Hot Reload Development
```bash
# Terminal 1: Watch for TypeScript changes
npm run build:watch

# Terminal 2: Run Electron with auto-restart
npm run dev:hot
```

## Architecture Deep Dive

### Main Process (`src/main/`)

#### `main.ts` - Application Entry
```typescript
import { app, BrowserWindow } from 'electron';
import { setupIpcHandlers } from './ipc-handlers';

// Window management and application lifecycle
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
};
```

#### `ipc-handlers.ts` - Process Communication
```typescript
import { ipcMain } from 'electron';

// Handle renderer requests
ipcMain.handle('set-click-through', (event, enabled: boolean) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.setIgnoreMouseEvents(enabled);
});
```

### Renderer Process (`src/renderer/`)

#### Canvas2D Breathing Engine
Core animation system in `enhanced-app-browser.ts`:

```typescript
class EnhancedBreathingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number;
  
  private calculateBreathingValue(phase: BreathingPhase, progress: number): number {
    // Cubic easing for natural breathing feel
    const eased = this.cubicEaseInOut(progress);
    return this.interpolateBreathingSize(phase, eased);
  }
  
  private renderShape(): void {
    // High-performance Canvas2D rendering
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBreathingShape(this.currentValue);
  }
}
```

### Configuration System

#### Singleton Pattern
```typescript
export class ConfigManager {
  private static instance: ConfigManager;
  private config: HudConfig;
  
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
}
```

## Testing

### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```typescript
// __tests__/config-manager.test.ts
import { ConfigManager } from '../src/config-manager';

describe('ConfigManager', () => {
  let config: ConfigManager;
  
  beforeEach(() => {
    config = ConfigManager.getInstance();
  });
  
  test('should load default configuration', () => {
    const defaultConfig = config.getConfig();
    expect(defaultConfig.appearance.reduceMotion).toBe(false);
  });
});
```

### Integration Testing
```bash
# Test Electron app
npm run test:electron

# Test renderer process
npm run test:renderer

# Test main process
npm run test:main
```

## Performance Optimization

### Canvas2D Best Practices

#### Efficient Rendering
```typescript
// Minimize canvas state changes
ctx.save();
ctx.scale(scale, scale);
ctx.fillStyle = color;
ctx.fill();
ctx.restore();

// Use requestAnimationFrame for smooth animation
private animate(): void {
  this.animationId = requestAnimationFrame(() => {
    this.updateBreathingValue();
    this.renderShape();
    this.animate();
  });
}
```

#### Memory Management
```typescript
// Clean up animation frames
public cleanup(): void {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
}

// Efficient event listener management
public addEventListeners(): void {
  this.boundHandlers = {
    resize: this.handleResize.bind(this),
    click: this.handleClick.bind(this)
  };
  
  window.addEventListener('resize', this.boundHandlers.resize);
}
```

### Accessibility Performance
```typescript
// Detect reduced motion preference efficiently
private setupReducedMotionDetection(): void {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  // Cache the result to avoid repeated queries
  this.isReducedMotion = mediaQuery.matches;
  
  mediaQuery.addEventListener('change', (e) => {
    this.isReducedMotion = e.matches;
    this.updateAnimationStrategy();
  });
}
```

## Debugging

### Developer Tools
```typescript
// Enable DevTools in development
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}

// Debug configuration
console.log('Config loaded:', configManager.getConfig());
console.log('Performance metrics:', this.getPerformanceMetrics());
```

### Performance Monitoring
```typescript
// Built-in performance tracking
class PerformanceMonitor {
  private frameCount = 0;
  private startTime = performance.now();
  
  public logFrameRate(): void {
    this.frameCount++;
    const elapsed = performance.now() - this.startTime;
    
    if (elapsed >= 1000) {
      const fps = (this.frameCount / elapsed) * 1000;
      console.log(`FPS: ${fps.toFixed(1)}`);
      
      this.frameCount = 0;
      this.startTime = performance.now();
    }
  }
}
```

## Building for Distribution

### Electron Packaging
```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build for current platform
npm run dist

# Build for all platforms
npm run dist:all

# Build for specific platform
npm run dist:win
npm run dist:mac
npm run dist:linux
```

### Configuration for Distribution
```json
{
  "build": {
    "appId": "com.breathinghud.app",
    "productName": "Breathing HUD",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.healthcare-fitness"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

## Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with TypeScript support
- **Prettier**: Automatic code formatting
- **Commit Messages**: Conventional commit format

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request with detailed description

### Development Guidelines
- Write tests for new features
- Update documentation for API changes
- Follow existing code patterns and architecture
- Ensure accessibility compliance
- Test on multiple platforms before submitting