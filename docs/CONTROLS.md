# Controls Reference

This is the source-of-truth reference for the current Breathing HUD controls.
Hover a control for the same guidance in the app. Keyboard shortcuts are ignored
while focus is in a text field, slider, select, or button.

## Primary controls

| Control | Action | State and feedback |
| --- | --- | --- |
| Edit (pencil) | Toggles the independent Edit overlay. It does not change Zen, Basic, or Advanced mode. | The button changes to an exit indicator; the shape becomes draggable and the edit console appears. |
| Theme (palette) | Cycles through the available visual themes. | Colors and theme effects update immediately. |
| Pin | Enables or disables click-through behavior. The HUD remains visible while mouse input passes through it. | The pin state and opacity change; `Ctrl+Alt+P` also toggles it. |
| Close | Closes the HUD window. | The application window exits/closes according to the Electron window lifecycle. |

## Mode and navigation controls

| Control | Action | Notes |
| --- | --- | --- |
| Mode button | Cycles `Zen → Basic → Advanced → Zen`. | Edit is not part of this cycle; it is an independent overlay. |
| Previous shape | Selects the previous breathing shape. | Wraps from the first shape to the last. |
| Next shape | Selects the next breathing shape. | Wraps from the last shape to the first. |
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
runtime value; use **Save** to persist it.

## Edit controls

| Control | Action |
| --- | --- |
| Save | Persists the selected shape, pattern, theme, intensity, breathing parameters, HUD size, mode, and shape position to local storage. |
| Reset | Restores runtime defaults and clears the saved HUD configuration and saved window size. This is destructive and should be used deliberately. |
| Drag shape | Moves the breathing figure while Edit is enabled. |
| Arrow keys | Without a selected shape, left/right changes shape and up/down changes pattern. With a selected shape, arrows nudge its position by 5px. |
| Escape | Deselects the shape while remaining in Edit. |

Edit-mode zoom is bounded to 1–1.25× so it cannot make the HUD overflow its
window. HUD size controls are the supported way to change the overall scale.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+Alt+B` | Bring the HUD to the foreground and show a temporary attention state. |
| `Ctrl+Alt+P` | Toggle pin/click-through mode. |
| `Ctrl+Alt+H` | Show or hide the HUD window. |
| `ArrowLeft` / `ArrowRight` | Previous/next shape; in Edit, nudges a selected shape instead. |
| `ArrowUp` / `ArrowDown` | Next/previous pattern; in Edit, nudges a selected shape instead. |
| `Escape` | Deselect the shape in Edit. |

## Read-only indicators

- The center phase indicator announces the current breathing phase.
- The lower-left labels show the active shape and pattern.
- The sequence status shows whether a sequence is off, active, or at a specific step/repetition.
- The Edit debug console is diagnostic output; it is not an input control.

