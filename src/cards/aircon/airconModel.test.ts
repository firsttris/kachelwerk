import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import {
  choiceCall,
  FEATURE,
  limitsOf,
  modeCall,
  paceOf,
  powerCall,
  rangeCall,
  sortModes,
  swinging,
  toneOf,
  viewOfAircon,
} from './airconModel';

const climate = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'climate.klima',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// As a split unit reports itself (e.g. through midea_ac_lan or daikin)
const split = {
  hvac_modes: ['off', 'heat_cool', 'cool', 'dry', 'fan_only', 'heat'],
  fan_modes: ['auto', 'low', 'medium', 'high'],
  fan_mode: 'auto',
  swing_modes: ['off', 'vertical', 'horizontal', 'both'],
  swing_mode: 'vertical',
  preset_modes: ['none', 'eco', 'boost', 'sleep'],
  preset_mode: 'none',
  min_temp: 16,
  max_temp: 31,
  target_temp_step: 1,
  current_temperature: 26.4,
  temperature: 22,
  target_temp_low: null,
  target_temp_high: null,
  current_humidity: 52,
  hvac_action: 'cooling',
  supported_features:
    FEATURE.TARGET_TEMPERATURE |
    FEATURE.TARGET_TEMPERATURE_RANGE |
    FEATURE.FAN_MODE |
    FEATURE.PRESET_MODE |
    FEATURE.SWING_MODE |
    FEATURE.TURN_ON |
    FEATURE.TURN_OFF,
};

describe('viewOfAircon', () => {
  it('reads a cooling unit: one target, actual, humidity, fan, swing and presets', () => {
    const view = viewOfAircon(climate('cool', split));
    expect(view).toMatchObject({
      mode: 'cool',
      off: false,
      action: 'cooling',
      blowing: true,
      tone: 'cool',
      target: 22,
      low: null,
      high: null,
      current: 26.4,
      humidity: 52,
      limits: { min: 16, max: 31, step: 1 },
      canPower: true,
    });
    expect(view.modes).toEqual(['cool', 'heat', 'heat_cool', 'dry', 'fan_only']);
    expect(view.fan).toEqual({ value: 'auto', options: ['auto', 'low', 'medium', 'high'] });
    expect(view.swing?.value).toBe('vertical');
    expect(view.preset?.options).toContain('eco');
    expect(view.swingHorizontal).toBeNull();
  });

  it('takes the range in heat_cool', () => {
    const view = viewOfAircon(
      climate('heat_cool', { ...split, temperature: null, target_temp_low: 20, target_temp_high: 24, hvac_action: 'idle' }),
    );
    expect(view).toMatchObject({ target: null, low: 20, high: 24, blowing: false, tone: 'range' });
  });

  it('ignores a range without the feature, and options without theirs', () => {
    const view = viewOfAircon(
      climate('heat_cool', { temperature: 21, target_temp_low: 20, target_temp_high: 24, fan_modes: ['low', 'high'], supported_features: 1 }),
    );
    expect(view).toMatchObject({ target: 21, low: null, high: null, fan: null });
  });

  it('is off without a target, and blows by the mode where HA has no hvac_action', () => {
    expect(viewOfAircon(climate('off', { ...split, temperature: null, hvac_action: 'off' }))).toMatchObject({
      off: true,
      blowing: false,
      tone: 'off',
      target: null,
    });
    expect(viewOfAircon(climate('fan_only', { hvac_modes: ['off', 'fan_only'] }))).toMatchObject({
      blowing: true,
      tone: 'fan',
      action: null,
    });
  });
});

describe('helpers', () => {
  it('sorts the modes, off left out, unknown ones last', () => {
    expect(sortModes(['off', 'fan_only', 'turbo', 'heat', 'cool'])).toEqual(['cool', 'heat', 'fan_only', 'turbo']);
  });

  it('colors heat_cool and auto by what the unit does', () => {
    expect(toneOf('heat_cool', 'heating')).toBe('heat');
    expect(toneOf('auto', 'cooling')).toBe('cool');
    expect(toneOf('auto', 'idle')).toBe('auto');
    expect(toneOf('dry', 'drying')).toBe('dry');
    expect(toneOf('off', 'cooling')).toBe('off');
  });

  it('falls back to HA defaults for the limits', () => {
    expect(limitsOf(climate('cool'))).toEqual({ min: 7, max: 35, step: 0.5 });
  });

  it('paces the air by the fan, swings unless off', () => {
    expect(paceOf({ value: 'high', options: [] })).toBeGreaterThan(paceOf({ value: 'low', options: [] }));
    expect(paceOf(null)).toBe(1);
    expect(swinging({ value: 'both', options: [] })).toBe(true);
    expect(swinging({ value: 'off', options: [] })).toBe(false);
    expect(swinging(null)).toBe(false);
  });
});

describe('service calls', () => {
  it('turns off and on by turn_off/turn_on where supported', () => {
    const on = climate('cool', split);
    expect(powerCall(on, viewOfAircon(on))).toEqual({ service: 'turn_off', data: {} });
    const off = climate('off', split);
    expect(powerCall(off, viewOfAircon(off))).toEqual({ service: 'turn_on', data: {} });
  });

  it('else by the hvac_mode, on as HA falls back (heat_cool, heat, cool)', () => {
    const attributes = { hvac_modes: ['off', 'cool', 'heat', 'dry'] };
    const on = climate('cool', attributes);
    expect(powerCall(on, viewOfAircon(on))).toEqual(modeCall('off'));
    const off = climate('off', attributes);
    expect(powerCall(off, viewOfAircon(off))).toEqual(modeCall('heat'));
  });

  it('sends the range with both ends, low below high', () => {
    expect(rangeCall(25, 23)).toEqual({ service: 'set_temperature', data: { target_temp_low: 23, target_temp_high: 25 } });
  });

  it('sets fan, swing, horizontal swing and preset', () => {
    expect(choiceCall('fan', 'high')).toEqual({ service: 'set_fan_mode', data: { fan_mode: 'high' } });
    expect(choiceCall('swing', 'both')).toEqual({ service: 'set_swing_mode', data: { swing_mode: 'both' } });
    expect(choiceCall('swingHorizontal', 'on').service).toBe('set_swing_horizontal_mode');
    expect(choiceCall('preset', 'eco')).toEqual({ service: 'set_preset_mode', data: { preset_mode: 'eco' } });
  });
});
