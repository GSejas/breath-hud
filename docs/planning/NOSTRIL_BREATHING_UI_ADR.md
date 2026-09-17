# ADR: Nostril Breathing UI Progress and State Model

Status: Accepted

The cross-surface composition rules and review matrix live in
[HUD UI/UX Composition and Flow](HUD_UI_UX_COMPOSITION.md). This ADR owns the
nostril progress contract; the composition document owns how that contract is
placed alongside the rest of the HUD.

## Context

The alternate-nostril pattern had a working Canvas2D animation, but its UI
did not expose the active nostril or the user's position within the cycle.
The existing progress bar was hidden, the runtime referenced a nostril element
that was never mounted, and phase text was updated in a live region on every
animation frame.

The renderer is a DOM-native Electron view, not a React application. The
implementation must therefore stay small, avoid a new state framework, and
keep timing ownership inside the breathing engine.

## Decision

The engine remains the authority for phase timing. It emits a structured
`BreathingProgress` snapshot containing:

- pattern ID
- phase index and phase count
- phase name and active nostril
- phase progress and remaining milliseconds
- cycle progress

`BreathingStatusView` owns the DOM projection of that snapshot through the
`BreathingStatusSink` contract. It renders:

- phase label
- plain-language instruction
- left/right/both nostril state
- duration-weighted stage segments
- stage summary
- a transition-only accessible announcement

Airway is optional phase metadata. If a creator specifies `nose` or `mouth`,
the instruction includes it. If omitted, the instruction remains neutral so
the user can choose. Nostril phases are inherently nasal and use the nostril
label instead of duplicating a generic “through nose” suffix.

The stage elements and their phase metadata are cached when the pattern changes.
The visual rail is updated at most every 100ms; phase and nostril semantics are
committed immediately so a transition is never delayed by the visual cadence.

The status view is mounted once and updated in place. Its fixed dimensions
reserve space for all states and prevent layout shift.

## Visual hierarchy

The breathing shape remains primary. The phase instruction and active nostril
are secondary. Stage progress is a persistent temporal cue. Directional arrows
are tertiary reinforcement.

Shape navigation is not part of the active exercise surface; shape selection is
configured in the separate editor. This prevents left/right controls from
being mistaken for breathing instructions.

For nostril breathing, arrows are drawn only on the active side and use the
same translated canvas center as the breathing shape:

- inhale points toward the center
- exhale points away from the center
- both uses two subtle arrows
- hold and pause have no animated directional arrows

Reduced motion keeps a static, low-opacity directional cue and removes the
progress-driven arrow fade.

## Runtime states

The status view supports explicit loading, empty, error, disabled, and ready
states. Error messages are user-facing but do not expose raw exceptions.

The ready state is the only state that updates phase progress. Loading and
failure states retain the same layout footprint so the HUD does not jump when
the engine starts or fails.

## Accessibility contract

The visible phase label is not a live region. A separate visually hidden
status element announces only phase or nostril changes. Per-frame countdown
updates are not announced.

The visual stage rail exposes a progressbar value and text description. Canvas
visuals are treated as decoration; the text instruction is the accessible
equivalent of the active nostril visualization.

## Testing boundary

Pure timing and rendering policies remain engine concerns. `BreathingStatusView`
tests cover:

- stable segment count
- active/inactive nostril rendering
- stage summary rendering
- announcement deduplication
- loading, empty, error, and disabled states

Canvas-specific behavior continues to use mocked contexts under JSDOM.

## Follow-up: shared-source consolidation

The repository still contains a legacy `src/shared/breathing-presets.ts` module
alongside `src/shared/constants/patterns.constants.ts`. The main HUD runtime
uses the constants registry, while the sequence manager still imports the
legacy sequence module. New patterns must not be added to only one registry.

The next cleanup should move sequence definitions beside the canonical pattern
registry and leave a compatibility re-export until existing tests and imports
are migrated.
