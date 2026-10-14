import { describe, expect, it } from 'vitest';
import type { Hass, HassEntity } from '../../ha/types';
import { readClimate, toKmh, toMinutes } from './climateSensorModel';

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id,
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});
const hassWith = (...entities: HassEntity[]) =>
  ({ states: Object.fromEntries(entities.map((e) => [e.entity_id, e])) }) as unknown as Hass;

describe('readClimate', () => {
  it('reads a temperature sensor and the sensors named beside it', () => {
    const hass = hassWith(
      entity('sensor.t', '21.4'),
      entity('sensor.h', '55'),
      entity('sensor.w', '5', { unit_of_measurement: 'm/s' }),
      entity('binary_sensor.regen', 'on'),
    );
    expect(
      readClimate(hass, {
        entity: 'sensor.t',
        humidity_entity: 'sensor.h',
        wind_entity: 'sensor.w',
        rain_entity: 'binary_sensor.regen',
      }),
    ).toMatchObject({ temperature: 21.4, humidity: 55, wind: 18, raining: true, rainAmount: undefined });
  });

  it('reads a weather entity’s attributes', () => {
    const hass = hassWith(
      entity('weather.home', 'sunny', { temperature: 12.5, humidity: 70, wind_speed: 10, wind_speed_unit: 'km/h' }),
    );
    expect(readClimate(hass, { entity: 'weather.home' })).toMatchObject({ temperature: 12.5, humidity: 70, wind: 10 });
  });

  it('has no temperature while the sensor is unavailable', () => {
    expect(readClimate(hassWith(entity('sensor.t', 'unavailable')), { entity: 'sensor.t' }).temperature).toBeUndefined();
  });
});

describe('units', () => {
  it('converts wind and sunshine', () => {
    expect(toKmh(10, 'm/s')).toBe(36);
    expect(toMinutes(2, 'h')).toBe(120);
  });
});
