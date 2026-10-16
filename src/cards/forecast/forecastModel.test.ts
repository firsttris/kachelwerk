import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import {
  CONDITIONS,
  currentOf,
  forecastTypes,
  legacyForecast,
  nightAt,
  sceneOf,
  stripOf,
  subscribeMessage,
  todayOf,
  typeOf,
} from './forecastModel';

const weather = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'weather.home',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

const local = (day: number, hour: number) => new Date(2026, 9, day, hour, 0, 0);

describe('forecast types', () => {
  it('follows WeatherEntityFeature', () => {
    expect(forecastTypes(weather('sunny', { supported_features: 3 }))).toEqual(['daily', 'hourly']);
    expect(forecastTypes(weather('sunny', { supported_features: 4 }))).toEqual(['twice_daily']);
    expect(forecastTypes(weather('sunny'))).toEqual([]);
  });
  it("takes the YAML's type only where the entity offers it", () => {
    const entity = weather('sunny', { supported_features: 3 });
    expect(typeOf({ type: 't', entity: 'weather.home', forecast_type: 'hourly' }, entity)).toBe('hourly');
    expect(typeOf({ type: 't', entity: 'weather.home', forecast_type: 'twice_daily' }, entity)).toBe('daily');
    expect(typeOf({ type: 't', entity: 'weather.home' }, weather('sunny'))).toBeNull();
  });
  it('subscribes as websocket_api.py expects', () => {
    expect(subscribeMessage('weather.home', 'hourly')).toEqual({
      type: 'weather/subscribe_forecast',
      entity_id: 'weather.home',
      forecast_type: 'hourly',
    });
  });
});

describe('sceneOf', () => {
  it('draws every condition of HA', () => {
    expect(CONDITIONS).toHaveLength(15);
    expect(sceneOf('pouring')).toMatchObject({ clouds: 2, heavy: true, rain: 2 });
    expect(sceneOf('lightning-rainy')).toMatchObject({ bolt: true, rain: 1 });
    expect(sceneOf('snowy-rainy')).toMatchObject({ snow: true, rain: 1 });
    expect(sceneOf('clear-night')).toEqual({ moon: true });
  });
  it('puts the moon in place of the sun at night', () => {
    expect(sceneOf('partlycloudy', true)).toEqual({ sun: false, moon: true, clouds: 1 });
    expect(sceneOf('rainy', true)).toEqual({ clouds: 1, rain: 1 });
  });
  it('draws a cloud for an unknown condition', () => {
    expect(sceneOf('unknown')).toEqual({ clouds: 1 });
  });
});

describe('nightAt', () => {
  const sun = weather('above_horizon', {
    next_rising: local(17, 7).toISOString(),
    next_setting: local(16, 18).toISOString(),
  });
  it('is night between sunset and sunrise, any day', () => {
    expect(nightAt(sun, local(16, 12))).toBe(false);
    expect(nightAt(sun, local(16, 21))).toBe(true);
    expect(nightAt(sun, local(18, 3))).toBe(true);
    expect(nightAt(sun, local(18, 8))).toBe(false);
  });
  it('does not know without sun.sun', () => {
    expect(nightAt(undefined, local(16, 21))).toBeUndefined();
  });
});

describe('currentOf', () => {
  it('reads the condition, temperature and units', () => {
    expect(currentOf(weather('rainy', { temperature: 9.5, temperature_unit: '°F', precipitation_unit: 'in' }))).toEqual({
      condition: 'rainy',
      temperature: 9.5,
      unit: '°F',
      precipitationUnit: 'in',
    });
    expect(currentOf(weather('rainy'))).toMatchObject({ temperature: null, unit: '°C', precipitationUnit: 'mm' });
  });
});

describe('stripOf', () => {
  const now = local(16, 14);
  it('marks today, reads high, low and precipitation', () => {
    const items = stripOf(
      [
        { datetime: local(16, 0).toISOString(), condition: 'sunny', temperature: 18, templow: 7, precipitation_probability: 0 },
        { datetime: local(17, 0).toISOString(), condition: 'rainy', temperature: 14, templow: null, precipitation: 3.2 },
        { datetime: 'not a date', condition: 'rainy' },
      ],
      'daily',
      now,
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ first: true, high: 18, low: 7, probability: 0, night: false });
    expect(items[1]).toMatchObject({ first: false, high: 14, low: null, precipitation: 3.2, probability: null });
  });
  it('drops past hours and keeps a day of them', () => {
    const hours = Array.from({ length: 40 }, (_, i) => ({ datetime: local(16, 10 + i).toISOString(), temperature: 10 }));
    const items = stripOf(hours, 'hourly', now);
    expect(items).toHaveLength(24);
    expect(items[0].at).toEqual(local(16, 14));
    expect(items[0].first).toBe(true);
  });
  it("shows twice_daily's nights", () => {
    const items = stripOf(
      [
        { datetime: local(16, 6).toISOString(), is_daytime: true },
        { datetime: local(16, 18).toISOString(), is_daytime: false },
      ],
      'twice_daily',
      now,
    );
    expect(items.map((item) => item.night)).toEqual([false, true]);
  });
  it('is empty without a forecast', () => {
    expect(stripOf(null, 'daily', now)).toEqual([]);
  });
});

describe('todayOf and legacyForecast', () => {
  it("takes today's high and low from the daily forecast", () => {
    const now = local(16, 9);
    expect(todayOf([{ datetime: local(16, 0).toISOString(), temperature: 17, templow: 8 }], now)).toEqual({
      high: 17,
      low: 8,
      probability: null,
    });
    expect(todayOf([{ datetime: local(17, 0).toISOString(), temperature: 17 }], now)).toBeNull();
    expect(todayOf(null, now)).toBeNull();
  });
  it('reads a forecast attribute where one is left', () => {
    expect(legacyForecast(weather('sunny', { forecast: [{ datetime: 'x' }] }))).toEqual([{ datetime: 'x' }]);
    expect(legacyForecast(weather('sunny'))).toBeNull();
  });
});
