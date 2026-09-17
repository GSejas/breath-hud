import type { BreathingPattern, BreathingPhase, BreathingProgress } from '../../shared/types/breathing.types';
import { getBreathingInstruction } from '../../shared/breathing-language';

export type BreathingRuntimeState = 'loading' | 'ready' | 'empty' | 'error' | 'disabled';

export interface BreathingStatusSink {
  setPattern(pattern: BreathingPattern): void;
  setRuntimeState(state: BreathingRuntimeState): void;
  render(progress: BreathingProgress): void;
}

export type BreathingStatusState =
  | { kind: 'loading' }
  | { kind: 'empty'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'disabled'; reason: string };

interface StageSegment {
  element: HTMLElement;
  phaseName: BreathingPhase['name'];
}

const DEFAULT_STATE_MESSAGES: Record<BreathingRuntimeState, string> = {
  loading: 'Preparing breathing pattern',
  ready: 'Ready to breathe',
  empty: 'Choose a breathing pattern',
  error: 'Breathing visualization stopped',
  disabled: 'Enable breathing to continue',
};

/**
 * Owns the DOM projection of breathing progress.
 *
 * EnhancedBreathingEngine remains the timing authority. This view consumes
 * immutable snapshots, updates semantic content only on phase/nostril changes,
 * and caps visual progress writes at ten updates per second.
 */
export class BreathingStatusView implements BreathingStatusSink {
  private readonly root: HTMLElement;
  private readonly phaseLabel: HTMLElement;
  private readonly instructionLabel: HTMLElement;
  private readonly nostrilIndicator: HTMLElement;
  private readonly leftNostril: HTMLElement;
  private readonly rightNostril: HTMLElement;
  private readonly stageProgress: HTMLElement;
  private readonly progressSummary: HTMLElement;
  private readonly announcement: HTMLElement;
  private pattern: BreathingPattern | null = null;
  private readonly segments: StageSegment[] = [];
  private runtimeState: BreathingRuntimeState = 'loading';
  private runtimeMessage: string | null = null;
  private lastAnnouncementKey: string | null = null;
  private lastRenderedProgressKey: string | null = null;
  private lastVisualRenderAt = Number.NEGATIVE_INFINITY;
  private readonly renderIntervalMs = 100;

  constructor(root: HTMLElement, pattern?: BreathingPattern) {
    this.root = root;
    this.root.innerHTML = `
      <div class="breathing-status__phase" id="phase-indicator">Ready</div>
      <div class="breathing-status__instruction" id="breathing-instruction">Get ready to breathe</div>
      <div class="nostril-indicator" id="nostril-indicator" hidden aria-label="Active nostril">
        <span id="nostril-left" class="nostril-left" aria-hidden="true">LEFT</span>
        <span id="nostril-right" class="nostril-right" aria-hidden="true">RIGHT</span>
      </div>
      <div
        class="stage-progress"
        id="stage-progress"
        role="progressbar"
        aria-label="Breathing cycle progress"
        aria-valuemin="0"
        aria-valuemax="1"
        aria-valuenow="0"
        aria-valuetext="Ready"
      ></div>
      <div class="breathing-status__summary" id="progress-summary">Ready</div>
      <div class="sr-only" id="breathing-announcement" role="status" aria-live="polite"></div>
    `;

    this.phaseLabel = this.getRequiredElement('phase-indicator');
    this.instructionLabel = this.getRequiredElement('breathing-instruction');
    this.nostrilIndicator = this.getRequiredElement('nostril-indicator');
    this.leftNostril = this.getRequiredElement('nostril-left');
    this.rightNostril = this.getRequiredElement('nostril-right');
    this.stageProgress = this.getRequiredElement('stage-progress');
    this.progressSummary = this.getRequiredElement('progress-summary');
    this.announcement = this.getRequiredElement('breathing-announcement');

    if (pattern) this.setPattern(pattern);
    this.setRuntimeState('loading');
  }

