import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { detectorKindOf, isUnreachable, lastMotionOf } from './detectorModel';

const entity = (entity_id: string, state: string, device_class?: string, last_changed = ''): HassEntity => ({
  entity_id,
  state,
  attributes: { device_class },
  last_changed,
  last_updated: '',
});

describe('detectorKindOf', () => {
  it('picks the tile by the device class', () => {
    expect(detectorKindOf(entity('binary_sensor.a', 'off', 'smoke'))).toBe('smoke');
    expect(detectorKindOf(entity('binary_sensor.a', 'off', 'occupancy'))).toBe('presence');
    expect(detectorKindOf(entity('binary_sensor.a', 'off', 'moisture'))).toBe('water');
    expect(detectorKindOf(entity('binary_sensor.a', 'off', 'motion'))).toBe('motion');
    expect(detectorKindOf(entity('siren.a', 'off'))).toBe('siren');
    expect(detectorKindOf(entity('binary_sensor.a', 'off'), 'water')).toBe('water');
    expect(detectorKindOf(entity('binary_sensor.a', 'on', 'power'))).toBe('power');
    expect(detectorKindOf(entity('binary_sensor.a', 'on', 'moisture'), 'rain')).toBe('rain');
  });
});

describe('lastMotionOf', () => {
  it('is the moment the sensor went quiet', () => {
    expect(lastMotionOf(entity('binary_sensor.a', 'off', 'motion', '2026-10-14T12:00:00Z'))).toBe(
      Date.parse('2026-10-14T12:00:00Z'),
    );
    expect(lastMotionOf(entity('binary_sensor.a', 'on', 'motion', '2026-10-14T12:00:00Z'))).toBeNull();
  });
});

describe('isUnreachable', () => {
  it('is only an unavailable or missing entity, not an unknown state', () => {
    expect(isUnreachable(entity('binary_sensor.a', 'unavailable', 'smoke'))).toBe(true);
    expect(isUnreachable(undefined)).toBe(true);
    expect(isUnreachable(entity('binary_sensor.a', 'unknown', 'smoke'))).toBe(false);
    expect(isUnreachable(entity('binary_sensor.a', 'off', 'smoke'))).toBe(false);
  });
});
