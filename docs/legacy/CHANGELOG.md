# Changelog

## [2.0.0] - 2025-01-14 - Simplified Architecture

### 🚀 Major Improvements
- **Simplified Build System**: Reduced from 3+ TypeScript configs to single `tsconfig.json`
- **Modern Architecture**: Follows 2025 Electron + TypeScript best practices
- **Zero File Copying**: HTML loads directly from source, no build-time copying
- **Clean Codebase**: Removed ~2000 lines of unnecessary complex code

### ✅ What's Working
- **Simple Breathing Animation**: Smooth SVG circle with natural breathing rhythm
- **Pin Mode**: Click-through functionality when pinned
- **Modern UI**: Glass-like interface with backdrop blur effects
- **TypeScript Compilation**: Single `tsc` command for entire project

### 🗑️ Removed Complexity
- Multiple TypeScript configuration files (`tsconfig.main.json`, `tsconfig.renderer.json`, etc.)
- Complex breathing engine with unnecessary abstractions
- Manual file copying scripts
- Generated files in source directory (`.d.ts`, `.js`, `.js.map`)
- Unused HTML templates and migration files

### 🔧 Technical Changes
- **Build Command**: Now just `tsc` instead of complex multi-step process
- **Project Structure**: Clean main/renderer/shared separation maintained
- **HTML Loading**: Direct loading from `src/renderer/index.html`
- **Script References**: Proper relative paths to compiled JavaScript

### 📦 File Changes
```
Before: 23+ TypeScript files (~2500 lines)
After:  6 TypeScript files (~200 lines)

Removed:
- src/lib/ (entire complex breathing engine)
- src/minimal-breathing-engine.ts
- All generated .d.ts, .js, .js.map files from src/
- Multiple tsconfig files
- Build scripts directory
```

### 🎯 Benefits
- **Faster builds**: Single TypeScript compilation pass
- **Easier maintenance**: Simple, understandable codebase
- **Better debugging**: Clear separation of concerns
- **Modern practices**: Follows 2025 Electron + TypeScript standards

### 💔 Breaking Changes
- Removed complex breathing patterns (now uses simple sine wave animation)
- Removed audio functionality (can be re-added as simple Web Audio API)
- Simplified configuration options
- Changed build process (now just `npm run build`)

---

## [1.x.x] - Previous Versions
- Complex breathing engine with multiple patterns
- Multiple TypeScript configuration files
- Manual build scripts and file copying
- Generated files mixed with source code