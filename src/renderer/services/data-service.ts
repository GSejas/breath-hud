/**
 * Data Service
 * Handles data persistence (localStorage, ipcRenderer for main process storage)
 * Provides abstraction for saving/loading app data
 */

export interface StorageOptions {
  namespace?: string;
  persistent?: boolean;
}

export class DataService {
  private namespace: string = 'hud-';
  private storage: Storage;
  private ipcRenderer: any = null;
  private persistent: boolean = true;

  constructor(options: StorageOptions = {}) {
    this.namespace = options.namespace || 'hud-';
    this.persistent = options.persistent !== false;
    this.storage = typeof localStorage !== 'undefined' ? localStorage : this.createMemoryStorage();
    this.initializeIpcRenderer();
  }

  /**
   * Initialize ipcRenderer if available (Electron)
   */
  private initializeIpcRenderer(): void {
    try {
      // In Electron environment
      if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
        this.ipcRenderer = (window as any).ipcRenderer;
      }
    } catch {
      // Not in Electron, use localStorage only
    }
  }

  /**
   * Create in-memory storage fallback for testing/environments without localStorage
   */
  private createMemoryStorage(): Storage {
    const data: Record<string, string> = {};
    return {
      getItem: (key: string) => data[key] || null,
      setItem: (key: string, value: string) => {
        data[key] = value;
      },
      removeItem: (key: string) => {
        delete data[key];
      },
      clear: () => {
        Object.keys(data).forEach((key) => {
          delete data[key];
        });
      },
      key: (index: number) => {
        const keys = Object.keys(data);
        return keys[index] || null;
      },
      length: Object.keys(data).length
    };
  }

  /**
   * Build storage key with namespace
   * @param key Key name
   */
  private getKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  /**
   * Save data to storage
   * @param key Data key
   * @param value Value to save (will be JSON stringified)
   * @param options Storage options
   */
  save(key: string, value: unknown, options?: StorageOptions): void {
    const finalKey = this.getKey(key);
    const jsonValue = JSON.stringify(value);

    // Save to localStorage
    try {
      this.storage.setItem(finalKey, jsonValue);
    } catch (error) {
      console.error(`Failed to save to localStorage: ${finalKey}`, error);
    }

    // Save to main process if persistent and ipcRenderer available
    if ((options?.persistent !== false && this.persistent) && this.ipcRenderer) {
      try {
        this.ipcRenderer.invoke('data:save', { key: finalKey, value: jsonValue });
      } catch (error) {
        console.warn(`Failed to save to main process: ${finalKey}`, error);
      }
    }
  }

  /**
   * Load data from storage
   * @param key Data key
   * @param defaultValue Default value if not found
   * @returns Loaded value or default
   */
  load<T>(key: string, defaultValue?: T): T | undefined {
    const finalKey = this.getKey(key);

    try {
      const value = this.storage.getItem(finalKey);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to load from storage: ${finalKey}`, error);
      return defaultValue;
    }
  }

  /**
   * Check if key exists in storage
   * @param key Data key
   */
  has(key: string): boolean {
    const finalKey = this.getKey(key);
    return this.storage.getItem(finalKey) !== null;
  }

  /**
   * Delete data from storage
   * @param key Data key
   */
  delete(key: string): void {
    const finalKey = this.getKey(key);

    try {
      this.storage.removeItem(finalKey);
    } catch (error) {
      console.error(`Failed to delete from storage: ${finalKey}`, error);
    }

    // Delete from main process if ipcRenderer available
    if (this.ipcRenderer) {
      try {
        this.ipcRenderer.invoke('data:delete', { key: finalKey });
      } catch (error) {
        console.warn(`Failed to delete from main process: ${finalKey}`, error);
      }
    }
  }

  /**
   * Clear all data with namespace
   */
  clear(): void {
    const keys: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.namespace)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      try {
        this.storage.removeItem(key);
      } catch (error) {
        console.error(`Failed to delete key: ${key}`, error);
      }
    });

    // Clear from main process if ipcRenderer available
    if (this.ipcRenderer) {
      try {
        this.ipcRenderer.invoke('data:clear', { namespace: this.namespace });
      } catch (error) {
        console.warn(`Failed to clear main process storage`, error);
      }
    }
  }

  /**
   * Get all keys with namespace
   */
  getAllKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.namespace)) {
        keys.push(key.replace(this.namespace, ''));
      }
    }

    return keys;
  }

  /**
   * Export all data as object
   */
  export(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    this.getAllKeys().forEach((key) => {
      data[key] = this.load(key);
    });

    return data;
  }

  /**
   * Import data from object
   * @param data Data object to import
   */
  import(data: Record<string, unknown>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.save(key, value);
    });
  }

  /**
   * Watch for changes to a key (polling-based)
   * @param key Key to watch
   * @param callback Callback when value changes
   * @param interval Check interval in ms
   * @returns Unwatch function
   */
  watch(key: string, callback: (value: unknown) => void, interval: number = 1000): () => void {
    let lastValue = this.load(key);
    const intervalId = setInterval(() => {
      const currentValue = this.load(key);
      if (JSON.stringify(currentValue) !== JSON.stringify(lastValue)) {
        lastValue = currentValue;
        callback(currentValue);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }
}
