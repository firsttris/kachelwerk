import { useEffect, useRef, useState } from 'preact/hooks';
import ArrowUpIcon from '~icons/lucide/arrow-up-to-line';
import ArrowDownIcon from '~icons/lucide/arrow-down-to-line';
import WindIcon from '~icons/lucide/wind';
import SquareIcon from '~icons/lucide/square';
import { HoldButton } from '../../components/Gestures';
import { Tile, type TileStatus } from '../../components/Tile';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { type DoorState, VENTILATION } from './garageModel';

export interface GarageDoorProps {
  name: string;
  state: DoorState;
  // Where the door is moving (1 open, 0 closed), as the drive reports it
  movingTo: number | null;
  canVentilate: boolean;
  status?: TileStatus;
  onOpen: () => void;
  onClose: () => void;
  onVentilate: () => void;
  onStop: () => void;
  onName?: () => void;
}

// How far the door is drawn open (share of the opening)
const openShare: Record<DoorState, number> = {
  CLOSED: 0,
  OPEN: 1,
  VENTILATION_POSITION: VENTILATION / 100,
  POSITION_UNKNOWN: 0.5,
};

const button =
  'press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border bg-background/60 text-[13px] font-medium hover:bg-accent [&_svg]:size-4';

// MUI's GarageDoorControl: a garage whose sectional door rolls up to the
// reported position. Opening has to be held; closing, ventilation and stop
// are taps.
export const GarageDoor = ({
  name,
  state,
  movingTo,
  canVentilate,
  status,
  onOpen,
  onClose,
  onVentilate,
  onStop,
  onName,
}: GarageDoorProps) => {
  const effects = useEffects();
  // After a command the door is drawn moving towards its target, until HA
  // reports the drive moving or 20 s pass
  const [target, setTarget] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new state drops the drawn target
  useEffect(() => setTarget(null), [state]);

  const send = (action: () => void, drawTo: number | null) => {
    action();
    setTarget(drawTo);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTarget(null), 20000);
  };

  const goingTo = movingTo ?? target;
  const share = goingTo ?? openShare[state];
  const label =
    goingTo !== null
      ? goingTo > openShare[state] || (goingTo === 1 && state !== 'OPEN')
        ? m.GARAGE_OPENING()
        : m.GARAGE_CLOSING()
      : state === 'OPEN'
        ? m.GARAGE_OPEN()
        : state === 'CLOSED'
          ? m.GARAGE_CLOSED()
          : state === 'VENTILATION_POSITION'
            ? m.GARAGE_VENTILATION()
            : m.GARAGE_UNKNOWN();
  const open = state !== 'CLOSED';

  return (
    <Tile status={status} role="group" aria-label={name}>
      {/* Wide: the hold button beside the garage, under its name. Narrow:
          below it, across the tile. */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-2 p-3.5 [grid-template-areas:'pic_info'_'pic_hold'_'row_row'] @max-[339px]:[grid-template-areas:'pic_info'_'hold_hold'_'row_row']">
        <div aria-hidden className="relative h-[120px] w-[132px] shrink-0 [grid-area:pic] @max-[339px]:h-[96px] @max-[339px]:w-[106px] @max-[239px]:[zoom:0.7]">
          {/* Roof and walls */}
          <div className="absolute inset-x-0 top-0 h-7 bg-zinc-300 [clip-path:polygon(50%_0,100%_100%,0_100%)] dark:bg-zinc-700" />
          <div className="absolute inset-x-1.5 top-7 bottom-0 rounded-b-md bg-zinc-200 dark:bg-zinc-800" />
          {/* The opening: dark inside, a lamp lights up when open */}
          <div className="absolute inset-x-4 top-10 bottom-0 overflow-hidden rounded-t-sm bg-zinc-900">
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                background: 'radial-gradient(70% 60% at 50% 0%, rgba(253,230,138,0.55), transparent 75%)',
                opacity: effects.on && open ? Math.min(1, effects.k) : 0,
              }}
            />
            {/* Sectional door with its panels */}
            <div
              className="absolute inset-x-0 top-0 bg-[repeating-linear-gradient(180deg,#d4d4d8_0_15px,#a1a1aa_15px_17px)] transition-[height] duration-[1500ms] ease-in-out dark:bg-[repeating-linear-gradient(180deg,#52525b_0_15px,#3f3f46_15px_17px)]"
              style={{ height: `${(1 - share) * 100}%` }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-500" />
            </div>
          </div>
        </div>
        <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-1 self-start text-left [grid-area:info]">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={name}>
            {name}
          </span>
          <span
            role="status"
            className={cn(
              'text-[13px] font-medium',
              goingTo !== null || state === 'OPEN'
                ? 'text-amber-700 dark:text-amber-300'
                : state === 'CLOSED'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
        </button>
        {state !== 'OPEN' && (
          <div className="flex flex-col self-end [grid-area:hold]">
            <HoldButton
              label={m.GARAGE_OPEN_ACTION()}
              hint={m.HOLD_TO_CONFIRM()}
              icon={<ArrowUpIcon />}
              onConfirm={() => send(onOpen, 1)}
            />
          </div>
        )}
        <div className="flex gap-2 [grid-area:row]">
          <button type="button" className={button} onClick={() => send(onClose, 0)}>
            <ArrowDownIcon />
            {/* Very narrow, only the icon shows (the text stays its name) */}
            <span className="@max-[239px]:sr-only">{m.GARAGE_CLOSE_ACTION()}</span>
          </button>
          {canVentilate && (
            <button type="button" className={button} onClick={() => send(onVentilate, VENTILATION / 100)}>
              <WindIcon />
              <span className="@max-[239px]:sr-only">{m.GARAGE_VENTILATE()}</span>
            </button>
          )}
          <button
            type="button"
            className={cn(button, 'max-w-12')}
            aria-label={m.BLIND_STOP()}
            title={m.BLIND_STOP()}
            onClick={() => send(onStop, null)}
          >
            <SquareIcon className="fill-current !size-3.5" />
          </button>
        </div>
      </div>
    </Tile>
  );
};
