import { describe, expect, it } from 'vitest';
import { co2Rating, pmRating, soilRating } from './Measure';

// From MUI's SensorControls.test
describe('ratings', () => {
  it('rates CO₂ as the German Environment Agency', () => {
    expect(co2Rating(650)).toBe('good');
    expect(co2Rating(1000)).toBe('poor');
    expect(co2Rating(2000)).toBe('poor');
    expect(co2Rating(2400)).toBe('bad');
  });

  it('rates PM2.5 by the European Air Quality Index', () => {
    expect(pmRating(4)).toBe('PM_GOOD');
    expect(pmRating(18)).toBe('PM_FAIR');
    expect(pmRating(24)).toBe('PM_MODERATE');
    expect(pmRating(40)).toBe('PM_POOR');
    expect(pmRating(70)).toBe('PM_VERY_POOR');
    expect(pmRating(120)).toBe('PM_EXTREMELY_POOR');
  });

  it('rates soil moisture', () => {
    expect(soilRating(12)).toBe('SOIL_DRY');
    expect(soilRating(45)).toBe('SOIL_MOIST');
    expect(soilRating(85)).toBe('SOIL_WET');
  });
});
