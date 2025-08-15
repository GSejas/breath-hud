# Architecture — ASCII Abstract Art

This file contains compact ASCII art diagrams that express relationships between major entities, processes, data models, IPC flows, and UI modes for the Breathing HUD project. Use these as quick visual references or to inspire implementation changes.

---

## 1) System Overview

Shows the top-level processes and how they communicate.

```
+---------------------------------------------+
|                 Host Machine                 |
|                                             |
|  +-----------+       +------------------+   |
|  |  Main     | <==== |  File system /   |   |
|  |  Process  |  IPC  |  user config     |   |
|  | (Node)    | ----> |  hud-config.json |   |
|  +-----------+       +------------------+   |
|       |  ^                                   |
|  IPC   |  | Renderer (Browser)                |
|       v  |                                   |
|  +-----------+    preload.js   +-----------+  |
|  | Breathing | <-------------- | Renderer  |  |
|  | Engine    |  secured IPC    | (Canvas/  |  |
|  | (timing,  |                |  SVG)     |  |
|  |  audio)   |                +-----------+  |
|  +-----------+                                |
+---------------------------------------------+
```

Legend:
- Arrows labeled `IPC` indicate calls via `preload.ts` contextBridge.
- The engine runs in `main` (recommended) or may run in the renderer depending on mode.

---

## 2) IPC & Preload Relations

Focus on the preload bridge and the minimal API surface.

```
+----------------------+        contextBridge         +----------------------+
|  Renderer (window)   |  <-------------------------- |  Preload (isolated)  |
|  (UI / Canvas)       |  window.electronAPI.*       |  (contextBridge)     |
+----------------------+                             +----------------------+
           |  ^                                                |  ^
           |  | ipcRenderer.invoke / on                        |  | ipcMain.handle / on
           v  |                                                v  |
+----------------------+       secured IPC        +----------------------+ 
| Renderer-side code   | -----------------------> | Main-side handlers   |
| (subscribe, render)  | <----------------------- | (engine, config, fs) |
+----------------------+       events & commands  +----------------------+ 
```

Key APIs (examples): `loadConfig`, `startBreathing`, `stopBreathing`, `setClickThrough`, `onBreathingStateChanged`.

---

## 3) Engine Lifecycle (State Machine)

An abstract state machine for breathing engine phases and transitions.

```
[STOPPED]
   | start()                (engine start)
   v
[RUNNING] --(phase completes)--> [RUNNING]  (cycle through phases)
   |                                ^
   | pause() / stop()               |
   v                                |
[PAUSED] ---------------------------

Phases (pattern): inhale -> hold -> exhale -> pause -> inhale ...
Each phase: { name, duration (s), intensity }
```

Notes:
- Engine should emit `phaseChanged(phase)` only when a phase boundary occurs.
- Per-frame updates should emit `tick(state)` or `frame(state)` for renderer drawing.

---

## 4) Data & Entities (Abstract)

```
HudConfig
├─ appearance
│  ├─ theme
│  ├─ opacity
│  └─ colors
├─ window
│  ├─ width
│  └─ position
├─ breathing
│  ├─ shape
│  └─ animation
└─ controls
   └─ pinButton

BreathingPattern
├─ id
├─ name
└─ phases[]
   ├─ { name, duration, intensity }
   └─ ...
```

Relationships:
- `HudConfig` is read by `Main` to create `BrowserWindow`, and by `Renderer` to theme UI.
- `BreathingPattern` is consumed by the engine (Main or Renderer) to schedule phases.

---

## 5) UI Mode Flows (compact diagrams)

Compact HUD Flow
```
User -> Click Play -> Renderer sends `start` -> Main or Renderer Engine runs -> Renderer draws frames
User -> Click Pin -> Renderer sends `pin` -> Main toggles click-through
```

Enhanced HUD Flow
```
User -> Open Settings -> Renderer shows Settings UI -> User edits config
    -> Renderer calls `settings:update` via preload -> Main writes config file & responds
    -> Renderer optionally reloads applied values (colors / positions)
```

Tray-first / Headless Flow
```
System Tray Icon -> Right-click -> [Start/Stop] -> sends ipc -> Engine toggles
If HUD closed: Engine still runs in background -> tray tooltip shows status
```

---

## 6) Sequence: Start-up (simplified)

```
1. app.whenReady()
2. ConfigManager.loadConfig()  (Main reads hud-config.json or defaults)
3. new BrowserWindow({ preload: 'dist/main/preload.js', ...})
4. mainWindow.loadFile('dist/renderer/index.html')
5. Renderer bootstraps -> preload exposed API available
6. Renderer calls window.electronAPI.loadConfig() -> receives config
7. Renderer applies theming, then requests engine start or waits for user
```

---

## 7) Performance-relevant relationships (cause -> effect)

```
Cause: onPhaseChange called every frame
  -> Effect: heavy DOM/IPC work per frame
  -> Fix: call only on transitions OR throttle / emit light-weight events

Cause: querySelector / DOM allocation inside rAF loop
  -> Effect: layout and GC pressure -> visible jank
  -> Fix: cache element refs; do minimal style writes; use Canvas for per-frame draws
```

---

## 8) Mapping of UI Modes to Implementation Decisions

```
Compact HUD   -> Minimal DOM, small canvas, engine may run in renderer for simplicity
Enhanced HUD  -> Full DOM, settings pane, engine in main preferred for stability
Zen Mode      -> Click-through window, minimal or hidden DOM controls
Pinned Overlay-> alwaysOnTop + ignoreMouseEvents(true) with hotspot region
Electron-native-> Engine in main, renderer subscribes to state; best for determinism
```

---

## 9) Quick ASCII Key (symbols)

- `->` / `-->` : directional flow / message
- `<->` : bidirectional flow
- `[ ]` : state or entity
- `|` / `-` : connectors
- `*` : event or trigger

---

If you'd like, I can embed these diagrams into the `DEVELOPER_GUIDE.md` or `CONFIGURATION_AND_UI_FLOWS.md`, or produce PNG/SVG exports from these ASCII diagrams for design docs. Which file should I update next?
