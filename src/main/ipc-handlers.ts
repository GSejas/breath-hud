import { ipcMain, BrowserWindow } from 'electron';
import { ConfigManager } from '../shared/config-manager';

export function setupIPCHandlers(hudApp: any) {
  ipcMain.handle('window:pin', async () => {
    const window = hudApp.getMainWindow();
    if (window) {
      window.setAlwaysOnTop(true);
      // Enable click-through when pinned
      window.setIgnoreMouseEvents(true, { forward: true });
      return { success: true };
    }
    throw new Error('Main window not available');
  });

  ipcMain.handle('window:unpin', async () => {
    const window = hudApp.getMainWindow();
    if (window) {
      window.setAlwaysOnTop(false);
      // Disable click-through when unpinned
      window.setIgnoreMouseEvents(false);
      return { success: true };
    }
    throw new Error('Main window not available');
  });

  ipcMain.handle('window:set-click-through', async (event, enabled: boolean) => {
    const window = hudApp.getMainWindow();
    if (window) {
      window.setIgnoreMouseEvents(enabled, { forward: true });
      return { success: true };
    }
    throw new Error('Main window not available');
  });

  ipcMain.handle('window:close', async () => {
    const window = hudApp.getMainWindow();
    if (window) {
      window.close();
      return { success: true };
    }
    throw new Error('Main window not available');
  });

  ipcMain.handle('window:minimize', async () => {
    const window = hudApp.getMainWindow();
    if (window) {
      window.minimize();
      return { success: true };
    }
    throw new Error('Main window not available');
  });

  // Configuration handler
  ipcMain.handle('config:load', async () => {
    try {
      const config = ConfigManager.loadConfig();
      console.log('Configuration loaded for renderer');
      return config;
    } catch (error) {
      console.error('Failed to load config for renderer:', error);
      return ConfigManager.loadConfig(); // This will return defaults if loading fails
    }
  });
}
