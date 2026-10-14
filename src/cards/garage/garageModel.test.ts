import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { doorStateOf, movingTo } from './garageModel';

const cover = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'cover.garage',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

describe('doorStateOf', () => {
  it('reads closed, open and the ventilation gap', () => {
    expect(doorStateOf(cover('closed'))).toBe('CLOSED');
    expect(doorStateOf(cover('open'))).toBe('OPEN');
    expect(doorStateOf(cover('open', { current_position: 100 }))).toBe('OPEN');
    expect(doorStateOf(cover('open', { current_position: 15 }))).toBe('VENTILATION_POSITION');
    expect(doorStateOf(cover('unknown'))).toBe('POSITION_UNKNOWN');
  });

  it('knows where a moving door goes', () => {
    expect(movingTo(cover('opening'))).toBe(1);
    expect(movingTo(cover('closing'))).toBe(0);
    expect(movingTo(cover('open'))).toBeNull();
  });
});
