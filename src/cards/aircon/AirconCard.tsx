import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { type ServiceCall, temperatureCall } from '../thermostat/climateModel';
import { Aircon } from './Aircon';
import { choiceCall, modeCall, powerCall, rangeCall, viewOfAircon } from './airconModel';

// The HA side of the air conditioner tile: a climate entity in, climate
// services out (homeassistant/components/climate/services.py)
export const AirconCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const view = viewOfAircon(entity);
  const run = ({ service, data }: ServiceCall) => call('climate', service, { entity_id: config.entity, ...data });

  return (
    <Aircon
      name={nameOf(config, entity)}
      view={view}
      status={{ UNREACH: isUnavailable(entity) }}
      onTemperature={(temp) => run(temperatureCall(temp))}
      onRange={(low, high) => run(rangeCall(low, high))}
      onMode={(mode) => run(modeCall(mode))}
      onPower={() => run(powerCall(entity, view))}
      onChoice={(kind, value) => run(choiceCall(kind, value))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const airconSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'climate' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
