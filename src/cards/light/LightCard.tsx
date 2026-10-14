import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { ColorLightTile } from './ColorLightTile';
import { DimmerTile } from './DimmerTile';
import {
  capsOf,
  colorOf,
  hueCall,
  isOn,
  kindOf,
  levelCall,
  levelOf,
  type ServiceCall,
  toggleCall,
  whiteCall,
} from './lightModel';
import { SwitchTile } from './SwitchTile';

export interface LightConfig extends BaseConfig {
  // Which tile: light (a lamp), socket, dimmer or color; else by what the
  // entity can and, for switches, by its name
  tile?: 'light' | 'socket' | 'dimmer' | 'color';
}

// The HA side of MUI's light tiles: lights, switches and input booleans
export const LightCard = ({ hass, config }: CardProps<LightConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const name = nameOf(config, entity);
  const kind = kindOf(entity, name, config.tile);
  const run = ({ domain, service, data }: ServiceCall) => call(domain, service, { entity_id: config.entity, ...data });
  const common = {
    name,
    status: { UNREACH: isUnavailable(entity) },
    onToggle: () => run(toggleCall(config.entity)),
    onHold: () => moreInfo(config.entity),
  };

  if (kind === 'socket' || kind === 'switch') {
    return <SwitchTile {...common} on={isOn(entity)} lamp={kind === 'switch'} />;
  }
  const level = levelOf(entity);
  const color = colorOf(entity);
  if (kind === 'dimmer') {
    return <DimmerTile {...common} level={level} color={color.rgb} onLevel={(v) => run(levelCall(v))} />;
  }
  const caps = capsOf(entity);
  return (
    <ColorLightTile
      {...common}
      level={level}
      color={color}
      caps={caps}
      onLevel={(v) => run(levelCall(v))}
      onHue={(h) => run(hueCall(h))}
      onWhite={(k) => run(whiteCall(k, caps))}
    />
  );
};

// Color lights are wide, as in MUI (col-span-2)
export const lightColumns = (config: LightConfig, hass: CardProps<LightConfig>['hass']) =>
  kindOf(hass.states[config.entity], nameOf(config, hass.states[config.entity]), config.tile) === 'color' ? 12 : 6;

export const lightSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['light', 'switch', 'input_boolean'] } } },
  { name: 'name', selector: { text: {} } },
  {
    name: 'tile',
    selector: { select: { mode: 'dropdown', options: ['light', 'socket', 'dimmer', 'color'] } },
  },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
