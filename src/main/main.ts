import { app, BrowserWindow, globalShortcut, Menu, nativeImage, Tray } from 'electron';
import { join } from 'path';
import { setupIPCHandlers } from './ipc-handlers';
import { ConfigManager } from '../shared/config-manager';

class HudApplication {
  private mainWindow: BrowserWindow | null = null;
  private editorWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting = false;
  private config = ConfigManager.loadConfig();

  constructor() {
    this.setupAppEvents();
    this.setupIPC();
  }

  private setupAppEvents(): void {
    app.whenReady().then(() => {
      if (app.isPackaged && process.platform === 'win32') {
        app.setLoginItemSettings({
          openAtLogin: true,
          path: process.execPath,
        });
      }

      this.createWindow();
      this.createTray();
      this.registerShortcuts();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin' && !this.tray) {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('will-quit', () => {
      this.isQuitting = true;
      globalShortcut.unregisterAll();
      this.tray?.destroy();
      this.tray = null;
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

    // Load the renderer HTML from the packaged renderer output.
    const htmlFile = '../renderer/index.html';
      
    const loadWindow = this.mainWindow.loadFile(join(__dirname, htmlFile));
    loadWindow.catch((error) => {
      console.error('Failed to load HUD renderer:', error);
    });

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('ready-to-show', () => {
      console.log('Window ready to show');
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // The tray owns the application's lifetime. Closing the HUD hides it so
    // the user can bring it back from the tray or open the editor later.
    this.mainWindow.on('close', (event) => {
      if (this.isQuitting) return;
      event.preventDefault();
      this.mainWindow?.hide();
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

  /** Open the editor in a normal, taskbar-visible window. */
  public openEditor(): void {
    if (this.editorWindow && !this.editorWindow.isDestroyed()) {
      if (this.editorWindow.isMinimized()) this.editorWindow.restore();
      this.editorWindow.show();
      this.editorWindow.focus();
      return;
    }

    this.editorWindow = new BrowserWindow({
      width: 980,
      height: 720,
      minWidth: 320,
      minHeight: 560,
      title: 'Breathing HUD — Minimal editor',
      backgroundColor: '#0d1016',
      show: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      skipTaskbar: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
      },
    });

    const htmlFile = join(__dirname, '../renderer/index.html');
    const loadEditor = this.editorWindow.loadFile(htmlFile, { query: { view: 'editor' } });
    loadEditor.catch((error) => {
      console.error('Failed to load minimal editor:', error);
    });

    this.editorWindow.once('ready-to-show', () => {
      this.editorWindow?.show();
      this.editorWindow?.focus();
    });

    this.editorWindow.on('closed', () => {
      this.editorWindow = null;
    });
  }

  public closeEditor(): void {
    if (this.editorWindow && !this.editorWindow.isDestroyed()) {
      this.editorWindow.close();
    }
  }

  private createTray(): void {
    if (this.tray) return;

    // Keep the tray asset local to the main process so packaging does not need
    // a second asset pipeline for the MVP icon.
    const iconSvg = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
      '<circle cx="8" cy="8" r="7" fill="#0d1016" stroke="#a8d5ff"/>' +
      '<circle cx="8" cy="8" r="3" fill="#78d9ad"/>' +
      '</svg>',
    );
    const icon = nativeImage.createFromDataURL(`data:image/svg+xml;charset=utf-8,${iconSvg}`);
    this.tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
    this.tray.setToolTip('Breathing HUD');
    this.tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show HUD', click: () => this.showHUD() },
      { label: 'Open minimal editor', click: () => this.openEditor() },
      { label: 'Hide HUD', click: () => this.mainWindow?.hide() },
      { type: 'separator' },
       { label: 'Quit', click: () => this.quit() },
    ]));
    this.tray.on('click', () => this.showHUD());
    this.tray.on('double-click', () => this.openEditor());
  }

  private showHUD(): void {
    const win = this.mainWindow;
    if (!win || win.isDestroyed()) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }

  private quit(): void {
    this.isQuitting = true;
    app.quit();
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

    // Editor remains reachable even while the transparent HUD is pinned.
    globalShortcut.register('Control+Alt+E', () => this.openEditor());
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getEditorWindow(): BrowserWindow | null {
    return this.editorWindow;
  }
}

// Initialize the application
const hudApp = new HudApplication();

export { hudApp };
