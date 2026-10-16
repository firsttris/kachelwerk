import type { HassConnection } from '../src/ha/types';

// The forecast card's websocket in the demo: weather/subscribe_forecast
// answers at once with a forecast made from now, as an integration would
// (homeassistant/components/weather/websocket_api.py)

const DAYS: [condition: string, high: number, low: number, chance: number][] = [
  ['partlycloudy', 17, 8, 10],
  ['rainy', 14, 9, 70],
  ['pouring', 12, 8, 90],
  ['cloudy', 13, 6, 20],
  ['sunny', 16, 5, 0],
  ['lightning-rainy', 18, 11, 60],
  ['snowy-rainy', 6, 0, 50],
];

const HOURS = ['partlycloudy', 'partlycloudy', 'cloudy', 'rainy', 'rainy', 'cloudy', 'partlycloudy', 'sunny'];

const shift = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const demoForecast = (type: string, now = new Date()) => {
  if (type === 'hourly') {
    const hour = new Date(now);
    hour.setMinutes(0, 0, 0);
    return Array.from({ length: 24 }, (_, i) => ({
      datetime: new Date(hour.getTime() + i * 3_600_000).toISOString(),
      condition: HOURS[Math.floor(i / 3) % HOURS.length],
      temperature: Math.round(13 + 4 * Math.sin(((hour.getHours() + i - 9) / 24) * 2 * Math.PI)),
      precipitation_probability: [0, 0, 10, 60, 80, 30, 10, 0][Math.floor(i / 3) % 8],
    }));
  }
  const today = startOfDay(now);
  const days = DAYS.map(([condition, high, low, chance], i) => ({
    datetime: new Date(today.getTime() + i * 86_400_000 + 12 * 3_600_000).toISOString(),
    condition,
    temperature: high,
    templow: low,
    precipitation_probability: chance,
  }));
  if (type !== 'twice_daily') return days;
  return days.flatMap((day) => [
    { ...day, datetime: shift(day.datetime, -6), is_daytime: true },
    { ...day, datetime: shift(day.datetime, 6), condition: day.condition === 'sunny' ? 'clear-night' : day.condition, temperature: day.templow, templow: undefined, is_daytime: false },
  ]);
};

// What the tests and animations look at: the subscriptions the cards made
const subscriptions: Record<string, unknown>[] = [];
(window as unknown as { subscriptions: unknown[] }).subscriptions = subscriptions;

export const demoConnection: HassConnection = {
  subscribeMessage: async <T,>(callback: (message: T) => void, message: Record<string, unknown>) => {
    subscriptions.push(message);
    const type = String(message.forecast_type);
    setTimeout(() => callback({ type, forecast: demoForecast(type) } as T), 0);
    return () => undefined;
  },
};
