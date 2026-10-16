import { type HassEntity, numberAttr, supports } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';

// What the media player tile shows, read from a HA media_player entity.
// States, attributes and features: homeassistant/components/media_player/
// const.py (MediaPlayerState, ATTR_*, MediaPlayerEntityFeature); which
// attributes an entity has: media_player/__init__.py (state_attributes
// leaves out everything but group_members while off, capability_attributes
// adds source_list and sound_mode_list only with their feature); the
// services and their fields: media_player/services.yaml.

// MediaPlayerEntityFeature (media_player/const.py)
export const FEATURE = {
  PAUSE: 1,
  SEEK: 2,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  VOLUME_STEP: 1024,
  SELECT_SOURCE: 2048,
  STOP: 4096,
  PLAY: 16384,
  SELECT_SOUND_MODE: 65536,
} as const;

// A list of options with the one set now (source, sound mode)
export interface Choice {
  value: string;
  options: string[];
}

// Where the track is: media_position at media_position_updated_at, moving
// on by itself while it plays (MediaPlayerEntity.media_position in
// media_player/__init__.py)
export interface Progress {
  position: number;
  duration: number;
  updatedAt: number;
}

export interface MediaView {
  // MediaPlayerState: off, on, idle, playing, paused, standby, buffering
  state: string;
  // Off or in standby: nothing but the power button
  off: boolean;
  playing: boolean;
  // Playing or about to (buffering): the button pauses
  active: boolean;
  title: string | null;
  subtitle: string | null;
  // entity_picture as the browser can load it
  picture: string | null;
  // The app or the source it plays from (app_name, source)
  from: string | null;
  // tv, speaker, receiver, projector (MediaPlayerDeviceClass)
  deviceClass: string | null;
  canPlay: boolean;
  canPause: boolean;
  canStop: boolean;
  canPrevious: boolean;
  canNext: boolean;
  // The power button and what it does now; null without the feature
  power: 'turn_on' | 'turn_off' | null;
  // 0..100, null while the player doesn't report it
  volume: number | null;
  muted: boolean;
  canSetVolume: boolean;
  canStepVolume: boolean;
  canMute: boolean;
  source: Choice | null;
  soundMode: Choice | null;
  progress: Progress | null;
}

const stringAttr = (entity: HassEntity | undefined, key: string) => {
  const value = entity?.attributes[key];
  return typeof value === 'string' && value !== '' ? value : null;
};

const listOf = (entity: HassEntity | undefined, key: string): string[] => {
  const value = entity?.attributes[key];
  return Array.isArray(value) ? value.map(String) : [];
};

const choiceOf = (entity: HassEntity | undefined, feature: number, current: string, list: string): Choice | null => {
  const options = listOf(entity, list);
  if (!supports(entity, feature) || options.length === 0) return null;
  return { value: stringAttr(entity, current) ?? '', options };
};

// "standby" is deprecated (MediaPlayerState in const.py) but still reported;
// HA's own toggle treats it as off (async_toggle in __init__.py)
const POWERED_DOWN = ['off', 'standby'];

// An episode as "S2E5", where the player says so
const episodeOf = (entity: HassEntity | undefined) => {
  const season = stringAttr(entity, 'media_season');
  const episode = stringAttr(entity, 'media_episode');
  return [season && `S${season}`, episode && `E${episode}`].filter(Boolean).join('') || null;
};

// The second line under the title: the artist, else the series, the
// channel or the album
const subtitleOf = (entity: HassEntity | undefined) => {
  const series = stringAttr(entity, 'media_series_title');
  if (series) return [series, episodeOf(entity)].filter(Boolean).join(' · ');
  return (
    stringAttr(entity, 'media_artist') ??
    stringAttr(entity, 'media_album_artist') ??
    stringAttr(entity, 'media_channel') ??
    stringAttr(entity, 'media_album_name')
  );
};

// entity_picture is either the player's own URL (media_image_remotely_
// accessible) or HA's proxy, a path relative to HA (/api/media_player_proxy/…,
// MediaPlayerEntity.entity_picture in __init__.py). The frontend's
// hass.hassUrl makes the path absolute where the dashboard runs elsewhere
// (the companion app, a cast device); without it the path stays relative to
// the page, which is HA itself.
export const pictureUrl = (picture: unknown, hassUrl?: (path: string) => string): string | null => {
  if (typeof picture !== 'string' || picture === '') return null;
  if (!picture.startsWith('/') || picture.startsWith('//') || !hassUrl) return picture;
  return hassUrl(picture);
};

