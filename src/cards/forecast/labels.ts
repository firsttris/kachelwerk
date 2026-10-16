import { getLocale, m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import type { ForecastType, StripItem } from './forecastModel';

// The weather states of homeassistant/components/weather/strings.json
const CONDITION: Record<string, () => string> = {
  'clear-night': m.WEATHER_CLEAR_NIGHT,
  cloudy: m.WEATHER_CLOUDY,
  exceptional: m.WEATHER_EXCEPTIONAL,
  fog: m.WEATHER_FOG,
  hail: m.WEATHER_HAIL,
  lightning: m.WEATHER_LIGHTNING,
  'lightning-rainy': m.WEATHER_LIGHTNING_RAINY,
  partlycloudy: m.WEATHER_PARTLYCLOUDY,
  pouring: m.WEATHER_POURING,
  rainy: m.WEATHER_RAINY,
  snowy: m.WEATHER_SNOWY,
  'snowy-rainy': m.WEATHER_SNOWY_RAINY,
  sunny: m.WEATHER_SUNNY,
  windy: m.WEATHER_WINDY,
  'windy-variant': m.WEATHER_WINDY_VARIANT,
};

export const conditionText = (condition: string) => CONDITION[condition]?.() ?? condition;

export const TYPE_LABEL: Record<ForecastType, () => string> = {
  daily: m.FORECAST_DAILY,
  hourly: m.FORECAST_HOURLY,
  twice_daily: m.FORECAST_TWICE_DAILY,
};

const formats = new Map<string, Intl.DateTimeFormat>();
const dateFormat = (options: Intl.DateTimeFormatOptions) => {
  const key = `${getLocale()}|${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(getLocale(), options);
    formats.set(key, format);
  }
  return format;
};

// Above an entry of the strip: today, a weekday, now or an hour
export const itemLabel = (item: StripItem, type: ForecastType) => {
  if (type === 'hourly') return item.first ? m.FORECAST_NOW() : dateFormat({ hour: 'numeric' }).format(item.at);
  if (type === 'twice_daily' && item.night) return m.FORECAST_NIGHT();
  return item.first ? m.FORECAST_TODAY() : dateFormat({ weekday: 'short' }).format(item.at);
};

// The full day or hour, for screen readers
export const itemWhen = (item: StripItem, type: ForecastType) =>
  type === 'hourly'
    ? dateFormat({ weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(item.at)
    : `${dateFormat({ weekday: 'long' }).format(item.at)}${type === 'twice_daily' && item.night ? `, ${m.FORECAST_NIGHT()}` : ''}`;

export const degrees = (value: number) => `${formatNumber(Math.round(value), 0)}°`;
