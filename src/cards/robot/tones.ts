import { m } from '../../i18n/messages';
import type { RobotActivity, RobotKind } from './robotModel';

// The color of what the robot does: sky blue for a vacuum at work, green
// for a mower, amber paused, red on an error, grey docked or idle
type Tone = 'work' | 'paused' | 'error' | 'rest';

const toneOf: Record<RobotActivity, Tone> = {
  working: 'work',
  returning: 'work',
  paused: 'paused',
  error: 'error',
  docked: 'rest',
  idle: 'rest',
  unknown: 'rest',
};

const COLORS: Record<RobotKind, Record<Tone, string>> = {
  vacuum: { work: '#0ea5e9', paused: '#f59e0b', error: '#ef4444', rest: '#a1a1aa' },
  mower: { work: '#65a30d', paused: '#f59e0b', error: '#ef4444', rest: '#a1a1aa' },
};

const TEXTS: Record<RobotKind, Record<Tone, string>> = {
  vacuum: {
    work: 'text-sky-700 dark:text-sky-300',
    paused: 'text-amber-700 dark:text-amber-300',
    error: 'text-red-600 dark:text-red-400',
    rest: 'text-muted-foreground',
  },
  mower: {
    work: 'text-lime-700 dark:text-lime-300',
    paused: 'text-amber-700 dark:text-amber-300',
    error: 'text-red-600 dark:text-red-400',
    rest: 'text-muted-foreground',
  },
};

export const colorOf = (kind: RobotKind, activity: RobotActivity) => COLORS[kind][toneOf[activity]];
export const textOf = (kind: RobotKind, activity: RobotActivity) => TEXTS[kind][toneOf[activity]];

// What it does, in words
const ACTIVITY: Record<RobotActivity, (kind: RobotKind) => string> = {
  working: (kind) => (kind === 'mower' ? m.ROBOT_MOWING() : m.ROBOT_CLEANING()),
  docked: () => m.ROBOT_DOCKED(),
  idle: () => m.ROBOT_IDLE(),
  paused: () => m.ROBOT_PAUSED(),
  returning: () => m.ROBOT_RETURNING(),
  error: () => m.ROBOT_ERROR(),
  unknown: () => m.ROBOT_UNKNOWN(),
};

export const activityText = (kind: RobotKind, activity: RobotActivity) => ACTIVITY[activity](kind);

// A fan speed as the integration names it ("turbo", "max_plus"), readable
export const speedText = (speed: string) => {
  const words = speed.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};
