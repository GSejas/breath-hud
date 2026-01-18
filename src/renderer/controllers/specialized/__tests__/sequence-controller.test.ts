import { SequenceController } from '../sequence-controller';

describe('SequenceController', () => {
  let controller: SequenceController;

  beforeEach(() => {
    controller = new SequenceController();
  });

  describe('initialization', () => {
    it('should have default sequences', () => {
      const sequences = controller.getAllSequences();
      expect(sequences.length).toBeGreaterThan(0);
    });

    it('should have morning sequence', () => {
      const sequence = controller.getSequence('morning');
      expect(sequence?.name).toBeTruthy();
    });
  });

  describe('sequence selection', () => {
    it('should select sequence', () => {
      controller.selectSequence('morning');
      expect(controller.getCurrentSequenceId()).toBe('morning');
    });

    it('should get current sequence', () => {
      controller.selectSequence('morning');
      const sequence = controller.getCurrentSequence();
      expect(sequence?.id).toBe('morning');
    });
  });

  describe('step navigation', () => {
    beforeEach(() => {
      controller.selectSequence('morning');
    });

    it('should start at step 0', () => {
      expect(controller.getCurrentStepIndex()).toBe(0);
    });

    it('should get current step', () => {
      const step = controller.getCurrentStep();
      expect(step).toBeDefined();
    });

    it('should move to next step', () => {
      const hasNext = controller.nextStep();
      expect(hasNext).toBe(true);
    });
  });

  describe('custom sequences', () => {
    it('should register custom sequence', () => {
      controller.registerSequence({
        id: 'custom',
        name: 'Custom Sequence',
        steps: [{ pattern: 'zen', duration: 5, repetitions: 1 }],
        loop: false
      });

      const sequence = controller.getSequence('custom');
      expect(sequence?.name).toBe('Custom Sequence');
    });
  });

  describe('listeners', () => {
    it('should notify listener on sequence selection', () => {
      const listener = jest.fn();
      controller.subscribe(listener);

      controller.selectSequence('morning');

      expect(listener).toHaveBeenCalledWith('morning');
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = controller.subscribe(listener);

      controller.selectSequence('morning');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      controller.selectSequence('evening');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      controller.selectSequence('morning');
      controller.reset();
      expect(controller.getCurrentSequenceId()).toBeNull();
    });
  });
});
