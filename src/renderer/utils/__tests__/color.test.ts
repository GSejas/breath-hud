import {
  parseRgbColor,
  rgbToString,
  lightenColor,
  darkenColor,
  blendColors,
  getColorLuminance,
  getContrastColor
} from '../color';

describe('Color Utilities', () => {
  describe('parseRgbColor', () => {
    it('should parse valid RGBA string', () => {
      const color = parseRgbColor('rgba(74, 144, 226, 0.8)');
      expect(color.r).toBe(74);
      expect(color.g).toBe(144);
      expect(color.b).toBe(226);
      expect(color.a).toBe(0.8);
    });

    it('should parse RGB string without alpha', () => {
      const color = parseRgbColor('rgb(255, 128, 0)');
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(0);
      expect(color.a).toBe(1);
    });

    it('should handle invalid input gracefully', () => {
      const color = parseRgbColor('invalid');
      expect(color.r).toBe(255);
      expect(color.g).toBe(255);
      expect(color.b).toBe(255);
      expect(color.a).toBe(1);
    });
  });

  describe('rgbToString', () => {
    it('should convert color object to RGBA string', () => {
      const result = rgbToString({ r: 74, g: 144, b: 226, a: 0.8 });
      expect(result).toBe('rgba(74, 144, 226, 0.8)');
    });

    it('should default alpha to 1', () => {
      const result = rgbToString({ r: 255, g: 128, b: 0 });
      expect(result).toBe('rgba(255, 128, 0, 1)');
    });
  });

  describe('lightenColor', () => {
    it('should lighten a color', () => {
      const original = 'rgba(100, 100, 100, 1)';
      const lightened = lightenColor(original, 20);
      const color = parseRgbColor(lightened);

      expect(color.r).toBeGreaterThan(100);
      expect(color.g).toBeGreaterThan(100);
      expect(color.b).toBeGreaterThan(100);
    });

    it('should not exceed 255', () => {
      const bright = 'rgba(200, 200, 200, 1)';
      const lighter = lightenColor(bright, 50);
      const color = parseRgbColor(lighter);

      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeLessThanOrEqual(255);
    });
  });

  describe('darkenColor', () => {
    it('should darken a color', () => {
      const original = 'rgba(200, 200, 200, 1)';
      const darkened = darkenColor(original, 20);
      const color = parseRgbColor(darkened);

      expect(color.r).toBeLessThan(200);
      expect(color.g).toBeLessThan(200);
      expect(color.b).toBeLessThan(200);
    });

    it('should not go below 0', () => {
      const dark = 'rgba(50, 50, 50, 1)';
      const darker = darkenColor(dark, 50);
      const color = parseRgbColor(darker);

      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeGreaterThanOrEqual(0);
    });
  });

  describe('blendColors', () => {
    it('should blend two colors at 50%', () => {
      const color1 = 'rgba(0, 0, 0, 1)';
      const color2 = 'rgba(100, 100, 100, 1)';
      const blended = blendColors(color1, color2, 0.5);
      const result = parseRgbColor(blended);

      expect(result.r).toBeCloseTo(50, 0);
      expect(result.g).toBeCloseTo(50, 0);
      expect(result.b).toBeCloseTo(50, 0);
    });

    it('should return color1 at factor 0', () => {
      const color1 = 'rgba(100, 100, 100, 1)';
      const color2 = 'rgba(200, 200, 200, 1)';
      const blended = blendColors(color1, color2, 0);
      const result = parseRgbColor(blended);

      expect(result.r).toBeCloseTo(100, 0);
    });

    it('should return color2 at factor 1', () => {
      const color1 = 'rgba(100, 100, 100, 1)';
      const color2 = 'rgba(200, 200, 200, 1)';
      const blended = blendColors(color1, color2, 1);
      const result = parseRgbColor(blended);

      expect(result.r).toBeCloseTo(200, 0);
    });
  });

  describe('getColorLuminance', () => {
    it('should calculate luminance for white', () => {
      const luminance = getColorLuminance('rgba(255, 255, 255, 1)');
      expect(luminance).toBeCloseTo(1, 1);
    });

    it('should calculate luminance for black', () => {
      const luminance = getColorLuminance('rgba(0, 0, 0, 1)');
      expect(luminance).toBeCloseTo(0, 1);
    });

    it('should return value between 0 and 1', () => {
      const luminance = getColorLuminance('rgba(128, 128, 128, 1)');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastColor', () => {
    it('should return dark text for light background', () => {
      const contrast = getContrastColor('rgba(255, 255, 255, 1)');
      expect(contrast).toContain('0, 0, 0');
    });

    it('should return light text for dark background', () => {
      const contrast = getContrastColor('rgba(0, 0, 0, 1)');
      expect(contrast).toContain('255, 255, 255');
    });
  });
});
