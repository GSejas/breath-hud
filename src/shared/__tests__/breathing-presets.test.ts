import { BREATHING_SHAPES, BREATHING_PATTERNS, VISUAL_THEMES } from '../breathing-presets';
import { BreathingShape, BreathingPattern, ThemeConfig } from '../meditation-types';

describe('Breathing Presets', () => {
  describe('BREATHING_SHAPES', () => {
    it('should have at least one shape', () => {
      expect(BREATHING_SHAPES.length).toBeGreaterThan(0);
    });

    it('should have valid shape properties', () => {
      BREATHING_SHAPES.forEach((shape: BreathingShape) => {
        expect(shape).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String)
        });
        
        expect(shape.id).toBeTruthy();
        expect(shape.name).toBeTruthy();
        expect(shape.type).toBeTruthy();
      });
    });

    it('should have unique shape IDs', () => {
      const ids = BREATHING_SHAPES.map(shape => shape.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include basic shapes', () => {
      const shapeTypes = BREATHING_SHAPES.map(shape => shape.type);
      expect(shapeTypes).toContain('circle');
    });

    it('should have SVG paths for non-circle shapes', () => {
      BREATHING_SHAPES.forEach(shape => {
        if (shape.type !== 'circle') {
          expect(shape.svgPath).toBeDefined();
          expect(typeof shape.svgPath).toBe('string');
          expect(shape.svgPath!.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('BREATHING_PATTERNS', () => {
    it('should have at least one pattern', () => {
      expect(BREATHING_PATTERNS.length).toBeGreaterThan(0);
    });

    it('should have valid pattern properties', () => {
      BREATHING_PATTERNS.forEach((pattern: BreathingPattern) => {
        expect(pattern).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          duration: expect.any(Number),
          phases: expect.any(Array)
        });

        expect(pattern.id).toBeTruthy();
        expect(pattern.name).toBeTruthy();
        expect(pattern.description).toBeTruthy();
        expect(pattern.duration).toBeGreaterThan(0);
        expect(pattern.phases.length).toBeGreaterThan(0);
      });
    });

    it('should have unique pattern IDs', () => {
      const ids = BREATHING_PATTERNS.map(pattern => pattern.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid phases', () => {
      BREATHING_PATTERNS.forEach(pattern => {
        let totalDuration = 0;
        
        pattern.phases.forEach(phase => {
          expect(phase).toMatchObject({
            name: expect.any(String),
            duration: expect.any(Number),
            intensity: expect.any(Number)
          });

          expect(phase.name).toBeTruthy();
          expect(phase.duration).toBeGreaterThan(0);
          expect(phase.intensity).toBeGreaterThanOrEqual(0);
          expect(phase.intensity).toBeLessThanOrEqual(1);
          
          totalDuration += phase.duration;
        });

        // Total phase durations should match pattern duration
        expect(totalDuration).toBe(pattern.duration);
      });
    });

    it('should include standard breathing patterns', () => {
      const patternIds = BREATHING_PATTERNS.map(p => p.id);
      expect(patternIds).toContain('zen-simple');
      expect(patternIds).toContain('box-breathing');
    });

    it('should have recognizable phase names', () => {
      const validPhaseNames = ['inhale', 'exhale', 'hold', 'pause'];
      
      BREATHING_PATTERNS.forEach(pattern => {
        pattern.phases.forEach(phase => {
          expect(validPhaseNames).toContain(phase.name);
        });
      });
    });
  });

  describe('VISUAL_THEMES', () => {
    it('should have at least one theme', () => {
      expect(VISUAL_THEMES.length).toBeGreaterThan(0);
    });

    it('should have valid theme properties', () => {
      VISUAL_THEMES.forEach((theme: ThemeConfig) => {
        expect(theme).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          colors: expect.objectContaining({
            primary: expect.any(String),
            secondary: expect.any(String),
            background: expect.any(String),
            accent: expect.any(String)
          }),
          effects: expect.objectContaining({
            glow: expect.any(Boolean),
            pulse: expect.any(Boolean),
            gradient: expect.any(Boolean)
          })
        });

        expect(theme.id).toBeTruthy();
        expect(theme.name).toBeTruthy();
      });
    });

    it('should have unique theme IDs', () => {
      const ids = VISUAL_THEMES.map(theme => theme.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid CSS color values', () => {
      const colorRegex = /^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$|^#[0-9a-fA-F]{3,6}$/;
      
      VISUAL_THEMES.forEach(theme => {
        expect(theme.colors.primary).toMatch(colorRegex);
        expect(theme.colors.secondary).toMatch(colorRegex);
        expect(theme.colors.background).toMatch(colorRegex);
        expect(theme.colors.accent).toMatch(colorRegex);
      });
    });

    it('should include basic themes', () => {
      const themeIds = VISUAL_THEMES.map(t => t.id);
      expect(themeIds).toContain('ocean');
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent naming conventions', () => {
      // All IDs should be kebab-case
      const kebabCaseRegex = /^[a-z][a-z0-9-]*$/;
      
      BREATHING_SHAPES.forEach(shape => {
        expect(shape.id).toMatch(kebabCaseRegex);
      });
      
      BREATHING_PATTERNS.forEach(pattern => {
        expect(pattern.id).toMatch(kebabCaseRegex);
      });
      
      VISUAL_THEMES.forEach(theme => {
        expect(theme.id).toMatch(kebabCaseRegex);
      });
    });

    it('should have reasonable durations', () => {
      BREATHING_PATTERNS.forEach(pattern => {
        // Breathing patterns should be between 4 and 60 seconds
        expect(pattern.duration).toBeGreaterThanOrEqual(4);
        expect(pattern.duration).toBeLessThanOrEqual(60);
        
        pattern.phases.forEach(phase => {
          // Individual phases should be between 1 and 20 seconds
          expect(phase.duration).toBeGreaterThanOrEqual(1);
          expect(phase.duration).toBeLessThanOrEqual(20);
        });
      });
    });
  });
});