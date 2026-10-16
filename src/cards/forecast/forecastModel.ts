import { type BaseConfig, type Hass, type HassEntity, numberAttr, supports } from '../../ha/types';

// A weather entity's forecast: homeassistant/components/weather/__init__.py
// (Forecast, the ATTR_CONDITION_* states), const.py (WeatherEntityFeature)
// and websocket_api.py (weather/subscribe_forecast)

export type ForecastType = 'daily' | 'hourly' | 'twice_daily';

export interface ForecastConfig extends BaseConfig {
  forecast_type?: ForecastType;
}

// WeatherEntityFeature (const.py)
export const FEATURE: Record<ForecastType, number> = { daily: 1, hourly: 2, twice_daily: 4 };

const TYPES: ForecastType[] = ['daily', 'hourly', 'twice_daily'];

// The forecasts the entity offers: websocket_api.py refuses the others
// (forecast_not_supported)
export const forecastTypes = (entity: HassEntity | undefined) => TYPES.filter((type) => supports(entity, FEATURE[type]));

// The YAML's forecast_type where the entity offers it, else the first it offers
export const typeOf = (config: ForecastConfig, entity: HassEntity | undefined): ForecastType | null => {
  const offered = forecastTypes(entity);
  return config.forecast_type && offered.includes(config.forecast_type) ? config.forecast_type : (offered[0] ?? null);
};

// One entry as the subscription sends it: _convert_forecast in __init__.py
// turns native_* into temperature, templow, precipitation, … in the
// entity's display units
export interface ForecastEntry {
  datetime: string;
  condition?: string | null;
  temperature?: number | null;
  templow?: number | null;
  precipitation?: number | null;
  precipitation_probability?: number | null;
  is_daytime?: boolean | null;
}

// The message of weather/subscribe_forecast (forecast_listener in websocket_api.py)
export interface ForecastEvent {
  type: ForecastType;
  forecast: ForecastEntry[] | null;
}

export const subscribeMessage = (entityId: string, type: ForecastType) => ({
  type: 'weather/subscribe_forecast',
  entity_id: entityId,
  forecast_type: type,
});

// What the picture of a condition is made of
export interface Scene {
  sun?: boolean;
  moon?: boolean;
  // 0 none, 1 one cloud, 2 a second one behind
  clouds?: 0 | 1 | 2;
  // Heavy, dark clouds
  heavy?: boolean;
  rain?: 0 | 1 | 2;
  snow?: boolean;
  hail?: boolean;
  bolt?: boolean;
  fog?: boolean;
  wind?: boolean;
  alert?: boolean;
}

// The ATTR_CONDITION_* states of __init__.py as pictures
const SCENES: Record<string, Scene> = {
  'clear-night': { moon: true },
  cloudy: { clouds: 2 },
  exceptional: { alert: true },
  fog: { clouds: 1, fog: true },
  hail: { clouds: 2, heavy: true, hail: true },
  lightning: { clouds: 2, heavy: true, bolt: true },
  'lightning-rainy': { clouds: 2, heavy: true, bolt: true, rain: 1 },
  partlycloudy: { sun: true, clouds: 1 },
  pouring: { clouds: 2, heavy: true, rain: 2 },
  rainy: { clouds: 1, rain: 1 },
  snowy: { clouds: 1, snow: true },
  'snowy-rainy': { clouds: 1, rain: 1, snow: true },
  sunny: { sun: true },
  windy: { wind: true },
  'windy-variant': { clouds: 1, wind: true },
};

// At night the moon takes the sun's place
export const sceneOf = (condition: string | null | undefined, night = false): Scene => {
  const scene = SCENES[condition ?? ''] ?? { clouds: 1 };
  return night && scene.sun ? { ...scene, sun: false, moon: true } : scene;
};

export const CONDITIONS = Object.keys(SCENES);

// sun.sun (homeassistant/components/sun/entity.py): below_horizon now, and
// next_rising/next_setting give the night's hours for the hourly forecast
export const isNight = (sun: HassEntity | undefined) => sun?.state === 'below_horizon';

const timeOfDay = (date: Date) => (date.getHours() * 60 + date.getMinutes()) * 60_000;

export const nightAt = (sun: HassEntity | undefined, at: Date): boolean | undefined => {
  const rising = new Date(String(sun?.attributes.next_rising ?? ''));
  const setting = new Date(String(sun?.attributes.next_setting ?? ''));
  if (!Number.isFinite(rising.getTime()) || !Number.isFinite(setting.getTime())) return undefined;
  const t = timeOfDay(at);
  const up = timeOfDay(rising);
  const down = timeOfDay(setting);
  // Day between sunrise and sunset; the times of the next days are close enough
  return up < down ? t < up || t >= down : t >= down && t < up;
};

export interface CurrentWeather {
  condition: string;
  temperature: number | null;
  unit: string;
  precipitationUnit: string;
}

// The state is the condition; temperature and its unit are attributes
// (WeatherEntityStateAttribute in const.py)
export const currentOf = (entity: HassEntity | undefined): CurrentWeather => ({
  condition: entity?.state ?? '',
  temperature: numberAttr(entity, 'temperature'),
  unit: String(entity?.attributes.temperature_unit ?? '°C'),
  precipitationUnit: String(entity?.attributes.precipitation_unit ?? 'mm'),
});

export interface StripItem {
  at: Date;
  condition: string;
  high: number | null;
  low: number | null;
  probability: number | null;
  precipitation: number | null;
  // twice_daily's night half, or an hour after sunset
  night: boolean;
  // daily: the first entry is today; hourly: the current hour
  first: boolean;
}

// How many entries the strip shows: a week and a bit, a day of hours
const LIMIT: Record<ForecastType, number> = { daily: 10, hourly: 24, twice_daily: 14 };

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const stripOf = (
  forecast: ForecastEntry[] | null | undefined,
  type: ForecastType,
  now: Date,
  sun?: HassEntity,
): StripItem[] => {
  const entries = (forecast ?? [])
    .map((entry) => ({ entry, at: new Date(entry.datetime) }))
    .filter(({ at }) => Number.isFinite(at.getTime()))
    // Past hours drop out until the integration sends the next forecast
    .filter(({ at }) => type !== 'hourly' || at.getTime() > now.getTime() - 3_600_000)
    .slice(0, LIMIT[type]);
  return entries.map(({ entry, at }, i) => ({
    at,
    condition: entry.condition ?? '',
    high: num(entry.temperature),
    low: num(entry.templow),
    probability: num(entry.precipitation_probability),
    precipitation: num(entry.precipitation),
    night: type === 'twice_daily' ? entry.is_daytime === false : type === 'hourly' ? (nightAt(sun, at) ?? false) : false,
    first: i === 0 && (type === 'hourly' ? at.getTime() <= now.getTime() + 3_600_000 : sameDay(at, now)),
  }));
};

// Today's highest and lowest, from the daily forecast's first entry if it is today
export const todayOf = (daily: ForecastEntry[] | null | undefined, now: Date) => {
  const first = daily?.[0];
  if (!first || !sameDay(new Date(first.datetime), now)) return null;
  const high = num(first.temperature);
  const low = num(first.templow);
  const probability = num(first.precipitation_probability);
  return high === null && low === null && probability === null ? null : { high, low, probability };
};

// Before HA 2024.3 integrations put the forecast in an attribute; a few
// template entities still do
export const legacyForecast = (entity: HassEntity | undefined) => {
  const forecast = entity?.attributes.forecast;
  return Array.isArray(forecast) ? (forecast as ForecastEntry[]) : null;
};

export const sunOf = (hass: Hass) => hass.states['sun.sun'];
