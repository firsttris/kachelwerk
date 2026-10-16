import { Tile, type TileStatus } from '../../components/Tile';
import { litTileStyle, PendantLamp, WARM } from '../../components/light/PendantLamp';
import { useEffects } from '../../contexts/EffectsContext';
import { useHold } from '../../hooks/useHold';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { useStateChanges } from './useStateChanges';

export interface SwitchTileProps {
  name: string;
  on: boolean;
  // A lamp casts light, a socket gets a plug
  lamp: boolean;
  status?: TileStatus;
  onToggle: () => void;
  onHold?: () => void;
}

// A wall socket (Schuko): empty while off; on, a plug sits in it and current
// runs through its cable
const Socket = ({ on }: { on: boolean }) => {
  const effects = useEffects();
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-11 shrink-0 overflow-visible">
      {/* Cover plate and the round recess */}
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="9"
        className="fill-white stroke-zinc-300 dark:fill-zinc-200 dark:stroke-zinc-500"
        strokeWidth="1.5"
      />
      <circle
        cx="22"
        cy="22"
        r="14"
        className={cn(
          'transition-[fill] duration-500',
          on ? 'fill-emerald-100 dark:fill-emerald-200' : 'fill-zinc-100 dark:fill-zinc-300',
        )}
        stroke="currentColor"
        strokeOpacity="0.15"
        style={on && effects.on ? { filter: `drop-shadow(0 0 ${5 * effects.k}px rgba(16,185,129,0.7))` } : undefined}
      />
      {/* Earthing clips */}
      <rect x="20" y="8.5" width="4" height="2.5" rx="1" className="fill-zinc-400" />
      <rect x="20" y="33" width="4" height="2.5" rx="1" className="fill-zinc-400" />
      {on ? (
        <g>
          {/* The cable down to the device, current running through it */}
          <path
            d="M22 30 V50"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className="stroke-zinc-600 dark:stroke-zinc-400"
          />
          <path
            d="M22 30 V50"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 9"
            className={effects.on ? 'fx-flow' : undefined}
            style={{ animationDuration: '0.8s' }}
          />
          {/* The plug: its body with the grip */}
          <circle cx="22" cy="22" r="11.5" className="fill-zinc-700 dark:fill-zinc-500" />
          <circle cx="22" cy="22" r="8" fill="none" strokeWidth="1.5" className="stroke-zinc-500 dark:stroke-zinc-300" />
          <rect x="16" y="20.8" width="12" height="2.4" rx="1.2" className="fill-zinc-500 dark:fill-zinc-300" />
        </g>
      ) : (
        <g className="fill-zinc-500">
          <circle cx="16" cy="22" r="2.2" />
          <circle cx="28" cy="22" r="2.2" />
        </g>
      )}
    </svg>
  );
};

// MUI's SwitchControl: a switch as a pendant lamp that casts a cone of warm
// light and swings briefly, or as a wall socket with a plug
export const SwitchTile = ({ name, on, lamp, status, onToggle, onHold }: SwitchTileProps) => {
  const effects = useEffects();
  const { changes, external, markRequested } = useStateChanges(on);
  const hold = useHold(onHold);
  const state = on ? m.ON() : m.OFF();
  const toggle = hold.wrapClick(() => {
    markRequested(!on);
    onToggle();
  });

  if (!lamp) {
    return (
      <Tile
        status={status}
        lit={on}
        className={cn('min-h-32', on && 'border-emerald-500/40', effects.on && external && 'fx-flash')}
        style={
          on && effects.on
            ? {
                background: `radial-gradient(90% 80% at 50% 0%, rgba(16,185,129,${Math.min(1, 0.16 * effects.k)}), transparent 70%), var(--card)`,
                boxShadow: `0 12px 36px -14px rgba(16,185,129,${Math.min(1, 0.45 * effects.k)})`,
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={toggle}
          {...hold.handlers}
          aria-pressed={on}
          aria-label={`${name}: ${state}`}
          data-tile="switch"
          className="press relative flex flex-1 flex-col items-start justify-between gap-2 overflow-hidden px-3.5 pt-3.5 pb-3 text-left"
        >
          <span className="flex w-full items-center justify-between">
            <Socket on={on} />
            {/* A toggle switch, drawn: the knob slides over */}
            <span
              aria-hidden
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors duration-300',
                on ? 'bg-emerald-500' : 'bg-muted-foreground/25',
              )}
              style={on && effects.on ? { boxShadow: `0 0 ${12 * effects.k}px rgba(16,185,129,0.5)` } : undefined}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-300 ease-[cubic-bezier(.3,.8,.2,1)]',
                  on ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </span>
          </span>
          <span className="relative flex w-full min-w-0 flex-col gap-0.5">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium [overflow-wrap:anywhere]" title={name}>
              {name}
            </span>
            <span
              className={cn('text-[13px]', on ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground')}
            >
              {external ? m.AT_DEVICE({ state }) : state}
            </span>
          </span>
        </button>
      </Tile>
    );
  }

  return (
    <Tile
      status={status}
      lit={on}
      className={cn('min-h-32', effects.on && external && 'fx-flash')}
      style={litTileStyle(on ? 1 : 0, WARM, effects.on, effects.k)}
    >
      <button
        type="button"
        onClick={toggle}
        {...hold.handlers}
        aria-pressed={on}
        aria-label={`${name}: ${state}`}
        data-tile="light"
        className="press relative flex flex-1 flex-col items-start justify-end overflow-hidden px-3.5 pb-3 text-left"
      >
        <PendantLamp level={on ? 1 : 0} changes={changes} />
        <span className="relative flex w-full min-w-0 flex-col gap-0.5">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium [overflow-wrap:anywhere]" title={name}>
            {name}
          </span>
          <span className={cn('text-[13px]', on ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
            {external ? m.AT_DEVICE({ state }) : state}
          </span>
        </span>
      </button>
    </Tile>
  );
};