  public setPattern(pattern: BreathingPattern): void {
    this.pattern = pattern;
    this.segments.length = 0;
    this.stageProgress.replaceChildren();

    const cycleDuration = this.getCycleDuration(pattern);
    pattern.phases.forEach((phase, index) => {
      const segment = document.createElement('span');
      segment.className = `stage-progress__segment ${phase.name} upcoming`;
      segment.dataset.stageIndex = String(index);
      segment.style.setProperty('--stage-width', `${(phase.duration / cycleDuration) * 100}%`);
      segment.style.setProperty('--segment-progress', '0%');
      segment.setAttribute('aria-hidden', 'true');
      this.stageProgress.appendChild(segment);
      this.segments.push({ element: segment, phaseName: phase.name });
    });

    this.stageProgress.setAttribute('aria-valuemax', String(pattern.phases.length));
    this.updateNostrilIndicator(undefined);
    this.lastAnnouncementKey = null;
    this.lastRenderedProgressKey = null;
    this.lastVisualRenderAt = Number.NEGATIVE_INFINITY;
  }

  public setRuntimeState(state: BreathingRuntimeState): void {
    this.runtimeState = state;
    this.root.dataset.state = state;
    this.root.setAttribute('aria-busy', String(state === 'loading'));
    this.updateNostrilIndicator(undefined);

    const message = this.runtimeMessage ?? DEFAULT_STATE_MESSAGES[state];
    switch (state) {
      case 'loading':
        this.phaseLabel.textContent = 'Loading';
        this.setInstruction(message);
        this.progressSummary.textContent = 'Please wait';
        break;
      case 'ready':
        this.phaseLabel.textContent = 'Ready';
        this.setInstruction(message);
        this.progressSummary.textContent = 'Ready';
        break;
      case 'empty':
        this.phaseLabel.textContent = 'No pattern';
        this.setInstruction(message);
        this.progressSummary.textContent = DEFAULT_STATE_MESSAGES.empty;
        break;
      case 'error':
        this.phaseLabel.textContent = 'Unavailable';
        this.setInstruction(message);
        this.progressSummary.textContent = DEFAULT_STATE_MESSAGES.error;
        break;
      case 'disabled':
        this.phaseLabel.textContent = 'Disabled';
        this.setInstruction(message);
        this.progressSummary.textContent = DEFAULT_STATE_MESSAGES.disabled;
        break;
    }

    this.stageProgress.setAttribute('aria-valuenow', '0');
    this.stageProgress.setAttribute('aria-valuetext', message);
    if (state !== 'ready') this.announce(message);
    this.runtimeMessage = null;
  }

  public render(progress: BreathingProgress): void {
    if (!this.pattern || progress.phaseCount === 0 || progress.patternId !== this.pattern.id) return;

    const progressKey = `${progress.patternId}:${progress.phaseIndex}:${progress.airway ?? 'unspecified'}:${progress.nostril ?? 'none'}`;
    const phaseChanged = progressKey !== this.lastRenderedProgressKey;
    const now = Date.now();
    if (!phaseChanged && now - this.lastVisualRenderAt < this.renderIntervalMs) return;

    this.root.dataset.state = 'ready';
    this.runtimeState = 'ready';
    this.root.setAttribute('aria-busy', 'false');

    if (phaseChanged) {
      this.phaseLabel.textContent = this.capitalize(progress.phaseName);
      const instruction = getBreathingInstruction(progress.phaseName, progress.nostril, progress.airway);
      this.setInstruction(instruction, instruction.toLowerCase() !== progress.phaseName);
      this.updateNostrilIndicator(progress.nostril);
      this.updateStageSegments(progress);

      const announcement = this.getProgressText(progress);
      if (progressKey !== this.lastAnnouncementKey) {
        this.announce(announcement);
        this.lastAnnouncementKey = progressKey;
      }
      this.lastRenderedProgressKey = progressKey;
    } else {
      this.updateCurrentSegmentProgress(progress);
    }

    this.updateProgressValues(progress);
    this.lastVisualRenderAt = now;
  }

