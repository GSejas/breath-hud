/**
 * Auto-Fade Controller for UI fade-on-inactivity behavior
 * Hides UI after delay when mouse leaves, shows on hover
 */

export class AutoFadeController {
  private fadeTimer: NodeJS.Timeout | null = null;
  private container: HTMLElement;
  private readonly FADE_DELAY = 3000; // 3 seconds

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupFadeListeners();
  }

  /**
   * Set up event listeners for fade behavior
   */
  private setupFadeListeners(): void {
    // Show on hover
    this.container.addEventListener('mouseenter', () => {
      if (!this.isPinned()) {
        this.showInterface();
        this.clearFadeTimer();
      }
    });

    // Start fade timer on mouse leave
    this.container.addEventListener('mouseleave', () => {
      if (!this.isPinned()) {
        this.startFadeTimer();
      }
    });

    // Cancel fade if controls are clicked
    this.container.addEventListener('click', (e) => {
      if (e.target instanceof HTMLButtonElement) {
        this.clearFadeTimer();
        this.showInterface();
        // Start new timer after click
        setTimeout(() => {
          if (!this.isPinned()) {
            this.startFadeTimer();
          }
        }, 100);
      }
    });
  }

  /**
   * Start timer to fade interface after delay
   */
  private startFadeTimer(): void {
    this.clearFadeTimer();
    this.fadeTimer = setTimeout(() => {
      this.fadeInterface();
    }, this.FADE_DELAY);
  }

  /**
   * Clear any pending fade timer
   */
  private clearFadeTimer(): void {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  /**
   * Show interface (remove fade class)
   */
  private showInterface(): void {
    this.container.classList.remove('auto-faded');
  }

  /**
   * Fade interface (add fade class)
   */
  private fadeInterface(): void {
    if (!this.isPinned()) {
      this.container.classList.add('auto-faded');
    }
  }

  /**
   * Check if interface is pinned (always visible)
   */
  private isPinned(): boolean {
    return this.container.classList.contains('pinned');
  }

  /**
   * Force show interface (for debugging/testing)
   */
  public forceShow(): void {
    this.clearFadeTimer();
    this.showInterface();
  }

  /**
   * Update pin status and adjust fade behavior
   */
  public updatePinStatus(isPinned: boolean): void {
    if (isPinned) {
      this.clearFadeTimer();
      this.showInterface();
    } else {
      this.startFadeTimer();
    }
  }
}
