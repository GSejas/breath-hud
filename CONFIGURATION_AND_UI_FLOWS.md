# Configuration and UI Flows — Breathing HUD

This document describes the current configuration system, default values, where the config is loaded from, and the supported UI modes/flows for the Breathing HUD application.

## At-a-glance
- Config loader: `src/shared/config-manager.ts`
- Runtime access (renderer): `window.electronAPI.loadConfig()` via `preload.ts`
- Config file location (project / dev): `hud-config.json` at project root (loaded via relative path)
- Defaults are provided if the file is missing or invalid

---

## Config Schema (TypeScript interface)
The TypeScript interface for the HUD configuration is defined as `HudConfig` in `src/shared/config-manager.ts`:

- appearance
  - theme: string
  - opacity: number (0.0 — 1.0)
  - pinnedOpacity: number (0.0 — 1.0)
  - background: CSS color string
  - pinnedBackground: CSS color string
  - borderColor: CSS color string
  - pinnedBorderColor: CSS color string

- window
  - width: number (pixels)
  - height: number (pixels)
  - transparent: boolean
  - alwaysOnTop: boolean
  - position
    - x: number (pixels)
    - y: number (pixels)

- breathing
  - shape
    - color: CSS color string
    - glowColor: CSS color string
    - pinnedColor: CSS color string
    - size: number (px) — base shape size
  - animation
    - duration: string (e.g. "4s")  — text-based duration used by renderer CSS/logic
    - easing: string (CSS easing, e.g. "ease-in-out")

- controls
  - pinButton
    - size: number (px)
    - normalColor: CSS color string
    - pinnedColor: CSS color string
    - hoverScale: number (multiplier, e.g. 1.1)

---

## Default Values
Defaults are returned by `ConfigManager.getDefaultConfig()` when `hud-config.json` is missing or invalid.

Key defaults (summary):
- appearance.theme: `dark`
- appearance.opacity: `0.8`
- appearance.pinnedOpacity: `0.3`
- appearance.background: `rgba(0, 0, 0, 0.8)`
- breathing.shape.color: `rgba(74, 144, 226, 0.8)`
- breathing.shape.size: `100` (px)
- window.width / height: `300 x 300`
- window.transparent: `true`
- window.alwaysOnTop: `true`
- breathing.animation.duration: `4s`

Use these defaults as a baseline when authoring a custom `hud-config.json`.

---

## Where to place the config file
- Development path: The app attempts to load `hud-config.json` relative to the compiled `shared` module. In the project layout this resolves to the project root `hud-config.json` (the loader uses `join(__dirname, '../../hud-config.json')`).
- Packaged app: For production builds the recommended approach is to read the config from a user directory (e.g., `%APPDATA%` on Windows or `~/.config` on Linux) — adjust `ConfigManager` if you want a per-user location.

Example placement (project root):
```
C:\path\to\repo\hud-config.json
```

---

## Example `hud-config.json`

```json
{
  "appearance": {
    "theme": "dark",
    "opacity": 0.85,
    "pinnedOpacity": 0.25,
    "background": "rgba(0,0,0,0.85)",
    "pinnedBackground": "rgba(0,0,0,0.12)",
    "borderColor": "rgba(255,255,255,0.6)",
    "pinnedBorderColor": "rgba(255,255,255,0.12)"
  },
  "window": {
    "width": 320,
    "height": 320,
    "transparent": true,
    "alwaysOnTop": true,
    "position": { "x": 1600, "y": 80 }
  },
  "breathing": {
    "shape": {
      "color": "rgba(74,144,226,0.9)",
      "glowColor": "rgba(74,144,226,0.45)",
      "pinnedColor": "rgba(74,144,226,0.3)",
      "size": 110
    },
    "animation": {
      "duration": "4s",
      "easing": "ease-in-out"
    }
  },
  "controls": {
    "pinButton": {
      "size": 22,
      "normalColor": "rgba(255,255,255,0.85)",
      "pinnedColor": "rgba(255,215,0,0.95)",
      "hoverScale": 1.12
    }
  }
}
```

Notes:
- `animation.duration` is a string (e.g. `"4s"`) — some renderer code expects numeric durations (seconds). If you modify duration semantics, ensure the renderer parses this string into seconds (strip trailing `s`) or change to numeric duration in seconds.

---

## How the app uses the config at runtime
- `main` process uses `ConfigManager.loadConfig()` to configure the `BrowserWindow` (size, position, transparency, alwaysOnTop).
- `preload.ts` exposes `loadConfig()` via `window.electronAPI.loadConfig()` so the renderer can fetch the full config and apply appearance and breathing settings.
- Renderer code (`src/renderer/app.ts`) calls `window.electronAPI.loadConfig()` at startup and applies styles and shape sizes.

Developer note: `ConfigManager.loadConfig()` caches the config on first load. If you change the file while the app is running, you must call the relevant IPC handler or restart the app to reload updated config.

---

