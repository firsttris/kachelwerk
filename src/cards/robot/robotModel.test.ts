import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { batteryOf, fanSpeedCall, robotCall, viewOfRobot } from './robotModel';

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id,
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// PAUSE, STOP, RETURN_HOME, FAN_SPEED, LOCATE, CLEAN_SPOT, STATE, START
const FULL = 4 | 8 | 16 | 32 | 512 | 1024 | 4096 | 8192;

describe('viewOfRobot', () => {
  it('reads a vacuum with all its features', () => {
    const view = viewOfRobot(
      'vacuum.robo',
      entity('vacuum.robo', 'cleaning', { supported_features: FULL, fan_speed: 'turbo', fan_speed_list: ['quiet', 'turbo'] }),
    );
    expect(view).toMatchObject({
      kind: 'vacuum',
      activity: 'working',
      primary: 'pause',
      canDock: true,
      canLocate: true,
      canSpot: true,
      fan: { value: 'turbo', options: ['quiet', 'turbo'] },
      battery: null,
    });
  });

  it('offers start when not working, stop when it cannot pause', () => {
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'docked', { supported_features: FULL })).primary).toBe('start');
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'paused', { supported_features: FULL })).primary).toBe('start');
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'cleaning', { supported_features: 8 | 8192 })).primary).toBe('stop');
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'cleaning', { supported_features: 8192 })).primary).toBeNull();
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'idle', { supported_features: 4 })).primary).toBeNull();
  });

  it('has no fan speed without the feature or a list', () => {
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'idle', { fan_speed_list: ['a'] })).fan).toBeNull();
    expect(viewOfRobot('vacuum.r', entity('vacuum.r', 'idle', { supported_features: 32 })).fan).toBeNull();
  });

  it('reads a lawn mower', () => {
    const view = viewOfRobot('lawn_mower.m', entity('lawn_mower.m', 'mowing', { supported_features: 1 | 2 | 4 }));
    expect(view).toMatchObject({ kind: 'mower', activity: 'working', primary: 'pause', canDock: true, canLocate: false, canSpot: false, fan: null });
    expect(viewOfRobot('lawn_mower.m', entity('lawn_mower.m', 'error')).activity).toBe('error');
    expect(viewOfRobot('lawn_mower.m', entity('lawn_mower.m', 'cleaning')).activity).toBe('unknown');
    expect(viewOfRobot('lawn_mower.m', undefined).activity).toBe('unknown');
  });
});

describe('batteryOf', () => {
  it('prefers the sensor, else battery_level, clamped', () => {
    const vacuum = entity('vacuum.r', 'docked', { battery_level: 80 });
    expect(batteryOf(vacuum, entity('sensor.b', '42.4'))).toBe(42);
    expect(batteryOf(vacuum, entity('sensor.b', 'unavailable'))).toBe(80);
    expect(batteryOf(vacuum)).toBe(80);
    expect(batteryOf(entity('vacuum.r', 'docked', { battery_level: 130 }))).toBe(100);
    expect(batteryOf(entity('vacuum.r', 'docked'))).toBeNull();
  });
});

describe('robotCall', () => {
  it('maps the actions on each domain', () => {
    expect(robotCall('vacuum', 'start')).toEqual({ domain: 'vacuum', service: 'start' });
    expect(robotCall('vacuum', 'dock')).toEqual({ domain: 'vacuum', service: 'return_to_base' });
    expect(robotCall('vacuum', 'spot')).toEqual({ domain: 'vacuum', service: 'clean_spot' });
    expect(robotCall('mower', 'start')).toEqual({ domain: 'lawn_mower', service: 'start_mowing' });
    expect(robotCall('mower', 'dock')).toEqual({ domain: 'lawn_mower', service: 'dock' });
    expect(robotCall('mower', 'locate')).toBeNull();
  });

  it('sets the fan speed', () => {
    expect(fanSpeedCall('max')).toEqual({ domain: 'vacuum', service: 'set_fan_speed', data: { fan_speed: 'max' } });
  });
});
