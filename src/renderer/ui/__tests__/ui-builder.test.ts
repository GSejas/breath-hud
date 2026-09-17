import { UIBuilder } from '../ui-builder';

describe('UIBuilder', () => {
  let container: HTMLElement;
  let builder: UIBuilder;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    builder = new UIBuilder(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('buildUI', () => {
    it('should create all UI components', () => {
      const ui = builder.buildUI();

      expect(ui.canvas).toBeDefined();
      expect(ui.controls).toBeDefined();
      expect(ui.display).toBeDefined();
      expect(ui.tooltip).toBeDefined();
    });

    it('should add components to container', () => {
      builder.buildUI();
      expect(container.children.length).toBe(4);
    });

    it('should create canvas container with correct ID', () => {
      const ui = builder.buildUI();
      expect(ui.canvas.id).toBe('breathing-canvas-container');
    });

    it('should create controls with buttons', () => {
      const ui = builder.buildUI();
      const buttons = ui.controls.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('createShapeSelector', () => {
    it('should create select element', () => {
      const selector = builder.createShapeSelector();
      expect(selector.tagName).toBe('SELECT');
    });

    it('should have multiple options', () => {
      const selector = builder.createShapeSelector();
      const options = selector.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('createPatternSelector', () => {
    it('should create select element', () => {
      const selector = builder.createPatternSelector();
      expect(selector.tagName).toBe('SELECT');
    });
  });

  describe('createThemeSelector', () => {
    it('should create select element', () => {
      const selector = builder.createThemeSelector();
      expect(selector.tagName).toBe('SELECT');
    });
  });

  describe('getElement', () => {
    it('should return null for non-existent elements', () => {
      const el = builder.getElement('non-existent');
      expect(el).toBeNull();
    });

    it('should return element after buildUI', () => {
      builder.buildUI();
      const el = builder.getElement('breathing-canvas-container');
      expect(el).not.toBeNull();
    });
  });

  describe('getElements', () => {
    it('should return map of elements', () => {
      builder.buildUI();
      const elements = builder.getElements(
        'breathing-canvas-container',
        'controls-panel'
      );

      expect(elements.size).toBe(2);
      expect(elements.has('breathing-canvas-container')).toBe(true);
      expect(elements.has('controls-panel')).toBe(true);
    });
  });
});
