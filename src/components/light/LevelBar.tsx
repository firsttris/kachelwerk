import { cn } from '../../lib/utils';
import { snap, useSliderDrag } from '../../hooks/useSliderDrag';
import { type RGB, WARM } from './PendantLamp';

const STEP = 5;

interface LevelBarProps {
  label: string;
  // 0..100
  value: number;
  onChange: (value: number) => void;
  color?: RGB;
  // The steps of the value (a fan's speeds): where a drag or a key lands,
  // and how far one key press goes; 5 % steps by default
  snapTo?: (value: number) => number;
  step?: number;
}

// Brightness as a bar to drag or tap; the new value is sent once on
// release, arrow keys change it in 5 % steps. A vertical swipe scrolls the
// page (touch-pan-y) and sends nothing (pointercancel).
export const LevelBar = ({
  label,
  value,
  onChange,
  color = WARM,
  snapTo = (v) => snap(v, STEP),
  step = STEP,
}: LevelBarProps) => {
  const { ref, shown, dragging, handlers, nudge } = useSliderDrag<HTMLDivElement>({
    value,
    axis: 'x',
    valueAt: (fraction) => snapTo(fraction * 100),
    onCommit: onChange,
  });
  const [r, g, b] = color;

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      aria-valuetext={`${shown} %`}
      {...handlers}
      onPointerDown={(event) => {
        event.stopPropagation();
        handlers.onPointerDown(event);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        const delta =
          event.key === 'ArrowRight' || event.key === 'ArrowUp'
            ? step
            : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
              ? -step
              : 0;
        if (!delta) return;
        event.preventDefault();
        nudge(snapTo(Math.max(0, Math.min(100, shown + delta))));
      }}
      className="relative h-7 cursor-ew-resize touch-pan-y overflow-hidden rounded-full bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full', !dragging && 'transition-[width] duration-500')}
        style={{
          width: `${Math.max(shown, shown > 0 ? 14 : 0)}%`,
          background: `linear-gradient(90deg, rgba(${r},${g},${b},0.45), rgba(${r},${g},${b},0.95))`,
        }}
      />
      <span
        className={cn(
          'absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold tabular-nums',
          shown > 0 ? 'text-black/75' : 'text-muted-foreground',
        )}
      >
        {shown} %
      </span>
    </div>
  );
};
