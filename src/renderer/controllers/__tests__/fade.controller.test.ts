import { AutoFadeController } from '../fade.controller';

describe('AutoFadeController', () => {
  let controller: AutoFadeController;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    mockContainer = document.createElement('div');
    controller = new AutoFadeController(mockContainer);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(controller).toBeDefined();
    });

    it('should set up event listeners', () => {
      const spy = jest.spyOn(mockContainer, 'addEventListener');
      new AutoFadeController(mockContainer);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('mouseenter event', () => {
    it('should show interface on mouse enter', () => {
      mockContainer.classList.add('auto-faded');
      const mouseEnterEvent = new MouseEvent('mouseenter');
      mockContainer.dispatchEvent(mouseEnterEvent);

      expect(mockContainer.classList.contains('auto-faded')).toBe(false);
    });
  });

  describe('mouseleave event', () => {
    it('should start fade timer on mouse leave', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      mockContainer.dispatchEvent(mouseLeaveEvent);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
      setTimeoutSpy.mockRestore();
    });

    it('should not fade if pinned', () => {
      mockContainer.classList.add('pinned');
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      mockContainer.dispatchEvent(mouseLeaveEvent);

      jest.runAllTimers();
      expect(mockContainer.classList.contains('auto-faded')).toBe(false);
    });
  });

  describe('click event', () => {
    it('should show interface on button click', () => {
      mockContainer.classList.add('auto-faded');
      const button = document.createElement('button');
      mockContainer.appendChild(button);

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: button,
        enumerable: true
      });
      mockContainer.dispatchEvent(clickEvent);

      expect(mockContainer.classList.contains('auto-faded')).toBe(false);
    });
  });

  describe('forceShow', () => {
    it('should immediately show interface', () => {
      mockContainer.classList.add('auto-faded');
      controller.forceShow();

      expect(mockContainer.classList.contains('auto-faded')).toBe(false);
    });
  });

  describe('updatePinStatus', () => {
    it('should show and prevent fade when pinned', () => {
      mockContainer.classList.add('auto-faded');
      controller.updatePinStatus(true);

      expect(mockContainer.classList.contains('auto-faded')).toBe(false);
    });

    it('should allow fade when unpinned', () => {
      controller.updatePinStatus(false);

      const mouseLeaveEvent = new MouseEvent('mouseleave');
      mockContainer.dispatchEvent(mouseLeaveEvent);

      jest.advanceTimersByTime(3000);

      // The fade should be triggered
      expect(mockContainer.classList.contains('auto-faded')).toBe(true);
    });
  });
});
