import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import {
  boostCall,
  powerOffCall,
  presetCall,
  type ServiceCall,
  temperatureCall,
  toggleModeCall,
  viewOfClimate,
} from './climateModel';
import { Thermostat } from './Thermostat';

export interface ThermostatConfig extends BaseConfig {
  // A window contact: the badge and icon show "window open" while it is on
  window_entity?: string;
  // The valve opening in percent (a radiator thermostat's level sensor)
  valve_entity?: string;
  // A humidity sensor, where the climate entity has no current_humidity
  humidity_entity?: string;
}

// The HA side of MUI's thermostat tile: a climate entity in, climate
// services out
export const ThermostatCard = ({ hass, config }: CardProps<ThermostatConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const view = viewOfClimate(entity);
  const run = ({ service, data }: ServiceCall) => call('climate', service, { entity_id: config.entity, ...data });

  const window = config.window_entity ? hass.states[config.window_entity] : undefined;
  const valveState = config.valve_entity ? Number(hass.states[config.valve_entity]?.state) : Number.NaN;
  const humidityState = config.humidity_entity ? Number(hass.states[config.humidity_entity]?.state) : Number.NaN;

  return (
    <Thermostat
      name={nameOf(config, entity)}
      view={{ ...view, humidity: view.humidity ?? (Number.isFinite(humidityState) ? Math.round(humidityState) : undefined) }}
      windowOpen={window?.state === 'on' || window?.state === 'open'}
      valve={Number.isFinite(valveState) ? Math.round(valveState) : undefined}
      status={{ UNREACH: isUnavailable(entity) }}
      onTemperature={(temp) => run(temperatureCall(temp))}
      onPowerOff={() => run(powerOffCall(entity))}
      onToggleMode={() => run(toggleModeCall(view))}
      onToggleBoost={() => run(boostCall(entity, view))}
      onComfort={() => run(presetCall('comfort'))}
      onEco={() => run(presetCall('eco'))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const thermostatEntities = (config: ThermostatConfig) =>
  [config.entity, config.window_entity, config.valve_entity, config.humidity_entity].filter(
    (id): id is string => !!id,
  );

export const thermostatSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'climate' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'window_entity', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'valve_entity', selector: { entity: { domain: ['sensor', 'number'] } } },
  { name: 'humidity_entity', selector: { entity: { domain: 'sensor', device_class: 'humidity' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
