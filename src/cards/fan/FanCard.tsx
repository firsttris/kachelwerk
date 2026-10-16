import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';
import { Fan } from './Fan';
import { directionCall, oscillateCall, percentageCall, powerCall, presetCall, viewOfFan } from './fanModel';

// The HA side of the fan tile: a fan entity in, fan services out
// (homeassistant/components/fan/services.py)
export const FanCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const view = viewOfFan(entity);
  const run = ({ service, data }: ServiceCall) => call('fan', service, { entity_id: config.entity, ...data });

  return (
    <Fan
      name={nameOf(config, entity)}
      view={view}
      status={{ UNREACH: isUnavailable(entity) }}
      onPower={() => run(powerCall(view))}
      onPercentage={(percentage) => run(percentageCall(percentage))}
      // "Manual" (no preset) is only shown: HA can't set it, a speed ends the preset
      onPreset={(preset) => view.preset?.options.includes(preset) && run(presetCall(preset))}
      onOscillate={(oscillating) => run(oscillateCall(oscillating))}
      onDirection={(direction) => run(directionCall(direction))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const fanSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'fan' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
