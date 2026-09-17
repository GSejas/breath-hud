import { BREATHING_PATTERNS, BREATHING_SHAPES, VISUAL_THEMES } from './constants';
import {
  DEFAULT_EDITOR_DRAFT,
  type EditorDraft,
  type EditorFrame,
} from './types/editor.types';

export const EDITOR_CONFIG_STORAGE_KEY = 'breathingHudConfig';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function chooseId(value: unknown, ids: readonly string[], fallback: string): string {
  return typeof value === 'string' && ids.includes(value) ? value : fallback;
}

function chooseFrame(value: unknown): EditorFrame {
  return value === 'outline' || value === 'soft' || value === 'quiet' || value === 'glass'
    ? value
    : DEFAULT_EDITOR_DRAFT.frame;
}

function indexOfId(ids: readonly string[], id: string): number {
  const index = ids.indexOf(id);
  return index >= 0 ? index : 0;
}

export function cloneEditorDraft(draft: EditorDraft): EditorDraft {
  return {
    ...draft,
    shapePosition: { ...draft.shapePosition },
  };
}

/** Normalize untrusted editor input at the contract boundary. */
export function normalizeEditorDraft(value: unknown): EditorDraft {
  const raw = isRecord(value) ? value : {};
  const baseSize = clamp(raw.baseSize, 0.2, 1.2, DEFAULT_EDITOR_DRAFT.baseSize);
  const inhaleMax = Math.max(
    baseSize,
    clamp(raw.inhaleMax, 0.6, 1.8, DEFAULT_EDITOR_DRAFT.inhaleMax),
  );
  const exhaleMin = Math.min(
    baseSize,
    clamp(raw.exhaleMin, 0.1, 0.8, DEFAULT_EDITOR_DRAFT.exhaleMin),
  );
  const position = isRecord(raw.shapePosition) ? raw.shapePosition : {};

  return {
    shapeId: chooseId(raw.shapeId, BREATHING_SHAPES.map((shape) => shape.id), DEFAULT_EDITOR_DRAFT.shapeId),
    patternId: chooseId(raw.patternId, BREATHING_PATTERNS.map((pattern) => pattern.id), DEFAULT_EDITOR_DRAFT.patternId),
    themeId: chooseId(raw.themeId, VISUAL_THEMES.map((theme) => theme.id), DEFAULT_EDITOR_DRAFT.themeId),
    frame: chooseFrame(raw.frame),
    intensity: clamp(raw.intensity, 0.1, 1.0, DEFAULT_EDITOR_DRAFT.intensity),
    baseSize,
    inhaleMax,
    exhaleMin,
    hudSize: Math.round(clamp(raw.hudSize, 240, 600, DEFAULT_EDITOR_DRAFT.hudSize) / 40) * 40,
    shapePosition: {
      x: clamp(position.x, -80, 80, DEFAULT_EDITOR_DRAFT.shapePosition.x),
      y: clamp(position.y, -80, 80, DEFAULT_EDITOR_DRAFT.shapePosition.y),
    },
  };
}

/** Convert the existing local-storage shape into the editor's ID-based draft. */
export function editorDraftFromPersistedConfig(value: unknown): EditorDraft {
  const raw = isRecord(value) ? value : {};
  const position = isRecord(raw.shapePosition) ? raw.shapePosition : {};
  const params = isRecord(raw.breathingParams) ? raw.breathingParams : {};

  return normalizeEditorDraft({
    shapeId: typeof raw.shapeId === 'string'
      ? raw.shapeId
      : BREATHING_SHAPES[typeof raw.currentShape === 'number' ? raw.currentShape : 0]?.id,
    patternId: typeof raw.patternId === 'string'
      ? raw.patternId
      : BREATHING_PATTERNS[typeof raw.currentPattern === 'number' ? raw.currentPattern : 0]?.id,
    themeId: typeof raw.themeId === 'string'
      ? raw.themeId
      : VISUAL_THEMES[typeof raw.currentTheme === 'number' ? raw.currentTheme : 0]?.id,
    frame: raw.frame,
    intensity: raw.intensity,
    baseSize: params.baseSize,
    inhaleMax: params.inhaleMax,
    exhaleMin: params.exhaleMin,
    hudSize: raw.hudSize,
    shapePosition: position,
  });
}

/** Preserve unrelated legacy fields while writing the normalized editor draft. */
export function editorDraftToPersistedConfig(
  draft: EditorDraft,
  existingValue: unknown,
): UnknownRecord {
  const existing = isRecord(existingValue) ? { ...existingValue } : {};
  const shapeIndex = indexOfId(BREATHING_SHAPES.map((shape) => shape.id), draft.shapeId);
  const patternIndex = indexOfId(BREATHING_PATTERNS.map((pattern) => pattern.id), draft.patternId);
  const themeIndex = indexOfId(VISUAL_THEMES.map((theme) => theme.id), draft.themeId);

  return {
    ...existing,
    shapeId: draft.shapeId,
    patternId: draft.patternId,
    themeId: draft.themeId,
    frame: draft.frame,
    currentShape: shapeIndex,
    currentPattern: patternIndex,
    currentTheme: themeIndex,
    intensity: draft.intensity,
    hudSize: draft.hudSize,
    shapePosition: { ...draft.shapePosition },
    breathingParams: {
      ...(isRecord(existing.breathingParams) ? existing.breathingParams : {}),
      baseSize: draft.baseSize,
      inhaleMax: draft.inhaleMax,
      exhaleMin: draft.exhaleMin,
    },
    timestamp: Date.now(),
  };
}

