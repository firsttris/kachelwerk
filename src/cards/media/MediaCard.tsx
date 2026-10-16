import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, type Hass, isUnavailable, nameOf } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';
import { Media } from './Media';
import {
  choiceCall,
  muteCall,
  playButton,
  playCall,
  powerCall,
  stepCall,
  trackCall,
  viewOfMedia,
  volumeCall,
} from './mediaModel';

// HA's frontend hands its hass object a hassUrl(path) that makes a path
// absolute to HA (the cover behind /api/media_player_proxy/…)
type FrontendHass = Hass & { hassUrl?: (path?: string) => string };

// The HA side of the media player tile: a media_player entity in,
// media_player services out (homeassistant/components/media_player/services.yaml)
export const MediaCard = ({ hass, config }: CardProps<BaseConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const { hassUrl } = hass as FrontendHass;
  const view = viewOfMedia(entity, typeof hassUrl === 'function' ? (path) => hassUrl.call(hass, path) : undefined);
  const run = ({ service, data }: ServiceCall) => call('media_player', service, { entity_id: config.entity, ...data });

  return (
    <Media
      name={nameOf(config, entity)}
      view={view}
      status={{ UNREACH: isUnavailable(entity) }}
      onPlay={() => {
        const button = playButton(view);
        if (button) run(playCall(button));
      }}
      onTrack={(direction) => run(trackCall(direction))}
      onPower={() => view.power && run(powerCall(view.power))}
      onVolume={(percent) => run(volumeCall(percent))}
      onStep={(direction) => run(stepCall(direction))}
      onMute={() => run(muteCall(view.muted))}
      onChoice={(kind, value) => run(choiceCall(kind, value))}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const mediaSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: 'media_player' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
