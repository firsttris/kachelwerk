import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, nameOf } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';
import { WaterHeater } from './WaterHeater';
import { awayCall, modeCall, powerCall, temperatureCall, viewOfWaterHeater } from './waterHeaterModel';

// The HA side of the water heater tile: a water_heater entity in,
// water_heater services out (homeassistant/components/water_heater/services.py)
export const WaterHeaterCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const view = viewOfWaterHeater(entity);
  const run = ({ service, data }: ServiceCall) => call('water_heater', service, { entity_id: config.entity, ...data });

  return (
    <WaterHeater
      name={nameOf(config, entity)}
      view={view}
      // The state is the current operation (WaterHeaterEntity.state in
      // water_heater/__init__.py): without operation modes it may well be
      // unknown, so only unavailable means unreachable
      status={{ UNREACH: !entity || entity.state === 'unavailable' }}
      onTemperature={(temp) => run(temperatureCall(temp))}
      onMode={(mode) => run(modeCall(mode))}
      onAway={(away) => run(awayCall(away))}
      onPower={() => run(powerCall(entity, view))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const waterHeaterSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'water_heater' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
