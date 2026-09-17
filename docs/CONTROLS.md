# Controls Reference

This is the source-of-truth reference for the current Breathing HUD controls.
Hover a control for the same guidance in the app. Keyboard shortcuts are ignored
while focus is in a text field, slider, select, or button.

## Primary controls

| Control | Action | State and feedback |
| --- | --- | --- |
| Edit (pencil) | Opens the separate minimal editor window. It does not change Zen, Basic, or Advanced mode. | The editor opens as a taskbar-visible window with preview, bounded controls, state inspection, Save, Cancel, and Reset. |
| Theme (palette) | Cycles through the available visual themes. | Colors and theme effects update immediately. |
| Pin | Enables or disables click-through behavior. The HUD remains visible while mouse input passes through it. | The pin state and opacity change; `Ctrl+Alt+P` also toggles it. |
| Close | Hides the HUD to the system tray. | Use the tray's **Quit** command to exit the application. |

## Mode and navigation controls

| Control | Action | Notes |
| --- | --- | --- |
| Mode button | Cycles `Zen → Basic → Advanced → Zen`. | Edit is a separate taskbar-visible editor window, not a mode. |
| Next pattern | Selects the next breathing pattern. | Stops an active sequence before changing the pattern. |
| Start/stop sequence | Starts or stops the selected breathing sequence. | Starting resets the sequence to its first step. The status line reports the current step and repetition. |
| Next sequence | Selects the next configured sequence. | When stopped, it previews the first pattern without starting. When active, it starts the selected sequence. It is disabled when fewer than two sequences are configured. |

The current built-in sequence is **Focus Session**: 25 repetitions of
4-4-4-4 box breathing. The sequence control becomes more useful when additional
sequences are added to `BREATHING_SEQUENCES`.

## Advanced controls

| Control | Action | Range/step |
| --- | --- | --- |
| Smaller / Larger | Changes the square HUD window and scales the figure and labels proportionally. | 240–600px, in 40px steps; default 300px. |
| Less / More intense | Changes the overall breathing animation intensity. | 0.1–1.0, in 0.1 steps. |
| Base slider | Sets the neutral breathing size. | 0.2–1.2, step 0.05. |
| Inhale slider | Sets the maximum size reached during inhale. | 0.6–1.8, step 0.05. |
| Exhale slider | Sets the minimum size reached during exhale. | 0.1–0.8, step 0.05; capped at the base size. |

Changing a slider applies immediately. The displayed value is the current
runtime value; use the editor's **Save changes** action to persist it.

## Minimal editor controls

| Control | Action |
| --- | --- |
| Save changes | Persists the normalized draft and applies it to the live HUD. The editor remains open after a successful save. |
| Cancel | Restores the session snapshot and closes the editor without applying unsaved changes. |
| Reset defaults | Replaces the draft with defaults after confirmation; Save is still required. |
| Drag shape | Moves the preview shape within the bounded -80..80 position range. |
| Arrow keys | With the preview shape focused, nudges its position by 5px. |
| Preview state | Inspects loading, empty, error, ready, and disabled states without changing the saved draft. |

The editor preview keeps shape movement bounded to the preview surface. HUD size
controls are the supported way to change the live overlay scale.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+Alt+B` | Bring the HUD to the foreground and show a temporary attention state. |
| `Ctrl+Alt+P` | Toggle pin/click-through mode. |
| `Ctrl+Alt+H` | Show or hide the HUD window. |
| `Ctrl+Alt+E` | Open or focus the minimal editor window. |
| `ArrowLeft` / `ArrowRight` | Nudges the focused preview shape in the editor. Shape selection is configured in the editor, not during an active HUD session. |
| `ArrowUp` / `ArrowDown` | Next/previous pattern in the HUD; nudges the focused preview shape in the editor. |
| `Escape` | Cancels and closes the editor without applying unsaved changes. |

## Read-only indicators

- The center phase indicator announces the current breathing phase.
- Nostril patterns show the active left, right, or both-nostril cue and a stage summary.
- The segmented rail shows progress through the full pattern cycle, not only the current phase.
- The lower-left labels show the active shape and pattern.
- The sequence status shows whether a sequence is off, active, or at a specific step/repetition.
- The HUD debug console is diagnostic output; it is not an input control.

## System tray

The app creates a tray entry while running. Single-click shows and focuses the
HUD; double-click opens the minimal editor. The context menu also provides
**Show HUD**, **Open minimal editor**, **Hide HUD**, and **Quit**.