const progressOf = (entity: HassEntity | undefined): Progress | null => {
  const position = numberAttr(entity, 'media_position');
  const duration = numberAttr(entity, 'media_duration');
  const at = Date.parse(String(entity?.attributes.media_position_updated_at ?? ''));
  if (position === null || duration === null || duration <= 0 || Number.isNaN(at)) return null;
  return { position, duration, updatedAt: at };
};

// The share of the track played at a time (ms), 0..1
export const playedAt = (progress: Progress, playing: boolean, now: number) => {
  const position = progress.position + (playing ? Math.max(0, now - progress.updatedAt) / 1000 : 0);
  return Math.max(0, Math.min(1, position / progress.duration));
};

export const viewOfMedia = (entity: HassEntity | undefined, hassUrl?: (path: string) => string): MediaView => {
  const state = entity?.state ?? 'off';
  const off = POWERED_DOWN.includes(state);
  const playing = state === 'playing';
  const level = numberAttr(entity, 'volume_level');
  const power = off
    ? supports(entity, FEATURE.TURN_ON)
      ? 'turn_on'
      : null
    : supports(entity, FEATURE.TURN_OFF)
      ? 'turn_off'
      : null;
  return {
    state,
    off,
    playing,
    active: playing || state === 'buffering',
    title: off ? null : stringAttr(entity, 'media_title'),
    subtitle: off ? null : subtitleOf(entity),
    picture: off ? null : pictureUrl(entity?.attributes.entity_picture, hassUrl),
    from: off ? null : (stringAttr(entity, 'app_name') ?? stringAttr(entity, 'source')),
    deviceClass: stringAttr(entity, 'device_class'),
    canPlay: supports(entity, FEATURE.PLAY),
    canPause: supports(entity, FEATURE.PAUSE),
    canStop: supports(entity, FEATURE.STOP),
    canPrevious: supports(entity, FEATURE.PREVIOUS_TRACK),
    canNext: supports(entity, FEATURE.NEXT_TRACK),
    power,
    volume: level === null ? null : Math.round(Math.max(0, Math.min(1, level)) * 100),
    muted: entity?.attributes.is_volume_muted === true,
    canSetVolume: supports(entity, FEATURE.VOLUME_SET),
    // volume_up/volume_down take either feature (services.yaml); with
    // VOLUME_SET the bar does it
    canStepVolume: supports(entity, FEATURE.VOLUME_STEP),
    canMute: supports(entity, FEATURE.VOLUME_MUTE),
    source: choiceOf(entity, FEATURE.SELECT_SOURCE, 'source', 'source_list'),
    soundMode: choiceOf(entity, FEATURE.SELECT_SOUND_MODE, 'sound_mode', 'sound_mode_list'),
    progress: off ? null : progressOf(entity),
  };
};

// The middle button: pause while it plays (stop where it can't pause, a
// radio stream), else play; null when the player can do neither
export const playButton = (view: MediaView): 'pause' | 'stop' | 'play' | null => {
  if (view.active) return view.canPause ? 'pause' : view.canStop ? 'stop' : null;
  return view.canPlay ? 'play' : null;
};

const PLAY_SERVICE = { pause: 'media_pause', stop: 'media_stop', play: 'media_play' } as const;

export const playCall = (button: 'pause' | 'stop' | 'play'): ServiceCall => ({ service: PLAY_SERVICE[button], data: {} });

export const trackCall = (direction: 'previous' | 'next'): ServiceCall => ({
  service: direction === 'next' ? 'media_next_track' : 'media_previous_track',
  data: {},
});

export const powerCall = (power: 'turn_on' | 'turn_off'): ServiceCall => ({ service: power, data: {} });

// volume_level is 0..1 (volume_set in services.yaml)
export const volumeCall = (percent: number): ServiceCall => ({
  service: 'volume_set',
  data: { volume_level: Math.round(Math.max(0, Math.min(100, percent))) / 100 },
});

export const stepCall = (direction: 'up' | 'down'): ServiceCall => ({ service: `volume_${direction}`, data: {} });

export const muteCall = (muted: boolean): ServiceCall => ({ service: 'volume_mute', data: { is_volume_muted: !muted } });

export const choiceCall = (kind: 'source' | 'soundMode', value: string): ServiceCall =>
  kind === 'source'
    ? { service: 'select_source', data: { source: value } }
    : { service: 'select_sound_mode', data: { sound_mode: value } };
