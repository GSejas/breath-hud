GitHub Copilot

Understood — app is an Electron breathing-HUD with main/renderer separation, modes (basic/advanced/zen), a breathing canvas/shape renderer, and control UI. Below are several alternative UI flows represented in ASCII art. Each block shows layout and interaction paths.

Flow 1 — Compact HUD (single small widget, minimal controls)
```text
   [ Compact HUD ]
   +------------------+
   |      (shape)     |   <-- breathing canvas (center)
   |       80px       |
   |                  |
   |  [Play] [Pin]    |   <-- tiny control row (no modes)
   +------------------+

 Interactions:
  Play/Stop -> toggles engine via IPC
  Pin -> toggles always-on-top / click-through
```

Flow 2 — Enhanced HUD (matches enhanced-index.html: grid + controls)
```text
   [ Enhanced HUD ]
   +--------------------------------------+
   |  BREATHING CANVAS (spans top)       |
   |  +------------------------------+    |
   |  |   central tile (shape + txt) |    |
   |  +------------------------------+    |
   |                      [controls] ^     <- small icon buttons (top-right)
   |                                 |     (mode, settings, pin, close)
   +--------------------------------------+
   |   [Mode buttons]   [Mode display]     | <- bottom row: mode switcher, pattern names
   +--------------------------------------+

 Interactions:
  Mode buttons -> change style/state
  Controls -> keyboard shortcuts, hover reveals in zen
  Canvas <- renderer draws frames from engine state
```

Flow 3 — Zen Mode (minimal, hover-reveal)
```text
   [ Zen Mode ]
   +--------------------------------------+
   |  (translucent background, shape)     |
   |                                      |
   |          *controls hidden*           |
   |                                      |
   +--------------------------------------+
   Hover -> show small control cluster (pin/exit) at corner
   Double-click / hotkey -> open full controls overlay
```

Flow 4 — Pinned Overlay (always-on-top, partial click-through)
```text
   [ Pinned Overlay ]
   +--------------------------------------+
   |  (HUD visual only; click-through)    |
   |   shape renders, low opacity         |
   |  [Pin Control]  [Unpin Ctrl] (hidden)|
   +--------------------------------------+

 Implementation notes:
  - Window set to alwaysOnTop, skipTaskbar, and setIgnoreMouseEvents(true) except a small control hotspot
  - Hotspot receives clicks via CSS region / no-drag zones
```

Flow 5 — Electron-native (no DOM logic; main-driven rendering)
```text
   [ Electron-native (preferred no-DOM) ]
   Main Process (engine)                Renderer (UI)
   +--------------------+               +------------------+
   | Engine tick loop   |  IPC/state →  | Canvas (draw)    |
   | computes shape     |──────────────>| (no Node, small) |
   | audio / timers     |               | minimal DOM only |
   +--------------------+               +------------------+
                ↑
             Preload (exposes safe IPC channels)
   Interactions:
    - Renderer subscribes to state/frame events
    - Main owns engine & timing (safer, no DOM in engine)
```

Flow 6 — Tray-first / Headless mode (background engine + quick UI)
```text
   [ Tray / Headless ]
   +------------+    Right-click
   | Tray Icon  |----------------> Context Menu
   +------------+                  - Open HUD
                                   - Start/Stop
                                   - Settings
                                   - Exit

 When "Open HUD" -> ephemeral window (Compact HUD or Enhanced)
 Engine can run in background while hidden
```

Pick one or ask for a merged hybrid (e.g., Electron-native engine + Enhanced UI with hover-zen + tray control) and I will produce a concrete implementation plan and IPC APIs for that flow.

# instructions
let's add a welcome messaege, that the first time you use the app, it appears
a translucent small tile, that explains hotkeys, modes, and controls. 3 simple centered
big messages, disappeared with simple clicks.

