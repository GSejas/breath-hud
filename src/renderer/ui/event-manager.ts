/**
 * Event Manager for handling all UI events
 * Centralizes event listener management
 */

export interface EventHandlers {
  onPlayClick?: () => void;
  onStopClick?: () => void;
  onSettingsClick?: () => void;
  onPinClick?: () => void;
  onShapeChange?: (shapeId: string) => void;
  onPatternChange?: (patternId: string) => void;
  onThemeChange?: (themeId: string) => void;
  onScaleUp?: () => void;
  onScaleDown?: () => void;
}

export class EventManager {
  private handlers: EventHandlers = {};
  private listeners: Array<{
    element: HTMLElement;
    event: string;
    handler: EventListener;
  }> = [];

  /**
   * Set event handlers
   */
  public setHandlers(handlers: EventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Setup all event listeners
   */
  public setupListeners(container: HTMLElement): void {
    const playBtn = container.querySelector('#play-btn') as HTMLButtonElement;
    const stopBtn = container.querySelector('#stop-btn') as HTMLButtonElement;
    const settingsBtn = container.querySelector(
      '#settings-btn'
    ) as HTMLButtonElement;
    const pinBtn = container.querySelector('#pin-btn') as HTMLButtonElement;
    const shapeSelect = container.querySelector(
      '#shape-selector'
    ) as HTMLSelectElement;
    const patternSelect = container.querySelector(
      '#pattern-selector'
    ) as HTMLSelectElement;
    const themeSelect = container.querySelector(
      '#theme-selector'
    ) as HTMLSelectElement;

    if (playBtn)
      this.addEventListener(playBtn, 'click', () => this.handlers.onPlayClick?.());
    if (stopBtn)
      this.addEventListener(stopBtn, 'click', () => this.handlers.onStopClick?.());
    if (settingsBtn)
      this.addEventListener(settingsBtn, 'click', () =>
        this.handlers.onSettingsClick?.()
      );
    if (pinBtn)
      this.addEventListener(pinBtn, 'click', () => this.handlers.onPinClick?.());

    if (shapeSelect)
      this.addEventListener(shapeSelect, 'change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.handlers.onShapeChange?.(value);
      });

    if (patternSelect)
      this.addEventListener(patternSelect, 'change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.handlers.onPatternChange?.(value);
      });

    if (themeSelect)
      this.addEventListener(themeSelect, 'change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.handlers.onThemeChange?.(value);
      });

    // Keyboard shortcuts
    this.addEventListener(document, 'keydown', (e) => {
      const event = e as KeyboardEvent;
      if (event.code === 'Space') {
        event.preventDefault();
        this.handlers.onPlayClick?.();
      }
      if (event.code === 'KeyP') {
        this.handlers.onPinClick?.();
      }
    });
  }

  /**
   * Add event listener with tracking
   */
  private addEventListener(
    element: HTMLElement | Document,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    if (element instanceof HTMLElement) {
      this.listeners.push({ element, event, handler });
    }
  }

  /**
   * Remove all event listeners
   */
  public cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }

  /**
   * Trigger handler manually (for testing)
   */
  public trigger(handlerName: keyof EventHandlers): void {
    const handler = this.handlers[handlerName];
    if (typeof handler === 'function') {
      (handler as any)();
    }
  }
}