  /** Backwards-compatible alias for existing engine integrations. */
  public updateProgress(progress: BreathingProgress): void {
    this.render(progress);
  }

  public showLoading(): void {
    this.runtimeMessage = null;
    this.setRuntimeState('loading');
  }

  public showEmpty(message: string): void {
    this.runtimeMessage = message;
    this.setRuntimeState('empty');
  }

  public showError(message: string): void {
    this.runtimeMessage = message;
    this.setRuntimeState('error');
  }

  public showDisabled(reason: string): void {
    this.runtimeMessage = reason;
    this.setRuntimeState('disabled');
  }

  private updateStageSegments(progress: BreathingProgress): void {
    this.segments.forEach(({ element }, index) => {
      element.classList.toggle('complete', index < progress.phaseIndex);
      element.classList.toggle('current', index === progress.phaseIndex);
      element.classList.toggle('upcoming', index > progress.phaseIndex);
      element.style.setProperty(
        '--segment-progress',
        index === progress.phaseIndex ? `${progress.phaseProgress * 100}%` : '0%',
      );
    });
  }

  private updateCurrentSegmentProgress(progress: BreathingProgress): void {
    const segment = this.segments[progress.phaseIndex]?.element;
    segment?.style.setProperty('--segment-progress', `${progress.phaseProgress * 100}%`);
  }

  private updateProgressValues(progress: BreathingProgress): void {
    const summary = `Stage ${progress.phaseIndex + 1} of ${progress.phaseCount} · ${Math.max(0, Math.ceil(progress.phaseRemainingMs / 1000))}s`;
    this.progressSummary.textContent = summary;
    this.stageProgress.setAttribute('aria-valuenow', String(progress.phaseIndex + progress.phaseProgress));
    this.stageProgress.setAttribute(
      'aria-valuetext',
      `${getBreathingInstruction(progress.phaseName, progress.nostril, progress.airway)}. ${summary}`,
    );
  }

  private updateNostrilIndicator(nostril?: BreathingPhase['nostril']): void {
    const visible = Boolean(this.pattern?.isNostrilBreathing && nostril);
    this.nostrilIndicator.hidden = !visible;
    if (!visible || !nostril) return;

    const leftActive = nostril === 'left' || nostril === 'both';
    const rightActive = nostril === 'right' || nostril === 'both';
    this.leftNostril.className = `nostril-left ${leftActive ? 'active' : 'inactive'}`;
    this.rightNostril.className = `nostril-right ${rightActive ? 'active' : 'inactive'}`;
    this.nostrilIndicator.setAttribute('aria-label', `Active nostril: ${nostril}`);
  }

  private getProgressText(progress: BreathingProgress): string {
    const summary = `Stage ${progress.phaseIndex + 1} of ${progress.phaseCount} · ${Math.max(0, Math.ceil(progress.phaseRemainingMs / 1000))}s`;
    return `${getBreathingInstruction(progress.phaseName, progress.nostril, progress.airway)}. ${summary}`;
  }

  private announce(message: string): void {
    this.announcement.textContent = '';
    this.announcement.textContent = message;
  }

  private setInstruction(message: string, hasDetail = true): void {
    this.instructionLabel.textContent = message;
    this.instructionLabel.classList.toggle('is-redundant', !hasDetail);
    this.instructionLabel.setAttribute('aria-hidden', String(!hasDetail));
  }

  private getCycleDuration(pattern: BreathingPattern): number {
    const duration = pattern.phases.reduce((total, phase) => total + phase.duration, 0);
    return duration > 0 ? duration : 1;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private getRequiredElement(id: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`Breathing status element not found: ${id}`);
    return element;
  }
}
