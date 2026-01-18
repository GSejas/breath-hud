import { ScaleController } from '../scale.controller';

describe('ScaleController', () => {
  let controller: ScaleController;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    controller = new ScaleController(mockContainer);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with default scale 1.0', () => {
      expect(controller.getScale()).toBe(1.0);
    });

    it('should load saved scale from localStorage', () => {
      localStorage.setItem('breathingHudScale', '1.5');
      const newController = new ScaleController(mockContainer);
      expect(newController.getScale()).toBe(1.5);
    });

    it('should ignore invalid saved scale', () => {
      localStorage.setItem('breathingHudScale', 'invalid');
      const newController = new ScaleController(mockContainer);
      expect(newController.getScale()).toBe(1.0);
    });
  });

  describe('scaleUp', () => {
    it('should increase scale by step', () => {
      controller.scaleUp();
      expect(controller.getScale()).toBeCloseTo(1.1, 1);
    });

    it('should not exceed max scale', () => {
      controller.setScale(2.95);
      controller.scaleUp();
      expect(controller.getScale()).toBeLessThanOrEqual(3.0);
    });
  });

  describe('scaleDown', () => {
    it('should decrease scale by step', () => {
      controller.setScale(1.5);
      controller.scaleDown();
      expect(controller.getScale()).toBeCloseTo(1.4, 1);
    });

    it('should not go below min scale', () => {
      controller.setScale(0.55);
      controller.scaleDown();
      expect(controller.getScale()).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('resetScale', () => {
    it('should reset to 1.0', () => {
      controller.setScale(2.0);
      controller.resetScale();
      expect(controller.getScale()).toBe(1.0);
    });
  });

  describe('setScale', () => {
    it('should clamp scale to valid range', () => {
      controller.setScale(-1.0);
      expect(controller.getScale()).toBe(0.5);

      controller.setScale(5.0);
      expect(controller.getScale()).toBe(3.0);
    });

    it('should save scale to localStorage', () => {
      controller.setScale(1.8);
      expect(localStorage.getItem('breathingHudScale')).toBe('1.8');
    });

    it('should apply scale to container CSS variables', () => {
      controller.setScale(1.5);
      expect(mockContainer.style.getPropertyValue('--hud-scale')).toBe('1.5');
      const inverseScale = parseFloat(mockContainer.style.getPropertyValue('--inverse-scale'));
      expect(inverseScale).toBeCloseTo(0.667, 2);
    });
  });

  describe('setPresetScale', () => {
    it('should set preset 1 to 0.5', () => {
      controller.setPresetScale(1);
      expect(controller.getScale()).toBe(0.5);
    });

    it('should set preset 3 to 1.0', () => {
      controller.setPresetScale(3);
      expect(controller.getScale()).toBe(1.0);
    });

    it('should set preset 9 to 3.0', () => {
      controller.setPresetScale(9);
      expect(controller.getScale()).toBe(3.0);
    });

    it('should ignore invalid presets', () => {
      controller.setScale(1.0);
      controller.setPresetScale(0);
      expect(controller.getScale()).toBe(1.0);

      controller.setPresetScale(10);
      expect(controller.getScale()).toBe(1.0);
    });
  });

  describe('getScaleInfo', () => {
    it('should return formatted scale info', () => {
      controller.setScale(1.0);
      expect(controller.getScaleInfo()).toBe('100% (300×300px)');
    });

    it('should show correct size for different scales', () => {
      controller.setScale(0.5);
      expect(controller.getScaleInfo()).toBe('50% (150×150px)');

      controller.setScale(2.0);
      expect(controller.getScaleInfo()).toBe('200% (600×600px)');
    });
  });
});
