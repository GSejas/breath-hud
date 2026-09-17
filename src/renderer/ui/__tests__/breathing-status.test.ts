import { BreathingStatusView } from '../breathing-status';
import type { BreathingPattern, BreathingProgress } from '../../../shared/types/breathing.types';

const pattern: BreathingPattern = {
  id: 'alternate-nostril-test',
  name: 'Nostril',
  type: 'flow',
  duration: 6,
  isNostrilBreathing: true,
  phases: [
    { name: 'inhale', duration: 2, intensity: 0.7, nostril: 'left' },
    { name: 'exhale', duration: 2, intensity: 0.3, nostril: 'right' },
    { name: 'hold', duration: 2, intensity: 1, nostril: 'both' },
  ],
};

const progress: BreathingProgress = {
  patternId: pattern.id,
  phaseIndex: 0,
  phaseCount: 3,
  phaseName: 'inhale',
  nostril: 'left',
  phaseProgress: 0.5,
  phaseRemainingMs: 1000,
  cycleProgress: 1 / 6,
};

describe('BreathingStatusView', () => {
  let root: HTMLElement;
  let view: BreathingStatusView;

  beforeEach(() => {
    root = document.createElement('div');
    view = new BreathingStatusView(root, pattern);
  });

  it('renders one stable segment per phase', () => {
    expect(root.querySelectorAll('.stage-progress__segment')).toHaveLength(3);
    expect(root.querySelector('#stage-progress')?.getAttribute('aria-valuemax')).toBe('3');
  });

  it('renders the active nostril and stage progress', () => {
    view.updateProgress(progress);

    expect(root.dataset.state).toBe('ready');
    expect(root.querySelector('#phase-indicator')?.textContent).toBe('Inhale');
    expect(root.querySelector('#breathing-instruction')?.textContent).toBe('Inhale through left nostril');
    expect(root.querySelector('.nostril-left')?.className).toContain('active');
    expect(root.querySelector('.nostril-right')?.className).toContain('inactive');
    expect(root.querySelector('#progress-summary')?.textContent).toBe('Stage 1 of 3 · 1s');
    expect(root.querySelector('.stage-progress__segment')?.className).toContain('current');
  });

  it('keeps nostril semantics hidden for ordinary patterns', () => {
    const ordinaryPattern: BreathingPattern = {
      id: 'ordinary-test',
      name: 'Ordinary',
      type: 'relaxing',
      duration: 4,
      phases: [{ name: 'inhale', duration: 2, intensity: 0.7 }, { name: 'exhale', duration: 2, intensity: 0.3 }],
    };
    const ordinaryView = new BreathingStatusView(root, ordinaryPattern);

    ordinaryView.render({
      patternId: ordinaryPattern.id,
      phaseIndex: 0,
      phaseCount: 2,
      phaseName: 'inhale',
      phaseProgress: 0,
      phaseRemainingMs: 2000,
      cycleProgress: 0,
    });

    expect(root.querySelector('#nostril-indicator')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('#breathing-instruction')?.textContent).toBe('Inhale');
    expect(root.querySelector('#breathing-instruction')?.classList.contains('is-redundant')).toBe(true);
  });

  it('shows an optional creator-authored airway without changing neutral cues', () => {
    const mouthPattern: BreathingPattern = {
      id: 'mouth-test',
      name: 'Mouth',
      type: 'custom',
      duration: 4,
      phases: [{ name: 'inhale', duration: 2, intensity: 0.7, airway: 'mouth' }],
    };
    const mouthView = new BreathingStatusView(root, mouthPattern);

    mouthView.render({
      patternId: mouthPattern.id,
      phaseIndex: 0,
      phaseCount: 1,
      phaseName: 'inhale',
      airway: 'mouth',
      phaseProgress: 0,
      phaseRemainingMs: 2000,
      cycleProgress: 0,
    });

    expect(root.querySelector('#breathing-instruction')?.textContent).toBe('Inhale through mouth');
    expect(root.querySelector('#breathing-announcement')?.textContent).toContain('Inhale through mouth');
  });

  it('announces only stage changes, not every animation frame', () => {
    view.updateProgress(progress);
    const announcement = root.querySelector('#breathing-announcement');
    expect(announcement?.textContent).toContain('Inhale through left nostril');

    view.updateProgress({ ...progress, phaseProgress: 0.75, phaseRemainingMs: 500 });
    expect(announcement?.textContent).toContain('Stage 1 of 3 · 1s');

    view.updateProgress({
      ...progress,
      phaseIndex: 1,
      phaseName: 'exhale',
      nostril: 'right',
      phaseProgress: 0,
      phaseRemainingMs: 2000,
    });
    expect(announcement?.textContent).toContain('Exhale through right nostril');
  });

  it('bounds visual progress writes while allowing phase transitions immediately', () => {
    const segment = root.querySelector('.stage-progress__segment') as HTMLElement;
    const styleSpy = jest.spyOn(segment.style, 'setProperty');

    view.render(progress);
    styleSpy.mockClear();
    view.render({ ...progress, phaseProgress: 0.75, phaseRemainingMs: 500 });
    expect(styleSpy).not.toHaveBeenCalled();

    view.render({
      ...progress,
      phaseIndex: 1,
      phaseName: 'exhale',
      nostril: 'right',
      phaseProgress: 0,
      phaseRemainingMs: 2000,
    });
    expect(styleSpy).toHaveBeenCalled();
  });

  it.each([
    ['loading', 'Loading'],
    ['empty', 'No pattern'],
    ['error', 'Unavailable'],
    ['disabled', 'Disabled'],
  ] as const)('renders the %s state', (state, expectedLabel) => {
    if (state === 'loading') view.showLoading();
    if (state === 'empty') view.showEmpty('Select a pattern');
    if (state === 'error') view.showError('Could not start');
    if (state === 'disabled') view.showDisabled('Pattern is disabled');

    expect(root.dataset.state).toBe(state);
    expect(root.querySelector('#phase-indicator')?.textContent).toBe(expectedLabel);
  });
});
