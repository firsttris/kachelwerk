import { type Hass, type HassEntity, numberAttr, numberState } from '../../ha/types';

export interface ClimateSensorConfigPart {
  entity: string;
  humidity_entity?: string;
  wind_entity?: string;
  rain_entity?: string;
  illuminance_entity?: string;
  sunshine_entity?: string;
}

// Wind in km/h, as MUI shows it, from the units HA's sensors and weather
// entities use
const KMH: Record<string, number> = { 'km/h': 1, 'm/s': 3.6, mph: 1.609344, kn: 1.852, ft_s: 1.09728 };

export const toKmh = (value: number, unit: string | undefined) => value * (KMH[unit ?? 'km/h'] ?? 1);

// Sunshine in minutes: HA's duration sensors come in s, min or h
const MINUTES: Record<string, number> = { s: 1 / 60, min: 1, h: 60, d: 1440 };

export const toMinutes = (value: number, unit: string | undefined) => value * (MINUTES[unit ?? 'min'] ?? 1);

const unitOf = (entity: HassEntity | undefined) => entity?.attributes.unit_of_measurement;

// The values of MUI's climate sensor tile: a temperature sensor with the
// others named in the YAML, or a weather entity with its attributes
export const readClimate = (hass: Hass, config: ClimateSensorConfigPart) => {
  const main = hass.states[config.entity];
  const get = (id?: string) => (id ? hass.states[id] : undefined);
  const weather = config.entity.startsWith('weather.');
  const temperature = weather ? (numberAttr(main, 'temperature') ?? undefined) : numberState(main);
  const humidityEntity = get(config.humidity_entity);
  const humidity = humidityEntity
    ? numberState(humidityEntity)
    : weather
      ? (numberAttr(main, 'humidity') ?? undefined)
      : undefined;
  const windEntity = get(config.wind_entity);
  const windValue = windEntity
    ? numberState(windEntity)
    : weather
      ? (numberAttr(main, 'wind_speed') ?? undefined)
      : undefined;
  const windUnit = windEntity ? unitOf(windEntity) : String(main?.attributes.wind_speed_unit ?? 'km/h');
  const rain = get(config.rain_entity);
  // A rain sensor is a binary_sensor (raining) or an amount in mm
  const raining = rain?.entity_id.startsWith('binary_sensor.') ? rain.state === 'on' : undefined;
  const rainAmount = rain && raining === undefined ? numberState(rain) : undefined;
  const sun = get(config.sunshine_entity);
  const sunshine = numberState(sun);
  return {
    temperature,
    humidity,
    wind: windValue === undefined ? undefined : toKmh(windValue, windUnit),
    raining,
    rainAmount,
    illumination: numberState(get(config.illuminance_entity)),
    sunshine: sunshine === undefined ? undefined : toMinutes(sunshine, unitOf(sun)),
  };
};
