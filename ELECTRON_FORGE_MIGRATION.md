# Electron Forge Migration Guide for Breathing HUD

## Why Migrate to Electron Forge?

Based on your current TypeScript Electron app structure, migrating to Electron Forge offers:

- **First-party support**: Official Electron tooling with immediate feature updates
- **Simplified workflow**: Single CLI for development, packaging, and distribution
- **Better TypeScript integration**: Out-of-the-box templates and configurations
- **Plugin architecture**: Extensible and maintainable build system
- **Reduced complexity**: Less configuration than electron-builder for most use cases

## Current vs. Target Setup

### Current (electron-builder)
```
breathing-hud/
├── package.json (electron-builder config)
├── tsconfig.main.json
├── tsconfig.renderer.json
├── tsconfig.build.json
├── src/
│   ├── main/
│   ├── renderer/
│   ├── shared/
│   └── lib/
└── dist/ (tsc output)
```

### Target (Electron Forge)
```
breathing-hud/
├── package.json (forge config)
├── forge.config.js
├── tsconfig.json (simplified)
├── src/
│   ├── main/
│   ├── renderer/
│   ├── preload/
│   └── lib/
└── out/ (forge output)
```

## Step-by-Step Migration

### Step 1: Backup Current Project
```bash
git add -A
git commit -m "Backup before Electron Forge migration"
```

### Step 2: Remove electron-builder
```bash
npm uninstall electron-builder
```

### Step 3: Install Electron Forge
```bash
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

### Step 4: Update package.json Scripts
Replace your current scripts with:

```json
{
  "scripts": {
    "build": "tsc -b tsconfig.build.json",
    "start": "npm run build && electron-forge start",
    "dev": "npm run build && electron-forge start",
    "package": "npm run build && electron-forge package",
    "make": "npm run build && electron-forge make",
    "publish": "npm run build && electron-forge publish",
    "clean": "rimraf dist out"
  }
}
```

### Step 5: Create Forge Configuration
Create `forge.config.js`:

```javascript
module.exports = {
  packagerConfig: {
    name: "Breathing HUD",
    executableName: "breathing-hud",
    asar: true,
    icon: "./assets/icon", // Add your icon files
    ignore: [
      /^\/src\//,
      /^\/\.git/,
      /^\/node_modules\/\.cache/,
      /tsconfig.*\.json$/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'breathing_hud'
      }
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
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};
```

### Step 6: Install Required Makers
```bash
npm install --save-dev @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/maker-deb @electron-forge/maker-rpm
```

### Step 7: Update Main Entry Point
Ensure your `package.json` main field points to the compiled output:
```json
{
  "main": "dist/main/main.js"
}
```

### Step 8: Test the Migration
```bash
npm run start
```

## Advanced Configuration for Your HUD App

### TypeScript Webpack Plugin (Optional but Recommended)

For hot reload and advanced bundling:

```bash
npm install --save-dev @electron-forge/plugin-webpack @electron-forge/plugin-webpack-typescript
```

Update `forge.config.js`:
```javascript
module.exports = {
  // ... existing config
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
};
```

### Auto-Updater Setup

For automatic updates:

```bash
npm install --save-dev @electron-forge/publisher-github
```

Add to `forge.config.js`:
```javascript
{
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'your-username',
          name: 'breathing-hud'
        }
      }
    }
  ]
}
```

## User Tutorial Guides

### For End Users: Installing Breathing HUD

#### Windows Users
1. Download the `.exe` installer from the releases page
2. Run the installer with administrator privileges
3. Launch "Breathing HUD" from the Start Menu
4. Use `Ctrl+Alt+B` to bring focus to the HUD
5. Use `Ctrl+Alt+P` to toggle pin mode
6. Use `Ctrl+Alt+H` to show/hide the HUD

#### macOS Users
1. Download the `.dmg` file from releases
2. Open the DMG and drag "Breathing HUD" to Applications
3. Launch from Applications (you may need to allow in Security preferences)
4. Use the same keyboard shortcuts as Windows

#### Linux Users
1. Download the `.AppImage` file
2. Make it executable: `chmod +x breathing-hud.AppImage`
3. Run: `./breathing-hud.AppImage`
4. Optional: Install using your package manager if `.deb` or `.rpm` available

### For Developers: Building and Distributing

#### Development Workflow
```bash
# Clone the repository
git clone https://github.com/your-username/breathing-hud.git
cd breathing-hud

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package for current platform
npm run package

# Create installers for all platforms
npm run make
```

#### Release Process
```bash
# Ensure version is updated in package.json
npm version patch  # or minor/major

# Create release builds
npm run make

# Publish to GitHub releases (if configured)
npm run publish
```

#### Customization Guide

##### Changing Breathing Patterns
Edit `src/lib/v1.ts` to add new breathing patterns:
```typescript
export const CUSTOM_PATTERN = {
  id: 'custom',
  name: 'Custom Pattern',
  phases: [
    { type: 'inhale', seconds: 4, target: 1.0 },
    { type: 'hold', seconds: 2, target: 1.0 },
    { type: 'exhale', seconds: 6, target: 0.0 },
    { type: 'pause', seconds: 1, target: 0.0 }
  ]
};
```

##### Modifying UI Appearance
Edit `src/shared/config-manager.ts` default configuration:
```typescript
const defaultConfig = {
  appearance: {
    background: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shape: {
      color: 'rgba(74, 144, 226, 0.8)',
      glowColor: 'rgba(74, 144, 226, 0.4)'
    }
  }
};
```

## Troubleshooting

### Common Issues

#### Build Fails with TypeScript Errors
```bash
# Check TypeScript compilation separately
npm run build
# Fix any TypeScript errors before running Forge
```

#### App Won't Start
- Ensure `main` field in `package.json` points to compiled JS
- Check that `dist/main/main.js` exists after build
- Verify preload script path in main process

#### Packaging Fails
- Check file permissions on build outputs
- Ensure all dependencies are properly installed
- Verify Forge configuration syntax

#### Auto-updater Not Working
- Ensure GitHub repository is public or tokens are configured
- Check that releases are properly tagged
- Verify publisher configuration in `forge.config.js`

### Debug Mode
Run with debug output:
```bash
DEBUG=electron-forge:* npm run start
```

## Performance Optimizations

### Production Build Optimizations
```javascript
// In forge.config.js
module.exports = {
  packagerConfig: {
    asar: true,
    prune: true,
    ignore: [
      /^\/src\//,
      /^\/\.git/,
      /^\/\.vscode/,
      /tsconfig.*\.json$/,
      /\.md$/
    ]
  }
};
```

### Webpack Optimizations (if using webpack plugin)
```javascript
// webpack.renderer.config.js
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

This migration will modernize your build process while maintaining your current TypeScript structure and breathing engine functionality.
