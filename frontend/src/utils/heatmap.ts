/**
 * Normalizes a Q-value to a 0-1 range based on the min/max values in the grid.
 * If all values are identical (range is 0), it returns 0.
 */
export function normalizeValue(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return 0;
  return (value - min) / range;
}

/**
 * Maps a normalized value (0-1) to an RGB color.
 * Scale: Dark Blue (cold) -> Blue -> Green -> Yellow -> Red (hot)
 */
export function interpolateColor(normalized: number): { r: number; g: number; b: number } {
  let r, g, b;
  
  if (normalized <= 0) {
    // Minimum/Neutral: Dark Blue
    return { r: 10, g: 10, b: 62 };
  }
  
  if (normalized < 0.25) {
    // Dark Blue to Blue
    const t = normalized / 0.25;
    r = Math.round(10 + (20 - 10) * t);
    g = Math.round(10 + (61 - 10) * t);
    b = Math.round(62 + (165 - 62) * t);
  } else if (normalized < 0.5) {
    // Blue to Green
    const t = (normalized - 0.25) / 0.25;
    r = Math.round(20 + (65 - 20) * t);
    g = Math.round(61 + (181 - 61) * t);
    b = Math.round(165 + (73 - 165) * t);
  } else if (normalized < 0.75) {
    // Green to Yellow
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(65 + (251 - 65) * t);
    g = Math.round(181 + (191 - 181) * t);
    b = Math.round(73 + (36 - 73) * t);
  } else if (normalized < 1.0) {
    // Yellow to Red
    const t = (normalized - 0.75) / 0.25;
    r = Math.round(251 + (248 - 251) * t);
    g = Math.round(191 + (113 - 191) * t);
    b = Math.round(36 + (113 - 36) * t);
  } else {
    // Maximum: Bright Red
    return { r: 248, g: 113, b: 113 };
  }

  return { r, g, b };
}

/**
 * Returns the CSS rgb string for a given value and range.
 */
export function getHeatmapColor(value: number, min: number, max: number): string {
  const norm = normalizeValue(value, min, max);
  const { r, g, b } = interpolateColor(norm);
  return `rgb(${r}, ${g}, ${b})`;
}
