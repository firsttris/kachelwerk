import { describe, expect, it } from 'vitest';
import { keyLabels } from './Buttons';
import { keyCall, keysOf } from './ButtonsCard';

// keyLabels from MUI's lights.test
describe('keyLabels', () => {
  it('takes what all keys share as the title', () => {
    expect(keyLabels(['Wandtaster Flur oben', 'Wandtaster Flur unten'])).toEqual({
      title: 'Wandtaster Flur',
      labels: ['oben', 'unten'],
    });
  });

  it('cuts only at word boundaries and keeps single keys', () => {
    expect(keyLabels(['Taster1', 'Taster2'])).toEqual({ title: 'Taster1', labels: ['Taster1', 'Taster2'] });
    expect(keyLabels(['Klingel'])).toEqual({ title: 'Klingel', labels: ['Klingel'] });
  });
});

describe('keys', () => {
  it('collects the main entity and the further keys', () => {
    expect(
      keysOf({ type: 'x', entity: 'button.a', entities: ['button.b', { entity: 'script.c', name: 'C', hold: 'script.d' }] }),
    ).toEqual([{ entity: 'button.a' }, { entity: 'button.b' }, { entity: 'script.c', name: 'C', hold: 'script.d' }]);
  });

  it('presses buttons and runs scripts and scenes', () => {
    expect(keyCall('button.a')).toEqual({ domain: 'button', service: 'press' });
    expect(keyCall('input_button.a')).toEqual({ domain: 'input_button', service: 'press' });
    expect(keyCall('script.a')).toEqual({ domain: 'script', service: 'turn_on' });
    expect(keyCall('scene.a')).toEqual({ domain: 'scene', service: 'turn_on' });
    expect(keyCall('event.a')).toBeNull();
  });
});
