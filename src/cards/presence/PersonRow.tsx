import HouseIcon from '~icons/lucide/house';
import MapPinIcon from '~icons/lucide/map-pin';
import NavigationIcon from '~icons/lucide/navigation';
import CircleHelpIcon from '~icons/lucide/circle-help';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { numberFormat } from '../../lib/format';
import { cn } from '../../lib/utils';
import { durationSince, type PersonView, type Whereabouts } from './presenceModel';

// The circles behind the initials, one per person (presenceModel.colorOf)
const AVATAR = [
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-fuchsia-500',
  'bg-lime-600',
];

const HOME_COLOR = '#10b981';

const LOOK: Record<Whereabouts, { icon: ComponentChildren; text: string; row: string; dot?: string }> = {
  home: {
    icon: <HouseIcon />,
    text: 'text-emerald-700 dark:text-emerald-300',
    row: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    dot: 'bg-emerald-500',
  },
  zone: {
    icon: <MapPinIcon />,
    text: 'text-sky-700 dark:text-sky-300',
    row: 'bg-muted/50 hover:bg-accent',
    dot: 'bg-sky-500',
  },
  away: {
    icon: <NavigationIcon />,
    text: 'text-muted-foreground',
    row: 'bg-muted/50 hover:bg-accent',
    dot: 'bg-zinc-400 dark:bg-zinc-500',
  },
  unknown: { icon: <CircleHelpIcon />, text: 'text-muted-foreground', row: 'bg-muted/50 hover:bg-accent' },
};

const placeText = (person: PersonView) =>
  person.where === 'home'
    ? m.PERSON_HOME()
    : person.where === 'away'
      ? m.PERSON_AWAY()
      : person.where === 'zone'
        ? (person.place ?? '')
        : m.PERSON_UNKNOWN();

export const sinceText = (since: Date, now: Date) => {
  const duration = durationSince(since, now);
  if (!duration) return m.PERSON_JUST_NOW();
  const time = numberFormat({ style: 'unit', unit: duration.unit, unitDisplay: 'short' }).format(duration.value);
  return m.PERSON_SINCE({ time });
};

const Avatar = ({ person }: { person: PersonView }) => {
  const effects = useEffects();
  const home = person.where === 'home';
  const look = LOOK[person.where];
  // Coming home: a ring spreads from the picture once
  const [arrived, setArrived] = useState(0);
  const previous = useRef(person.where);
  useEffect(() => {
    if (person.where === 'home' && previous.current !== 'home') setArrived((n) => n + 1);
    previous.current = person.where;
  }, [person.where]);
  return (
    <span className="relative size-9 shrink-0" aria-hidden>
      {arrived > 0 && effects.on && (
        <span key={arrived} className="fx-arrive absolute inset-0 rounded-full border-2 border-emerald-500" />
      )}
      <span
        className={cn(
          'flex size-full items-center justify-center overflow-hidden rounded-full text-[13px] font-semibold text-white transition-[filter,opacity,box-shadow] duration-500',
          !person.picture && AVATAR[person.color],
          home ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-card' : 'opacity-75 saturate-50',
        )}
        style={home && effects.on ? { boxShadow: `0 0 ${12 * effects.k}px ${rgba(HOME_COLOR, 0.5 * effects.k)}` } : undefined}
      >
        {person.picture ? <img src={person.picture} alt="" className="size-full object-cover" /> : person.initials}
      </span>
      {look.dot && (
        <span className={cn('absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card', look.dot)} />
      )}
    </span>
  );
};

// One person: picture or initials, name, where they are and since when.
// A tap opens HA's more-info dialog (map and history).
export const PersonRow = ({ person, now, onTap }: { person: PersonView; now: Date; onTap?: () => void }) => {
  const look = LOOK[person.where];
  const place = placeText(person);
  const since = person.since ? sinceText(person.since, now) : null;
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onTap}
        aria-label={[person.name, place, since].filter(Boolean).join(', ')}
        className={cn(
          'press flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left @max-[240px]:gap-2 @max-[240px]:px-2',
          look.row,
          person.unavailable && 'opacity-50',
        )}
      >
        <Avatar person={person} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm leading-snug font-medium">{person.name}</span>
          {/* Narrow: the time on a line of its own */}
          <span className="flex min-w-0 items-center gap-x-1 text-[13px] leading-snug @max-[240px]:flex-col @max-[240px]:items-start">
            <span className={cn('flex min-w-0 items-center gap-1 font-medium [&_svg]:size-3.5 [&_svg]:shrink-0', look.text)}>
              {look.icon}
              <span className="truncate">{place}</span>
            </span>
            {since && (
              <span className="max-w-full truncate text-muted-foreground @max-[240px]:text-xs">
                <span className="@max-[240px]:hidden">· </span>
                {since}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
};
