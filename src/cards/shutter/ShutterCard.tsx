import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { levelCall, reportOfCover, slatsOfCover } from './coverModel';
import { Shutter } from './Shutter';

export interface ShutterConfig extends BaseConfig {
  // Seconds from bottom to top, for the travel shown while the shutter moves
  travel_time?: number;
}

// The HA side of the shutter tile: a cover entity in, cover services out
export const ShutterCard = ({ hass, config }: CardProps<ShutterConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const target = { entity_id: config.entity };

  return (
    <Shutter
      name={nameOf(config, entity)}
      report={reportOfCover(entity)}
      slats={slatsOfCover(entity)}
      status={{ UNREACH: isUnavailable(entity) }}
      fullTravel={config.travel_time ? config.travel_time * 1000 : undefined}
      onLevel={(percent) => {
        const { service, data } = levelCall(entity, percent);
        call('cover', service, { ...target, ...data });
      }}
      onStop={() => call('cover', 'stop_cover', target)}
      onSlats={(percent) => call('cover', 'set_cover_tilt_position', { ...target, tilt_position: percent })}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const shutterSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'cover' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'travel_time', selector: { number: { min: 1, max: 180, unit_of_measurement: 's', mode: 'box' } } },
  {
    name: 'effects',
    selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } },
  },
];
