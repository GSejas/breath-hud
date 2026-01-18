import { DisplayUpdater } from '../display-updater';

describe('DisplayUpdater', () => {
  let container: HTMLElement;
  let updater: DisplayUpdater;

  beforeEach(() => {
    updater = new DisplayUpdater();
    container = document.createElement('div');

    const displays = [
      'phase-display',
      'shape-display',
      'pattern-display',
      'scale-display'
    ];
    displays.forEach(id => {
      const el = document.createElement('span');
      el.id = id;
      container.appendChild(el);
    });

    updater.initialize(container);
  });

  describe('updatePhase', () => {
    it('should update phase display', () => {
      updater.updatePhase('inhale', 0.5);
      const display = container.querySelector('#phase-display') as HTMLElement;
      expect(display.textContent).toContain('inhale');
      expect(display.textContent).toContain('50%');
    });
  });

  describe('updateShape', () => {
    it('should update shape display', () => {
      updater.updateShape('Circle');
      const display = container.querySelector('#shape-display') as HTMLElement;
      expect(display.textContent).toBe('Circle');
    });
  });

  describe('updatePattern', () => {
    it('should update pattern display', () => {
      updater.updatePattern('Box');
      const display = container.querySelector(
        '#pattern-display'
      ) as HTMLElement;
      expect(display.textContent).toBe('Box');
    });
  });

  describe('updateScale', () => {
    it('should update scale display', () => {
      updater.updateScale('100% (300×300px)');
      const display = container.querySelector('#scale-display') as HTMLElement;
      expect(display.textContent).toBe('100% (300×300px)');
    });
  });

  describe('clear', () => {
    it('should reset all displays to dashes', () => {
      updater.updatePhase('inhale', 0.5);
      updater.updateShape('Circle');
      updater.clear();

      const phaseDisplay = container.querySelector(
        '#phase-display'
      ) as HTMLElement;
      expect(phaseDisplay.textContent).toContain('—');
    });
  });

  describe('updateAll', () => {
    it('should update multiple displays at once', () => {
      updater.updateAll({
        phase: { name: 'inhale', progress: 0.5 },
        shape: 'Triangle',
        pattern: 'Zen'
      });

      const phaseDisplay = container.querySelector(
        '#phase-display'
      ) as HTMLElement;
      const shapeDisplay = container.querySelector(
        '#shape-display'
      ) as HTMLElement;

      expect(phaseDisplay.textContent).toContain('inhale');
      expect(shapeDisplay.textContent).toBe('Triangle');
    });
  });
});
