import LuggageIcon from '~icons/lucide/luggage';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { operationIcon, operationText } from './labels';

interface ModeBarProps {
  modes: string[];
  mode: string;
  // away_mode, null where the heater has none
  away: boolean | null;
  onMode: (mode: string) => void;
  onAway: (away: boolean) => void;
}

// One row while each segment gets 44 px, else two (or three) rows; by the
// card's width (the .kw container: 2 × 14 px padding and the border)
const WRAP: Record<number, string> = {
  3: '@max-[162px]:basis-[45%]',
  4: '@max-[206px]:basis-[45%]',
  5: '@max-[250px]:basis-[30%]',
  6: '@max-[294px]:basis-[30%]',
  7: '@max-[338px]:basis-[22%] @max-[206px]:basis-[30%]',
};

// The operation modes as segments (only the listed ones; each at least
// 44 px, so they wrap on a narrow card) and away mode as a chip beside them
export const ModeBar = ({ modes, mode, away, onMode, onAway }: ModeBarProps) => {
  const segments = modes.length > 1;
  if (!segments && away === null) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {segments && (
        <div
          role="group"
          aria-label={m.HVAC_MODE()}
          className="flex min-w-0 grow-[3] basis-[176px] flex-wrap overflow-hidden rounded-xl bg-muted"
        >
          {modes.map((value) => {
            const Icon = operationIcon(value);
            const active = value === mode;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onMode(value)}
                aria-pressed={active}
                aria-label={operationText(value)}
                title={operationText(value)}
                className={cn(
                  'press flex h-11 min-w-11 grow basis-0 items-center whitespace-nowrap justify-center rounded-xl text-muted-foreground hover:text-foreground [&_svg]:size-5',
                  WRAP[modes.length],
                  active && '@min-[360px]:basis-auto @min-[360px]:px-3 bg-orange-500/15 text-orange-600 hover:text-orange-600 dark:text-orange-300',
                )}
              >
                <Icon />
                {/* The active one named, where there is room */}
                {active && <span className="ml-1.5 hidden text-[13px] font-medium @min-[360px]:inline">{operationText(value)}</span>}
              </button>
            );
          })}
        </div>
      )}
      {away !== null && (
        <button
          type="button"
          onClick={() => onAway(!away)}
          aria-pressed={away}
          className={cn(
            'press flex h-11 grow items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium [&_svg]:size-4',
            away
              ? 'border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-300'
              : 'bg-background/60 text-muted-foreground hover:bg-accent',
          )}
        >
          <LuggageIcon />
          {m.PRESET_AWAY()}
        </button>
      )}
    </div>
  );
};
