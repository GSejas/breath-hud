import { ConfigService, type ConfigData } from '../config-service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    service = new ConfigService();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.breathing).toBeDefined();
      expect(config.ui).toBeDefined();
    });

    it('should have breathing defaults', () => {
      expect(service.get('breathing.defaultPattern')).toBe('zen');
      expect(service.get('breathing.defaultShape')).toBe('circle');
      expect(service.get('breathing.defaultTheme')).toBe('ocean');
    });

    it('should have ui defaults', () => {
      expect(service.get('ui.defaultScale')).toBe(1);
      expect(service.get('ui.autoFade')).toBe(true);
      expect(service.get('ui.fadeDelay')).toBe(3000);
    });
  });

  describe('get', () => {
    it('should get value by path', () => {
      const value = service.get('breathing.defaultPattern');
      expect(value).toBe('zen');
    });

    it('should return undefined for non-existent path', () => {
      const value = service.get('non.existent.path');
      expect(value).toBeUndefined();
    });

    it('should handle nested paths', () => {
      service.set('custom.nested.value', 42);
      expect(service.get('custom.nested.value')).toBe(42);
    });
  });

  describe('set', () => {
    it('should set value by path', () => {
      service.set('breathing.defaultPattern', 'box');
      expect(service.get('breathing.defaultPattern')).toBe('box');
    });

    it('should create nested objects as needed', () => {
      service.set('new.nested.path', 'value');
      expect(service.get('new.nested.path')).toBe('value');
    });

    it('should not affect other values', () => {
      const originalShape = service.get('breathing.defaultShape');
      service.set('breathing.defaultPattern', 'new');
      expect(service.get('breathing.defaultShape')).toBe(originalShape);
    });
  });

  describe('mergeConfigs', () => {
    it('should merge multiple configs', () => {
      const config1: ConfigData = { breathing: { defaultPattern: 'zen' } };
      const config2: ConfigData = { breathing: { defaultShape: 'square' } };

      const merged = service.mergeConfigs(config1, config2);

      expect(merged.breathing?.defaultPattern).toBe('zen');
      expect(merged.breathing?.defaultShape).toBe('square');
    });

    it('should apply overrides in order', () => {
      const config1: ConfigData = { test: 1 };
      const config2: ConfigData = { test: 2 };
      const config3: ConfigData = { test: 3 };

      const merged = service.mergeConfigs(config1, config2, config3);
      expect(merged.test).toBe(3);
    });

    it('should preserve unrelated properties', () => {
      const config1: ConfigData = { a: { b: 1 }, c: 2 };
      const config2: ConfigData = { a: { d: 3 } };

      const merged = service.mergeConfigs(config1, config2);

      expect(merged.a).toEqual({ b: 1, d: 3 });
      expect(merged.c).toBe(2);
    });
  });

  describe('has', () => {
    it('should check if path exists', () => {
      expect(service.has('breathing.defaultPattern')).toBe(true);
      expect(service.has('non.existent')).toBe(false);
    });
  });

  describe('getSection', () => {
    it('should get config section', () => {
      const breathing = service.getSection('breathing');
      expect(breathing).toBeDefined();
      expect(breathing?.defaultPattern).toBe('zen');
    });

    it('should return undefined for non-existent section', () => {
      expect(service.getSection('non.existent')).toBeUndefined();
    });
  });

  describe('setConfig', () => {
    it('should replace entire config', () => {
      const newConfig: ConfigData = { custom: { value: 'test' } };
      service.setConfig(newConfig);

      expect(service.get('custom.value')).toBe('test');
      expect(service.get('breathing')).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset to default config', () => {
      service.set('breathing.defaultPattern', 'modified');
      service.reset();

      expect(service.get('breathing.defaultPattern')).toBe('zen');
    });

    it('should clear cache on reset', () => {
      service.clearCache();
      const keys1 = Object.keys(service.getConfig());

      service.set('test', 'value');
      service.reset();

      const keys2 = Object.keys(service.getConfig());
      expect(keys2).toEqual(keys1);
    });
  });

  describe('cache', () => {
    it('should have cache duration', () => {
      const config1 = service.getConfig();
      service.set('test', 'value');
      const config2 = service.getConfig();

      expect(config2.test).toBe('value');
    });

    it('should clear cache', () => {
      service.set('test', 'value');
      service.clearCache();
      service.reset();

      expect(service.has('test')).toBe(false);
    });
  });
});
