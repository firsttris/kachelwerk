import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { Alarm } from './Alarm';
import { actionCall, viewOfAlarm } from './alarmModel';

// The HA side of the alarm panel tile: an alarm_control_panel entity in,
// its services out (homeassistant/components/alarm_control_panel/services.py)
export const AlarmCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  return (
    <Alarm
      name={nameOf(config, entity)}
      view={viewOfAlarm(entity)}
      status={{ UNREACH: isUnavailable(entity) }}
      onAction={(action, code) => {
        const { service, data } = actionCall(action, code);
        call('alarm_control_panel', service, { entity_id: config.entity, ...data });
      }}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const alarmSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'alarm_control_panel' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
