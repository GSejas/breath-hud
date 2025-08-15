# Developer Guide - Breathing HUD

## Table of Contents
1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Build System](#build-system)
4. [Electron Forge Migration](#electron-forge-migration)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## Development Setup

### Prerequisites
- **Node.js**: Version 16+ (LTS recommended)
- **npm**: Version 8+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript extension

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-username/breathing-hud.git
cd breathing-hud

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@electron-forge/cli": "^7.0.0",
    "@electron-forge/maker-squirrel": "^7.0.0",
    "@electron-forge/maker-zip": "^7.0.0",
    "@electron-forge/maker-deb": "^7.0.0",
    "@electron-forge/maker-rpm": "^7.0.0",
    "typescript": "^5.0.0",
    "rimraf": "^5.0.0",
    "electron": "^26.6.10"
  }
}
```

## Project Structure

### Current Structure
```
breathing-hud/
├── src/
│   ├── main/                 # Main Electron process
│   │   ├── main.ts          # Application entry point
│   │   ├── preload.ts       # Preload script for renderer
│   │   └── ipc-handlers.ts  # IPC communication handlers
│   ├── renderer/            # Renderer process (UI)
│   │   ├── app.ts          # Main renderer logic
│   │   └── types.d.ts      # Type definitions
│   ├── shared/              # Shared utilities
│   │   ├── config-manager.ts
│   │   ├── types.ts
│   │   └── electron.d.ts
│   └── lib/                 # Breathing engine library
│       ├── engine.ts        # Core breathing engine
│       ├── svgShapes.ts     # SVG rendering
│       ├── types.ts         # Type definitions
│       ├── utils.ts         # Utilities
│       ├── v1.ts           # Breathing patterns
│       └── engine-internals/
│           ├── phase-controller.ts
│           └── state.ts
├── dist/                    # Compiled TypeScript output
├── out/                     # Electron Forge build output
├── scripts/                 # Build scripts
│   └── generate-renderer-html.js
├── tsconfig.main.json       # Main process TypeScript config
├── tsconfig.renderer.json   # Renderer process TypeScript config
├── tsconfig.build.json      # Project references config
├── forge.config.js          # Electron Forge configuration
└── package.json
```

### Key Files Explained

#### `src/main/main.ts`
- **Purpose**: Main Electron process entry point
- **Responsibilities**: Window creation, global shortcuts, app lifecycle
- **Key Features**:
  - Creates transparent, always-on-top window
  - Registers global keyboard shortcuts
  - Manages window states (show/hide, pin/unpin)

#### `src/main/preload.ts`
- **Purpose**: Bridge between main and renderer processes
- **Security**: Provides secure IPC communication via contextBridge
- **APIs Exposed**:
  - Window controls (minimize, close, pin)
  - Configuration management
  - Breathing engine controls
  - Event listeners for hotkeys

#### `src/renderer/app.ts`
- **Purpose**: Main UI logic and breathing visualization
- **Features**:
  - Breathing engine initialization
  - SVG shape rendering
  - UI event handling
  - Configuration application

#### `src/lib/engine.ts`
- **Purpose**: Core breathing engine
- **Functionality**:
  - Phase timing and transitions
  - State management
  - Callback system for UI updates
  - Pattern management

## Build System

### TypeScript Configuration

#### Multiple TypeScript Configs
We use separate TypeScript configurations for different parts of the application:

1. **`tsconfig.main.json`**: Main process (Node.js environment)
2. **`tsconfig.renderer.json`**: Renderer process (Browser/DOM environment)
3. **`tsconfig.build.json`**: Project references for building both

#### Build Process
```bash
# Compile TypeScript for both main and renderer
npm run build

# The build process:
# 1. tsc -b tsconfig.build.json (compiles both main and renderer)
# 2. node scripts/generate-renderer-html.js (creates HTML file)
```

### Current vs. Forge Build System

#### Current (Manual TypeScript + electron-builder)
- Manual TypeScript compilation with project references
- Custom HTML generation script
- electron-builder for packaging

#### Target (Electron Forge)
- Integrated TypeScript support
- Plugin-based architecture
- Simplified configuration
- Better development experience

## Electron Forge Migration

### Why Migrate?
1. **Official Tool**: First-party Electron tooling
2. **Simplified Workflow**: One tool for dev, build, package, publish
3. **Better TypeScript Support**: Out-of-the-box templates
4. **Modern Features**: Latest Electron features immediately available
5. **Plugin Ecosystem**: Extensible architecture

### Migration Steps

#### 1. Remove electron-builder
```bash
npm uninstall electron-builder
```

#### 2. Install Electron Forge
```bash
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

#### 3. Install Required Makers
```bash
npm install --save-dev \
  @electron-forge/maker-squirrel \
  @electron-forge/maker-zip \
  @electron-forge/maker-deb \
  @electron-forge/maker-rpm
```

#### 4. Create forge.config.js
```javascript
module.exports = {
  packagerConfig: {
    name: "Breathing HUD",
    executableName: "breathing-hud",
    asar: true,
    ignore: [
      /^\/src\//,
      /^\/\.git/,
      /tsconfig.*\.json$/
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { name: 'breathing_hud' }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};
```

#### 5. Update package.json Scripts
```json
{
  "scripts": {
    "build": "tsc -b tsconfig.build.json && node scripts/generate-renderer-html.js",
    "start": "npm run build && electron-forge start",
    "dev": "npm run build && electron-forge start",
    "package": "npm run build && electron-forge package",
    "make": "npm run build && electron-forge make",
    "publish": "npm run build && electron-forge publish"
  }
}
```

