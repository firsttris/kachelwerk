import { type HassEntity, numberAttr, supports } from '../../ha/types';
import { CoverFeature } from '../shutter/coverModel';

// MUI's door states (the WebUI's door_opener.fn DOOR_STATE)
export type DoorState = 'CLOSED' | 'OPEN' | 'VENTILATION_POSITION' | 'POSITION_UNKNOWN';

// Up to this share open counts as the ventilation position
export const VENTILATION = 15;

// A garage door from a HA cover: closed, open, or a gap for air when it
// stands a little open (a door that reports a position)
export const doorStateOf = (entity: HassEntity | undefined): DoorState => {
  const state = entity?.state;
  const position = numberAttr(entity, 'current_position');
  if (state === 'closed' || position === 0) return 'CLOSED';
  if (position !== null && position > 0 && position <= VENTILATION + 5) return 'VENTILATION_POSITION';
  if (state === 'open' || state === 'opening' || state === 'closing') return 'OPEN';
  return 'POSITION_UNKNOWN';
};

// While HA says opening or closing, the door is drawn moving there
export const movingTo = (entity: HassEntity | undefined): number | null =>
  entity?.state === 'opening' ? 1 : entity?.state === 'closing' ? 0 : null;

// The ventilation gap needs a door that goes to a position
export const canVentilate = (entity: HassEntity | undefined) => supports(entity, CoverFeature.SET_POSITION);
