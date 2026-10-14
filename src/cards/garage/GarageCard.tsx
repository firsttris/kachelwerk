import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { GarageDoor } from './GarageDoor';
import { canVentilate, doorStateOf, movingTo, VENTILATION } from './garageModel';

export const GarageCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const target = { entity_id: config.entity };
  return (
    <GarageDoor
      name={nameOf(config, entity)}
      state={doorStateOf(entity)}
      movingTo={movingTo(entity)}
      canVentilate={canVentilate(entity)}
      status={{ UNREACH: isUnavailable(entity) }}
      onOpen={() => call('cover', 'open_cover', target)}
      onClose={() => call('cover', 'close_cover', target)}
      onVentilate={() => call('cover', 'set_cover_position', { ...target, position: VENTILATION })}
      onStop={() => call('cover', 'stop_cover', target)}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const garageSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'cover' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
