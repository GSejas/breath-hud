/**
 * Tooltip Manager for displaying contextual help
 * Handles tooltip visibility and positioning
 */

export class TooltipManager {
  private tooltip: HTMLElement | null = null;
  private hideTimer: NodeJS.Timeout | null = null;
  private readonly SHOW_DELAY = 500; // ms
  private readonly HIDE_DELAY = 3000; // ms

  /**
   * Initialize tooltip
   */
  public initialize(container: HTMLElement): void {
    this.tooltip = container.querySelector('#tooltip') as HTMLElement;
  }

  /**
   * Show tooltip with text
   */
  public show(text: string, targetElement?: HTMLElement): void {
    if (!this.tooltip) return;

    this.clearHideTimer();

    this.tooltip.textContent = text;
    this.tooltip.classList.remove('hidden');
    this.tooltip.style.opacity = '1';

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      this.tooltip.style.left = rect.left + rect.width / 2 + 'px';
      this.tooltip.style.top = rect.bottom + 10 + 'px';
    }

    this.startHideTimer();
  }

  /**
   * Hide tooltip
   */
  public hide(): void {
    if (!this.tooltip) return;

    this.clearHideTimer();
    this.tooltip.style.opacity = '0';
    setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.classList.add('hidden');
      }
    }, 300);
  }

  /**
   * Setup tooltip hover behavior for an element
   */
  public setupHoverTooltip(element: HTMLElement, text: string): void {
    element.addEventListener('mouseenter', () => {
      setTimeout(() => this.show(text, element), this.SHOW_DELAY);
    });

    element.addEventListener('mouseleave', () => {
      this.hide();
    });
  }

  /**
   * Start timer to auto-hide tooltip
   */
  private startHideTimer(): void {
    this.hideTimer = setTimeout(() => this.hide(), this.HIDE_DELAY);
  }

  /**
   * Clear hide timer
   */
  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.clearHideTimer();
    this.hide();
  }
}