## UI Modes and Flows
Below are the supported UI modes and their concise behavioral descriptions and ASCII diagrams.

### 1) Compact HUD
- Small, single-widget HUD for minimal distraction
- Minimal controls: Play/Stop, Pin

```
[ Compact HUD ]
+------------------+
|      (shape)     |
|       80px       |
|                  |
|  [Play] [Pin]    |
+------------------+
```

Behavior:
- Click Play to start engine (IPC -> main or local renderer engine)
- Pin toggles click-through and pinned appearance

### 2) Enhanced HUD
- Full-featured HUD with controls, mode selector, and status
- Intended for interactive tuning and display

```
[ Enhanced HUD ]
+--------------------------------------+
|  BREATHING CANVAS (spans top)       |
|  +------------------------------+    |
|  |   central tile (shape + txt) |    |
|  +------------------------------+    |
|                      [controls] ^     
+--------------------------------------+
|   [Mode buttons]   [Mode display]     |
+--------------------------------------+
```

Behavior:
- Mode switcher selects presets (e.g., Relaxed, Energize, Focus)
- Controls include audio toggle, pin, close, and settings
- Status shows current phase and progress

### 3) Zen Mode
- Minimal, hover-reveal controls and low visual disruption
- Good for long-term background usage

```
[ Zen Mode ]
+--------------------------------------+
|  (translucent background, shape)     |
|          *controls hidden*           |
+--------------------------------------+
```

Behavior:
- Controls are hidden by default and revealed on hover or hotkey
- Double-click or hotkey opens full control overlay

### 4) Pinned Overlay
- Always-on-top, click-through skin with small interactive hotspot

```
[ Pinned Overlay ]
+--------------------------------------+
|  (HUD visual only; click-through)    |
|   shape renders, low opacity         |
|  [Pin Control]  [Unpin Ctrl] (hidden)|
+--------------------------------------+
```

Behavior:
- Window uses `alwaysOnTop` and `setIgnoreMouseEvents(true)` (click-through)
- A small hotspot area is interactive (pin/unpin)

### 5) Electron-native Mode (engine in main)
- Breathing engine runs in main (no DOM engine logic)
- Renderer subscribes to state via IPC and renders minimal canvas

```
Main Process (engine)                Renderer (UI)
+--------------------+               +------------------+
| Engine tick loop   |  IPC/state →  | Canvas (draw)    |
| computes shape     |──────────────>| (no Node, small) |
+--------------------+               +------------------+
             ↑
          Preload (exposes safe IPC channels)
```

Behavior:
- Safer (engine isolated from renderer), easier to test, and avoids DOM timing differences
- Renderer focuses on rendering only (faster and simpler)

### 6) Tray / Headless Mode
- Run engine in background controlled from system tray icon or menu

```
[ Tray Icon ] -> Context Menu -> Open HUD / Start / Stop / Settings / Exit
```

Behavior:
- Engine can run while HUD window is hidden
- Quick access from system tray

---

## Mode switching and persistence
- The HUD should persist mode and window position via configuration
- Currently the config is loaded at start. To persist runtime changes, implement a `settings:update` IPC channel that writes to a user config location and updates `ConfigManager` cache.

---

## Developer Notes and Best Practices
- `animation.duration` is stored as a string (e.g. `"4s"`) — standardize to numeric seconds when integrating with engine code (strip trailing `s` or store as numeric seconds).
- Renderer should avoid expensive DOM queries and per-frame allocations. Cache nodes and use `requestAnimationFrame` for animation. Consider canvas-based rendering for better performance.
- Consider moving the breathing engine to main and emitting structured state updates to renderer. This makes the engine deterministic and reduces renderer-side CPU.
- For production, consider moving the `hud-config.json` lookup to a per-user folder (e.g., `%APPDATA%/BreathingHUD/config.json`) and expose a `config:get`/`config:set` IPC surface for in-app settings edits.

---

## Troubleshooting
- "Config not loading": Ensure `hud-config.json` exists and is valid JSON. The loader logs a warning and falls back to defaults.
- "Window not positioned": Check that `window.position` uses screen coordinates that match current displays; negative or off-screen values will place the window out of view.
- "Animation durations not matching": Confirm `animation.duration` parsing in the renderer; if strings are used, make sure the renderer converts them to numeric seconds.

---

## Quick tasks you can apply now
- Add `settings:update` IPC to write to a user config path and call it when the user changes settings in the UI.
- Standardize `animation.duration` to numeric seconds in config and update `ConfigManager.getDefaultConfig()` accordingly.
- Implement cached DOM refs and `requestAnimationFrame` loops in renderer (already partially implemented in `enhanced-breathing-engine.ts`).

---

If you'd like, I can:
- Implement `settings:update` IPC and persist user changes to a user-writable config path,
- Convert `animation.duration` to numeric seconds across the app,
- Add a small UI within the HUD to edit and persist configuration interactively.

Which of the above would you like me to implement next?
