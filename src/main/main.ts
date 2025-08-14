import { app, BrowserWindow, globalShortcut } from 'electron';
import { join } from 'path';
import { setupIPCHandlers } from './ipc-handlers';
import { ConfigManager } from '../shared/config-manager';

class HudApplication {
  private mainWindow: BrowserWindow | null = null;
  private config = ConfigManager.loadConfig();

  constructor() {
    this.setupAppEvents();
    this.setupIPC();
  }

  private setupAppEvents(): void {
    app.whenReady().then(() => {
      this.createWindow();
      this.registerShortcuts();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  private setupIPC(): void {
    setupIPCHandlers(this);
  }

  private createWindow(): void {
    console.log('Creating HUD window...');

    this.mainWindow = new BrowserWindow({
      width: this.config.window.width,
      height: this.config.window.height,
      x: this.config.window.position.x,
      y: this.config.window.position.y,
      frame: false,
      transparent: this.config.window.transparent,
      alwaysOnTop: this.config.window.alwaysOnTop,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
      },
    });

    console.log('Window created, loading HTML...');

    // Load the renderer HTML directly from source
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadFile(join(__dirname, '../../src/renderer/index.html'));
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../../src/renderer/index.html'));
    }

    this.mainWindow.on('ready-to-show', () => {
      console.log('Window ready to show');
      this.mainWindow?.show();
    });

    console.log('HUD window setup complete');

    // Hide on blur for now (MVP behavior)
    this.mainWindow.on('blur', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        // TODO: Check if pinned before hiding
        // this.mainWindow.hide();
      }
    });
  }

  private registerShortcuts(): void {
    // Bring attention: show + focus + flash + notify renderer to amplify visuals briefly
    globalShortcut.register('Control+Alt+B', () => {
      const win = this.mainWindow;
      if (!win) return;
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.show();
      win.focus();
      win.flashFrame(true);
      win.webContents.send('hud:attention');
      setTimeout(() => {
        win.webContents.send('hud:attention:end');
        win.flashFrame(false);
      }, 2500);
    });

    // Toggle pin via renderer (so UI stays in sync)
    globalShortcut.register('Control+Alt+P', () => {
      this.mainWindow?.webContents.send('hud:toggle-pin');
    });

    // Show/hide toggle
    globalShortcut.register('Control+Alt+H', () => {
      const win = this.mainWindow;
      if (!win) return;
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    });
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Initialize the application
const hudApp = new HudApplication();

export { hudApp };
