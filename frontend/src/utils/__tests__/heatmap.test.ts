import { describe, it, expect } from 'vitest';
import { normalizeValue, interpolateColor } from '../heatmap';

describe('heatmap utility', () => {
  describe('normalizeValue', () => {
    it('should return 0 when range is 0 (all values same)', () => {
      expect(normalizeValue(0, 0, 0)).toBe(0);
      expect(normalizeValue(10, 10, 10)).toBe(0);
    });

    it('should normalize correctly within range', () => {
      expect(normalizeValue(5, 0, 10)).toBe(0.5);
      expect(normalizeValue(0, 0, 10)).toBe(0);
      expect(normalizeValue(10, 0, 10)).toBe(1);
    });
  });

  describe('interpolateColor', () => {
    it('should return dark blue for normalized <= 0', () => {
      const color = interpolateColor(0);
      expect(color).toEqual({ r: 10, g: 10, b: 62 });
    });

    it('should return bright red for normalized >= 1', () => {
      const color = interpolateColor(1);
      expect(color).toEqual({ r: 248, g: 113, b: 113 });
    });

    it('should return a mid-range color for 0.5', () => {
      const color = interpolateColor(0.5);
      // Based on our logic: normalized < 0.5 is Blue to Green, 
      // but normalized < 0.75 is Green to Yellow.
      // 0.5 hits the normalized < 0.75 block.
      // t = (0.5 - 0.5) / 0.25 = 0
      // r = 65, g = 181, b = 73
      expect(color).toEqual({ r: 65, g: 181, b: 73 });
    });
  });
});
