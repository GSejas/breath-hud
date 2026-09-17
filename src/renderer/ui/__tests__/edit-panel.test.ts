/**
 * Tests for EditPanel component (Issue #12)
 */

import { EditPanel } from '../edit-panel';

describe('EditPanel Component (Issue #12)', () => {
  let editPanel: EditPanel;
  let container: HTMLElement;

  beforeEach(() => {
    // Create a container for testing
    container = document.createElement('div');
    document.body.appendChild(container);
    editPanel = new EditPanel();
  });

  afterEach(() => {
    editPanel.dispose();
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Panel Creation', () => {
    it('should create edit panel element', () => {
      const panel = editPanel.create();
      expect(panel).toBeTruthy();
      expect(panel.id).toBe('edit-panel');
    });

    it('should have proper CSS positioning', () => {
      const panel = editPanel.create();
      // Check inline styles (JSDOM doesn't compute CSS)
      expect(panel.style.position).toBe('fixed');
    });

    it('should not overlap with breathing canvas', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      // Check z-index from inline styles
      expect(panel.style.zIndex).toBe('10000');
    });
  });

  describe('Panel Visibility', () => {
    it('should start hidden', () => {
      const panel = editPanel.create();
      expect(editPanel.isShowing()).toBe(false);
    });

    it('should show when show() is called', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.show();
      expect(editPanel.isShowing()).toBe(true);
      expect(panel.classList.contains('hidden')).toBe(false);
    });

    it('should hide when hide() is called', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.show();
      editPanel.hide();
      expect(editPanel.isShowing()).toBe(false);
      expect(panel.classList.contains('hidden')).toBe(true);
    });

    it('should toggle visibility', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      expect(editPanel.isShowing()).toBe(false);
      editPanel.toggle();
      expect(editPanel.isShowing()).toBe(true);
      editPanel.toggle();
      expect(editPanel.isShowing()).toBe(false);
    });
  });

  describe('Controls Section', () => {
    it('should have three sliders', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const sliders = panel.querySelectorAll('input[type="range"]');
      expect(sliders.length).toBe(3);
    });

    it('should have slider for base control', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const baseSlider = panel.querySelector('#base-slider') as HTMLInputElement;
      expect(baseSlider).toBeTruthy();
      expect(parseFloat(baseSlider.value)).toBeGreaterThan(0);
    });

    it('should have slider for inhale control', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const inhaleSlider = panel.querySelector('#inhale-slider') as HTMLInputElement;
      expect(inhaleSlider).toBeTruthy();
    });

    it('should have slider for exhale control', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const exhaleSlider = panel.querySelector('#exhale-slider') as HTMLInputElement;
      expect(exhaleSlider).toBeTruthy();
    });

    it('should get and set slider values', () => {
      editPanel.create();
      
      editPanel.setSliderValue('base-slider', 0.8);
      expect(editPanel.getSliderValue('base-slider')).toBe(0.8);
    });

    it('should get all slider values', () => {
      editPanel.create();
      
      editPanel.setSliderValue('base-slider', 0.7);
      editPanel.setSliderValue('inhale-slider', 1.5);
      editPanel.setSliderValue('exhale-slider', 0.5);
      
      const values = editPanel.getAllSliderValues();
      expect(values.base).toBe(0.7);
      expect(values.inhale).toBe(1.5);
      expect(values.exhale).toBe(0.5);
    });
  });

  describe('Debug Console', () => {
    it('should add debug messages', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.addDebugMessage('Test message');
      
      const output = panel.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(1);
    });

    it('should add messages with different types', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.addDebugMessage('Info message', 'info');
      editPanel.addDebugMessage('Warning message', 'warn');
      editPanel.addDebugMessage('Error message', 'error');
      
      const output = panel.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(3);
    });

    it('should clear console', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.addDebugMessage('Message 1');
      editPanel.addDebugMessage('Message 2');
      editPanel.clearConsole();
      
      const output = panel.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(0);
    });

    it('should keep only last 50 messages', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      for (let i = 0; i < 60; i++) {
        editPanel.addDebugMessage(`Message ${i}`);
      }
      
      const output = panel.querySelector('#edit-panel-debug-output');
      expect(output?.children.length).toBe(50);
    });
  });

  describe('Drag Functionality', () => {
    it('should allow dragging the panel', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const header = panel.querySelector('.edit-panel-header') as HTMLElement;
      expect(header.style.cursor).toBe('move');
    });

    it('should have close button', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      const closeBtn = panel.querySelector('.edit-panel-close');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn?.textContent).toBe('✕');
    });

    it('should close panel when close button is clicked', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.show();
      const closeBtn = panel.querySelector('.edit-panel-close') as HTMLElement;
      closeBtn.click();
      
      expect(editPanel.isShowing()).toBe(false);
    });
  });

  describe('Panel Disposal', () => {
    it('should dispose of panel', () => {
      const panel = editPanel.create();
      document.body.appendChild(panel);
      
      editPanel.dispose();
      expect(editPanel.getElement()).toBeNull();
    });
  });
});
