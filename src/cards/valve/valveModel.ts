import { type HassEntity, numberAttr, supports } from '../../ha/types';

// ValveEntityFeature.STOP (homeassistant/components/valve/__init__.py) and
// CoverEntityFeature.STOP share the value 8
export const STOP = 8;

// How far open: the position where the entity reports one, else open 100,
// closed 0; null while unknown
export const levelOf = (entity: HassEntity | undefined): number | null => {
  const position = numberAttr(entity, 'current_position');
  if (position !== null) return Math.round(position);
  const state = entity?.state;
  if (state === 'open' || state === 'opening') return 100;
  if (state === 'closed' || state === 'closing') return 0;
  return null;
};

export const canStop = (entity: HassEntity | undefined) => supports(entity, STOP);
