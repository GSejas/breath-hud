# Breathing HUD — View Review & Redesign Handoff

Status: design-only review. This document proposes a calmer information
hierarchy and documents the existing renderer contracts without changing them.

Visual index: [storyboard](diagrams/hud-view-storyboard.svg) ·
[user flows](diagrams/hud-user-flows.svg) · [mode map](diagrams/hud-mode-map.svg) ·
[component contracts](diagrams/hud-component-contracts.svg).

## 1. What was reviewed

The populated checkout is `C:\Users\delir\Documents\repos\hud`. The current
implementation is an Electron main process plus a DOM renderer and Canvas2D
breathing engine. Existing design/editor changes in the dirty worktree were
left untouched.

Repository documentation was treated as evidence, not as a new task. In
particular, the trailing `# instructions` block in `docs/FLOWS.md` is legacy
Copilot text; it is not silently promoted into an implementation requirement.
The redesign below responds to the current request and preserves existing
runtime behavior.

## 2. Current view inventory

| View | Current source/evidence | User job | Main friction |
| --- | --- | --- | --- |
| Runtime HUD | `src/renderer/index.html`, `app.ts` | Follow the active phase | Multiple floating control clusters compete with the breath cue |
| Basic mode | `setBasicControlsVisibility()` in `app.ts` | Start a calm session with essentials | Mode is a cycle button, not an explicit mode choice |
| Zen mode | `.zen-mode` CSS and hover rules | Keep the HUD ambient | Hover/focus and auto-fade policies are difficult to predict |
| Advanced mode | `.advanced-controls`, `.breathing-sliders` | Tune size and intensity | Configuration is split between compact buttons and sliders |
| Pinned overlay | `togglePin()`, main-process window state | Keep guidance visible while working | Click-through affordance is easy to miss; controls can be visually noisy |
| Minimal editor | `?view=editor`, `SystemEditor` | Preview and save presentation settings | Stronger than runtime HUD, but editor and runtime vocabulary is not yet unified |
| Tray | `main.ts:createTray()` | Recover/open/quit without the HUD | Tray is a second navigation surface with no shared visual map |
| First-run welcome | Not currently implemented | Learn hotkeys, modes, and controls | Add as a dismissible onboarding tile, not as a new mode |

## 3. Redesign direction

### Runtime principle: one focus surface, one utility rail

The breathing field is the primary surface. The phase cue, remaining time,
nostril/airway cue, and cycle progress stay centered and reserve stable space.
All utility actions live in one compact rail that can expand on demand. The
shape/pattern/sequence summary becomes one readable metadata row rather than
three separate low-contrast labels.

Recommended hierarchy:

1. Breath cue: phase + instruction + remaining time.
2. Progress: phase segment and cycle position.
3. Session context: pattern, shape, sequence status.
4. Utility rail: Edit, Theme, Pin, Hide; Advanced controls behind an explicit
   “Tune” disclosure.

### First-run welcome tile

Show once per installation/profile, after the first HUD paint and before the
user starts a sequence. It is a small translucent tile anchored beside the
HUD, never centered over the breathing cue. It has three click-to-advance
cards, each with one sentence and one visual:

1. **Breathe** — “The circle follows your phase. Follow the word, not the
   animation.”
2. **Modes** — “Basic is calm, Advanced tunes the feel, Zen gets out of the
   way.”
3. **Controls** — “Edit, pin, and hide are always available; use the hotkeys
   when the HUD is out of reach.”

The tile must expose a progress indicator, a visible `Skip` action, and a
close button. Clicking the card advances; clicking the final card or `Done`
sets a versioned local preference. It must not start breathing, change mode,
or alter the saved draft.

### Mode language

Treat mode as presentation density, not a second engine state:

- **Zen**: breath field + phase cue; reveal the utility rail on hover/focus.
- **Basic**: breath field + utility rail + session context.
- **Advanced**: Basic plus an explicit Tune sheet for bounded values.
- **Pinned**: a window interaction state orthogonal to mode; preserve the
  prior mode when unpinning.
- **Editor**: a separate taskbar-visible preview workspace, never part of the
  mode cycle.

## 4. Proposed view set

The [storyboard](diagrams/hud-view-storyboard.svg) shows the intended sequence:

- `V0` runtime at rest: quiet ring, one cue, one metadata row.
- `V1` first-run welcome: three centered messages in a side tile.
- `V2` Basic active: utility rail expanded, no advanced controls.
- `V3` Advanced tuning: bounded controls in a stable sheet, not scattered
  around the canvas.
- `V4` editor: existing two-column editor retained, with shared naming.
- `V5` tray recovery: Show HUD, Edit, Hide, Quit mirror the same vocabulary.

## 5. Interaction and state contracts

The [user-flow diagram](diagrams/hud-user-flows.svg) makes ownership explicit:

- Startup checks the onboarding preference, then paints the runtime HUD.
- Welcome dismissal is local UI state; it does not touch `EditorDraft`.
- Mode changes call the existing mode presentation boundary.
- Pinning changes window/input behavior and remembers the previous mode.
- Edit opens the existing editor bridge and snapshot lifecycle.
- Close hides to tray; Quit remains a main-process action.

Required user-visible states for every redesign surface: loading, ready,
empty/no pattern, error, disabled/click-through, and saved/unsaved. Reserve
space for status text so phase changes and save feedback never shift controls.

## 6. Accessibility and responsive requirements

- Keep every interactive target at least 44 × 44 CSS px.
- Use semantic `button`, `fieldset/legend`, `input[type=range]`, and `role=status`;
  never make the Canvas2D drawing the only source of phase meaning.
- Announce phase/nostril transitions at a bounded cadence, not every animation
  frame. Keep a persistent text cue in the DOM.
- `Escape` closes the welcome tile, utility rail, and editor in that order;
  focus returns to the invoking control.
- Reduced motion keeps the phase cue and progress visible while removing glow,
  scale, and directional animation.
- At narrow widths, stack the utility rail below the cue and keep the welcome
  tile inside the window bounds; no horizontal scroll or hover-only action.

## 7. Implementation boundary for a future build

This is a handoff, not an implementation request. If adopted, map the design
to the existing boundaries:

- `TileControlSystem` remains the runtime owner of mode, pin, sequence, and
  editor-open actions.
- `BreathingStatusView` remains the semantic projection of phase progress.
- `EnhancedBreathingEngine` remains the Canvas2D renderer and timing owner.
- `SystemEditor` remains the editor draft/preview/save controller.
- `main.ts` and `preload.ts` remain the tray, window, and shortcut boundary.
- A future `WelcomeTile` should own only versioned onboarding preference and
  `onDismiss`; it must not duplicate engine or editor state.

Acceptance signals for a later implementation: a new user understands the
three modes without opening docs; a returning user can reach Edit/Pin/Hide in
one interaction; active phase text remains readable with controls hidden; and
the editor, HUD, and tray use identical names for the same action.