### Optional: Webpack Integration

For advanced features like hot module reload:

```bash
npm install --save-dev \
  @electron-forge/plugin-webpack \
  @electron-forge/plugin-webpack-typescript
```

Update `forge.config.js`:
```javascript
{
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/app.ts',
              name: 'main_window',
              preload: {
                js: './src/main/preload.ts'
              }
            }
          ]
        }
      }
    }
  ]
}
```

## Development Workflow

### Daily Development
```bash
# Start development with auto-reload
npm run dev

# Or with watch mode for TypeScript
npm run dev:watch
```

### Code Style and Linting
```bash
# Add ESLint and Prettier (recommended)
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Add to package.json scripts
"lint": "eslint src --ext .ts",
"format": "prettier --write src/**/*.ts"
```

### Debugging

#### Main Process Debugging
```bash
# Start with Node.js debugging
npm run dev -- --inspect-brk=5858
```

Then connect VS Code debugger or Chrome DevTools to `localhost:5858`.

#### Renderer Process Debugging
- Development builds automatically open DevTools
- Or use `Ctrl+Shift+I` in the app window

#### Debug Configuration (VS Code)
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--", "--inspect-brk=5858"],
      "port": 5858
    }
  ]
}
```

## Testing

### Unit Testing Setup
```bash
# Install testing framework
npm install --save-dev jest @types/jest ts-jest

# Create jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

### Example Test Structure
```
src/
├── lib/
│   ├── __tests__/
│   │   ├── engine.test.ts
│   │   └── utils.test.ts
│   ├── engine.ts
│   └── utils.ts
```

### Testing the Breathing Engine
```typescript
// src/lib/__tests__/engine.test.ts
import { BreathingEngine } from '../engine';
import { PRESETS_V1 } from '../v1';

describe('BreathingEngine', () => {
  let engine: BreathingEngine;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    engine = new BreathingEngine({
      onPhaseChange: mockCallback
    });
  });

  test('should initialize with default state', () => {
    expect(engine.getState().isRunning).toBe(false);
  });

  test('should start breathing with pattern', () => {
    engine.setPattern(PRESETS_V1[0]);
    engine.start();
    expect(engine.getState().isRunning).toBe(true);
  });

  test('should call phase change callback', (done) => {
    engine.setPattern(PRESETS_V1[0]);
    engine.start();
    
    setTimeout(() => {
      expect(mockCallback).toHaveBeenCalled();
      done();
    }, 100);
  });
});
```

### Integration Testing with Spectron
```bash
npm install --save-dev spectron
```

### End-to-End Testing Example
```typescript
// src/__tests__/app.e2e.test.ts
import { Application } from 'spectron';
import * as path from 'path';

describe('Breathing HUD App', () => {
  let app: Application;

  beforeEach(async () => {
    app = new Application({
      path: path.join(__dirname, '../../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../../dist/main/main.js')]
    });
    await app.start();
  });

  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  test('should launch and show window', async () => {
    const windowCount = await app.client.getWindowCount();
    expect(windowCount).toBe(1);
  });

  test('should have breathing canvas', async () => {
    const canvas = await app.client.$('#breathing-canvas');
    expect(await canvas.isExisting()).toBe(true);
  });
});
```

## Deployment

### Build for Production
```bash
# Clean previous builds
npm run clean

# Build TypeScript
npm run build

# Package for current platform
npm run package

# Create installers for all platforms
npm run make
```

### Platform-Specific Builds

#### Windows
```bash
# Requires Windows or cross-compilation setup
npm run make -- --platform=win32
```

#### macOS
```bash
# Requires macOS for code signing
npm run make -- --platform=darwin
```

#### Linux
```bash
npm run make -- --platform=linux
```

### GitHub Actions CI/CD

Create `.github/workflows/build.yml`:
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run make

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: out/make/**/*
```

### Release Process
1. **Update version**: `npm version patch|minor|major`
2. **Create tag**: `git push --tags`
3. **GitHub Actions** will automatically build and create release
4. **Manually upload** any additional assets if needed

### Code Signing

#### Windows
```javascript
// In forge.config.js
{
  packagerConfig: {
    win32metadata: {
      CompanyName: "Your Company",
      ProductName: "Breathing HUD"
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: 'path/to/certificate.p12',
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      }
    }
  ]
}
```

#### macOS
```javascript
{
  packagerConfig: {
    osxSign: {
      identity: "Developer ID Application: Your Name"
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD
    }
  }
}
```

## Contributing

### Development Guidelines
1. **Follow TypeScript best practices**
2. **Write tests for new features**
3. **Update documentation**
4. **Use conventional commits**

### Code Review Process
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes with tests**
4. **Submit pull request**

### Commit Message Format
```
type(scope): description

feat(engine): add new breathing pattern
fix(ui): resolve pin button state issue
docs(readme): update installation instructions
```

### Setting Up Development Environment
```bash
# Fork and clone
git clone https://github.com/your-username/breathing-hud.git
cd breathing-hud

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes...

# Test changes
npm run test
npm run build
npm run dev

# Commit and push
git add .
git commit -m "feat(feature): description"
git push origin feature/your-feature
```

### Performance Considerations
1. **Keep renderer process lightweight**
2. **Use efficient rendering techniques**
3. **Minimize memory usage**
4. **Optimize for transparency and overlay performance**

### Security Best Practices
1. **Never disable contextIsolation**
2. **Always use preload scripts for IPC**
3. **Validate all user inputs**
4. **Keep dependencies updated**

This completes the comprehensive developer guide for the Breathing HUD project!
