import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { canStop, levelOf } from './valveModel';
import { Valve, WaterSwitch, WindowDrive } from './Valves';

// A valve (valve), irrigation (a switch) or a window drive (a cover)
export const ValveCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const target = { entity_id: config.entity };
  const domain = config.entity.split('.')[0];
  const common = {
    name: nameOf(config, entity),
    status: { UNREACH: isUnavailable(entity) },
    onName: () => moreInfo(config.entity),
  };
  if (domain === 'switch' || domain === 'input_boolean') {
    return (
      <WaterSwitch
        {...common}
        running={entity?.state === 'on'}
        onSet={(on) => call('homeassistant', on ? 'turn_on' : 'turn_off', target)}
      />
    );
  }
  if (domain === 'cover') {
    return (
      <WindowDrive
        {...common}
        level={levelOf(entity)}
        onOpen={() => call('cover', 'open_cover', target)}
        onClose={() => call('cover', 'close_cover', target)}
        onStop={() => call('cover', 'stop_cover', target)}
      />
    );
  }
  return (
    <Valve
      {...common}
      level={levelOf(entity)}
      onOpen={() => call('valve', 'open_valve', target)}
      onClose={() => call('valve', 'close_valve', target)}
      onStop={canStop(entity) ? () => call('valve', 'stop_valve', target) : undefined}
    />
  );
};

export const valveSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['valve', 'switch', 'input_boolean', 'cover'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
