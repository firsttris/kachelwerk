import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, nameOf } from '../../ha/types';
import { DoorView } from './Door';
import { canOpen, isBusy, isJammed, lockStateOf } from './lockModel';

// Locks and door openers: lock with a tap, unlock by holding, open by
// sliding, so a stray tap can't open the front door
export const LockCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const target = { entity_id: config.entity };
  return (
    <DoorView
      name={nameOf(config, entity)}
      // unknown is a lock that doesn't know its bolt, not an unreachable one
      status={{ UNREACH: !entity || entity.state === 'unavailable' }}
      state={lockStateOf(entity)}
      busy={isBusy(entity)}
      error={isJammed(entity)}
      onLock={() => call('lock', 'lock', target)}
      onUnlock={() => call('lock', 'unlock', target)}
      onOpen={canOpen(entity) ? () => call('lock', 'open', target) : undefined}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const lockSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'lock' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
