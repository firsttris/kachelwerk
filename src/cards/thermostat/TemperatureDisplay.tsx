import { useEffect, useRef, useState } from 'preact/hooks';
import AppWindowIcon from '~icons/lucide/app-window';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { formatTemperature } from '../../lib/format';

interface TemperatureDisplayProps {
  localTarget: number;
  currentTemperature: number;
  humidity?: number;
  windowOpen: boolean;
  color: string;
}

// Counts changes of a value, to restart an animation on each one
const useChangeCount = (value: number) => {
  const [count, setCount] = useState(0);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      setCount((c) => c + 1);
    }
  }, [value]);
  return count;
};

export const TemperatureDisplay = ({
  localTarget,
  currentTemperature,
  humidity,
  windowOpen,
  color,
}: TemperatureDisplayProps) => {
  const effects = useEffects();
  const changes = useChangeCount(localTarget);
  return (
    // Sized by the dial (cqw: % of its width), so it stays inside the arc on a narrow card
    <div className="pointer-events-none absolute inset-x-[15%] top-[17%] flex flex-col items-center">
      {/* Only while a window is open; the space stays, so nothing jumps */}
      {windowOpen ? (
        <AppWindowIcon
          role="img"
          aria-label={m.WINDOW_OPEN()}
          className={cn('size-5 text-blue-500 dark:text-blue-400', effects.on && 'fx-pulse')}
        />
      ) : (
        <span className="h-5" />
      )}
      <div
        key={effects.on ? changes % 2 : 0}
        className={cn(
          'mt-0.5 text-[clamp(30px,21cqw,46px)] leading-none font-semibold tracking-[-0.04em] tabular-nums',
          effects.on && changes > 0 && (changes % 2 ? 'fx-rise-a' : 'fx-rise-b'),
        )}
        style={effects.on ? { textShadow: `0 0 ${18 * effects.k}px ${color}59` } : undefined}
      >
        {formatTemperature(localTarget)}
        <span className="ml-0.5 align-top text-[clamp(13px,8cqw,18px)] font-medium text-muted-foreground">°C</span>
      </div>
      <div className="my-1.5 h-px w-8 bg-border" />
      <div className="flex max-w-full gap-[clamp(8px,6cqw,16px)]">
        <div className="flex min-w-0 flex-col items-center">
          <span className="text-[clamp(12px,6.4cqw,14px)] font-medium tabular-nums">{formatTemperature(currentTemperature)}°</span>
          <span className="max-w-full truncate text-[clamp(8px,4.5cqw,10px)] tracking-[0.04em] text-muted-foreground uppercase">{m.ACTUAL()}</span>
        </div>
        {humidity !== undefined && humidity > 0 && (
          <div className="flex min-w-0 flex-col items-center">
            <span className="text-[clamp(12px,6.4cqw,14px)] font-medium tabular-nums">{humidity} %</span>
            <span className="max-w-full truncate text-[clamp(8px,4.5cqw,10px)] tracking-[0.04em] text-muted-foreground uppercase">{m.HUMIDITY()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
