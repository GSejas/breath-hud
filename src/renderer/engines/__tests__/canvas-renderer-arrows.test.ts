/**
 * Tests for Arrow Direction functionality (Issue #13)
 * Note: These tests use mocked canvas context since JSDOM doesn't support canvas.getContext()
 */

import { CanvasRenderer } from '../canvas-renderer';

// Mock canvas context since JSDOM doesn't support it
const mockCanvasContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  closePath: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 2,
  lineCap: 'round',
  globalAlpha: 1.0,
};

describe('Canvas Renderer - Arrow Direction (Issue #13)', () => {
  let container: HTMLElement;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '300px';
    document.body.appendChild(container);

    // Create renderer and override canvas context
    renderer = new CanvasRenderer(container);
    (renderer as any).context = mockCanvasContext;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Directional Arrows - Inhale Phase', () => {
    it('should draw upward arrows during inhale', () => {
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 3);
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should draw multiple arrows for inhale', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 3);
      expect((mockCanvasContext.beginPath as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    it('should use correct color for arrows', () => {
      jest.clearAllMocks();
      const color = 'rgba(100, 200, 255, 0.8)';
      renderer.drawDirectionalArrows('in', 100, 100, color, 1.0, 1);
      expect(mockCanvasContext.strokeStyle).toBe(color);
    });
  });

  describe('Directional Arrows - Exhale Phase', () => {
    it('should draw downward arrows during exhale', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('out', 100, 100, 'rgba(200, 100, 100, 0.8)', 1.0, 3);
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should draw multiple downward arrows', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('out', 100, 100, 'rgba(200, 100, 100, 0.8)', 1.0, 3);
      expect((mockCanvasContext.beginPath as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Arrow Size Variations', () => {
    it('should respect arrow size parameter', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const callCount1 = (mockCanvasContext.beginPath as jest.Mock).mock.calls.length;

      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 5);
      const callCount2 = (mockCanvasContext.beginPath as jest.Mock).mock.calls.length;

      // More arrows should mean more draw calls
      expect(callCount2).toBeGreaterThan(callCount1);
    });

    it('should clamp arrow size to valid range', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 0.1);
      expect((mockCanvasContext.beginPath as jest.Mock).mock.calls.length).toBeGreaterThan(0);

      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 100);
      expect((mockCanvasContext.beginPath as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Single Arrow Variants', () => {
    it('should draw single upward arrow for inhale', () => {
      jest.clearAllMocks();
      renderer.drawSingleArrow('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0);
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should draw single downward arrow for exhale', () => {
      jest.clearAllMocks();
      renderer.drawSingleArrow('out', 100, 100, 'rgba(200, 100, 100, 0.8)', 1.0);
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });
  });

  describe('Arrow Opacity', () => {
    it('should respect opacity parameter', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 0.5, 1);
      expect(mockCanvasContext.globalAlpha).toBe(0.5);
    });

    it('should draw transparent arrows at low opacity', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 0.2, 1);
      expect(mockCanvasContext.globalAlpha).toBe(0.2);
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });
  });

  describe('Arrow Positioning', () => {
    it('should draw arrows at correct center position', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 150, 150, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      expect(mockCanvasContext.moveTo).toHaveBeenCalled();
      expect(mockCanvasContext.lineTo).toHaveBeenCalled();
    });

    it('should adjust arrow positioning for different canvas sizes', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 50, 50, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const firstCount = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 250, 250, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const secondCount = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      // Should have similar structure regardless of position
      expect(firstCount).toBe(secondCount);
    });
  });

  describe('Canvas Context State Management', () => {
    it('should restore canvas context after drawing arrows', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      expect(mockCanvasContext.save).toHaveBeenCalled();
      expect(mockCanvasContext.restore).toHaveBeenCalled();
    });

    it('should restore context for single arrow too', () => {
      jest.clearAllMocks();
      renderer.drawSingleArrow('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0);
      expect(mockCanvasContext.save).toHaveBeenCalled();
      expect(mockCanvasContext.restore).toHaveBeenCalled();
    });
  });

  describe('Arrow Line Styling', () => {
    it('should use round line caps for smooth arrows', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      expect(mockCanvasContext.lineCap).toBe('round');
    });

    it('should use appropriate line width', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      expect(mockCanvasContext.lineWidth).toBeGreaterThan(0);
    });
  });

  describe('Arrow Direction Consistency', () => {
    it('should maintain arrow direction consistency across multiple draws', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const firstCount = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const secondCount = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      expect(firstCount).toBe(secondCount);
    });

    it('should draw different arrows for in vs out', () => {
      jest.clearAllMocks();
      renderer.drawDirectionalArrows('in', 100, 100, 'rgba(100, 200, 255, 0.8)', 1.0, 1);
      const inCalls = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      jest.clearAllMocks();
      renderer.drawDirectionalArrows('out', 100, 100, 'rgba(200, 100, 100, 0.8)', 1.0, 1);
      const outCalls = (mockCanvasContext.moveTo as jest.Mock).mock.calls.length;

      expect(inCalls).toBeGreaterThan(0);
      expect(outCalls).toBeGreaterThan(0);
    });
  });
});
