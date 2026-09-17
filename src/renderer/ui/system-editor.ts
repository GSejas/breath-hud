import { getBreathingInstruction } from '../../shared/breathing-language';
import {
  editorDraftFromPersistedConfig,
  editorDraftToPersistedConfig,
  EDITOR_CONFIG_STORAGE_KEY,
  normalizeEditorDraft,
  cloneEditorDraft,
} from '../../shared/editor-draft';
import { BREATHING_PATTERNS, BREATHING_SHAPES, VISUAL_THEMES } from '../../shared/constants';
import type {
  EditorDraft,
  PreviewState,
  SaveState,
} from '../../shared/types/editor.types';
import { DEFAULT_EDITOR_DRAFT } from '../../shared/types/editor.types';

interface EditorBridge {
  openEditor?: () => Promise<{ success: boolean }>;
  closeEditor?: () => Promise<{ success: boolean }>;
  saveEditorDraft?: (draft: EditorDraft) => Promise<{ success: boolean; draft: EditorDraft }>;
}

interface EditorElements {
  preview: HTMLElement;
  previewFrame: HTMLElement;
  previewShape: HTMLElement;
  previewPhase: HTMLElement;
  previewInstruction: HTMLElement;
  previewNostrils: HTMLElement;
  leftNostril: HTMLElement;
  rightNostril: HTMLElement;
  stageProgress: HTMLElement;
  previewSummary: HTMLElement;
  previewMessage: HTMLElement;
  previewPatternName: HTMLElement;
  previewShapeName: HTMLElement;
  cardShapeName: HTMLElement;
  positionPatternName: HTMLElement;
  positionShapeName: HTMLElement;
  shapeType: HTMLElement;
  patternType: HTMLElement;
  themeName: HTMLElement;
  position: HTMLElement;
  saveStatus: HTMLElement;
  saveButton: HTMLButtonElement;
  shapeSelect: HTMLSelectElement;
  patternSelect: HTMLSelectElement;
  themeSelect: HTMLSelectElement;
  intensity: HTMLInputElement;
  base: HTMLInputElement;
  inhale: HTMLInputElement;
  exhale: HTMLInputElement;
  size: HTMLInputElement;
  frameOptions: HTMLButtonElement[];
  stateOptions: HTMLButtonElement[];
}

const PREVIEW_MESSAGES: Record<PreviewState, string> = {
  loading: 'Loading preview…',
  empty: 'Choose a breathing pattern to preview.',
  error: 'Preview unavailable. Your draft is preserved.',
  success: 'Ready to breathe',
  disabled: 'Breathing is disabled for this preview.',
};

function getEditorBridge(): EditorBridge | undefined {
  return (window as Window & { electronAPI?: EditorBridge }).electronAPI;
}

/**
 * Controller for the minimal editor window.
 *
 * It owns draft and save state, while the preview is a deterministic projection
 * of the draft. It never starts the live breathing engine.
 */
export class SystemEditor {
  private readonly root: HTMLElement;
  private readonly elements: EditorElements;
  private readonly onDraftSaved?: (draft: EditorDraft) => void;
  private draft: EditorDraft;
  private initialDraft: EditorDraft;
  private previewState: PreviewState = 'success';
  private saveState: SaveState = 'idle';
  private previousFocus: HTMLElement | null = null;
  private dragStart: { x: number; y: number; position: { x: number; y: number } } | null = null;
  private initialized = false;

  constructor(root: HTMLElement, onDraftSaved?: (draft: EditorDraft) => void) {
    this.root = root;
    this.onDraftSaved = onDraftSaved;
    this.elements = this.collectElements();
    this.draft = this.readDraft();
    this.initialDraft = cloneEditorDraft(this.draft);
  }

  public initialize(): void {
    if (this.initialized) {
      this.open();
      return;
    }

    document.title = 'Breathing HUD — Minimal editor';
    this.populateCatalogs();
    this.bindEvents();
    this.renderDraft();
    this.initialized = true;
    this.open(this.draft);
  }

