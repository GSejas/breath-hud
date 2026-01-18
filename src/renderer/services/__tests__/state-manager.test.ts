import { StateManager, type AppState } from '../state-manager';

describe('StateManager', () => {
  let manager: StateManager;

  beforeEach(() => {
    manager = new StateManager();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = manager.getState();

      expect(state.isPlaying).toBe(false);
      expect(state.currentPattern).toBeNull();
      expect(state.currentShape).toBeNull();
      expect(state.currentTheme).toBeNull();
      expect(state.currentScale).toBe(1);
      expect(state.isEditMode).toBe(false);
      expect(state.isPinned).toBe(false);
      expect(state.selectedSequence).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should notify listener on state change', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      manager.setPlaying(true);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ isPlaying: true }));
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.setPlaying(true);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.setPlaying(false);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      manager.subscribe(listener1);
      manager.subscribe(listener2);

      manager.setPlaying(true);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update single property', () => {
      manager.update('isPlaying', true);
      expect(manager.getValue('isPlaying')).toBe(true);
    });

    it('should not notify if value unchanged', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      manager.update('isPlaying', false); // Already false
      expect(listener).not.toHaveBeenCalled();
    });

    it('should add to history', () => {
      manager.update('isPlaying', true);
      manager.update('currentScale', 2);

      const history = manager.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('updateBatch', () => {
    it('should update multiple properties at once', () => {
      manager.updateBatch({
        isPlaying: true,
        currentScale: 1.5,
        isEditMode: true
      });

      expect(manager.getValue('isPlaying')).toBe(true);
      expect(manager.getValue('currentScale')).toBe(1.5);
      expect(manager.getValue('isEditMode')).toBe(true);
    });

    it('should notify once for batch update', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      manager.updateBatch({
        isPlaying: true,
        currentScale: 2
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not notify if no changes', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      manager.updateBatch({
        isPlaying: false, // Already false
        currentScale: 1 // Already 1
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('playing status', () => {
    it('should check if playing', () => {
      expect(manager.isPlaying()).toBe(false);
      manager.setPlaying(true);
      expect(manager.isPlaying()).toBe(true);
    });

    it('should set playing status', () => {
      manager.setPlaying(true);
      expect(manager.getValue('isPlaying')).toBe(true);

      manager.setPlaying(false);
      expect(manager.getValue('isPlaying')).toBe(false);
    });
  });

  describe('pattern', () => {
    it('should set pattern', () => {
      const pattern = { id: 'zen', name: 'Zen', type: 'relaxing' as const, phases: [], duration: 0 };
      manager.setPattern(pattern);
      expect(manager.getValue('currentPattern')).toBe(pattern);
    });

    it('should set pattern to null', () => {
      manager.setPattern(null);
      expect(manager.getValue('currentPattern')).toBeNull();
    });
  });

  describe('shape', () => {
    it('should set shape', () => {
      const shape = { id: 'circle', name: 'Circle', type: 'circle' as const, description: 'Circle shape' };
      manager.setShape(shape);
      expect(manager.getValue('currentShape')).toBe(shape);
    });

    it('should set shape to null', () => {
      manager.setShape(null);
      expect(manager.getValue('currentShape')).toBeNull();
    });
  });

  describe('theme', () => {
    it('should set theme', () => {
      const theme: any = { id: 'ocean', name: 'Ocean' };
      manager.setTheme(theme);
      expect(manager.getValue('currentTheme')).toBe(theme);
    });

    it('should set theme to null', () => {
      manager.setTheme(null);
      expect(manager.getValue('currentTheme')).toBeNull();
    });
  });

  describe('scale', () => {
    it('should set valid scale', () => {
      manager.setScale(1.5);
      expect(manager.getValue('currentScale')).toBe(1.5);
    });

    it('should reject scale below 0.5', () => {
      manager.setScale(0.25);
      expect(manager.getValue('currentScale')).toBe(1); // Unchanged
    });

    it('should reject scale above 3', () => {
      manager.setScale(4);
      expect(manager.getValue('currentScale')).toBe(1); // Unchanged
    });

    it('should accept boundary scales', () => {
      manager.setScale(0.5);
      expect(manager.getValue('currentScale')).toBe(0.5);

      manager.setScale(3);
      expect(manager.getValue('currentScale')).toBe(3);
    });
  });

  describe('edit mode', () => {
    it('should toggle edit mode', () => {
      expect(manager.getValue('isEditMode')).toBe(false);
      manager.toggleEditMode();
      expect(manager.getValue('isEditMode')).toBe(true);
      manager.toggleEditMode();
      expect(manager.getValue('isEditMode')).toBe(false);
    });

    it('should set edit mode', () => {
      manager.setEditMode(true);
      expect(manager.getValue('isEditMode')).toBe(true);

      manager.setEditMode(false);
      expect(manager.getValue('isEditMode')).toBe(false);
    });
  });

  describe('pinned status', () => {
    it('should toggle pinned', () => {
      expect(manager.getValue('isPinned')).toBe(false);
      manager.togglePinned();
      expect(manager.getValue('isPinned')).toBe(true);
      manager.togglePinned();
      expect(manager.getValue('isPinned')).toBe(false);
    });

    it('should set pinned', () => {
      manager.setPinned(true);
      expect(manager.getValue('isPinned')).toBe(true);

      manager.setPinned(false);
      expect(manager.getValue('isPinned')).toBe(false);
    });
  });

  describe('sequence', () => {
    it('should set selected sequence', () => {
      manager.setSelectedSequence('seq-1');
      expect(manager.getValue('selectedSequence')).toBe('seq-1');
    });

    it('should set sequence to null', () => {
      manager.setSelectedSequence(null);
      expect(manager.getValue('selectedSequence')).toBeNull();
    });
  });

  describe('history', () => {
    it('should track state history', () => {
      manager.setPlaying(true);
      manager.setScale(1.5);
      manager.setEditMode(true);

      const history = manager.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 100; i++) {
        manager.update('currentScale', Math.random());
      }

      const history = manager.getHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    it('should undo to previous state', () => {
      manager.setPlaying(true);
      manager.setScale(1.5);
      manager.setEditMode(true);

      const history = manager.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(3);

      manager.undo();
      const state = manager.getState();

      // After undo, should restore to state before setEditMode
      expect(state.isEditMode).toBe(false);
      expect(state.isPlaying).toBe(true);
      expect(state.currentScale).toBe(1.5);
    });

    it('should clear history', () => {
      manager.setPlaying(true);
      manager.setScale(1.5);

      manager.clearHistory();
      expect(manager.getHistory().length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      manager.setPlaying(true);
      manager.setScale(2);
      manager.setEditMode(true);

      manager.reset();

      const state = manager.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.currentScale).toBe(1);
      expect(state.isEditMode).toBe(false);
    });

    it('should clear history on reset', () => {
      manager.setPlaying(true);
      manager.reset();

      expect(manager.getHistory().length).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return copy of state', () => {
      const state1 = manager.getState();
      const state2 = manager.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow mutation of returned state', () => {
      const state = manager.getState();
      state.isPlaying = true;

      expect(manager.getValue('isPlaying')).toBe(false);
    });
  });
});
