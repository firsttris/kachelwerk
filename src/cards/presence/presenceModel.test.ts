import { describe, expect, it } from 'vitest';
import type { Hass, HassEntity } from '../../ha/types';
import {
  AVATAR_COLORS,
  colorOf,
  durationSince,
  initialsOf,
  peopleOf,
  placeOf,
  slugify,
  viewOfPerson,
  whereOf,
} from './presenceModel';

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id,
  state,
  attributes,
  last_changed: '2026-10-16T08:00:00Z',
  last_updated: '2026-10-16T08:00:00Z',
});

const hassWith = (...entities: HassEntity[]): Hass => ({
  states: Object.fromEntries(entities.map((e) => [e.entity_id, e])),
  callService: async () => undefined,
});

describe('peopleOf', () => {
  it('starts with the card entity, then the list, strings or objects', () => {
    expect(peopleOf({ type: 't', entity: 'person.a', entities: ['person.b', { entity: 'device_tracker.c', name: 'C' }] })).toEqual([
      { entity: 'person.a' },
      { entity: 'person.b' },
      { entity: 'device_tracker.c', name: 'C' },
    ]);
  });
});

describe('whereOf', () => {
  it('reads home, not_home, a zone name and no state', () => {
    expect(whereOf('home')).toBe('home');
    expect(whereOf('not_home')).toBe('away');
    expect(whereOf('Arbeit')).toBe('zone');
    expect(whereOf('unknown')).toBe('unknown');
    expect(whereOf('unavailable')).toBe('unknown');
    expect(whereOf(undefined)).toBe('unknown');
  });
});

describe('slugify and placeOf', () => {
  it('makes zone ids as HA does', () => {
    expect(slugify('Büro Süd')).toBe('buro_sud');
    expect(slugify('Straße 1')).toBe('strasse_1');
    expect(slugify('  Gym! ')).toBe('gym');
  });
  it("takes the zone's friendly name where the zone exists", () => {
    const hass = hassWith(entity('zone.buro_sud', '0', { friendly_name: 'Büro (Süd)' }));
    expect(placeOf(hass, 'Büro Süd')).toBe('Büro (Süd)');
    expect(placeOf(hass, 'Supermarkt')).toBe('Supermarkt');
  });
});

describe('initialsOf and colorOf', () => {
  it('takes up to two initials', () => {
    expect(initialsOf('Anna Maria Schmidt')).toBe('AM');
    expect(initialsOf('tom')).toBe('T');
    expect(initialsOf('')).toBe('?');
  });
  it('keeps a color per person', () => {
    expect(colorOf('person.anna')).toBe(colorOf('person.anna'));
    expect(colorOf('person.anna')).toBeLessThan(AVATAR_COLORS);
  });
});

describe('viewOfPerson', () => {
  it('reads a person at home with a picture', () => {
    const hass = hassWith(entity('person.anna', 'home', { friendly_name: 'Anna', entity_picture: '/api/image/serve/1/512x512' }));
    expect(viewOfPerson(hass, { entity: 'person.anna' })).toMatchObject({
      name: 'Anna',
      picture: '/api/image/serve/1/512x512',
      initials: 'A',
      where: 'home',
      since: new Date('2026-10-16T08:00:00Z'),
      unavailable: false,
    });
  });
  it('reads a tracker in a zone, with the name from the YAML', () => {
    const hass = hassWith(entity('device_tracker.phone', 'Work'), entity('zone.work', '1', { friendly_name: 'Office' }));
    expect(viewOfPerson(hass, { entity: 'device_tracker.phone', name: 'Ben' })).toMatchObject({
      name: 'Ben',
      where: 'zone',
      place: 'Office',
      picture: undefined,
    });
  });
  it('has no time for an unknown state, and a missing entity is unavailable', () => {
    expect(viewOfPerson(hassWith(entity('person.x', 'unknown')), { entity: 'person.x' }).since).toBeUndefined();
    expect(viewOfPerson(hassWith(), { entity: 'person.y' })).toMatchObject({ unavailable: true, where: 'unknown', name: 'person.y' });
  });
});

describe('durationSince', () => {
  const now = new Date('2026-10-16T12:00:00Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000);
  it('rounds down to the largest unit', () => {
    expect(durationSince(ago(0.5), now)).toBeNull();
    expect(durationSince(ago(12), now)).toEqual({ value: 12, unit: 'minute' });
    expect(durationSince(ago(150), now)).toEqual({ value: 2, unit: 'hour' });
    expect(durationSince(ago(3 * 1440 + 5), now)).toEqual({ value: 3, unit: 'day' });
  });
});
