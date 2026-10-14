import ThermometerIcon from '~icons/lucide/thermometer';
import DropletsIcon from '~icons/lucide/droplets';
import WindIcon from '~icons/lucide/wind';
import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, type Hass, type HassEntity, isUnavailable, nameOf, numberState } from '../../ha/types';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { Extra, format } from '../climate-sensor/ClimateSensor';
import { co2Label, co2Rating, MeasureTile, pmLabel, pmRating, pmTone, soilLabel, soilRating } from './Measure';

export interface SensorConfig extends BaseConfig {
  // co2, pm25, soil, illuminance or plain; else by the device class
  kind?: string;
  // Further values below (MUI's extras): PM10, temperature, humidity
  pm10_entity?: string;
  temperature_entity?: string;
  humidity_entity?: string;
}

type Kind = 'co2' | 'pm25' | 'soil' | 'illuminance' | 'plain';

const BY_CLASS: Record<string, Kind> = {
  carbon_dioxide: 'co2',
  pm25: 'pm25',
  moisture: 'soil',
  illuminance: 'illuminance',
};

export const sensorKindOf = (entity: HassEntity | undefined, kind?: string): Kind =>
  kind && ['co2', 'pm25', 'soil', 'illuminance', 'plain'].includes(kind)
    ? (kind as Kind)
    : (BY_CLASS[String(entity?.attributes.device_class ?? '')] ?? 'plain');

// Decimals by the size of the value, as MUI's tiles show them
const decimalsOf = (value: number) => (Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2);

const extrasOf = (hass: Hass, config: SensorConfig) => {
  const value = (id?: string) => numberState(id ? hass.states[id] : undefined);
  const pm10 = value(config.pm10_entity);
  const temperature = value(config.temperature_entity);
  const humidity = value(config.humidity_entity);
  return [
    pm10 !== undefined && <Extra key="pm10" icon={<WindIcon />} label="PM10" value={`${format(pm10)} µg/m³`} />,
    temperature !== undefined && (
      <Extra key="t" icon={<ThermometerIcon />} label={m.TEMPERATURE()} value={`${format(temperature)} °C`} />
    ),
    humidity !== undefined && (
      <Extra key="h" icon={<DropletsIcon />} label={m.HUMIDITY()} value={`${format(humidity, 0)} %`} />
    ),
  ].filter(Boolean);
};

// MUI's measurement tiles (MeasureTile): the value large with its unit,
// rated where MUI rates it
export const SensorCard = ({ hass, config }: CardProps<SensorConfig>) => {
  const entity = hass.states[config.entity];
  const moreInfo = useMoreInfo();
  const value = numberState(entity);
  const kind = sensorKindOf(entity, config.kind);
  const common = {
    name: nameOf(config, entity),
    status: { UNREACH: isUnavailable(entity) },
    onName: () => moreInfo(config.entity),
    extras: extrasOf(hass, config),
  };
  const shown = (digits: number) => (value !== undefined ? format(value, digits) : '–');

  if (kind === 'co2') {
    const rating = value !== undefined ? co2Rating(value) : undefined;
    return (
      <MeasureTile
        {...common}
        label={m.CO2()}
        value={shown(0)}
        unit="ppm"
        rating={rating}
        ratingLabel={rating ? co2Label[rating]() : undefined}
      />
    );
  }
  if (kind === 'pm25') {
    const rating = value !== undefined ? pmRating(value) : undefined;
    return (
      <MeasureTile
        {...common}
        label="PM2.5"
        caption="PM2.5"
        value={shown(1)}
        unit="µg/m³"
        rating={rating ? pmTone[rating] : undefined}
        ratingLabel={rating ? pmLabel[rating]() : undefined}
      />
    );
  }
  if (kind === 'soil') {
    const rating = value !== undefined ? soilRating(value) : undefined;
    return (
      <MeasureTile
        {...common}
        label={m.SOIL_MOISTURE()}
        value={shown(0)}
        unit="%"
        rating={rating === 'SOIL_DRY' ? 'poor' : rating ? 'good' : undefined}
        ratingLabel={rating ? soilLabel[rating]() : undefined}
      />
    );
  }
  const unit = String(entity?.attributes.unit_of_measurement ?? '');
  // A sensor without a number (a text state) shows its state as it is
  const text = value === undefined && entity && !isUnavailable(entity) ? entity.state : undefined;
  return (
    <MeasureTile
      {...common}
      label={kind === 'illuminance' ? m.BRIGHTNESS() : common.name}
      value={text ?? (value !== undefined ? formatNumber(value, decimalsOf(value)) : '–')}
      unit={kind === 'illuminance' ? 'lx' : unit}
    />
  );
};

export const sensorEntities = (config: SensorConfig) =>
  [config.entity, config.pm10_entity, config.temperature_entity, config.humidity_entity].filter(
    (id): id is string => !!id,
  );

export const sensorSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['sensor', 'number', 'input_number'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'kind', selector: { select: { mode: 'dropdown', options: ['co2', 'pm25', 'soil', 'illuminance', 'plain'] } } },
  { name: 'pm10_entity', selector: { entity: { domain: 'sensor' } } },
  { name: 'temperature_entity', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
  { name: 'humidity_entity', selector: { entity: { domain: 'sensor', device_class: 'humidity' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
