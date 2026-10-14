import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { valveOf } from './floorModel';

const number = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'number.fbh_level',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

describe('valveOf', () => {
  it('reads percent and fractions', () => {
    expect(valveOf(number('35', { unit_of_measurement: '%' }))).toBe(35);
    expect(valveOf(number('0.35', { max: 1 }))).toBe(35);
    expect(valveOf(number('0', { unit_of_measurement: '%' }))).toBe(0);
    expect(valveOf(number('unavailable'))).toBe(0);
  });
});
