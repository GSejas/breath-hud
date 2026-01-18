import { TooltipManager } from '../tooltip-manager';

describe('TooltipManager', () => {
  let container: HTMLElement;
  let manager: TooltipManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new TooltipManager();
    container = document.createElement('div');

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip hidden';
    container.appendChild(tooltip);

    manager.initialize(container);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('show', () => {
    it('should display tooltip with text', () => {
      manager.show('Test tooltip');
      const tooltip = container.querySelector('#tooltip') as HTMLElement;

      expect(tooltip.textContent).toBe('Test tooltip');
      expect(tooltip.classList.contains('hidden')).toBe(false);
    });

    it('should set opacity to 1', () => {
      manager.show('Test');
      const tooltip = container.querySelector('#tooltip') as HTMLElement;

      expect(tooltip.style.opacity).toBe('1');
    });
  });

  describe('hide', () => {
    it('should hide tooltip', () => {
      manager.show('Test');
      manager.hide();

      jest.runAllTimers();

      const tooltip = container.querySelector('#tooltip') as HTMLElement;
      expect(tooltip.classList.contains('hidden')).toBe(true);
    });
  });

  describe('setupHoverTooltip', () => {
    it('should show tooltip on hover', () => {
      const element = document.createElement('button');
      manager.setupHoverTooltip(element, 'Hover text');

      const mouseEnterEvent = new MouseEvent('mouseenter');
      element.dispatchEvent(mouseEnterEvent);

      jest.advanceTimersByTime(500);

      const tooltip = container.querySelector('#tooltip') as HTMLElement;
      expect(tooltip.textContent).toBe('Hover text');
    });

    it('should hide tooltip on mouse leave', () => {
      const element = document.createElement('button');
      manager.setupHoverTooltip(element, 'Hover text');

      const mouseEnterEvent = new MouseEvent('mouseenter');
      element.dispatchEvent(mouseEnterEvent);

      jest.advanceTimersByTime(500);

      const mouseLeaveEvent = new MouseEvent('mouseleave');
      element.dispatchEvent(mouseLeaveEvent);

      const tooltip = container.querySelector('#tooltip') as HTMLElement;
      expect(tooltip.style.opacity).toBe('0');
    });
  });

  describe('cleanup', () => {
    it('should clear timers and hide tooltip', () => {
      manager.show('Test');
      manager.cleanup();

      const tooltip = container.querySelector('#tooltip') as HTMLElement;
      expect(tooltip.style.opacity).toBe('0');
    });
  });
});
