import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import {
  choiceCall,
  FEATURE,
  muteCall,
  pictureUrl,
  playButton,
  playCall,
  playedAt,
  powerCall,
  stepCall,
  trackCall,
  viewOfMedia,
  volumeCall,
} from './mediaModel';

const player = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'media_player.wohnzimmer',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// As a Sonos speaker reports itself
const SONOS =
  FEATURE.PAUSE |
  FEATURE.SEEK |
  FEATURE.VOLUME_SET |
  FEATURE.VOLUME_MUTE |
  FEATURE.PREVIOUS_TRACK |
  FEATURE.NEXT_TRACK |
  FEATURE.SELECT_SOURCE |
  FEATURE.STOP |
  FEATURE.PLAY;

const sonos = {
  supported_features: SONOS,
  volume_level: 0.34,
  is_volume_muted: false,
  media_title: 'Teardrop',
  media_artist: 'Massive Attack',
  media_album_name: 'Mezzanine',
  entity_picture: '/api/media_player_proxy/media_player.wohnzimmer?token=abc&cache=1',
  source: 'Line-in',
  source_list: ['Line-in', 'TV'],
  media_position: 60,
  media_duration: 240,
  media_position_updated_at: '2026-10-16T10:00:00+00:00',
};

describe('viewOfMedia', () => {
  it('reads a speaker playing a track', () => {
    const view = viewOfMedia(player('playing', sonos));
    expect(view).toMatchObject({
      off: false,
      playing: true,
      active: true,
      title: 'Teardrop',
      subtitle: 'Massive Attack',
      volume: 34,
      muted: false,
      canSetVolume: true,
      canMute: true,
      canPrevious: true,
      canNext: true,
      from: 'Line-in',
      source: { value: 'Line-in', options: ['Line-in', 'TV'] },
      soundMode: null,
    });
    expect(view.progress).toEqual({ position: 60, duration: 240, updatedAt: Date.parse('2026-10-16T10:00:00Z') });
  });

  it('shows nothing of the media while off, only the power button', () => {
    const view = viewOfMedia(player('off', { ...sonos, supported_features: SONOS | FEATURE.TURN_ON }));
    expect(view).toMatchObject({ off: true, title: null, picture: null, progress: null, power: 'turn_on' });
    expect(viewOfMedia(player('standby', { supported_features: FEATURE.TURN_ON })).off).toBe(true);
  });

  it('offers power only with the feature for the way it would go', () => {
    expect(viewOfMedia(player('playing', { supported_features: FEATURE.TURN_ON })).power).toBeNull();
    expect(viewOfMedia(player('idle', { supported_features: FEATURE.TURN_OFF })).power).toBe('turn_off');
    expect(viewOfMedia(player('off', { supported_features: FEATURE.TURN_OFF })).power).toBeNull();
  });

  it('takes the series, the channel or the album where there is no artist', () => {
    const tv = player('playing', { media_title: 'Pilot', media_series_title: 'Lost', media_season: '1', media_episode: '1' });
    expect(viewOfMedia(tv).subtitle).toBe('Lost · S1E1');
    expect(viewOfMedia(player('playing', { media_channel: 'Das Erste' })).subtitle).toBe('Das Erste');
    expect(viewOfMedia(player('playing', { media_album_name: 'Mezzanine' })).subtitle).toBe('Mezzanine');
  });

  it('prefers the app over the source', () => {
    expect(viewOfMedia(player('playing', { app_name: 'Spotify', source: 'TV' })).from).toBe('Spotify');
  });

  it('lists sources and sound modes only with their feature', () => {
    const lists = { source_list: ['A'], sound_mode_list: ['Movie', 'Music'], sound_mode: 'Movie' };
    expect(viewOfMedia(player('on', lists))).toMatchObject({ source: null, soundMode: null });
    expect(viewOfMedia(player('on', { ...lists, supported_features: FEATURE.SELECT_SOUND_MODE })).soundMode).toEqual({
      value: 'Movie',
      options: ['Movie', 'Music'],
    });
  });

  it('has no volume while the player reports none', () => {
    expect(viewOfMedia(player('idle', { supported_features: FEATURE.VOLUME_SET })).volume).toBeNull();
    expect(viewOfMedia(player('idle', { volume_level: 1.2 })).volume).toBe(100);
  });
});

describe('pictureUrl', () => {
  const hassUrl = (path: string) => `https://ha.example${path}`;
  it("makes HA's proxy path absolute where hass can", () => {
    expect(pictureUrl('/api/media_player_proxy/x?token=1', hassUrl)).toBe('https://ha.example/api/media_player_proxy/x?token=1');
    expect(pictureUrl('/api/media_player_proxy/x', undefined)).toBe('/api/media_player_proxy/x');
  });
  it("keeps the player's own URLs", () => {
    expect(pictureUrl('https://i.scdn.co/image/1', hassUrl)).toBe('https://i.scdn.co/image/1');
    expect(pictureUrl('//cdn.example/1.jpg', hassUrl)).toBe('//cdn.example/1.jpg');
    expect(pictureUrl(undefined, hassUrl)).toBeNull();
    expect(pictureUrl('', hassUrl)).toBeNull();
  });
});

describe('playedAt', () => {
  const progress = { position: 60, duration: 240, updatedAt: 1_000_000 };
  it('moves on while playing, stands while paused', () => {
    expect(playedAt(progress, true, 1_000_000 + 60_000)).toBe(0.5);
    expect(playedAt(progress, false, 1_000_000 + 60_000)).toBe(0.25);
    expect(playedAt(progress, true, 1_000_000 + 600_000)).toBe(1);
  });
});

describe('calls', () => {
  it('pauses while playing, stops where it cannot pause, plays otherwise', () => {
    const view = viewOfMedia(player('playing', sonos));
    expect(playButton(view)).toBe('pause');
    expect(playButton({ ...view, canPause: false })).toBe('stop');
    expect(playButton({ ...view, canPause: false, canStop: false })).toBeNull();
    expect(playButton(viewOfMedia(player('paused', sonos)))).toBe('play');
    expect(playButton(viewOfMedia(player('buffering', sonos)))).toBe('pause');
    expect(playCall('pause')).toEqual({ service: 'media_pause', data: {} });
    expect(playCall('play')).toEqual({ service: 'media_play', data: {} });
  });

  it('sends the services of services.yaml', () => {
    expect(trackCall('next')).toEqual({ service: 'media_next_track', data: {} });
    expect(trackCall('previous')).toEqual({ service: 'media_previous_track', data: {} });
    expect(volumeCall(35)).toEqual({ service: 'volume_set', data: { volume_level: 0.35 } });
    expect(volumeCall(140)).toEqual({ service: 'volume_set', data: { volume_level: 1 } });
    expect(stepCall('up')).toEqual({ service: 'volume_up', data: {} });
    expect(muteCall(false)).toEqual({ service: 'volume_mute', data: { is_volume_muted: true } });
    expect(powerCall('turn_off')).toEqual({ service: 'turn_off', data: {} });
    expect(choiceCall('source', 'TV')).toEqual({ service: 'select_source', data: { source: 'TV' } });
    expect(choiceCall('soundMode', 'Movie')).toEqual({ service: 'select_sound_mode', data: { sound_mode: 'Movie' } });
  });
});
