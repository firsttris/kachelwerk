import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { HUMIDIFIER_FEATURE, humidityCall, limitsOf, modeCall, powerCall, viewOfHumidifier } from './humidifierModel';

const humidifier = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'humidifier.bad',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

const mist = {
  device_class: 'humidifier',
  humidity: 50,
  current_humidity: 38,
  min_humidity: 30,
  max_humidity: 80,
  action: 'humidifying',
  mode: 'normal',
  available_modes: ['normal', 'eco', 'sleep', 'baby'],
  supported_features: HUMIDIFIER_FEATURE.MODES,
};

describe('viewOfHumidifier', () => {
  it('reads a humidifier at work: target, actual, limits, modes', () => {
    expect(viewOfHumidifier(humidifier('on', mist))).toEqual({
      on: true,
      kind: 'humidifier',
      action: 'humidifying',
      working: true,
      tone: 'humidify',
      target: 50,
      current: 38,
      limits: { min: 30, max: 80, step: 1 },
      mode: { value: 'normal', options: ['normal', 'eco', 'sleep', 'baby'] },
    });
  });

  it('reads a dehumidifier drying, and idle', () => {
    const dry = { device_class: 'dehumidifier', humidity: 55, current_humidity: 68, action: 'drying' };
    expect(viewOfHumidifier(humidifier('on', dry))).toMatchObject({ kind: 'dehumidifier', tone: 'dry', working: true });
    expect(viewOfHumidifier(humidifier('on', { ...dry, action: 'idle' }))).toMatchObject({ tone: 'idle', working: false });
  });

  it('is off while off, whatever the action says', () => {
    expect(viewOfHumidifier(humidifier('off', mist))).toMatchObject({ on: false, action: 'off', tone: 'off', working: false });
  });

  it('works by its device class without an action', () => {
    expect(viewOfHumidifier(humidifier('on', { humidity: 50 }))).toMatchObject({ action: null, tone: 'humidify' });
    expect(viewOfHumidifier(humidifier('on', { device_class: 'dehumidifier' }))).toMatchObject({ tone: 'dry' });
    expect(viewOfHumidifier(humidifier('off', { humidity: 50 })).action).toBeNull();
  });

  it('offers modes only with the MODES feature', () => {
    expect(viewOfHumidifier(humidifier('on', { ...mist, supported_features: 0 })).mode).toBeNull();
  });
});

describe('limitsOf', () => {
  it("takes HA's defaults, 0–100 in whole percents", () => {
    expect(limitsOf(humidifier('on'))).toEqual({ min: 0, max: 100, step: 1 });
    expect(limitsOf(humidifier('on', { target_humidity_step: 5 }))).toEqual({ min: 0, max: 100, step: 5 });
    expect(limitsOf(humidifier('on', { min_humidity: 60, max_humidity: 40 }))).toEqual({ min: 0, max: 100, step: 1 });
  });
});

describe('calls', () => {
  it('turns on and off', () => {
    expect(powerCall(viewOfHumidifier(humidifier('on', mist)))).toEqual({ service: 'turn_off', data: {} });
    expect(powerCall(viewOfHumidifier(humidifier('off', mist)))).toEqual({ service: 'turn_on', data: {} });
  });

  it('sends whole percents within the limits, and the mode', () => {
    const limits = { min: 30, max: 80, step: 1 };
    expect(humidityCall(51.6, limits)).toEqual({ service: 'set_humidity', data: { humidity: 52 } });
    expect(humidityCall(90, limits)).toEqual({ service: 'set_humidity', data: { humidity: 80 } });
    expect(modeCall('eco')).toEqual({ service: 'set_mode', data: { mode: 'eco' } });
  });
});
