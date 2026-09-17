/**
 * Shared contracts for the minimal system editor.
 *
 * The editor owns a draft. The HUD owns runtime timing and applies a saved
 * draft through an explicit adapter; neither side reaches into the other's
 * private state.
 */

export type EditorFrame = 'glass' | 'outline' | 'soft' | 'quiet';

export type PreviewState = 'loading' | 'empty' | 'error' | 'success' | 'disabled';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface EditorDraft {
  readonly shapeId: string;
  readonly patternId: string;
  readonly themeId: string;
  readonly frame: EditorFrame;
  readonly intensity: number;
  readonly baseSize: number;
  readonly inhaleMax: number;
  readonly exhaleMin: number;
  readonly hudSize: number;
  readonly shapePosition: Readonly<{ x: number; y: number }>;
}

export interface EditorState {
  readonly draft: EditorDraft;
  readonly initialDraft: EditorDraft;
  readonly previewState: PreviewState;
  readonly saveState: SaveState;
  readonly errorMessage?: string;
}

export const DEFAULT_EDITOR_DRAFT: EditorDraft = {
  shapeId: 'circle',
  patternId: 'zen-simple',
  themeId: 'ocean',
  frame: 'glass',
  intensity: 0.7,
  baseSize: 0.6,
  inhaleMax: 1.0,
  exhaleMin: 0.4,
  hudSize: 300,
  shapePosition: { x: 0, y: 0 },
};
