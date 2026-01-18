import { EditModeController } from '../edit-mode-controller';

describe('EditModeController', () => {
  let controller: EditModeController;
  let editPanel: HTMLElement;

  beforeEach(() => {
    controller = new EditModeController();
    editPanel = document.createElement('div');
    editPanel.id = 'edit-panel';
    document.body.appendChild(editPanel);
    controller.setEditPanel(editPanel);
  });

  afterEach(() => {
    document.body.removeChild(editPanel);
  });

  describe('edit mode state', () => {
    it('should initialize disabled', () => {
      expect(controller.isEnabled()).toBe(false);
    });

    it('should enable edit mode', () => {
      controller.enable();
      expect(controller.isEnabled()).toBe(true);
    });

    it('should toggle edit mode', () => {
      controller.toggle();
      expect(controller.isEnabled()).toBe(true);
      controller.toggle();
      expect(controller.isEnabled()).toBe(false);
    });
  });

  describe('listeners', () => {
    it('should notify listener on enable', () => {
      const listener = jest.fn();
      controller.subscribe(listener);
      controller.enable();
      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = controller.subscribe(listener);

      controller.enable();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      controller.disable();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    it('should reset to disabled', () => {
      controller.enable();
      controller.reset();
      expect(controller.isEnabled()).toBe(false);
    });
  });
});
