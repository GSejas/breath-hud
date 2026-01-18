/**
 * Color parsing and manipulation utilities
 */

/**
 * Parse RGBA string to color object
 */
export function parseRgbColor(
  rgbString: string
): { r: number; g: number; b: number; a: number } {
  const match = rgbString.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
  );

  if (!match) {
    console.warn(`Could not parse color: ${rgbString}, returning default white`);
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1
  };
}

/**
 * Convert color object to RGBA string
 */
export function rgbToString(
  color: { r: number; g: number; b: number; a?: number }
): string {
  const a = color.a !== undefined ? color.a : 1;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${a})`;
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(rgbString: string, percent: number): string {
  const color = parseRgbColor(rgbString);
  const factor = 1 + percent / 100;

  return rgbToString({
    r: Math.min(255, Math.round(color.r * factor)),
    g: Math.min(255, Math.round(color.g * factor)),
    b: Math.min(255, Math.round(color.b * factor)),
    a: color.a
  });
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(rgbString: string, percent: number): string {
  const color = parseRgbColor(rgbString);
  const factor = 1 - percent / 100;

  return rgbToString({
    r: Math.round(color.r * factor),
    g: Math.round(color.g * factor),
    b: Math.round(color.b * factor),
    a: color.a
  });
}

/**
 * Blend two colors together
 */
export function blendColors(
  color1: string,
  color2: string,
  blendFactor: number
): string {
  const c1 = parseRgbColor(color1);
  const c2 = parseRgbColor(color2);

  return rgbToString({
    r: Math.round(c1.r + (c2.r - c1.r) * blendFactor),
    g: Math.round(c1.g + (c2.g - c1.g) * blendFactor),
    b: Math.round(c1.b + (c2.b - c1.b) * blendFactor),
    a: c1.a + (c2.a - c1.a) * blendFactor
  });
}

/**
 * Get luminance of a color (for contrast calculation)
 */
export function getColorLuminance(rgbString: string): number {
  const color = parseRgbColor(rgbString);
  // Standard relative luminance formula
  const [r, g, b] = [color.r, color.g, color.b].map(value => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determine if text should be light or dark based on background color
 */
export function getContrastColor(backgroundRgb: string): string {
  const luminance = getColorLuminance(backgroundRgb);
  return luminance > 0.5
    ? 'rgba(0, 0, 0, 1)'
    : 'rgba(255, 255, 255, 1)';
}