  public open(draft: EditorDraft = this.draft): void {
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.draft = normalizeEditorDraft(draft);
    this.initialDraft = cloneEditorDraft(this.draft);
    this.previewState = 'success';
    this.setSaveState('idle', 'Ready to edit');
    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');
    this.root.removeAttribute('inert');
    document.body.classList.add('editor-open');
    this.renderDraft();
    this.root.querySelector<HTMLElement>('#editor-title')?.focus();
  }

  public close(): void {
    this.root.classList.remove('is-open');
    this.root.setAttribute('aria-hidden', 'true');
    this.root.setAttribute('inert', '');
    document.body.classList.remove('editor-open');
    this.previousFocus?.focus();
  }

  private collectElements(): EditorElements {
    const required = <T extends HTMLElement>(id: string): T => {
      const element = id.startsWith('[')
        ? document.querySelector<HTMLElement>(id)
        : document.getElementById(id);
      if (!element) throw new Error(`Editor element not found: ${id}`);
      return element as T;
    };

    return {
      preview: required('editor-preview'),
      previewFrame: required('editor-preview-frame'),
      previewShape: required('editor-preview-shape'),
      previewPhase: required('editor-preview-phase'),
      previewInstruction: required('editor-preview-instruction'),
      previewNostrils: required('editor-preview-nostrils'),
      leftNostril: required('editor-preview-left-nostril'),
      rightNostril: required('editor-preview-right-nostril'),
      stageProgress: required('editor-stage-progress'),
      previewSummary: required('editor-preview-summary'),
      previewMessage: required('[data-preview-message]'),
      previewPatternName: required('editor-preview-pattern-name'),
      previewShapeName: required('editor-preview-shape-name'),
      cardShapeName: required('editor-card-shape-name'),
      positionPatternName: required('editor-position-pattern-name'),
      positionShapeName: required('editor-position-shape-name'),
      shapeType: required('editor-shape-type'),
      patternType: required('editor-pattern-type'),
      themeName: required('editor-theme-name'),
      position: required('editor-position'),
      saveStatus: required('editor-save-status'),
      saveButton: required<HTMLButtonElement>('[data-editor-save]'),
      shapeSelect: required<HTMLSelectElement>('editor-shape'),
      patternSelect: required<HTMLSelectElement>('editor-pattern'),
      themeSelect: required<HTMLSelectElement>('editor-theme'),
      intensity: required<HTMLInputElement>('editor-intensity'),
      base: required<HTMLInputElement>('editor-base'),
      inhale: required<HTMLInputElement>('editor-inhale'),
      exhale: required<HTMLInputElement>('editor-exhale'),
      size: required<HTMLInputElement>('editor-size'),
      frameOptions: Array.from(document.querySelectorAll<HTMLButtonElement>('[data-frame]')),
      stateOptions: Array.from(document.querySelectorAll<HTMLButtonElement>('[data-preview-state]')),
    };
  }

  private populateCatalogs(): void {
    this.elements.shapeSelect.replaceChildren(
      ...BREATHING_SHAPES.map((shape) => new Option(shape.name, shape.id)),
    );
    this.elements.patternSelect.replaceChildren(
      ...BREATHING_PATTERNS.map((pattern) => new Option(pattern.name, pattern.id)),
    );
    this.elements.themeSelect.replaceChildren(
      ...VISUAL_THEMES.map((theme) => new Option(theme.name, theme.id)),
    );
  }

