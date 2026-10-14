import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { canOpen, isBusy, isJammed, lockStateOf } from './lockModel';

const lock = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'lock.haustuer',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

describe('lockModel', () => {
  it('reads the lock state, moves and faults', () => {
    expect(lockStateOf(lock('locked'))).toBe('locked');
    expect(lockStateOf(lock('unlocking'))).toBe('unlocked');
    expect(lockStateOf(lock('open'))).toBe('unlocked');
    expect(lockStateOf(lock('jammed'))).toBe('unknown');
    expect(isBusy(lock('locking'))).toBe(true);
    expect(isBusy(lock('locked'))).toBe(false);
    expect(isJammed(lock('jammed'))).toBe(true);
    expect(canOpen(lock('locked', { supported_features: 1 }))).toBe(true);
    expect(canOpen(lock('locked'))).toBe(false);
  });
});
