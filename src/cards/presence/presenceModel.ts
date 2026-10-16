import type { BaseConfig, Hass, HassEntity } from '../../ha/types';

// Who is home: person entities (homeassistant/components/person/entity.py)
// and device trackers (device_tracker/entity.py), one row each

export interface PersonConfig {
  entity: string;
  name?: string;
}

export interface PresenceConfig extends BaseConfig {
  entities?: (string | PersonConfig)[];
}

// The first person is the card's entity, the others follow
export const peopleOf = (config: PresenceConfig): PersonConfig[] => [
  { entity: config.entity },
  ...(config.entities ?? []).map((person) => (typeof person === 'string' ? { entity: person } : person)),
];

// home: STATE_HOME; away: STATE_NOT_HOME (homeassistant/const.py); zone: any
// other state, which device_tracker/entity.py sets to the active zone's name
// (zone_state.name) or the tracker's location_name; unknown: no tracker
// reports (person/entity.py leaves the state None)
export type Whereabouts = 'home' | 'zone' | 'away' | 'unknown';

export interface PersonView {
  id: string;
  name: string;
  // entity_picture: the person's picture (person/entity.py, CONF_PICTURE)
  picture?: string;
  initials: string;
  // Index into the avatar colors, the same for a person every time
  color: number;
  where: Whereabouts;
  // The zone's name for 'zone'
  place?: string;
  // When the state last changed (last_changed)
  since?: Date;
  unavailable: boolean;
}

export const AVATAR_COLORS = 8;

// HA's slugify (homeassistant/util/__init__.py): ASCII, lower case, runs of
// anything else as one underscore. Zone entity ids are made from names this way.
export const slugify = (text: string) =>
  text
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const initialsOf = (name: string) =>
  name
    .split(/[\s\-_.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0]?.toUpperCase() ?? '')
    .join('') || '?';

export const colorOf = (id: string) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % AVATAR_COLORS;
};

const WHERE: Record<string, Whereabouts> = {
  home: 'home',
  not_home: 'away',
  unknown: 'unknown',
  unavailable: 'unknown',
  '': 'unknown',
};

export const whereOf = (state: string | undefined): Whereabouts => WHERE[state ?? ''] ?? 'zone';

// The state is already the zone's name; where a zone of that name exists
// (zone.<slug>), its friendly_name as the user wrote it
export const placeOf = (hass: Hass, state: string) => {
  const zone = hass.states[`zone.${slugify(state)}`];
  return zone?.attributes.friendly_name ?? state;
};

const dateOf = (value: string | undefined) => {
  const date = value ? new Date(value) : undefined;
  return date && Number.isFinite(date.getTime()) ? date : undefined;
};

export const viewOfPerson = (hass: Hass, person: PersonConfig): PersonView => {
  const entity: HassEntity | undefined = hass.states[person.entity];
  const name = person.name ?? entity?.attributes.friendly_name ?? person.entity;
  const where = whereOf(entity?.state);
  const picture = entity?.attributes.entity_picture;
  return {
    id: person.entity,
    name,
    picture: typeof picture === 'string' && picture ? picture : undefined,
    initials: initialsOf(name),
    color: colorOf(person.entity),
    where,
    place: where === 'zone' && entity ? placeOf(hass, entity.state) : undefined,
    since: where === 'unknown' ? undefined : dateOf(entity?.last_changed),
    unavailable: !entity || entity.state === 'unavailable',
  };
};

// How long a person has been where they are, in the largest whole unit;
// null under a minute ("just now")
export const durationSince = (
  since: Date,
  now: Date,
): { value: number; unit: 'minute' | 'hour' | 'day' } | null => {
  const minutes = Math.floor((now.getTime() - since.getTime()) / 60000);
  if (minutes < 1) return null;
  if (minutes < 60) return { value: minutes, unit: 'minute' };
  if (minutes < 24 * 60) return { value: Math.floor(minutes / 60), unit: 'hour' };
  return { value: Math.floor(minutes / (24 * 60)), unit: 'day' };
};

