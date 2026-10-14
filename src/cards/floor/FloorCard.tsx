import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { FloorCircuit } from './FloorCircuit';
import { isOutput, valveOf } from './floorModel';
import { FloorOutput } from './FloorOutput';

export interface FloorConfig extends BaseConfig {
  // An output that is no pump (a pump is the default for switches)
  output?: boolean;
  // Dew point or humidity alarm (binary_sensor)
  dew_point_entity?: string;
}

export const FloorCard = ({ hass, config }: CardProps<FloorConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const common = {
    name: nameOf(config, entity),
    status: { UNREACH: isUnavailable(entity) },
    onName: () => moreInfo(config.entity),
  };
  if (!isOutput(config.entity)) return <FloorCircuit {...common} value={valveOf(entity)} />;
  const state = entity?.state;
  return (
    <FloorOutput
      {...common}
      on={state === 'on' ? true : state === 'off' ? false : null}
      pump={!config.output}
      dewPoint={config.dew_point_entity ? hass.states[config.dew_point_entity]?.state === 'on' : false}
      onSwitch={
        config.entity.startsWith('switch.')
          ? (on) => call('switch', on ? 'turn_on' : 'turn_off', { entity_id: config.entity })
          : undefined
      }
    />
  );
};

export const floorEntities = (config: FloorConfig) =>
  [config.entity, config.dew_point_entity].filter((id): id is string => !!id);

export const floorSchema = [
  {
    name: 'entity',
    required: true,
    selector: { entity: { domain: ['number', 'sensor', 'input_number', 'switch', 'binary_sensor'] } },
  },
  { name: 'name', selector: { text: {} } },
  { name: 'output', selector: { boolean: {} } },
  { name: 'dew_point_entity', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
