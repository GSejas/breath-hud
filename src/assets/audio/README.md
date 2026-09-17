# Breathing tonal cue assets

The current MP3 mapping is:

- `inhale.mp3`: generic inhale fallback
- `bells.mp3`: hold cue
- `exhale.mp3`: generic exhale fallback
- `nose inhale.mp3`: overrides generic inhale when airway is `nose`
- `mouth exhale.mp3`: exhale cue when airway is `mouth`

Pause is currently silent. Add `pause.mp3` later if that phase needs a neutral
cue.

The renderer build copies MP3 files from this directory to
`dist/renderer/audio/`. Keep the recordings short, tonal, and semantically
neutral; do not include phase words or nostril/airway instructions in this
first slice. Route-specific files are selected only from explicit phase airway
metadata; filenames with spaces are supported.
