import type { ComponentType } from 'preact';
import ShieldOffIcon from '~icons/lucide/shield-off';
import HouseIcon from '~icons/lucide/house';
import LockIcon from '~icons/lucide/lock';
import MoonIcon from '~icons/lucide/moon';
import PlaneIcon from '~icons/lucide/plane';
import ShieldHalfIcon from '~icons/lucide/shield-half';
import ShieldEllipsisIcon from '~icons/lucide/shield-ellipsis';
import SirenIcon from '~icons/lucide/siren';
import ShieldQuestionIcon from '~icons/lucide/shield-question-mark';
import { m } from '../../i18n/messages';
import type { Action, Mode, Tone } from './alarmModel';

// The icon of each mode (as HA's mdi:shield-home, shield-lock, shield-moon,
// shield-airplane, shield-half-full, shield-off in alarm_control_panel/icons.json)
export const MODE_ICON: Record<Mode, ComponentType> = {
  disarmed: ShieldOffIcon,
  armed_home: HouseIcon,
  armed_away: LockIcon,
  armed_night: MoonIcon,
  armed_vacation: PlaneIcon,
  armed_custom_bypass: ShieldHalfIcon,
};

// The icon in the shield for a state
export const stateIcon = (state: string): ComponentType => {
  if (state in MODE_ICON) return MODE_ICON[state as Mode];
  if (state === 'triggered') return SirenIcon;
  if (state === 'arming' || state === 'pending' || state === 'disarming') return ShieldEllipsisIcon;
  return ShieldQuestionIcon;
};

// The states (AlarmControlPanelState in const.py) in the tile's language
const STATES: Record<string, () => string> = {
  disarmed: m.ALARM_DISARMED,
  armed_home: m.ALARM_ARMED_HOME,
  armed_away: m.ALARM_ARMED_AWAY,
  armed_night: m.ALARM_ARMED_NIGHT,
  armed_vacation: m.ALARM_ARMED_VACATION,
  armed_custom_bypass: m.ALARM_ARMED_CUSTOM_BYPASS,
  arming: m.ALARM_ARMING,
  pending: m.ALARM_PENDING,
  disarming: m.ALARM_DISARMING,
  triggered: m.ALARM_TRIGGERED,
};

export const stateText = (state: string) => (Object.hasOwn(STATES, state) ? STATES[state]() : m.ALARM_UNKNOWN());

// What a button does
const ACTIONS: Record<Action, () => string> = {
  disarmed: m.ALARM_DISARM,
  armed_home: m.ALARM_ARM_HOME,
  armed_away: m.ALARM_ARM_AWAY,
  armed_night: m.ALARM_ARM_NIGHT,
  armed_vacation: m.ALARM_ARM_VACATION,
  armed_custom_bypass: m.ALARM_ARM_CUSTOM_BYPASS,
  trigger: m.ALARM_TRIGGER,
};

export const actionText = (action: Action) => ACTIONS[action]();

// The colors of the tones: the shield and glows as hex, the active button
// and the status line as Tailwind classes
export const TONE_COLOR: Record<Tone, string> = {
  disarmed: '#22C55E',
  armed: '#3B82F6',
  busy: '#F59E0B',
  triggered: '#EF4444',
  unknown: '#A1A1AA',
};

export const TONE_TEXT: Record<Tone, string> = {
  disarmed: 'text-green-700 dark:text-green-300',
  armed: 'text-blue-700 dark:text-blue-300',
  busy: 'text-amber-700 dark:text-amber-300',
  triggered: 'text-red-600 dark:text-red-400',
  unknown: 'text-muted-foreground',
};

export const TONE_ACTIVE: Record<Tone, string> = {
  disarmed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  armed: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  busy: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  triggered: 'bg-red-500/15 text-red-600 dark:text-red-400',
  unknown: 'bg-muted text-muted-foreground',
};

// The mode waiting for its code
export const TONE_RING: Record<Tone, string> = {
  disarmed: 'text-green-700 ring-green-500/70 dark:text-green-300',
  armed: 'text-blue-700 ring-blue-500/70 dark:text-blue-300',
  busy: 'text-amber-700 ring-amber-500/70 dark:text-amber-300',
  triggered: 'text-red-600 ring-red-500/70 dark:text-red-400',
  unknown: 'text-foreground ring-ring',
};
