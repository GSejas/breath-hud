/**
 * Sequence Controller
 * Manages breathing sequences and step navigation
 */

import type { StateManager } from '../../services';

export interface SequenceStep {
  pattern: string;
  duration: number;
  repetitions: number;
}

export interface Sequence {
  id: string;
  name: string;
  steps: SequenceStep[];
  loop: boolean;
}

export type SequenceListener = (sequenceId: string) => void;

export class SequenceController {
  private sequences: Map<string, Sequence> = new Map();
  private currentSequenceId: string | null = null;
  private currentStepIndex: number = 0;
  private listeners: Set<SequenceListener> = new Set();
  private stateManager: StateManager | null = null;

  constructor() {
    this.initializeDefaultSequences();
  }

  /**
   * Set state manager for updates
   */
  setStateManager(manager: StateManager): void {
    this.stateManager = manager;
  }

  /**
   * Register a new sequence
   */
  registerSequence(sequence: Sequence): void {
    this.sequences.set(sequence.id, sequence);
  }

  /**
   * Select a sequence by ID
   */
  selectSequence(id: string): void {
    if (!this.sequences.has(id)) {
      console.warn(`Sequence "${id}" not found`);
      return;
    }

    this.currentSequenceId = id;
    this.currentStepIndex = 0;
    this.notifyListeners();

    if (this.stateManager) {
      this.stateManager.update('selectedSequence', id);
    }
  }

  /**
   * Get current sequence
   */
  getCurrentSequence(): Sequence | null {
    if (!this.currentSequenceId) return null;
    return this.sequences.get(this.currentSequenceId) || null;
  }

  /**
   * Get current step
   */
  getCurrentStep(): SequenceStep | null {
    const sequence = this.getCurrentSequence();
    if (!sequence || this.currentStepIndex >= sequence.steps.length) {
      return null;
    }
    return sequence.steps[this.currentStepIndex];
  }

  /**
   * Move to next step
   */
  nextStep(): boolean {
    const sequence = this.getCurrentSequence();
    if (!sequence) return false;

    this.currentStepIndex++;

    if (this.currentStepIndex >= sequence.steps.length) {
      if (sequence.loop) {
        this.currentStepIndex = 0;
        return true;
      } else {
        this.currentStepIndex = sequence.steps.length - 1;
        return false;
      }
    }

    return true;
  }

  /**
   * Get all sequences
   */
  getAllSequences(): Sequence[] {
    return Array.from(this.sequences.values());
  }

  /**
   * Get sequence by ID
   */
  getSequence(id: string): Sequence | null {
    return this.sequences.get(id) || null;
  }

  /**
   * Subscribe to sequence changes
   */
  subscribe(listener: SequenceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current sequence ID
   */
  getCurrentSequenceId(): string | null {
    return this.currentSequenceId;
  }

  /**
   * Get current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentSequenceId = null;
    this.currentStepIndex = 0;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    if (this.currentSequenceId) {
      this.listeners.forEach((listener) => {
        listener(this.currentSequenceId!);
      });
    }
  }

  /**
   * Initialize default sequences
   */
  private initializeDefaultSequences(): void {
    const morning: Sequence = {
      id: 'morning',
      name: 'Morning Routine',
      steps: [
        { pattern: 'zen', duration: 5, repetitions: 1 },
        { pattern: 'coherent', duration: 10, repetitions: 1 }
      ],
      loop: false
    };

    const evening: Sequence = {
      id: 'evening',
      name: 'Evening Wind Down',
      steps: [
        { pattern: 'deep', duration: 8, repetitions: 1 },
        { pattern: 'zen', duration: 5, repetitions: 1 }
      ],
      loop: false
    };

    const quick: Sequence = {
      id: 'quick',
      name: 'Quick Session',
      steps: [
        { pattern: 'box', duration: 3, repetitions: 1 }
      ],
      loop: true
    };

    this.sequences.set('morning', morning);
    this.sequences.set('evening', evening);
    this.sequences.set('quick', quick);
  }
}