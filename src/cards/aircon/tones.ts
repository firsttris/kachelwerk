import type { Tone } from './airconModel';

// The colors of the modes: the air (and the glow) as hex, the active mode
// button and the status line as Tailwind classes
export const TONE_COLOR: Record<Tone, string> = {
  cool: '#38BDF8',
  heat: '#FB923C',
  dry: '#2DD4BF',
  fan: '#94A3B8',
  range: '#A78BFA',
  auto: '#34D399',
  off: '#A1A1AA',
};

export const TONE_ACTIVE: Record<Tone, string> = {
  cool: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  heat: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
  dry: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
  fan: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',
  range: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
  auto: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  off: 'bg-muted text-muted-foreground',
};

export const TONE_TEXT: Record<Tone, string> = {
  cool: 'text-sky-700 dark:text-sky-300',
  heat: 'text-orange-700 dark:text-orange-300',
  dry: 'text-teal-700 dark:text-teal-300',
  fan: 'text-slate-600 dark:text-slate-300',
  range: 'text-violet-700 dark:text-violet-300',
  auto: 'text-emerald-700 dark:text-emerald-300',
  off: 'text-muted-foreground',
};
