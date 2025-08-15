# Breathing HUD - User Guide

## Table of Contents
1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Using the HUD](#using-the-hud)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

## Installation

### Windows
1. **Download**: Get the latest `.exe` installer from the [releases page](https://github.com/your-username/breathing-hud/releases)
2. **Install**: 
   - Right-click the downloaded file and select "Run as administrator"
   - Follow the installation wizard
   - Choose installation directory (default recommended)
3. **Launch**: Find "Breathing HUD" in your Start Menu or desktop shortcut

### macOS
1. **Download**: Get the latest `.dmg` file from the releases page
2. **Install**:
   - Open the downloaded DMG file
   - Drag "Breathing HUD" to your Applications folder
   - If macOS shows a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"
3. **Launch**: Open from Applications folder or Spotlight search

### Linux
1. **AppImage** (Universal):
   ```bash
   # Download the .AppImage file
   chmod +x breathing-hud.AppImage
   ./breathing-hud.AppImage
   ```

2. **Debian/Ubuntu** (.deb):
   ```bash
   sudo dpkg -i breathing-hud.deb
   sudo apt-get install -f  # Fix any dependencies
   ```

3. **Fedora/CentOS** (.rpm):
   ```bash
   sudo rpm -i breathing-hud.rpm
   ```

## Getting Started

### First Launch
1. **Initial Setup**: The HUD will appear as a semi-transparent overlay
2. **Positioning**: Drag the HUD to your preferred screen location
3. **Testing**: The breathing animation should start automatically with a gentle blue circle

### Basic Controls
- **Pin Button** (📌): Toggle between moveable and pinned (click-through) modes
- **Audio Button** (🔊/🔇): Enable/disable breathing audio cues
- **Close Button** (✖): Exit the application

## Using the HUD

### Breathing Modes

#### Active Mode (Default)
- HUD is moveable and interactive
- Can click and drag to reposition
- All buttons are clickable
- Semi-opaque background for visibility

#### Pinned Mode
- HUD becomes click-through (won't interfere with other apps)
- More transparent appearance
- Only the pin button remains interactive when you hover over it
- Perfect for use during work or other activities

### Breathing Patterns
The HUD starts with a relaxing 4-7-8 breathing pattern:
- **Inhale**: 4 seconds (circle expands)
- **Hold**: 7 seconds (circle stays expanded)
- **Exhale**: 8 seconds (circle contracts)

### Visual Feedback
- **Circle Size**: Indicates breathing phase
  - Expanding = Inhale
  - Large/Stable = Hold
  - Contracting = Exhale
  - Small/Stable = Pause
- **Glow Effect**: Provides gentle visual guidance
- **Status Text**: Shows current phase and progress

### Audio Guidance
When audio is enabled:
- Gentle bell sounds mark phase transitions
- Soft voice cues ("In", "Hold", "Out", "Rest")
- Volume automatically adjusted for overlay use

## Keyboard Shortcuts

### Global Shortcuts (work from any application)
- **Ctrl+Alt+B**: Bring HUD to focus and flash attention
- **Ctrl+Alt+P**: Toggle pin mode
- **Ctrl+Alt+H**: Show/hide the HUD

### Note for macOS Users
Replace `Ctrl` with `Cmd` for Mac shortcuts:
- **Cmd+Option+B**: Attention/focus
- **Cmd+Option+P**: Toggle pin
- **Cmd+Option+H**: Show/hide

## Customization

### Configuration File
The HUD uses a configuration file that can be customized:

**Location**:
- Windows: `C:\Users\[username]\Documents\repos\hud-config.json`
- macOS: `~/Documents/repos/hud-config.json`
- Linux: `~/Documents/repos/hud-config.json`

### Basic Configuration Example
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
    "pinnedBackground": "rgba(0, 0, 0, 0.1)",
    "shape": {
      "color": "rgba(74, 144, 226, 0.8)",
      "glowColor": "rgba(74, 144, 226, 0.4)"
    }
  },
  "breathing": {
    "defaultPattern": "relaxed",
    "animation": {
      "duration": "4s",
      "easing": "ease-in-out"
    }
  },
  "audio": {
    "enabled": true,
    "volume": 0.5,
    "voiceGuidance": {
      "enabled": true,
      "language": "en-US"
    }
  }
}
```

### Color Customization
You can change the breathing circle colors by modifying the `appearance.shape` section:

```json
{
  "appearance": {
    "shape": {
      "color": "rgba(255, 100, 100, 0.8)",      // Red circle
      "glowColor": "rgba(255, 100, 100, 0.4)"   // Red glow
    }
  }
}
```

### Popular Color Schemes

#### Calming Green
```json
"shape": {
  "color": "rgba(100, 200, 100, 0.8)",
  "glowColor": "rgba(100, 200, 100, 0.4)"
}
```

#### Warm Gold
```json
"shape": {
  "color": "rgba(255, 215, 0, 0.8)",
  "glowColor": "rgba(255, 215, 0, 0.4)"
}
```

#### Cool Purple
```json
"shape": {
  "color": "rgba(147, 112, 219, 0.8)",
  "glowColor": "rgba(147, 112, 219, 0.4)"
}
```

### Window Positioning
Set your preferred default position:
```json
{
  "window": {
    "position": { 
      "x": 1620,  // Right side of 1920px screen
      "y": 100    // Top area
    }
  }
}
```

## Troubleshooting

### Common Issues

#### HUD Not Visible
1. **Check if running**: Look for the app icon in system tray/dock
2. **Use show shortcut**: Press `Ctrl+Alt+H` (or `Cmd+Option+H` on Mac)
3. **Check position**: The HUD might be off-screen, try `Ctrl+Alt+B` to bring it to focus

#### HUD Won't Stay on Top
1. **Restart the application**
2. **Check alwaysOnTop setting** in config file
3. **Disable conflicting software** that manages window layering

#### Keyboard Shortcuts Not Working
1. **Check for conflicts** with other applications
2. **Run as administrator** (Windows) or with proper permissions
3. **Restart the application** to re-register shortcuts

#### Audio Not Playing
1. **Check audio button** in HUD (should show 🔊)
2. **Verify system audio** is not muted
3. **Check config file** audio settings
4. **Restart with audio permissions** if needed

#### Performance Issues
1. **Close unnecessary applications**
2. **Check GPU acceleration** is enabled
3. **Reduce transparency** in config if needed
4. **Update graphics drivers**

#### Configuration Not Loading
1. **Check file path** and permissions
2. **Validate JSON syntax** using an online validator
3. **Reset to defaults** by deleting/renaming the config file
4. **Check file encoding** (should be UTF-8)

### Getting Help

#### Debug Information
To help with troubleshooting, gather this information:
- Operating system and version
- Breathing HUD version
- Configuration file contents
- Error messages (check console in developer tools)

#### Enable Debug Mode
1. **Windows**: Create a shortcut with argument `--enable-logging`
2. **macOS/Linux**: Run from terminal with `breathing-hud --enable-logging`
3. **Check logs** in the application data directory

#### Community Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/breathing-hud/issues)
- **Discussions**: [Community Q&A and tips](https://github.com/your-username/breathing-hud/discussions)

#### Reset to Defaults
If you're experiencing persistent issues:
1. **Close the application**
2. **Delete the configuration file**
3. **Restart the application** (will create new default config)

### Advanced Troubleshooting

#### Command Line Options
```bash
# Enable verbose logging
breathing-hud --enable-logging --log-level=verbose

# Start with default config (ignore user config)
breathing-hud --ignore-config

# Start in safe mode (minimal features)
breathing-hud --safe-mode
```

#### Config File Validation
Use this minimal config to test if the issue is configuration-related:
```json
{
  "window": {
    "width": 300,
    "height": 300,
    "transparent": true,
    "alwaysOnTop": true
  }
}
```

## Tips for Best Experience

### Meditation Practice
1. **Start with 5-10 minutes** daily
2. **Use pinned mode** during work for subtle reminders
3. **Adjust breathing patterns** to your comfort level
4. **Create a consistent routine** using the same time daily

### Productivity Integration
1. **Pin during focused work** for occasional breathing breaks
2. **Use attention shortcut** (`Ctrl+Alt+B`) for quick stress relief
3. **Position in peripheral vision** to avoid distraction
4. **Combine with Pomodoro technique** for regular breaks

### Workspace Setup
1. **Place on secondary monitor** if available
2. **Use with standing desk** for regular posture breaks
3. **Coordinate with ambient lighting** for better visibility
4. **Consider multiple screen setups** for optimal positioning

Happy breathing! 🧘‍♀️✨
