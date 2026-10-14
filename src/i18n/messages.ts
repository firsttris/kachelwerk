// The tiles' texts in German and English, with the keys and wording of
// MUI's messages/*.json. The language follows HA's profile (defineCard).

type Params = Record<string, string | number>;
type Text = string | ((params: Params) => string);

const fill = (template: string) => (params: Params) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''));

const de = {
  UNREACH: 'Nicht erreichbar',
  LOW_BAT: 'Batterie schwach',
  BLIND_UP: 'Hoch',
  BLIND_DOWN: 'Runter',
  BLIND_STOP: 'Stopp',
  BLIND_CLOSED: 'geschlossen',
  BLIND_FULLY_OPEN: 'Ganz offen',
  BLIND_MOVING_TO: fill('Fährt auf {percent} %'),
  BLIND_PERCENT_OPEN: fill('{percent} % offen'),
  BLIND_POSITION: fill('Position {name}'),
  SLATS: 'Lamellen',
  SLATS_OF: fill('Lamellen {name}'),
  ON: 'An',
  OFF: 'Aus',
  AT_DEVICE: fill('{state} · am Gerät'),
  DIMMED_TO: fill('An · {percent} %'),
  BRIGHTNESS_OF: fill('Helligkeit {name}'),
  COLOR_OF: fill('Farbe {name}'),
  QUICK_COLORS: 'Schnellauswahl Farben',
  COLOR: 'Farbe',
  BOOST: 'Boost',
  WINDOW_OPEN: 'Fenster offen',
  HOLIDAY_MODE: 'Urlaub',
  MANUAL: 'Manuell',
  AUTO: 'Auto',
  AUTOMATIC: 'Automatisch',
  RADIATOR_THERMOSTAT: 'Heizkörper',
  VALVE: fill('Ventil {percent} %'),
  TARGET_TEMPERATURE: 'Zieltemperatur',
  DECREASE_TEMPERATURE: 'Temperatur verringern',
  INCREASE_TEMPERATURE: 'Temperatur erhöhen',
  WEEK_PROFILE: 'Wochenprogramm',
  ACTUAL: 'Ist',
  HUMIDITY: 'Luftfeuchte',
  POWER_OFF: 'Ausschalten',
  SWITCH_MANUAL: 'Manuell – tippen für Auto',
  SWITCH_AUTO: 'Auto – tippen für Manuell',
  COMFORT_TEMPERATURE: 'Komforttemperatur',
  LOWERING_TEMPERATURE: 'Eco-Temperatur',
  HEATING: 'Heizt',
  COMFORT: 'Komfort',
  ECO: 'Eco',
  IDLE: 'Hält die Temperatur',
} satisfies Record<string, Text>;

type Key = keyof typeof de;

const en: Record<Key, Text> = {
  UNREACH: 'Not reachable',
  LOW_BAT: 'Battery low',
  BLIND_UP: 'Up',
  BLIND_DOWN: 'Down',
  BLIND_STOP: 'Stop',
  BLIND_CLOSED: 'closed',
  BLIND_FULLY_OPEN: 'Fully open',
  BLIND_MOVING_TO: fill('Moving to {percent} %'),
  BLIND_PERCENT_OPEN: fill('{percent} % open'),
  BLIND_POSITION: fill('Position {name}'),
  SLATS: 'Slats',
  SLATS_OF: fill('Slats {name}'),
  ON: 'On',
  OFF: 'Off',
  AT_DEVICE: fill('{state} · at the device'),
  DIMMED_TO: fill('On · {percent} %'),
  BRIGHTNESS_OF: fill('Brightness {name}'),
  COLOR_OF: fill('Color {name}'),
  QUICK_COLORS: 'Quick colors',
  COLOR: 'Color',
  BOOST: 'Boost',
  WINDOW_OPEN: 'Window open',
  HOLIDAY_MODE: 'Holiday',
  MANUAL: 'Manual',
  AUTO: 'Auto',
  AUTOMATIC: 'Automatic',
  RADIATOR_THERMOSTAT: 'Radiator',
  VALVE: fill('Valve {percent} %'),
  TARGET_TEMPERATURE: 'Target temperature',
  DECREASE_TEMPERATURE: 'Decrease Temperature',
  INCREASE_TEMPERATURE: 'Increase Temperature',
  WEEK_PROFILE: 'Week schedule',
  ACTUAL: 'Actual',
  HUMIDITY: 'Humidity',
  POWER_OFF: 'Power Off',
  SWITCH_MANUAL: 'Manual – tap for auto',
  SWITCH_AUTO: 'Auto – tap for manual',
  COMFORT_TEMPERATURE: 'Comfort temperature',
  LOWERING_TEMPERATURE: 'Reduction temperature',
  HEATING: 'Heating',
  COMFORT: 'Comfort',
  ECO: 'Eco',
  IDLE: 'Holding temperature',
};

const tables: Record<string, Record<Key, Text>> = { de, en };
let table: Record<Key, Text> = en;
let locale = 'en';

// "de-DE" → de; everything without a table gets English. The numbers keep
// the full locale (de-CH writes 21.5)
export const setLocale = (language: string) => {
  table = tables[language.slice(0, 2).toLowerCase()] ?? en;
  locale = language;
};

export const getLocale = () => locale;

const lookup = (key: Key, params: Params = {}) => {
  const text = table[key];
  return typeof text === 'function' ? text(params) : text;
};

// m.BLIND_UP(), m.BLIND_MOVING_TO({ percent: 40 }): as Paraglide's m in MUI
export const m = new Proxy({} as { [K in Key]: (params?: Params) => string }, {
  get: (_, key: string) => (params?: Params) => lookup(key as Key, params),
});
