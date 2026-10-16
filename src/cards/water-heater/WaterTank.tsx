import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import { waterColor } from './waterHeaterModel';

interface WaterTankProps {
  label: string;
  // The water's temperature and the target on the tank's scale, 0..1
  level: number | null;
  mark: number | null;
  // How warm the water is, 0..1, for its color
  warmth: number | null;
  heating: boolean;
  hot: boolean;
  // For the meter's value
  current: number | null;
  valueText: string;
  min: number;
  max: number;
  // Its place in the tile's grid
  className?: string;
}

// The water fills the tank up to here at most: above it the steam rises
const FULL = 0.8;
const ELEMENT = '#FB923C';

// The heating element at the bottom: a coil that glows while it heats
const COIL = 'M2 7 C5 7 5 1 8 1 S11 7 14 7 S17 1 20 1 S23 7 26 7 S29 1 32 1 S35 7 38 7';

// A hot water tank as a meter: the water rises with its temperature, from
// cold blue below to the warm color of its temperature at the top; a dashed
// line where the target is. While it heats, the coil at the bottom glows and
// bubbles rise; hot water steams.
export const WaterTank = ({ label, level, mark, warmth, heating, hot, current, valueText, min, max, className }: WaterTankProps) => {
  const effects = useEffects();
  const fill = (level ?? 0) * FULL;
  const warm = warmth ?? 0;
  return (
    // biome-ignore lint/a11y/useSemanticElements: drawn by the app; the native meter draws itself
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current ?? undefined}
      aria-valuetext={valueText}
      className={cn(
        'relative isolate w-16 shrink-0 self-stretch overflow-hidden rounded-[20px] border-[3px] border-zinc-300 bg-zinc-100 @max-[300px]:w-12 @max-[220px]:w-11 dark:border-zinc-700 dark:bg-zinc-800',
        className,
      )}
    >
      {/* The cold water below the warm */}
      <div className="absolute inset-x-0 bottom-0 h-[80%] bg-sky-500/10 dark:bg-sky-400/10" />
      {level !== null && (
        <div
          className="absolute inset-x-0 bottom-0 transition-[height,background] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            height: `${fill * 100}%`,
            background: `linear-gradient(to top, ${waterColor(0, 0.6)}, ${waterColor(warm * 0.5, 0.8)} 45%, ${waterColor(warm)})`,
          }}
        >
          {/* The surface, a little lighter */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/35" />
        </div>
      )}
      {/* Steam rising off hot water */}
      {effects.on &&
        hot &&
        [22, 52].map((left, i) => (
          <svg
            aria-hidden="true"
            key={left}
            viewBox="0 0 8 24"
            className="fx-heat absolute h-5 w-2"
            style={{ left: `${left}%`, bottom: `${fill * 100 - 4}%`, animationDelay: `${i * 1.1}s` }}
          >
            <path
              d="M4 23 C0 19 8 15 4 11 S0 3 4 1"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="stroke-zinc-400 dark:stroke-zinc-300"
              strokeOpacity={0.5 + 0.25 * effects.k}
            />
          </svg>
        ))}
      {/* The target */}
      {mark !== null && (
        <div
          className="absolute inset-x-1 border-t-[1.5px] border-dashed border-foreground/45 transition-[bottom] duration-500"
          style={{ bottom: `${mark * FULL * 100}%` }}
        />
      )}
      {/* Bubbles off the element while it heats */}
      {effects.on &&
        heating &&
        [30, 58, 44].map((left, i) => (
          <span
            key={left}
            className="fx-heat absolute bottom-2 size-1 rounded-full bg-white/70"
            style={{ left: `${left}%`, animationDelay: `${i * 0.75}s`, animationDuration: '2.2s' }}
          />
        ))}
      {/* The heating element */}
      <svg aria-hidden viewBox="0 0 40 8" className="absolute inset-x-[16%] bottom-1.5 h-2 overflow-visible" fill="none">
        <path
          d={COIL}
          strokeWidth="2"
          strokeLinecap="round"
          className={cn(
            'transition-[stroke] duration-500',
            heating ? 'stroke-orange-400' : 'stroke-zinc-400 dark:stroke-zinc-500',
            heating && effects.on && 'fx-breathe',
          )}
          style={
            heating && effects.on ? { filter: `drop-shadow(0 0 ${2 + 2 * effects.k}px ${rgba(ELEMENT, 0.9)})` } : undefined
          }
        />
      </svg>
      {/* The tank's sheen */}
      <div className="pointer-events-none absolute inset-y-2 left-1.5 w-1.5 rounded-full bg-white/40 dark:bg-white/10" />
    </div>
  );
};
