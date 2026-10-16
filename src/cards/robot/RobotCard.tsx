import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { Robot } from './Robot';
import { fanSpeedCall, robotCall, type ServiceCall, viewOfRobot } from './robotModel';

export interface RobotConfig extends BaseConfig {
  // The battery sensor: current vacuums no longer report battery_level
  // (homeassistant/components/vacuum/__init__.py), lawn mowers never did
  battery_entity?: string;
}

// The HA side of the robot tile: a vacuum or lawn_mower entity in, its
// services out (vacuum/services.py, lawn_mower/services.py)
export const RobotCard = ({ hass, config }: CardProps<RobotConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const battery = config.battery_entity ? hass.states[config.battery_entity] : undefined;
  const view = viewOfRobot(config.entity, entity, battery);
  const run = (sc: ServiceCall | null) => {
    if (sc) call(sc.domain, sc.service, { entity_id: config.entity, ...sc.data });
  };

  return (
    <Robot
      name={nameOf(config, entity)}
      view={view}
      status={{ UNREACH: isUnavailable(entity) }}
      onAction={(action) => run(robotCall(view.kind, action))}
      onFanSpeed={(speed) => run(fanSpeedCall(speed))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const robotEntities = (config: RobotConfig) =>
  [config.entity, config.battery_entity].filter((id): id is string => !!id);

export const robotSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['vacuum', 'lawn_mower'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'battery_entity', selector: { entity: { domain: 'sensor', device_class: 'battery' } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
