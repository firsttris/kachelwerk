import { type HassEntity, numberAttr, supports } from '../../ha/types';
import type { BlindReport } from './blindsModel';

// CoverEntityFeature in HA (homeassistant/components/cover/const.py)
export const CoverFeature = {
  OPEN: 1,
  CLOSE: 2,
  SET_POSITION: 4,
  STOP: 8,
  OPEN_TILT: 16,
  CLOSE_TILT: 32,
  STOP_TILT: 64,
  SET_TILT_POSITION: 128,
} as const;

// What the tile needs from a cover entity, as blindsModel's reportOf reads
// it from the CCU's datapoints: HA's current_position is 0 closed .. 100
// open like LEVEL × 100, and HA says opening/closing while it travels.
// A cover without positions is drawn fully open or closed.
export const reportOfCover = (entity: HassEntity | undefined): BlindReport => {
  const position = numberAttr(entity, 'current_position');
  const state = entity?.state;
  const level = position ?? (state === 'open' || state === 'closing' ? 100 : 0);
  return { level: Math.round(level), moving: state === 'opening' || state === 'closing' };
};

// Slats of venetian blinds: HA's tilt position, if the cover can set it
export const slatsOfCover = (entity: HassEntity | undefined): number | null =>
  supports(entity, CoverFeature.SET_TILT_POSITION)
    ? Math.round(Math.min(100, Math.max(0, numberAttr(entity, 'current_tilt_position') ?? 0)))
    : null;

export interface ServiceCall {
  service: string;
  data: Record<string, unknown>;
}

// The service for a target height. A cover without positions only knows
// open and close: the upper half opens it, the lower half closes it.
export const levelCall = (entity: HassEntity | undefined, percent: number): ServiceCall => {
  if (supports(entity, CoverFeature.SET_POSITION)) return { service: 'set_cover_position', data: { position: percent } };
  return { service: percent >= 50 ? 'open_cover' : 'close_cover', data: {} };
};
