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

// Mock DOM methods
Object.defineProperty(document, 'getElementById', {
  value: jest.fn(() => ({
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn()
    },
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  })),
  writable: true
});

// Suppress console.log in tests unless needed
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};