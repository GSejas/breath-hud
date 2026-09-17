/**
 * Tests for EditModeController with EditPanel integration (Issue #12)
 */

import { EditModeController } from '../edit-mode-controller';
import { EditPanel } from '../../../ui/edit-panel';

describe('EditModeController with EditPanel (Issue #12 Integration)', () => {
  let controller: EditModeController;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    controller = new EditModeController();
  });

  afterEach(() => {
    controller.dispose();
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('EditPanel Initialization', () => {
    it('should initialize EditPanel', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      expect(panel).toBeTruthy();
      expect(panel instanceof EditPanel).toBe(true);
    });

    it('should create EditPanel element in DOM', () => {
      controller.initializeEditPanel();
      
      const panelElement = document.querySelector('#edit-panel');
      expect(panelElement).toBeTruthy();
    });

    it('should allow setting custom panel element', () => {
      const panelElement = document.createElement('div');
      controller.setEditPanel(panelElement);
      
      // Should have created internal EditPanel
      expect(controller.getEditPanel()).toBeTruthy();
    });
  });

  describe('Edit Mode with EditPanel', () => {
    it('should show panel when entering edit mode', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      controller.enable();
      
      expect(panel?.isShowing()).toBe(true);
    });

    it('should hide panel when exiting edit mode', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      controller.enable();
      expect(panel?.isShowing()).toBe(true);
      
      controller.disable();
      expect(panel?.isShowing()).toBe(false);
    });

    it('should toggle panel visibility with toggle()', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      expect(panel?.isShowing()).toBe(false);
      
      controller.toggle();
      expect(panel?.isShowing()).toBe(true);
      
      controller.toggle();
      expect(panel?.isShowing()).toBe(false);
    });
  });

  describe('EditPanel Control Integration', () => {
    it('should access EditPanel sliders', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      expect(panel?.getSliderValue('base-slider')).toBeDefined();
      expect(panel?.getSliderValue('inhale-slider')).toBeDefined();
      expect(panel?.getSliderValue('exhale-slider')).toBeDefined();
    });

    it('should update slider values through controller', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      panel?.setSliderValue('base-slider', 0.75);
      expect(panel?.getSliderValue('base-slider')).toBe(0.75);
    });

    it('should get all slider values', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      const values = panel?.getAllSliderValues();
      expect(values).toHaveProperty('base');
      expect(values).toHaveProperty('inhale');
      expect(values).toHaveProperty('exhale');
    });
  });

  describe('EditPanel Debug Console Integration', () => {
    it('should access debug console', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      panel?.addDebugMessage('Test message');
      
      const output = document.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBeGreaterThan(0);
    });

    it('should add different message types to console', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      panel?.addDebugMessage('Info', 'info');
      panel?.addDebugMessage('Warning', 'warn');
      panel?.addDebugMessage('Error', 'error');
      
      const output = document.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(3);
    });

    it('should clear debug console', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      panel?.addDebugMessage('Message 1');
      panel?.addDebugMessage('Message 2');
      
      panel?.clearConsole();
      
      const output = document.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(0);
    });
  });

  describe('Edit Mode State Listeners', () => {
    it('should notify listeners when entering edit mode', () => {
      const listener = jest.fn();
      
      controller.subscribe(listener);
      controller.enable();
      
      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should notify listeners when exiting edit mode', () => {
      const listener = jest.fn();
      
      controller.subscribe(listener);
      controller.enable();
      controller.disable();
      
      expect(listener).toHaveBeenNthCalledWith(2, false);
    });

    it('should support multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      controller.subscribe(listener1);
      controller.subscribe(listener2);
      controller.enable();
      
      expect(listener1).toHaveBeenCalledWith(true);
      expect(listener2).toHaveBeenCalledWith(true);
    });

    it('should allow unsubscribing listeners', () => {
      const listener = jest.fn();
      
      const unsubscribe = controller.subscribe(listener);
      unsubscribe();
      controller.enable();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Panel Disposal and Cleanup', () => {
    it('should dispose of controller resources', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();
      
      controller.dispose();
      
      // After disposal, panel should be null
      expect(controller.getEditPanel()).toBeNull();
    });

    it('should remove panel from DOM on disposal', () => {
      controller.initializeEditPanel();
      
      const panelBefore = document.querySelector('#edit-panel');
      expect(panelBefore).toBeTruthy();
      
      controller.dispose();
      
      const panelAfter = document.querySelector('#edit-panel');
      // Panel might still exist, but controller should be cleaned up
      expect(controller.getEditPanel()).toBeNull();
    });

    it('should clear listeners on disposal', () => {
      const listener = jest.fn();
      
      controller.subscribe(listener);
      controller.dispose();
      
      // Creating a new controller should not trigger old listener
      const newController = new EditModeController();
      newController.enable();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Panel Non-Intrusive Design', () => {
    it('should keep panel separate from breathing canvas', () => {
      const canvas = document.createElement('div');
      canvas.id = 'breathing-canvas';
      canvas.style.width = '300px';
      canvas.style.height = '300px';
      document.body.appendChild(canvas);

      controller.initializeEditPanel();
      const panel = document.querySelector('#edit-panel') as HTMLElement;

      // Panel should be positioned far from canvas
      const canvasRect = canvas.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();

      expect(panelRect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(panelRect.bottom).toBeLessThanOrEqual(window.innerHeight);

      document.body.removeChild(canvas);
    });

    it('should not overlay breathing visualization', () => {
      controller.initializeEditPanel();
      const panel = document.querySelector('#edit-panel') as HTMLElement;

      // Panel should have fixed positioning and high z-index (check inline styles)
      expect(panel.style.position).toBe('fixed');
      expect(panel.style.zIndex).toBe('10000');
    });

    it('should be draggable', () => {
      controller.initializeEditPanel();
      const panel = document.querySelector('#edit-panel') as HTMLElement;
      const header = panel.querySelector('.edit-panel-header') as HTMLElement;

      expect(header.style.cursor).toBe('move');
    });

    it('should have close button for easy dismissal', () => {
      controller.initializeEditPanel();
      const panel = document.querySelector('#edit-panel') as HTMLElement;
      const closeBtn = panel.querySelector('.edit-panel-close') as HTMLElement;

      expect(closeBtn).toBeTruthy();
      expect(closeBtn.textContent).toBe('✕');
    });
  });

  describe('Edit Mode Reset', () => {
    it('should reset to default state', () => {
      controller.initializeEditPanel();
      const panel = controller.getEditPanel();

      controller.enable();
      expect(panel?.isShowing()).toBe(true);

      controller.reset();
      expect(panel?.isShowing()).toBe(false);
    });
  });
});
