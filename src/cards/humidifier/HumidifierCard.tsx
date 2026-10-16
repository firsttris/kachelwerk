import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';
import { Humidifier } from './Humidifier';
import { humidityCall, modeCall, powerCall, viewOfHumidifier } from './humidifierModel';

// The HA side of the humidifier tile: a humidifier entity in, humidifier
// services out (homeassistant/components/humidifier/services.py)
export const HumidifierCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const view = viewOfHumidifier(entity);
  const run = ({ service, data }: ServiceCall) => call('humidifier', service, { entity_id: config.entity, ...data });

  return (
    <Humidifier
      name={nameOf(config, entity)}
      view={view}
      status={{ UNREACH: isUnavailable(entity) }}
      onPower={() => run(powerCall(view))}
      onHumidity={(humidity) => run(humidityCall(humidity, view.limits))}
      onMode={(mode) => view.mode?.options.includes(mode) && run(modeCall(mode))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const humidifierSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'humidifier' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
