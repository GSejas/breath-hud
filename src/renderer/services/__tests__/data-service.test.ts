import { DataService } from '../data-service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService();
    service.clear();
  });

  afterEach(() => {
    service.clear();
  });

  describe('initialization', () => {
    it('should initialize with default namespace', () => {
      service.save('test', 'value');
      expect(service.load('test')).toBe('value');
    });

    it('should support custom namespace', () => {
      const service1 = new DataService({ namespace: 'app1-' });
      const service2 = new DataService({ namespace: 'app2-' });

      service1.save('key', 'value1');
      service2.save('key', 'value2');

      expect(service1.load('key')).toBe('value1');
      expect(service2.load('key')).toBe('value2');
    });
  });

  describe('save', () => {
    it('should save primitive values', () => {
      service.save('string', 'test');
      service.save('number', 42);
      service.save('boolean', true);

      expect(service.load('string')).toBe('test');
      expect(service.load('number')).toBe(42);
      expect(service.load('boolean')).toBe(true);
    });

    it('should save objects', () => {
      const obj = { name: 'Test', value: 123 };
      service.save('object', obj);

      expect(service.load('object')).toEqual(obj);
    });

    it('should save arrays', () => {
      const arr = [1, 2, 3, 4];
      service.save('array', arr);

      expect(service.load('array')).toEqual(arr);
    });

    it('should save nested structures', () => {
      const data = {
        user: { name: 'John', age: 30 },
        items: [1, 2, 3]
      };
      service.save('nested', data);

      expect(service.load('nested')).toEqual(data);
    });
  });

  describe('load', () => {
    it('should load saved data', () => {
      service.save('key', 'value');
      expect(service.load('key')).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(service.load('non-existent')).toBeUndefined();
    });

    it('should return default value for non-existent key', () => {
      expect(service.load('non-existent', 'default')).toBe('default');
    });

    it('should support typed loading', () => {
      interface User {
        name: string;
        age: number;
      }

      const user: User = { name: 'John', age: 30 };
      service.save('user', user);

      const loaded = service.load<User>('user');
      expect(loaded?.name).toBe('John');
      expect(loaded?.age).toBe(30);
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      service.save('exists', 'value');

      expect(service.has('exists')).toBe(true);
      expect(service.has('non-existent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete saved data', () => {
      service.save('key', 'value');
      expect(service.has('key')).toBe(true);

      service.delete('key');
      expect(service.has('key')).toBe(false);
    });

    it('should not error on deleting non-existent key', () => {
      expect(() => service.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all namespaced data', () => {
      service.save('key1', 'value1');
      service.save('key2', 'value2');

      service.clear();

      expect(service.has('key1')).toBe(false);
      expect(service.has('key2')).toBe(false);
    });

    it('should not affect other namespaces', () => {
      const service1 = new DataService({ namespace: 'ns1-' });
      const service2 = new DataService({ namespace: 'ns2-' });

      service1.save('key', 'value1');
      service2.save('key', 'value2');

      service1.clear();

      expect(service1.load('key')).toBeUndefined();
      expect(service2.load('key')).toBe('value2');
    });
  });

  describe('getAllKeys', () => {
    it('should get all keys', () => {
      service.save('key1', 'value1');
      service.save('key2', 'value2');
      service.save('key3', 'value3');

      const keys = service.getAllKeys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should not include keys from other namespaces', () => {
      const service1 = new DataService({ namespace: 'ns1-' });
      const service2 = new DataService({ namespace: 'ns2-' });

      service1.save('key1', 'value1');
      service2.save('key2', 'value2');

      const keys1 = service1.getAllKeys();
      const keys2 = service2.getAllKeys();

      expect(keys1).toContain('key1');
      expect(keys1).not.toContain('key2');
      expect(keys2).toContain('key2');
      expect(keys2).not.toContain('key1');
    });
  });

  describe('export', () => {
    it('should export all data', () => {
      service.save('key1', 'value1');
      service.save('key2', 'value2');

      const exported = service.export();

      expect(exported).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    it('should export nested data', () => {
      service.save('obj', { nested: { value: 123 } });

      const exported = service.export();
      expect(exported.obj).toEqual({ nested: { value: 123 } });
    });
  });

  describe('import', () => {
    it('should import data', () => {
      const data = {
        key1: 'value1',
        key2: 'value2'
      };

      service.import(data);

      expect(service.load('key1')).toBe('value1');
      expect(service.load('key2')).toBe('value2');
    });

    it('should merge with existing data', () => {
      service.save('existing', 'value');

      service.import({
        new: 'data'
      });

      expect(service.load('existing')).toBe('value');
      expect(service.load('new')).toBe('data');
    });
  });
});
