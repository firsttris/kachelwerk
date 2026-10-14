import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { ClimateSensor } from './ClimateSensor';
import { type ClimateSensorConfigPart, readClimate } from './climateSensorModel';

export type ClimateSensorConfig = BaseConfig & ClimateSensorConfigPart;

export const ClimateSensorCard = ({ hass, config }: CardProps<ClimateSensorConfig>) => {
  const entity = hass.states[config.entity];
  const moreInfo = useMoreInfo();
  return (
    <ClimateSensor
      name={nameOf(config, entity)}
      {...readClimate(hass, config)}
      status={{ UNREACH: isUnavailable(entity) }}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const climateSensorEntities = (config: ClimateSensorConfig) =>
  [
    config.entity,
    config.humidity_entity,
    config.wind_entity,
    config.rain_entity,
    config.illuminance_entity,
    config.sunshine_entity,
  ].filter((id): id is string => !!id);

export const climateSensorSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['sensor', 'weather'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'humidity_entity', selector: { entity: { domain: 'sensor', device_class: 'humidity' } } },
  { name: 'wind_entity', selector: { entity: { domain: 'sensor', device_class: 'wind_speed' } } },
  { name: 'rain_entity', selector: { entity: { domain: ['binary_sensor', 'sensor'] } } },
  { name: 'illuminance_entity', selector: { entity: { domain: 'sensor', device_class: 'illuminance' } } },
  { name: 'sunshine_entity', selector: { entity: { domain: 'sensor' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
