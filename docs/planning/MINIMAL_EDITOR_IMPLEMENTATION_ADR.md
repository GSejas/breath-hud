# ADR: Minimal Editor Runtime Boundary

Status: Accepted

Cross-surface mental models, hierarchy rules, and permutation review live in
[HUD UI/UX Composition and Flow](HUD_UI_UX_COMPOSITION.md). This ADR owns the
editor runtime boundary and lifecycle.

## Context

The initial editor work landed as a static design surface while the HUD still
used the legacy mutable edit path. A parallel implementation then connected the
editor, but left both paths and several implicit lifecycle assumptions in the
runtime.

## Decision

The minimal editor is a real, separate Electron `BrowserWindow` entered from
the HUD Edit control, `Ctrl+Alt+E`, or the system tray. Its renderer runs
`?view=editor` and never starts the live breathing engine.

`SystemEditor` owns a normalized, immutable-by-contract `EditorDraft` and its
session snapshot. The preview is a deterministic projection of that draft. The
HUD remains the only timing authority and receives a validated draft through
the narrow preload IPC bridge.

Persistence is explicit:

- Save validates and applies the draft, then persists it.
- Cancel restores the session snapshot and closes without applying changes.
- Reset requires confirmation and remains unsaved until Save succeeds.

The HUD's old `TileControlSystem` edit-mode runtime and styling are not a second
production entry point. `EditPanel` and `EditModeController` remain as legacy,
test-covered modules until a separately scoped removal/migration is approved.

The system tray owns application lifetime. Closing the HUD hides it to the tray;
the tray Quit action terminates the process. The editor remains taskbar-visible
and can be opened while the HUD is hidden or pinned.

## Invariants

- Draft IDs resolve against shared runtime catalogs.
- Numeric draft values are finite, bounded, and preserve size relationships.
- `initialDraft` does not mutate during an editor session.
- The editor does not create a second breathing timing loop.
- A renderer status view receives its pattern before the engine starts.
- Phase/nostril announcements are transition-only; visual progress is bounded.

## Verification boundary

Pure draft, DOM lifecycle, keyboard, status-cadence, and arrow-anchor tests run
in Jest. `npm run lint`, `npm run build`, and the full Jest suite are required.
Electron window/tray/focus smoke remains a manual verification step because the
current execution environment cannot launch Electron successfully.
