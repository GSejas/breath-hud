# Audio Cues Design

Status: Slice A selected: short tonal MP3 cues, intentionally small first
slice.

## Decision summary

Audio is a parallel practice cue, not a second breathing engine. The
`EnhancedBreathingEngine` remains the timing authority and emits one
transition event per phase. An audio adapter subscribes to that event and
plays at most one cue for the transition.

```text
engine phase transition
        +--> visual status projection
        +--> accessible announcement
        +--> optional audio cue
```

Audio must never calculate phase timing, poll progress, or become the only way
to understand the exercise.

## How it fits the mental models

### Practice mode

Audio answers the same question as the visual cue: “what changed?” It should
be short, predictable, and optional. A user can follow the shape and text with
audio disabled.

### Editor mode

The editor may eventually provide an explicit “Preview sound” action, but it
must not autoplay audio when the editor opens or when a user changes a select.
The editor previews configuration; it does not start the live engine.

### System chrome

The live HUD needs one clearly labelled Sound control: enabled/disabled. A
volume control belongs in configuration or the editor, not beside the phase
cue. Mute must be immediately recoverable from the HUD or tray menu.

## Phased scope

### Slice A: local phase cues

The current asset set is intentionally partial:

```text
audio/inhale.mp3
audio/bells.mp3
audio/exhale.mp3
audio/nose inhale.mp3
audio/mouth exhale.mp3
```

Resolution is explicit and conservative:

1. `nose inhale.mp3` for an inhale phase with `airway: 'nose'`.
2. `mouth exhale.mp3` for an exhale phase with `airway: 'mouth'`.
3. `inhale.mp3` for other inhale phases.
4. `bells.mp3` for hold phases.
5. `exhale.mp3` for other exhale phases.
6. No cue for pause when no matching asset exists.

If a specific route asset fails to load or play, the generic phase asset is
attempted before the phase is left silent.

The route semantics remain visible in the phase instruction and nostril
indicator. The app must not infer route meaning from a generic cue.

Required behavior:

- Sound is off by default until the user explicitly enables it.
- A phase transition plays one cue; per-frame progress never plays audio.
- Missing or failed recordings are skipped without breaking breathing.
- Repeated cycles reuse preloaded local assets; no network request is needed.
- Audio volume is clamped from 0.0 to 1.0.
- A new phase stops or replaces the previous cue; cues are never queued. The
  current `bells.mp3` is longer than a typical phase, so it is intentionally
  truncated when the next phase begins.

### Slice B: authored semantic variants

If a creator needs audio to state route semantics, add optional authored cue
IDs to the pattern phase, for example:

```ts
interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'pause';
  audioCueId?: string;
  airway?: 'nose' | 'mouth';
  nostril?: 'left' | 'right' | 'both';
}
```

Resolution order:

1. Explicit `audioCueId`, when present.
2. A phase-level default, when sound is enabled.
3. No audio.

Route-specific clips must be explicit. The system must not infer that a
generic phase recording communicates “left nostril” or “through mouth.”

## Contract

```ts
type AudioCuePhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface AudioCueConfig {
  enabled: boolean;
  volume: number; // 0..1
}

interface AudioCueSink {
  setConfig(config: AudioCueConfig): void;
  playPhase(phase: BreathingPhase): void;
  stop(): void;
}
```

The sink is a side-effect boundary. It does not mutate the breathing pattern
or emit phase changes. The engine event must be transition-deduplicated before
the sink is called.

## Playback technology

Use cached local `HTMLAudioElement` instances with packaged MP3 assets for
Slice A. This is sufficient for short recordings and keeps the implementation
boring:

- no Web Audio graph;
- no new renderer timer;
- no network streaming;
- no audio mixing requirement;
- catch rejected `play()` promises and log diagnostics only.

If later requirements need overlapping ambient sound, fades, or spatial audio,
that is a separate architecture decision.

## UI composition rules

| Element | Placement | Rule |
| --- | --- | --- |
| Sound toggle | Utility toolbar or tray | One toggle, 44px target, explicit label |
| Volume | Editor/configuration | Not in the practice field |
| Phase recording | Hidden implementation detail | Never displayed as a second phase label |
| Route instruction | Status cue | Remains visible when airway/nostril adds meaning |
| Playback failure | Diagnostic only | Do not replace breathing status with an audio error |

Audio must not introduce a second visible “Inhale” or “Hold.” It reinforces
the phase; it does not create another text hierarchy.

## Accessibility and safety

- Audio is never the sole cue; visual and accessible text remain complete.
- Sound preference is independent from `prefers-reduced-motion`.
- Reduced motion does not imply mute, and enabling sound does not re-enable
  visual motion.
- The user must be able to mute without opening the editor.
- Editor preview sound requires an explicit user action.
- Screen-reader announcements remain transition-only; audio does not alter
  the live-region cadence.
- Audio failures are non-fatal and must not prevent the breathing engine from
  starting or continuing.

## Recording handoff

For Slice A, provide short files with stable names matching the asset mapping.
Recommended constraints:

- MP3 files are the packaged format; source masters may be WAV or another
  lossless format.
- Short, consistent lead-in and loudness across files.
- No more than one cue per phase transition.
- Avoid long spoken instructions unless they are intentionally authored as
  route-specific Slice B cues.
- Include a text transcript/description for each recording.

Longer files are allowed for a deliberate sustained cue, but the phase
transition policy still stops them when the next phase begins.

Decision: Slice A uses short tonal MP3 cues, not spoken phase words. The
contract stays ready for authored route-specific recordings later, but the
first asset set must remain semantically neutral.

## Verification matrix

Before calling audio complete, verify:

- enabled/disabled toggle;
- volume 0, midpoint, and maximum;
- each phase and cycle wrap;
- reduced motion on/off;
- missing asset and rejected playback;
- generic, airway-authored, and nostril patterns;
- editor open without autoplay;
- HUD hidden to tray and restored;
- pinned/click-through mode;
- rapid phase transitions do not queue stale cues.

## Related sources

- [HUD UI/UX Composition and Flow](HUD_UI_UX_COMPOSITION.md)
- [Nostril Breathing UI ADR](NOSTRIL_BREATHING_UI_ADR.md)
- [Minimal Editor Runtime ADR](MINIMAL_EDITOR_IMPLEMENTATION_ADR.md)
