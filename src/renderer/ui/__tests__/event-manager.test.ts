import { EventManager } from '../event-manager';

describe('EventManager', () => {
  let container: HTMLElement;
  let manager: EventManager;

  beforeEach(() => {
    manager = new EventManager();
    container = document.createElement('div');

    // Create mock elements
    const playBtn = document.createElement('button');
    playBtn.id = 'play-btn';
    const shapeSelect = document.createElement('select');
    shapeSelect.id = 'shape-selector';

    container.appendChild(playBtn);
    container.appendChild(shapeSelect);
  });

  afterEach(() => {
    manager.cleanup();
  });

  describe('setHandlers', () => {
    it('should set event handlers', () => {
      const mockHandler = jest.fn();
      manager.setHandlers({ onPlayClick: mockHandler });

      expect(manager['handlers'].onPlayClick).toBe(mockHandler);
    });

    it('should merge handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.setHandlers({ onPlayClick: handler1 });
      manager.setHandlers({ onStopClick: handler2 });

      expect(manager['handlers'].onPlayClick).toBe(handler1);
      expect(manager['handlers'].onStopClick).toBe(handler2);
    });
  });

  describe('trigger', () => {
    it('should call handler by name', () => {
      const mockHandler = jest.fn();
      manager.setHandlers({ onPlayClick: mockHandler });

      manager.trigger('onPlayClick');

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove all listeners', () => {
      manager.setHandlers({ onPlayClick: jest.fn() });
      manager.setupListeners(container);

      const initialListenerCount = manager['listeners'].length;
      expect(initialListenerCount).toBeGreaterThan(0);

      manager.cleanup();
      expect(manager['listeners'].length).toBe(0);
    });
  });
});
