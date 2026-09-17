import {
  editorDraftFromPersistedConfig,
  editorDraftToPersistedConfig,
  normalizeEditorDraft,
} from '../editor-draft';
import { DEFAULT_EDITOR_DRAFT } from '../types/editor.types';

describe('editor draft contract', () => {
  it('normalizes invalid catalog values and numeric invariants', () => {
    expect(normalizeEditorDraft({
      shapeId: 'missing',
      patternId: 'missing',
      themeId: 'missing',
      frame: 'missing',
      intensity: 9,
      baseSize: 0.9,
      inhaleMax: 0.2,
      exhaleMin: 1.2,
      hudSize: 999,
      shapePosition: { x: -999, y: 999 },
    })).toEqual({
      ...DEFAULT_EDITOR_DRAFT,
      intensity: 1,
      baseSize: 0.9,
      inhaleMax: 0.9,
      exhaleMin: 0.8,
      hudSize: 600,
      shapePosition: { x: -80, y: 80 },
    });
  });

  it('reads the legacy index-based runtime config', () => {
    expect(editorDraftFromPersistedConfig({
      currentShape: 1,
      currentPattern: 8,
      currentTheme: 2,
      intensity: 0.5,
      hudSize: 440,
      shapePosition: { x: 12, y: -4 },
      breathingParams: { baseSize: 0.5, inhaleMax: 1.2, exhaleMin: 0.3 },
    })).toMatchObject({
      shapeId: 'triangle',
      patternId: 'alternate-nostril',
      themeId: 'sunset',
      intensity: 0.5,
      hudSize: 440,
      shapePosition: { x: 12, y: -4 },
      baseSize: 0.5,
      inhaleMax: 1.2,
      exhaleMin: 0.3,
    });
  });

  it('preserves unrelated persisted fields while writing IDs and indexes', () => {
    const draft = normalizeEditorDraft({ patternId: 'alternate-nostril', shapeId: 'heart' });
    const saved = editorDraftToPersistedConfig(draft, { mode: 'zen', custom: true });

    expect(saved).toMatchObject({
      mode: 'zen',
      custom: true,
      shapeId: 'heart',
      patternId: 'alternate-nostril',
      currentShape: 4,
      currentPattern: 8,
    });
  });
});

