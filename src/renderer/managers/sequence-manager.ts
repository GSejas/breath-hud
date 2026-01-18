import { BreathingSequence, BreathingPattern } from '../../shared/meditation-types';
import { BREATHING_SEQUENCES } from '../../shared/breathing-presets';

export class BreathingSequenceManager {
  private currentSequence: BreathingSequence | null = null;
  private currentStepIndex = 0;
  private currentRepetition = 0;
  private isSequenceActive = false;
  private onPatternChange?: (pattern: BreathingPattern, stepInfo: string) => void;
  
  constructor() {
    // Initialize with default sequence
    this.setSequence(BREATHING_SEQUENCES[0]);
  }
  
  public setSequence(sequence: BreathingSequence): void {
    this.currentSequence = sequence;
    this.currentStepIndex = 0;
    this.currentRepetition = 0;
    console.log(`Sequence set: ${sequence.name}`);
  }
  
  public startSequence(): void {
    if (!this.currentSequence) return;
    
    this.isSequenceActive = true;
    this.currentStepIndex = 0;
    this.currentRepetition = 0;
    
    const firstStep = this.currentSequence.steps[0];
    this.notifyPatternChange(firstStep.pattern, this.getStepInfo());
    
    console.log(`Sequence started: ${this.currentSequence.name}`);
  }
  
  public stopSequence(): void {
    this.isSequenceActive = false;
    console.log('Sequence stopped');
  }
  
  public onBreathingCycleComplete(): void {
    if (!this.isSequenceActive || !this.currentSequence) return;
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    this.currentRepetition++;
    
    console.log(`Completed rep ${this.currentRepetition}/${currentStep.repetitions} of ${currentStep.pattern.name}`);
    
    // Check if current step is complete
    if (this.currentRepetition >= currentStep.repetitions) {
      this.advanceToNextStep();
    }
  }
  
  private advanceToNextStep(): void {
    if (!this.currentSequence) return;
    
    this.currentStepIndex++;
    this.currentRepetition = 0;
    
    // Check if sequence is complete
    if (this.currentStepIndex >= this.currentSequence.steps.length) {
      if (this.currentSequence.loop) {
        // Restart sequence
        this.currentStepIndex = 0;
        console.log(`Sequence loop: restarting ${this.currentSequence.name}`);
      } else {
        // End sequence
        this.stopSequence();
        return;
      }
    }
    
    const nextStep = this.currentSequence.steps[this.currentStepIndex];
    this.notifyPatternChange(nextStep.pattern, this.getStepInfo());
    
    console.log(`Advanced to step: ${nextStep.description}`);
  }
  
  private getStepInfo(): string {
    if (!this.currentSequence) return '';
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    const stepNumber = this.currentStepIndex + 1;
    const totalSteps = this.currentSequence.steps.length;
    
    return `Step ${stepNumber}/${totalSteps}: ${currentStep.description} (${this.currentRepetition}/${currentStep.repetitions})`;
  }
  
  public getCurrentPattern(): BreathingPattern | null {
    if (!this.isSequenceActive || !this.currentSequence) return null;
    
    const currentStep = this.currentSequence.steps[this.currentStepIndex];
    return currentStep.pattern;
  }
  
  public getSequenceInfo(): string {
    if (!this.currentSequence) return 'No sequence';
    
    if (!this.isSequenceActive) {
      return `${this.currentSequence.name} (stopped)`;
    }
    
    return this.getStepInfo();
  }
  
  public onPatternChangeCallback(callback: (pattern: BreathingPattern, stepInfo: string) => void): void {
    this.onPatternChange = callback;
  }
  
  private notifyPatternChange(pattern: BreathingPattern, stepInfo: string): void {
    if (this.onPatternChange) {
      this.onPatternChange(pattern, stepInfo);
    }
  }
  
  public getAvailableSequences(): BreathingSequence[] {
    return BREATHING_SEQUENCES;
  }
  
  public isActive(): boolean {
    return this.isSequenceActive;
  }
  
  // Additional methods for better testability
  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
  
  public getCurrentRepetition(): number {
    return this.currentRepetition;
  }
  
  public getCurrentSequence(): BreathingSequence | null {
    return this.currentSequence;
  }
}