/**
 * Edit Mode Controller
 * Manages edit mode state and UI mode toggling
 */

import type { StateManager } from '../../services';
import { EditPanel } from '../../ui/edit-panel';

export type EditModeListener = (editMode: boolean) => void;

export class EditModeController {
  private isEditMode: boolean = false;
  private listeners: Set<EditModeListener> = new Set();
  private stateManager: StateManager | null = null;
  private editPanelElement: HTMLElement | null = null;
  private editPanel: EditPanel | null = null;

  constructor() {
    // Initialize
  }

  /**
   * Set state manager for updates
   */
  setStateManager(manager: StateManager): void {
    this.stateManager = manager;
  }

  /**
   * Set edit panel DOM element
   */
  setEditPanel(element: HTMLElement): void {
    this.editPanelElement = element;
    
    // Initialize EditPanel component
    if (!this.editPanel) {
      this.editPanel = new EditPanel();
      const panelElement = this.editPanel.create();
      document.body.appendChild(panelElement);
    }
  }

  /**
   * Initialize EditPanel component
   */
  initializeEditPanel(): void {
    if (!this.editPanel) {
      this.editPanel = new EditPanel();
      const panelElement = this.editPanel.create();
      document.body.appendChild(panelElement);
    }
  }

  /**
   * Get EditPanel instance
   */
  getEditPanel(): EditPanel | null {
    return this.editPanel;
  }

  /**
   * Subscribe to edit mode changes
   */
  subscribe(listener: EditModeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Enable edit mode
   */
  enable(): void {
    if (this.isEditMode) return;
    this.setEditMode(true);
  }

  /**
   * Disable edit mode
   */
  disable(): void {
    if (!this.isEditMode) return;
    this.setEditMode(false);
  }

  /**
   * Toggle edit mode
   */
  toggle(): void {
    this.setEditMode(!this.isEditMode);
  }

  /**
   * Check if in edit mode
   */
  isEnabled(): boolean {
    return this.isEditMode;
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.setEditMode(false);
  }

  /**
   * Set edit mode state
   */
  private setEditMode(editMode: boolean): void {
    this.isEditMode = editMode;

    this.updateEditPanelVisibility();
    this.updateInputs();
    this.notifyListeners();

    if (this.stateManager) {
      this.stateManager.update('isEditMode', editMode);
    }
  }

  /**
   * Update edit panel visibility
   */
  private updateEditPanelVisibility(): void {
    if (this.editPanel) {
      if (this.isEditMode) {
        this.editPanel.show();
      } else {
        this.editPanel.hide();
      }
    }

    if (this.editPanelElement) {
      if (this.isEditMode) {
        this.editPanelElement.style.display = 'block';
        this.editPanelElement.style.opacity = '1';
      } else {
        this.editPanelElement.style.opacity = '0';
        this.editPanelElement.style.display = 'none';
      }
    }
  }

  /**
   * Update input element states
   */
  private updateInputs(): void {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
        input.disabled = !this.isEditMode;
      }
    });
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.isEditMode);
    });
  }

  /**
   * Dispose of controller and cleanup resources
   */
  dispose(): void {
    if (this.editPanel) {
      this.editPanel.dispose();
      this.editPanel = null;
    }
    this.listeners.clear();
  }
}