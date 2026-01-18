import { BreathingSequenceManager } from '../sequence-manager';
import { BreathingSequence, BreathingPattern } from '../../../shared/meditation-types';

describe('BreathingSequenceManager', () => {
  let manager: BreathingSequenceManager;
  let mockOnPatternChange: jest.Mock;

  const mockSequence: BreathingSequence = {
    id: 'test-sequence',
    name: 'Test Sequence',
    description: 'A sequence for testing',
    steps: [
      {
        pattern: {
          id: 'test-pattern-1',
          name: 'Test Pattern 1',
          type: 'custom',
          description: 'First test pattern',
          duration: 8,
          phases: [
            { name: 'inhale', duration: 4, intensity: 0.8 },
            { name: 'exhale', duration: 4, intensity: 0.3 }
          ]
        },
        repetitions: 2,
        description: 'First step'
      },
      {
        pattern: {
          id: 'test-pattern-2',
          name: 'Test Pattern 2',
          type: 'custom',
          description: 'Second test pattern',
          duration: 6,
          phases: [
            { name: 'inhale', duration: 3, intensity: 0.6 },
            { name: 'exhale', duration: 3, intensity: 0.2 }
          ]
        },
        repetitions: 1,
        description: 'Second step'
      }
    ],
    totalDuration: 22, // (2 * 8) + (1 * 6)
    loop: false
  };

  beforeEach(() => {
    manager = new BreathingSequenceManager();
    mockOnPatternChange = jest.fn();
    manager.onPatternChangeCallback(mockOnPatternChange);
  });

  describe('initialization', () => {
    it('should initialize with a default sequence', () => {
      const sequences = manager.getAvailableSequences();
      expect(sequences.length).toBeGreaterThan(0);
      expect(manager.getCurrentSequence()).toBeTruthy();
    });

    it('should not be active initially', () => {
      expect(manager.isActive()).toBe(false);
    });
  });

  describe('setSequence', () => {
    it('should set a new sequence and reset state', () => {
      manager.setSequence(mockSequence);
      
      expect(manager.getCurrentSequence()).toBe(mockSequence);
      expect(manager.getCurrentStepIndex()).toBe(0);
      expect(manager.getCurrentRepetition()).toBe(0);
    });
  });

  describe('startSequence', () => {
    beforeEach(() => {
      manager.setSequence(mockSequence);
    });

    it('should start the sequence and become active', () => {
      manager.startSequence();
      
      expect(manager.isActive()).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(0);
      expect(manager.getCurrentRepetition()).toBe(0);
    });

    it('should notify pattern change for first step', () => {
      manager.startSequence();
      
      expect(mockOnPatternChange).toHaveBeenCalledWith(
        mockSequence.steps[0].pattern,
        expect.stringContaining('Step 1/2')
      );
    });

    it('should handle starting with no sequence gracefully', () => {
      manager.setSequence = jest.fn(); // Mock to avoid setting a sequence
      const managerWithoutSequence = new BreathingSequenceManager();
      (managerWithoutSequence as any).currentSequence = null;
      
      expect(() => managerWithoutSequence.startSequence()).not.toThrow();
      expect(managerWithoutSequence.isActive()).toBe(false);
    });
  });

  describe('stopSequence', () => {
    it('should stop the sequence and become inactive', () => {
      manager.setSequence(mockSequence);
      manager.startSequence();
      
      expect(manager.isActive()).toBe(true);
      
      manager.stopSequence();
      
      expect(manager.isActive()).toBe(false);
    });
  });

  describe('onBreathingCycleComplete', () => {
    beforeEach(() => {
      manager.setSequence(mockSequence);
      manager.startSequence();
      mockOnPatternChange.mockClear(); // Clear initial call
    });

    it('should increment repetition count', () => {
      expect(manager.getCurrentRepetition()).toBe(0);
      
      manager.onBreathingCycleComplete();
      
      expect(manager.getCurrentRepetition()).toBe(1);
    });

    it('should advance to next step when repetitions complete', () => {
      // Complete first repetition
      manager.onBreathingCycleComplete();
      expect(manager.getCurrentStepIndex()).toBe(0);
      expect(manager.getCurrentRepetition()).toBe(1);
      
      // Complete second repetition (should advance to next step)
      manager.onBreathingCycleComplete();
      expect(manager.getCurrentStepIndex()).toBe(1);
      expect(manager.getCurrentRepetition()).toBe(0);
      
      // Should notify pattern change
      expect(mockOnPatternChange).toHaveBeenCalledWith(
        mockSequence.steps[1].pattern,
        expect.stringContaining('Step 2/2')
      );
    });

    it('should complete sequence when all steps finished', () => {
      // Complete step 1 (2 repetitions)
      manager.onBreathingCycleComplete(); // rep 1
      manager.onBreathingCycleComplete(); // rep 2, advance to step 2
      
      // Complete step 2 (1 repetition)
      manager.onBreathingCycleComplete(); // rep 1, sequence should end
      
      expect(manager.isActive()).toBe(false);
    });

    it('should restart sequence if loop is enabled', () => {
      const loopingSequence = { ...mockSequence, loop: true };
      manager.setSequence(loopingSequence);
      manager.startSequence();
      mockOnPatternChange.mockClear();
      
      // Complete all steps
      manager.onBreathingCycleComplete(); // step 1, rep 1
      manager.onBreathingCycleComplete(); // step 1, rep 2 -> advance to step 2
      manager.onBreathingCycleComplete(); // step 2, rep 1 -> restart sequence
      
      expect(manager.isActive()).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(0);
      expect(manager.getCurrentRepetition()).toBe(0);
    });

    it('should not do anything when sequence is inactive', () => {
      manager.stopSequence();
      const initialRep = manager.getCurrentRepetition();
      
      manager.onBreathingCycleComplete();
      
      expect(manager.getCurrentRepetition()).toBe(initialRep);
    });
  });

  describe('getCurrentPattern', () => {
    it('should return current pattern when active', () => {
      manager.setSequence(mockSequence);
      manager.startSequence();
      
      const pattern = manager.getCurrentPattern();
      expect(pattern).toBe(mockSequence.steps[0].pattern);
    });

    it('should return null when inactive', () => {
      manager.setSequence(mockSequence);
      
      const pattern = manager.getCurrentPattern();
      expect(pattern).toBeNull();
    });
  });

  describe('getSequenceInfo', () => {
    it('should return sequence info when active', () => {
      manager.setSequence(mockSequence);
      manager.startSequence();
      
      const info = manager.getSequenceInfo();
      expect(info).toContain('Step 1/2');
      expect(info).toContain('First step');
      expect(info).toContain('(0/2)');
    });

    it('should return stopped status when inactive', () => {
      manager.setSequence(mockSequence);
      
      const info = manager.getSequenceInfo();
      expect(info).toContain('Test Sequence (stopped)');
    });

    it('should handle no sequence gracefully', () => {
      const managerWithoutSequence = new BreathingSequenceManager();
      (managerWithoutSequence as any).currentSequence = null;
      
      const info = managerWithoutSequence.getSequenceInfo();
      expect(info).toBe('No sequence');
    });
  });

  describe('getAvailableSequences', () => {
    it('should return array of sequences', () => {
      const sequences = manager.getAvailableSequences();
      expect(Array.isArray(sequences)).toBe(true);
      expect(sequences.length).toBeGreaterThan(0);
    });
  });

  describe('pattern change callback', () => {
    it('should notify when pattern changes during step transitions', () => {
      manager.setSequence(mockSequence);
      manager.startSequence();
      mockOnPatternChange.mockClear();
      
      // Complete step 1 to trigger transition
      manager.onBreathingCycleComplete(); // rep 1
      manager.onBreathingCycleComplete(); // rep 2, advance to step 2
      
      expect(mockOnPatternChange).toHaveBeenCalledWith(
        mockSequence.steps[1].pattern,
        expect.stringContaining('Step 2/2')
      );
    });

    it('should handle missing callback gracefully', () => {
      const managerWithoutCallback = new BreathingSequenceManager();
      managerWithoutCallback.setSequence(mockSequence);
      
      expect(() => managerWithoutCallback.startSequence()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle sequence with zero repetitions', () => {
      const zeroRepSequence: BreathingSequence = {
        ...mockSequence,
        steps: [{
          ...mockSequence.steps[0],
          repetitions: 0
        }]
      };
      
      manager.setSequence(zeroRepSequence);
      manager.startSequence();
      
      // Should start normally - zero reps are handled during cycle completion
      expect(manager.isActive()).toBe(true);
      
      // When completing a cycle with 0 reps, should advance immediately
      manager.onBreathingCycleComplete();
      expect(manager.isActive()).toBe(false); // Should stop after advancing
    });

    it('should handle sequence with single step', () => {
      const singleStepSequence: BreathingSequence = {
        ...mockSequence,
        steps: [mockSequence.steps[0]]
      };
      
      manager.setSequence(singleStepSequence);
      manager.startSequence();
      
      // Complete the single step
      manager.onBreathingCycleComplete(); // rep 1
      manager.onBreathingCycleComplete(); // rep 2, sequence should end
      
      expect(manager.isActive()).toBe(false);
    });
  });
});