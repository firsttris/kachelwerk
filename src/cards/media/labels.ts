import { m } from '../../i18n/messages';

// The player's state (MediaPlayerState in media_player/const.py) as the
// status line says it; a state HA doesn't know yet as it is
const STATE_TEXT: Record<string, () => string> = {
  playing: m.MEDIA_PLAYING,
  paused: m.MEDIA_PAUSED,
  idle: m.MEDIA_IDLE,
  on: m.ON,
  off: m.OFF,
  standby: m.MEDIA_STANDBY,
  buffering: m.MEDIA_BUFFERING,
  unavailable: m.UNREACH,
};

export const stateText = (state: string) => STATE_TEXT[state]?.() ?? state;

// The violet of a player at work: text, the play button, the volume bar
export const VIOLET = '#8b5cf6';
export const VIOLET_RGB: [number, number, number] = [139, 92, 246];
