/**
 * Edit Panel Component
 * Separate floating panel for edit mode controls and debug console
 * Keeps breathing visualization unobstructed
 */

export class EditPanel {
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  /**
   * Create and initialize edit panel
   */
  public create(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'edit-panel';
    panel.className = 'edit-panel hidden';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid rgba(100, 200, 255, 0.5);
      border-radius: 8px;
      padding: 0;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 20px rgba(100, 200, 255, 0.3);
      backdrop-filter: blur(10px);
      overflow: hidden;
    `;

    // Header with draggable area and close button
    const header = this.createHeader();
    panel.appendChild(header);

    // Controls section
    const controls = this.createControlsSection();
    panel.appendChild(controls);

    // Debug console section
    const console = this.createConsoleSection();
    panel.appendChild(console);

    // Setup drag functionality
    this.setupDragFunctionality(panel, header);

    this.panel = panel;
    return panel;
  }

  /**
   * Create panel header with title and close button
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'edit-panel-header';
    header.style.cssText = `
      background: linear-gradient(135deg, rgba(50, 100, 200, 0.8), rgba(100, 150, 255, 0.6));
      padding: 12px 16px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    `;

    const title = document.createElement('span');
    title.textContent = '⚙ Edit Mode';
    title.style.cssText = `
      font-weight: bold;
      font-size: 13px;
    `;
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.className = 'edit-panel-close';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      transition: color 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = 'rgba(255, 255, 255, 1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = 'rgba(255, 255, 255, 0.7)';
    });
    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(closeBtn);
    return header;
  }

  /**
   * Create controls section (sliders, selectors)
   */
  private createControlsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'edit-panel-controls';
    section.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.2);
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Add control containers
    const controls = [
      { id: 'base-slider', label: 'Base:', min: 0.3, max: 1.0, step: 0.1, value: 0.6 },
      { id: 'inhale-slider', label: 'Inhale:', min: 0.5, max: 2.0, step: 0.1, value: 1.0 },
      { id: 'exhale-slider', label: 'Exhale:', min: 0.3, max: 1.0, step: 0.1, value: 0.4 }
    ];

    controls.forEach(control => {
      const controlDiv = document.createElement('div');
      controlDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      const label = document.createElement('label');
      label.textContent = control.label;
      label.style.cssText = `
        min-width: 60px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
      `;
      controlDiv.appendChild(label);

      const slider = document.createElement('input');
      slider.id = control.id;
      slider.type = 'range';
      slider.min = String(control.min);
      slider.max = String(control.max);
      slider.step = String(control.step);
      slider.value = String(control.value);
      slider.style.cssText = `
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: rgba(100, 200, 255, 0.2);
        outline: none;
        cursor: pointer;
        accent-color: rgba(100, 200, 255, 0.8);
      `;
      controlDiv.appendChild(slider);

      const value = document.createElement('span');
      value.className = `${control.id}-value`;
      value.textContent = control.value.toFixed(1);
      value.style.cssText = `
        min-width: 30px;
        text-align: right;
        font-size: 11px;
        color: rgba(100, 200, 255, 0.8);
        font-weight: bold;
      `;
      controlDiv.appendChild(value);

      // Update display value
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        value.textContent = (parseFloat(target.value)).toFixed(1);
      });

      section.appendChild(controlDiv);
    });

    return section;
  }

  /**
   * Create debug console section
   */
  private createConsoleSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'edit-panel-console';
    section.style.cssText = `
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.6);
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: rgba(100, 255, 100, 0.8);
    `;

    const console = document.createElement('div');
    console.id = 'edit-panel-debug-output';
    console.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 2px;
    `;

    section.appendChild(console);
    return section;
  }

  /**
   * Setup drag functionality for the panel
   */
  private setupDragFunctionality(panel: HTMLElement, header: HTMLElement): void {
    header.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      const rect = panel.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging || !this.panel) return;

      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;

      // Keep panel within viewport bounds
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;

      this.panel.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      this.panel.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
      this.panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  /**
   * Show panel
   */
  public show(): void {
    if (!this.panel) return;
    this.isVisible = true;
    this.panel.classList.remove('hidden');
    this.panel.style.opacity = '1';
  }

  /**
   * Hide panel
   */
  public hide(): void {
    if (!this.panel) return;
    this.isVisible = false;
    this.panel.classList.add('hidden');
    this.panel.style.opacity = '0';
  }

  /**
   * Toggle panel visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Add debug message to console
   */
  public addDebugMessage(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.panel) return;

    const output = this.panel.querySelector('#edit-panel-debug-output');
    if (!output) return;

    const line = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'rgba(255, 100, 100, 0.8)' : 
                  type === 'warn' ? 'rgba(255, 200, 100, 0.8)' :
                  'rgba(100, 255, 100, 0.8)';

    line.style.color = color;
    line.textContent = `[${timestamp}] ${message}`;

    output.appendChild(line);

    // Keep only last 50 messages
    while (output.children.length > 50) {
      output.removeChild(output.children[0]);
    }

    // Auto-scroll to bottom
    const container = output.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  /**
   * Clear debug console
   */
  public clearConsole(): void {
    const output = this.panel?.querySelector('#edit-panel-debug-output');
    if (output) {
      output.innerHTML = '';
    }
  }

  /**
   * Get slider value by ID
   */
  public getSliderValue(sliderId: string): number {
    const slider = this.panel?.querySelector(`#${sliderId}`) as HTMLInputElement;
    return slider ? parseFloat(slider.value) : 0;
  }

  /**
   * Set slider value by ID
   */
  public setSliderValue(sliderId: string, value: number): void {
    const slider = this.panel?.querySelector(`#${sliderId}`) as HTMLInputElement;
    if (slider) {
      slider.value = String(value);
      slider.dispatchEvent(new Event('input'));
    }
  }

  /**
   * Get all slider values
   */
  public getAllSliderValues(): { base: number; inhale: number; exhale: number } {
    return {
      base: this.getSliderValue('base-slider'),
      inhale: this.getSliderValue('inhale-slider'),
      exhale: this.getSliderValue('exhale-slider')
    };
  }

  /**
   * Check if panel is visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Get panel element
   */
  public getElement(): HTMLElement | null {
    return this.panel;
  }

  /**
   * Dispose of panel
   */
  public dispose(): void {
    if (this.panel && this.panel.parentElement) {
      this.panel.parentElement.removeChild(this.panel);
    }
    this.panel = null;
  }
}
