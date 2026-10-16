import { getLocale } from './messages';

// Labels of the YAML options in HA's visual editor (getConfigForm's
// computeLabel), German and English
const labels: Record<string, [de: string, en: string]> = {
  entity: ['Entität', 'Entity'],
  entities: ['Weitere Tasten', 'More keys'],
  name: ['Name', 'Name'],
  effects: ['Effekte (Leuchten und Bewegung)', 'Effects (glow and motion)'],
  travel_time: ['Fahrzeit unten → oben (s)', 'Travel time bottom → top (s)'],
  tile: ['Kachel', 'Tile'],
  kind: ['Art', 'Kind'],
  window_entity: ['Fensterkontakt', 'Window contact'],
  valve_entity: ['Ventilöffnung', 'Valve opening'],
  humidity_entity: ['Luftfeuchte', 'Humidity'],
  temperature_entity: ['Temperatur', 'Temperature'],
  wind_entity: ['Wind', 'Wind'],
  rain_entity: ['Regen', 'Rain'],
  illuminance_entity: ['Helligkeit', 'Brightness'],
  sunshine_entity: ['Sonnenscheindauer', 'Sunshine duration'],
  sabotage_entity: ['Sabotagekontakt', 'Tamper contact'],
  test_entity: ['Taste für den Rauchtest', 'Smoke test button'],
  detection_entity: ['Schalter für die Erkennung', 'Detection switch'],
  dew_point_entity: ['Taupunktalarm', 'Dew point alarm'],
  output: ['Ausgang statt Pumpe', 'Output instead of pump'],
  power: ['Leistung', 'Power'],
  energy: ['Zählerstände', 'Meter readings'],
  feed_in: ['Einspeisung', 'Feed-in'],
  voltage: ['Spannung', 'Voltage'],
  current: ['Strom', 'Current'],
  frequency: ['Frequenz', 'Frequency'],
  gas: ['Gaszähler', 'Gas meter'],
  gas_flow: ['Gasdurchfluss', 'Gas flow'],
  pm10_entity: ['PM10', 'PM10'],
  // Robot vacuum and lawn mower
  battery_entity: ['Akku', 'Battery'],
  // Presence and forecast cards
  person: ['Person', 'Person'],
  people: ['Weitere Personen', 'More people'],
  forecast_type: ['Vorhersage', 'Forecast'],
};

// label_key: a field whose label differs by card (the presence card's people)
export const fieldLabel = (field: { name: string; label_key?: string }) => {
  const label = labels[field.label_key ?? field.name];
  if (!label) return field.name;
  return getLocale().toLowerCase().startsWith('de') ? label[0] : label[1];
};
