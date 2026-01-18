/**
 * State Manager
 * Centralized application state management with event emission
 * Manages: playing status, current pattern, shape, theme, scale, edit mode
 */

export type StateChangeListener = (state: AppState) => void;

export interface AppState {
  isPlaying: boolean;
  currentPattern: any | null;
  currentShape: any | null;
  currentTheme: any | null;
  currentScale: number;
  isEditMode: boolean;
  isPinned: boolean;
  selectedSequence: string | null;
  [key: string]: unknown;
}

export class StateManager {
  private state: AppState = this.getInitialState();
  private listeners: Set<StateChangeListener> = new Set();
  private stateHistory: AppState[] = [];
  private readonly MAX_HISTORY = 50;

  constructor() {
    // Initialize with defaults
    this.state = this.getInitialState();
  }

  /**
   * Subscribe to state changes
   * @param listener Callback fired when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit state change to all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.getState());
    });
  }

  /**
   * Update a single state property
   * @param key Property name
   * @param value New value
   */
  update<K extends keyof AppState>(key: K, value: AppState[K]): void {
    if (this.state[key] === value) return; // No change

    // Save to history before updating
    this.stateHistory.push({ ...this.state });
    if (this.stateHistory.length > this.MAX_HISTORY) {
      this.stateHistory.shift();
    }

    this.state[key] = value;
    this.notifyListeners();
  }

  /**
   * Batch update multiple state properties
   * @param updates Object with property updates
   */
  updateBatch(updates: Partial<AppState>): void {
    let hasChanges = false;

    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key as keyof AppState] !== value) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) return;

    // Save to history
    this.stateHistory.push({ ...this.state });
    if (this.stateHistory.length > this.MAX_HISTORY) {
      this.stateHistory.shift();
    }

    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state (copy)
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Get specific state value
   * @param key Property name
   */
  getValue<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Set playing status
   * @param playing True to play, false to stop
   */
  setPlaying(playing: boolean): void {
    this.update('isPlaying', playing);
  }

  /**
   * Set current pattern
   * @param pattern Breathing pattern or null
   */
  setPattern(pattern: any | null): void {
    this.update('currentPattern', pattern);
  }

  /**
   * Set current shape
   * @param shape Breathing shape or null
   */
  setShape(shape: any | null): void {
    this.update('currentShape', shape);
  }

  /**
   * Set current theme
   * @param theme Theme config or null
   */
  setTheme(theme: any | null): void {
    this.update('currentTheme', theme);
  }

  /**
   * Set scale factor
   * @param scale Scale value (e.g., 1.0, 1.5, 2.0)
   */
  setScale(scale: number): void {
    if (scale < 0.5 || scale > 3) {
      console.warn(`Scale out of bounds: ${scale}`);
      return;
    }
    this.update('currentScale', scale);
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.update('isEditMode', !this.state.isEditMode);
  }

  /**
   * Set edit mode
   * @param editMode True to enable edit mode
   */
  setEditMode(editMode: boolean): void {
    this.update('isEditMode', editMode);
  }

  /**
   * Toggle pinned status
   */
  togglePinned(): void {
    this.update('isPinned', !this.state.isPinned);
  }

  /**
   * Set pinned status
   * @param pinned True to pin window
   */
  setPinned(pinned: boolean): void {
    this.update('isPinned', pinned);
  }

  /**
   * Set selected sequence
   * @param sequenceId Sequence ID or null
   */
  setSelectedSequence(sequenceId: string | null): void {
    this.update('selectedSequence', sequenceId);
  }

  /**
   * Undo to previous state
   */
  undo(): void {
    if (this.stateHistory.length === 0) return;

    const previousState = this.stateHistory.pop();
    if (previousState) {
      this.state = previousState;
      this.notifyListeners();
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.stateHistory = [];
    this.state = this.getInitialState();
    this.notifyListeners();
  }

  /**
   * Get state history
   */
  getHistory(): AppState[] {
    return [...this.stateHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.stateHistory = [];
  }

  /**
   * Get initial state
   */
  private getInitialState(): AppState {
    return {
      isPlaying: false,
      currentPattern: null,
      currentShape: null,
      currentTheme: null,
      currentScale: 1,
      isEditMode: false,
      isPinned: false,
      selectedSequence: null
    };
  }
}
