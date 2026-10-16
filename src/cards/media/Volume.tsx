import VolumeIcon from '~icons/lucide/volume-2';
import VolumeLowIcon from '~icons/lucide/volume-1';
import MutedIcon from '~icons/lucide/volume-x';
import MinusIcon from '~icons/lucide/minus';
import PlusIcon from '~icons/lucide/plus';
import { snap, useSliderDrag } from '../../hooks/useSliderDrag';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { VIOLET_RGB } from './labels';

const STEP = 5;

export const round =
  'press flex size-11 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-accent disabled:opacity-40 [&_svg]:size-5';

// The volume as a bar to drag or tap, as the light's LevelBar: sent once on
// release, arrow keys in 5 % steps, a vertical swipe scrolls the page. The
// bar is 28 px, the area that takes the finger 44 px.
const VolumeBar = ({ label, value, muted, onChange }: { label: string; value: number; muted: boolean; onChange: (value: number) => void }) => {
  const { ref, shown, dragging, handlers, nudge } = useSliderDrag<HTMLDivElement>({
    value,
    axis: 'x',
    valueAt: (fraction) => snap(fraction * 100, 1),
    onCommit: onChange,
  });
  const [r, g, b] = VIOLET_RGB;
  const alpha = muted ? [0.18, 0.3] : [0.45, 0.95];
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      aria-valuetext={muted ? `${shown} % · ${m.MUTED()}` : `${shown} %`}
      {...handlers}
      onKeyDown={(event) => {
        const delta = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP }[event.key];
        if (!delta) return;
        event.preventDefault();
        nudge(Math.max(0, Math.min(100, shown + delta)));
      }}
      className="group flex h-11 min-w-0 flex-1 cursor-ew-resize touch-pan-y items-center outline-none"
    >
      <div className="relative h-7 w-full overflow-hidden rounded-full bg-muted group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full', !dragging && 'transition-[width,background] duration-500')}
          style={{
            width: `${Math.max(shown, shown > 0 ? 14 : 0)}%`,
            background: `linear-gradient(90deg, rgba(${r},${g},${b},${alpha[0]}), rgba(${r},${g},${b},${alpha[1]}))`,
          }}
        />
        <span
          className={cn(
            'absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold tabular-nums',
            shown > 0 && !muted ? 'text-violet-950 dark:text-white' : 'text-muted-foreground',
          )}
        >
          {shown} %
        </span>
      </div>
    </div>
  );
};

export interface VolumeProps {
  name: string;
  volume: number | null;
  muted: boolean;
  canSet: boolean;
  canStep: boolean;
  canMute: boolean;
  onVolume: (percent: number) => void;
  onStep: (direction: 'up' | 'down') => void;
  onMute: () => void;
}

// Mute, and the bar (volume_set) or − and + (volume_up/down) where the
// player can only step
export const Volume = ({ name, volume, muted, canSet, canStep, canMute, onVolume, onStep, onMute }: VolumeProps) => {
  const bar = canSet && volume !== null;
  const steps = !bar && canStep;
  if (!bar && !steps && !canMute) return null;
  const Icon = muted ? MutedIcon : volume !== null && volume < 40 ? VolumeLowIcon : VolumeIcon;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      {canMute ? (
        <button
          type="button"
          onClick={onMute}
          aria-pressed={muted}
          aria-label={muted ? m.UNMUTE() : m.MUTE()}
          title={muted ? m.UNMUTE() : m.MUTE()}
          className={cn(round, '-ml-1.5', muted && 'text-violet-600 dark:text-violet-300')}
        >
          <Icon />
        </button>
      ) : (
        <span aria-hidden className="-ml-1.5 flex size-11 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5">
          <Icon />
        </span>
      )}
      {bar && <VolumeBar label={m.VOLUME_OF({ name })} value={volume} muted={muted} onChange={onVolume} />}
      {steps && (
        <div className="flex flex-1 items-center justify-end gap-1">
          <button type="button" onClick={() => onStep('down')} aria-label={m.VOLUME_DOWN()} className={cn(round, 'border')}>
            <MinusIcon />
          </button>
          {volume !== null && (
            // On a phone the buttons keep the room
            <span className="min-w-10 text-center text-[13px] font-medium tabular-nums @max-[200px]:hidden">{volume} %</span>
          )}
          <button type="button" onClick={() => onStep('up')} aria-label={m.VOLUME_UP()} className={cn(round, 'border')}>
            <PlusIcon />
          </button>
        </div>
      )}
    </div>
  );
};
