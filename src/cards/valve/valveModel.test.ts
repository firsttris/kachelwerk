import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { levelOf } from './valveModel';

const valve = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'valve.wasser',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

describe('levelOf', () => {
  it('reads the position or open/closed', () => {
    expect(levelOf(valve('open', { current_position: 40 }))).toBe(40);
    expect(levelOf(valve('open'))).toBe(100);
    expect(levelOf(valve('closed'))).toBe(0);
    expect(levelOf(valve('unknown'))).toBeNull();
  });
});
