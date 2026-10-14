import { type HassEntity, supports } from '../../ha/types';
import type { LockState } from './Door';

// LockEntityFeature.OPEN (homeassistant/components/lock/const.py)
export const LOCK_OPEN = 1;

// HA's LockState: locked, unlocked, open, and the drive's moves locking,
// unlocking, opening; jammed is a fault
export const lockStateOf = (entity: HassEntity | undefined): LockState => {
  const state = entity?.state;
  if (state === 'locked' || state === 'locking') return 'locked';
  if (state === 'unlocked' || state === 'unlocking' || state === 'open' || state === 'opening') return 'unlocked';
  return 'unknown';
};

export const isBusy = (entity: HassEntity | undefined) =>
  ['locking', 'unlocking', 'opening'].includes(entity?.state ?? '');

export const isJammed = (entity: HassEntity | undefined) => entity?.state === 'jammed';

export const canOpen = (entity: HassEntity | undefined) => supports(entity, LOCK_OPEN);
