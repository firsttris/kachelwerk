import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { isHandle, windowStateOf } from './windowModel';

const entity = (entity_id: string, state: string): HassEntity => ({
  entity_id,
  state,
  attributes: {},
  last_changed: '',
  last_updated: '',
});

describe('windowStateOf', () => {
  it('reads contacts and handles', () => {
    expect(windowStateOf(entity('binary_sensor.fenster', 'on'))).toBe('open');
    expect(windowStateOf(entity('binary_sensor.fenster', 'off'))).toBe('closed');
    expect(windowStateOf(entity('sensor.griff', 'tilted'))).toBe('tilted');
    expect(windowStateOf(entity('sensor.griff', 'open'))).toBe('open');
    expect(windowStateOf(entity('binary_sensor.fenster', 'unavailable'))).toBe('unknown');
    expect(isHandle(entity('sensor.griff', 'closed'))).toBe(true);
    expect(isHandle(entity('binary_sensor.fenster', 'off'))).toBe(false);
  });
});
