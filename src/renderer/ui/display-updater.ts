/**
 * Display Updater for updating UI display values
 * Handles all display panel updates
 */

export class DisplayUpdater {
  private phaseDisplay: HTMLElement | null = null;
  private shapeDisplay: HTMLElement | null = null;
  private patternDisplay: HTMLElement | null = null;
  private scaleDisplay: HTMLElement | null = null;

  /**
   * Initialize display elements
   */
  public initialize(container: HTMLElement): void {
    this.phaseDisplay = container.querySelector('#phase-display');
    this.shapeDisplay = container.querySelector('#shape-display');
    this.patternDisplay = container.querySelector('#pattern-display');
    this.scaleDisplay = container.querySelector('#scale-display');
  }

  /**
   * Update phase display
   */
  public updatePhase(phaseName: string, progress: number): void {
    if (this.phaseDisplay) {
      const percentage = Math.round(progress * 100);
      this.phaseDisplay.textContent = `${phaseName} (${percentage}%)`;
    }
  }

  /**
   * Update shape display
   */
  public updateShape(shapeName: string): void {
    if (this.shapeDisplay) {
      this.shapeDisplay.textContent = shapeName;
    }
  }

  /**
   * Update pattern display
   */
  public updatePattern(patternName: string): void {
    if (this.patternDisplay) {
      this.patternDisplay.textContent = patternName;
    }
  }

  /**
   * Update scale display
   */
  public updateScale(scaleInfo: string): void {
    if (this.scaleDisplay) {
      this.scaleDisplay.textContent = scaleInfo;
    }
  }

  /**
   * Clear all displays
   */
  public clear(): void {
    this.updatePhase('—', 0);
    this.updateShape('—');
    this.updatePattern('—');
    this.updateScale('—');
  }

  /**
   * Update multiple displays at once
   */
  public updateAll(updates: {
    phase?: { name: string; progress: number };
    shape?: string;
    pattern?: string;
    scale?: string;
  }): void {
    if (updates.phase) {
      this.updatePhase(updates.phase.name, updates.phase.progress);
    }
    if (updates.shape) {
      this.updateShape(updates.shape);
    }
    if (updates.pattern) {
      this.updatePattern(updates.pattern);
    }
    if (updates.scale) {
      this.updateScale(updates.scale);
    }
  }
}
