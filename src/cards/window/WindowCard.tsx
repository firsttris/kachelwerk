import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { Window } from './Window';
import { isHandle, windowStateOf } from './windowModel';

export interface WindowConfig extends BaseConfig {
  // A tamper sensor (binary_sensor, on: the cover was opened)
  sabotage_entity?: string;
}

export const WindowCard = ({ hass, config }: CardProps<WindowConfig>) => {
  const entity = hass.states[config.entity];
  const moreInfo = useMoreInfo();
  const sabotage = config.sabotage_entity ? hass.states[config.sabotage_entity]?.state === 'on' : false;
  return (
    <Window
      name={nameOf(config, entity)}
      state={windowStateOf(entity)}
      handle={isHandle(entity)}
      sabotage={sabotage}
      status={{ UNREACH: isUnavailable(entity) }}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const windowEntities = (config: WindowConfig) =>
  [config.entity, config.sabotage_entity].filter((id): id is string => !!id);

export const windowSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['binary_sensor', 'sensor'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'sabotage_entity', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
