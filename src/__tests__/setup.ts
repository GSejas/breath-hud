// Test setup file
// Add any global test configuration here

// Mock Electron APIs for testing
(global as any).electronAPI = {
  setClickThrough: jest.fn(),
  close: jest.fn(),
  minimize: jest.fn(),
  saveConfig: jest.fn(),
  loadConfig: jest.fn(),
};

// Mock CSS variable access
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      const mockValues: Record<string, string> = {
        '--theme-primary': 'rgba(74, 144, 226, 0.8)',
        '--theme-secondary': 'rgba(100, 200, 255, 0.6)',
        '--theme-accent': 'rgba(150, 220, 255, 1.0)',
        '--theme-background': 'rgba(0, 50, 100, 0.1)',
      };
      return mockValues[prop] || '';
    }
  })
});

// Suppress console.log in tests unless needed
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Provide a lightweight 2D canvas context shim for jsdom tests to avoid "Not implemented: getContext" errors
(function applyCanvasShim() {
  const noop = () => {};
  const stubContext: any = {
    save: noop,
    restore: noop,
    clearRect: noop,
    beginPath: noop,
    arc: noop,
    fill: noop,
    stroke: noop,
    moveTo: noop,
    lineTo: noop,
    rect: noop,
    bezierCurveTo: noop,
    setLineDash: noop,
    clip: noop,
    fillRect: noop,
    scale: noop,
    translate: noop,
    rotate: noop,
    measureText: () => ({ width: 0 }),
    getImageData: () => ({ data: [] }),
    putImageData: noop,
    createImageData: () => ({ data: [] }),
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    shadowColor: 'transparent',
    shadowBlur: 0,
  };

  try {
    (HTMLCanvasElement.prototype as any).getContext = function (type: string) {
      if (type === '2d') return stubContext;
      return null;
    };
  } catch (e) {
    // ignore if prototype cannot be modified in some environments
  }
})();