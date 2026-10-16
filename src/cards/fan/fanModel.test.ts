import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import {
  directionCall,
  FAN_FEATURE,
  oscillateCall,
  percentageCall,
  percentageOf,
  powerCall,
  presetCall,
  snapPercentage,
  speedOf,
  speedsOf,
  viewOfFan,
} from './fanModel';

const fan = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'fan.ventilator',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

const ALL = Object.values(FAN_FEATURE).reduce((a, b) => a | b, 0);

// A pedestal fan with three speeds and presets, as HA reports it
const pedestal = {
  percentage: 66,
  percentage_step: 100 / 3,
  preset_mode: null,
  preset_modes: ['auto', 'sleep', 'nature'],
  oscillating: true,
  direction: 'forward',
  supported_features: ALL,
};

describe('viewOfFan', () => {
  it('reads speed, step, presets, oscillation and direction', () => {
    expect(viewOfFan(fan('on', pedestal))).toEqual({
      on: true,
      canOn: true,
      canOff: true,
      percentage: 66,
      speeds: 3,
      speed: 2,
      preset: { value: '', options: ['auto', 'sleep', 'nature'] },
      oscillating: true,
      direction: 'forward',
      spin: 0.66,
    });
  });

  it('shows no speed while off, even where the fan keeps its last one', () => {
    const view = viewOfFan(fan('off', pedestal));
    expect(view).toMatchObject({ on: false, percentage: 0, speed: 0, spin: 0 });
  });

  it('leaves out what the fan does not support', () => {
    const view = viewOfFan(fan('on', { ...pedestal, supported_features: FAN_FEATURE.TURN_ON | FAN_FEATURE.TURN_OFF }));
    expect(view).toMatchObject({ percentage: null, preset: null, oscillating: null, direction: null, spin: 0.55 });
  });

  it('offers presets with PRESET_MODE alone and shows the one set', () => {
    const view = viewOfFan(
      fan('on', { preset_mode: 'sleep', preset_modes: ['auto', 'sleep'], supported_features: FAN_FEATURE.PRESET_MODE }),
    );
    expect(view.preset).toEqual({ value: 'sleep', options: ['auto', 'sleep'] });
    expect(view.percentage).toBeNull();
  });

  it('reads reverse', () => {
    expect(viewOfFan(fan('on', { ...pedestal, direction: 'reverse' })).direction).toBe('reverse');
  });
});

describe('speeds', () => {
  it('takes speed_count from percentage_step, 100 without one', () => {
    expect(speedsOf(fan('on', { percentage_step: 100 / 6 }))).toBe(6);
    expect(speedsOf(fan('on', { percentage_step: 25 }))).toBe(4);
    expect(speedsOf(fan('on', {}))).toBe(100);
  });

  it('computes the percentages as HA does (i * 100 // count)', () => {
    expect([0, 1, 2, 3].map((i) => percentageOf(i, 3))).toEqual([0, 33, 66, 100]);
    expect([1, 2, 3, 4, 5, 6].map((i) => percentageOf(i, 6))).toEqual([16, 33, 50, 66, 83, 100]);
  });

  it('finds the step of a percentage (ceil), back and forth', () => {
    for (const count of [3, 4, 6, 7, 100]) {
      for (let i = 0; i <= count; i++) expect(speedOf(percentageOf(i, count), count)).toBe(i);
    }
    expect(speedOf(50, 3)).toBe(2);
  });

  it('snaps a value along the bar to the nearest speed', () => {
    expect(snapPercentage(40, 3)).toBe(33);
    expect(snapPercentage(60, 3)).toBe(66);
    expect(snapPercentage(99.3, 3)).toBe(100);
    expect(snapPercentage(10, 3)).toBe(0);
    expect(snapPercentage(42, 100)).toBe(42);
  });
});

describe('calls', () => {
  it('turns on and off', () => {
    expect(powerCall(viewOfFan(fan('on', pedestal)))).toEqual({ service: 'turn_off', data: {} });
    expect(powerCall(viewOfFan(fan('off', pedestal)))).toEqual({ service: 'turn_on', data: {} });
  });

  it('sets speed, preset, oscillation and direction', () => {
    expect(percentageCall(66.4)).toEqual({ service: 'set_percentage', data: { percentage: 66 } });
    expect(presetCall('sleep')).toEqual({ service: 'set_preset_mode', data: { preset_mode: 'sleep' } });
    expect(oscillateCall(false)).toEqual({ service: 'oscillate', data: { oscillating: false } });
    expect(directionCall('reverse')).toEqual({ service: 'set_direction', data: { direction: 'reverse' } });
  });
});
