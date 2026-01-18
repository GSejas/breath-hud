/**
 * Scale Controller for managing HUD scaling/sizing
 * Handles scale persistence via localStorage
 */

export class ScaleController {
  private currentScale: number = 1.0;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 3.0;
  private readonly SCALE_STEP = 0.1;
  private readonly STORAGE_KEY = 'breathingHudScale';
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadSavedScale();
    this.applyScale();
  }

  /**
   * Increase scale by one step
   */
  public scaleUp(): void {
    const newScale = Math.min(
      this.MAX_SCALE,
      this.currentScale + this.SCALE_STEP
    );
    this.setScale(newScale);
  }

  /**
   * Decrease scale by one step
   */
  public scaleDown(): void {
    const newScale = Math.max(
      this.MIN_SCALE,
      this.currentScale - this.SCALE_STEP
    );
    this.setScale(newScale);
  }

  /**
   * Reset scale to 1.0 (100%)
   */
  public resetScale(): void {
    this.setScale(1.0);
  }

  /**
   * Set scale to specific value with clamping
   */
  public setScale(scale: number): void {
    this.currentScale = Math.max(
      this.MIN_SCALE,
      Math.min(this.MAX_SCALE, scale)
    );
    this.applyScale();
    this.saveScale();

    console.log(`Tile scaled to: ${(this.currentScale * 100).toFixed(0)}%`);
  }

  /**
   * Get current scale value
   */
  public getScale(): number {
    return this.currentScale;
  }

  /**
   * Set scale using preset number (1-9)
   */
  public setPresetScale(preset: number): void {
    // Preset scales: 1=0.5x, 2=0.7x, 3=1.0x, 4=1.3x, 5=1.6x, 6=2.0x, 7=2.3x, 8=2.6x, 9=3.0x
    const presets = [0.5, 0.7, 1.0, 1.3, 1.6, 2.0, 2.3, 2.6, 3.0];
    if (preset >= 1 && preset <= 9) {
      this.setScale(presets[preset - 1]);
    }
  }

  /**
   * Get descriptive scale information
   */
  public getScaleInfo(): string {
    const percentage = Math.round(this.currentScale * 100);
    const size = Math.round(300 * this.currentScale);
    return `${percentage}% (${size}×${size}px)`;
  }

  /**
   * Apply scale to container using CSS variables
   */
  private applyScale(): void {
    if (this.container) {
      this.container.style.setProperty(
        '--hud-scale',
        this.currentScale.toString()
      );
      this.container.classList.add('scalable');

      // Update the scale for counter-scaling fixed controls
      this.container.style.setProperty(
        '--inverse-scale',
        (1 / this.currentScale).toString()
      );
    }
  }

  /**
   * Save scale preference to localStorage
   */
  private saveScale(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.currentScale.toString());
    } catch (error) {
      console.warn('Failed to save scale preference:', error);
    }
  }

  /**
   * Load scale preference from localStorage
   */
  private loadSavedScale(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const scale = parseFloat(saved);
        if (
          !isNaN(scale) &&
          scale >= this.MIN_SCALE &&
          scale <= this.MAX_SCALE
        ) {
          this.currentScale = scale;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved scale:', error);
    }
  }
}