  private bindEvents(): void {
    this.elements.shapeSelect.addEventListener('change', () => this.updateDraftFromControls());
    this.elements.patternSelect.addEventListener('change', () => this.updateDraftFromControls());
    this.elements.themeSelect.addEventListener('change', () => this.updateDraftFromControls());
    [this.elements.intensity, this.elements.base, this.elements.inhale, this.elements.exhale, this.elements.size]
      .forEach((input) => input.addEventListener('input', () => this.updateDraftFromControls()));

    this.bindRadioGroup(this.elements.frameOptions, (button) => {
      this.draft = normalizeEditorDraft({ ...this.draft, frame: button.dataset.frame });
      this.markDirty();
      this.renderDraft();
    });

    this.bindRadioGroup(this.elements.stateOptions, (button) => {
      const state = button.dataset.previewState as PreviewState | undefined;
      if (state) this.setPreviewState(state);
    });

    document.querySelectorAll<HTMLElement>('[data-editor-close]').forEach((button) => {
      button.addEventListener('click', () => void this.cancel());
    });
    document.querySelector<HTMLElement>('[data-editor-reset]')?.addEventListener('click', () => this.reset());
    this.elements.saveButton.addEventListener('click', () => void this.save());

    this.elements.previewShape.addEventListener('keydown', (event) => this.handleShapeKeydown(event));
    this.elements.previewShape.addEventListener('pointerdown', (event) => this.startShapeDrag(event));
    this.elements.previewShape.addEventListener('pointermove', (event) => this.moveShapeDrag(event));
    this.elements.previewShape.addEventListener('pointerup', () => this.endShapeDrag());
    this.elements.previewShape.addEventListener('pointercancel', () => this.endShapeDrag());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.root.classList.contains('is-open')) {
        event.preventDefault();
        void this.cancel();
        return;
      }
      if (event.key === 'Tab' && this.root.classList.contains('is-open')) {
        this.trapFocus(event);
      }
    });
  }

  private bindRadioGroup(
    options: HTMLButtonElement[],
    onSelect: (button: HTMLButtonElement) => void,
  ): void {
    options.forEach((button) => {
      button.addEventListener('click', () => onSelect(button));
      button.addEventListener('keydown', (event) => {
        const currentIndex = options.indexOf(button);
        const nextIndex = this.getRadioNavigationIndex(event.key, currentIndex, options.length);
        if (nextIndex === null) return;

        event.preventDefault();
        const next = options[nextIndex];
        next.focus();
        next.click();
      });
    });
  }

  private getRadioNavigationIndex(key: string, currentIndex: number, length: number): number | null {
    if (length === 0) return null;
    if (key === 'Home') return 0;
    if (key === 'End') return length - 1;
    if (key === 'ArrowRight' || key === 'ArrowDown') return (currentIndex + 1) % length;
    if (key === 'ArrowLeft' || key === 'ArrowUp') return (currentIndex - 1 + length) % length;
    return null;
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = Array.from(this.root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private readDraft(): EditorDraft {
    try {
      const saved = localStorage.getItem(EDITOR_CONFIG_STORAGE_KEY);
      return editorDraftFromPersistedConfig(saved ? JSON.parse(saved) : undefined);
    } catch (error) {
      console.warn('Failed to load editor draft; using defaults', error);
      return cloneEditorDraft(DEFAULT_EDITOR_DRAFT);
    }
  }

  private updateDraftFromControls(): void {
    this.draft = normalizeEditorDraft({
      ...this.draft,
      shapeId: this.elements.shapeSelect.value,
      patternId: this.elements.patternSelect.value,
      themeId: this.elements.themeSelect.value,
      intensity: Number(this.elements.intensity.value),
      baseSize: Number(this.elements.base.value),
      inhaleMax: Number(this.elements.inhale.value),
      exhaleMin: Number(this.elements.exhale.value),
      hudSize: Number(this.elements.size.value),
    });
    this.markDirty();
    this.renderDraft();
  }

  private markDirty(): void {
    this.setSaveState('idle', 'Unsaved changes');
  }

  private renderDraft(): void {
    const shape = BREATHING_SHAPES.find((item) => item.id === this.draft.shapeId) ?? BREATHING_SHAPES[0];
    const pattern = BREATHING_PATTERNS.find((item) => item.id === this.draft.patternId) ?? BREATHING_PATTERNS[0];
    const theme = VISUAL_THEMES.find((item) => item.id === this.draft.themeId) ?? VISUAL_THEMES[0];
    const phase = pattern.phases[0];

    this.elements.shapeSelect.value = shape.id;
    this.elements.patternSelect.value = pattern.id;
    this.elements.themeSelect.value = theme.id;
    this.elements.intensity.value = String(this.draft.intensity);
    this.elements.base.value = String(this.draft.baseSize);
    this.elements.inhale.value = String(this.draft.inhaleMax);
    this.elements.exhale.value = String(this.draft.exhaleMin);
    this.elements.size.value = String(this.draft.hudSize);

    this.elements.previewFrame.className = `preview-hud frame-${this.draft.frame}`;
    this.elements.previewFrame.style.setProperty('--preview-primary', theme.colors.primary);
    this.elements.previewFrame.style.setProperty('--preview-secondary', theme.colors.secondary);
    this.elements.previewFrame.style.setProperty('--preview-background', theme.colors.background);
    this.elements.previewFrame.style.setProperty('--preview-accent', theme.colors.accent);
    this.elements.previewFrame.style.setProperty('--preview-intensity', String(this.draft.intensity));
    this.elements.previewShape.dataset.shape = shape.type;
    this.elements.previewShape.style.setProperty('--preview-x', `${this.draft.shapePosition.x}px`);
    this.elements.previewShape.style.setProperty('--preview-y', `${this.draft.shapePosition.y}px`);
    this.elements.previewShape.setAttribute(
      'aria-label',
      `${shape.name} preview shape. Use arrow keys to move. Position ${this.draft.shapePosition.x}, ${this.draft.shapePosition.y}.`,
    );

    this.elements.previewPatternName.textContent = pattern.name;
    this.elements.previewShapeName.textContent = shape.name;
    this.elements.cardShapeName.textContent = shape.name;
    this.elements.positionPatternName.textContent = pattern.name;
    this.elements.positionShapeName.textContent = shape.name;
    this.elements.shapeType.textContent = shape.type;
    this.elements.patternType.textContent = pattern.name;
    this.elements.themeName.textContent = theme.name;
    this.elements.position.textContent = `${this.draft.shapePosition.x}, ${this.draft.shapePosition.y}`;
    this.elements.previewPhase.textContent = phase.name;
    const instruction = getBreathingInstruction(phase.name, phase.nostril, phase.airway);
    this.elements.previewInstruction.textContent = instruction;
    const instructionIsRedundant = instruction.toLowerCase() === phase.name;
    this.elements.previewInstruction.classList.toggle('is-redundant', instructionIsRedundant);
    this.elements.previewInstruction.setAttribute('aria-hidden', String(instructionIsRedundant));
    this.renderNostrils(pattern.isNostrilBreathing ? phase.nostril : undefined);
    this.renderStageProgress(pattern);
    this.renderFrames();
    this.renderPreviewState();
    this.renderValues();
  }

  private renderNostrils(nostril: 'left' | 'right' | 'both' | undefined): void {
    const visible = Boolean(nostril);
    this.elements.previewNostrils.hidden = !visible;
    if (!visible || !nostril) return;
    this.elements.leftNostril.classList.toggle('is-active', nostril === 'left' || nostril === 'both');
    this.elements.rightNostril.classList.toggle('is-active', nostril === 'right' || nostril === 'both');
    this.elements.previewNostrils.setAttribute('aria-label', `Active nostril: ${nostril}`);
  }

  private renderStageProgress(pattern: typeof BREATHING_PATTERNS[number]): void {
    this.elements.stageProgress.replaceChildren(
      ...pattern.phases.map((phase, index) => {
        const segment = document.createElement('span');
        segment.className = `preview-stage-segment ${index === 0 ? 'is-current' : ''}`;
        segment.style.setProperty('--stage-width', String(Math.max(1, phase.duration)));
        segment.setAttribute('aria-hidden', 'true');
        return segment;
      }),
    );
    const phase = pattern.phases[0];
    const remainingSeconds = Math.max(1, Math.ceil(phase.duration / 2));
    this.elements.stageProgress.setAttribute('aria-valuemax', String(pattern.phases.length));
    this.elements.stageProgress.setAttribute('aria-valuenow', '0.5');
    this.elements.stageProgress.setAttribute('aria-valuetext', `Stage 1 of ${pattern.phases.length}`);
    this.elements.previewSummary.textContent = `Stage 1 of ${pattern.phases.length} · ${remainingSeconds}s`;
  }

  private renderFrames(): void {
    this.elements.frameOptions.forEach((button) => {
      const selected = button.dataset.frame === this.draft.frame;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  private renderValues(): void {
    const values: Record<string, string> = {
      'editor-intensity-value': `${Math.round(this.draft.intensity * 100)}%`,
      'editor-base-value': this.draft.baseSize.toFixed(2),
      'editor-inhale-value': this.draft.inhaleMax.toFixed(2),
      'editor-exhale-value': this.draft.exhaleMin.toFixed(2),
      'editor-size-value': `${this.draft.hudSize}px`,
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  private setPreviewState(state: PreviewState): void {
    this.previewState = state;
    this.renderPreviewState();
  }

  private renderPreviewState(): void {
    this.elements.preview.dataset.state = this.previewState;
    this.elements.previewMessage.textContent = PREVIEW_MESSAGES[this.previewState];
    this.elements.stateOptions.forEach((button) => {
      const selected = button.dataset.previewState === this.previewState;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  private setSaveState(state: SaveState, message?: string): void {
    this.saveState = state;
    const text = message ?? {
      idle: 'Local changes',
      saving: 'Saving…',
      saved: 'Saved locally',
      error: 'Save failed',
    }[state];
    this.elements.saveStatus.dataset.status = state;
    this.elements.saveStatus.textContent = text;
    this.elements.saveButton.disabled = state === 'saving';
  }

  private async save(): Promise<void> {
    const normalized = normalizeEditorDraft(this.draft);
    const previousValue = localStorage.getItem(EDITOR_CONFIG_STORAGE_KEY);
    this.setSaveState('saving');

    try {
      const existing = previousValue ? JSON.parse(previousValue) : undefined;
      localStorage.setItem(
        EDITOR_CONFIG_STORAGE_KEY,
        JSON.stringify(editorDraftToPersistedConfig(normalized, existing)),
      );

      const api = getEditorBridge();
      if (api?.saveEditorDraft) {
        const result = await api.saveEditorDraft(normalized);
        if (!result.success) throw new Error('Editor draft was rejected');
      }
      this.onDraftSaved?.(normalized);
      this.draft = normalized;
      this.initialDraft = cloneEditorDraft(normalized);
      this.setSaveState('saved');
    } catch (error) {
      try {
        if (previousValue === null) localStorage.removeItem(EDITOR_CONFIG_STORAGE_KEY);
        else localStorage.setItem(EDITOR_CONFIG_STORAGE_KEY, previousValue);
      } catch (rollbackError) {
        console.error('Failed to restore the previous editor draft', rollbackError);
      }
      console.error('Failed to save editor draft', error);
      this.setSaveState('error', 'Save failed — try again');
      this.elements.saveButton.focus();
    }
  }

  private async cancel(): Promise<void> {
    this.draft = cloneEditorDraft(this.initialDraft);
    this.renderDraft();
    this.setSaveState('idle');
    const api = getEditorBridge();
    if (api?.closeEditor) await api.closeEditor();
    this.close();
  }

  private reset(): void {
    if (!window.confirm('Reset the editor draft to defaults?')) return;
    this.draft = cloneEditorDraft(DEFAULT_EDITOR_DRAFT);
    this.markDirty();
    this.renderDraft();
  }

  private handleShapeKeydown(event: KeyboardEvent): void {
    const deltas: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -5, y: 0 },
      ArrowRight: { x: 5, y: 0 },
      ArrowUp: { x: 0, y: -5 },
      ArrowDown: { x: 0, y: 5 },
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    this.draft = normalizeEditorDraft({
      ...this.draft,
      shapePosition: {
        x: this.draft.shapePosition.x + delta.x,
        y: this.draft.shapePosition.y + delta.y,
      },
    });
    this.markDirty();
    this.renderDraft();
  }

  private startShapeDrag(event: PointerEvent): void {
    this.elements.previewShape.setPointerCapture(event.pointerId);
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      position: { ...this.draft.shapePosition },
    };
  }

  private moveShapeDrag(event: PointerEvent): void {
    if (!this.dragStart) return;
    const nextPosition = {
      x: this.dragStart.position.x + (event.clientX - this.dragStart.x),
      y: this.dragStart.position.y + (event.clientY - this.dragStart.y),
    };
    this.draft = normalizeEditorDraft({ ...this.draft, shapePosition: nextPosition });
    this.markDirty();
    this.renderDraft();
  }

  private endShapeDrag(): void {
    this.dragStart = null;
  }
}
