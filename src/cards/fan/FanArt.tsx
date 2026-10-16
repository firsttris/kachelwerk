import { useId } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import { useSpin } from './useSpin';

interface FanArtProps {
  color: string;
  on: boolean;
  // 0 (still) to 1 (full speed)
  spin: number;
  reverse: boolean;
  oscillating: boolean;
}

// Three blades, each a curved leaf from the hub
const BLADE = 'M32 32 C 25 25, 23 12, 31 6.5 C 37.5 4, 41 11, 38 19 C 36.5 23.5, 34.5 28, 32 32 Z';

// The guard's spokes, every 30°
const SPOKES = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return `M ${32 + 8 * Math.cos(a)} ${32 + 8 * Math.sin(a)} L ${32 + 29 * Math.cos(a)} ${32 + 29 * Math.sin(a)}`;
}).join(' ');

// A pedestal fan: the blades turn with the speed (faster, then a blur),
// backwards in reverse, and the head sweeps from side to side while it
// oscillates
export const FanArt = ({ color, on, spin, reverse, oscillating }: FanArtProps) => {
  const effects = useEffects();
  const gradient = useId();
  const blades = useSpin<SVGGElement>(spin, reverse, on && effects.on);
  const blur = on && effects.on ? Math.min(0.32, spin * 0.3 * effects.k) : 0;
  return (
    <div aria-hidden className="pointer-events-none relative h-[76px] w-16 shrink-0 @max-[200px]:h-[64px] @max-[200px]:w-[54px]">
      {/* The stand */}
      <svg viewBox="0 0 64 16" className="absolute inset-x-0 bottom-0 h-auto w-full">
        <rect x="29.5" y="-4" width="5" height="14" rx="2" className="fill-zinc-300 dark:fill-zinc-600" />
        <ellipse cx="32" cy="12.5" rx="15" ry="3" className="fill-zinc-300 dark:fill-zinc-600" />
      </svg>
      <div className={cn('absolute inset-x-0 top-0 aspect-square', on && oscillating && effects.on && 'fx-oscillate')}>
        <svg viewBox="0 0 64 64" className="size-full overflow-visible">
          <defs>
            <radialGradient id={gradient} cx="32" cy="32" r="28" gradientUnits="userSpaceOnUse">
              <stop offset="0.2" stopColor={color} stopOpacity="0.95" />
              <stop offset="1" stopColor={color} stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="29.5" className="fill-muted" />
          {/* The blades, a disc of air when they turn fast */}
          <circle cx="32" cy="32" r="27" fill={color} opacity={blur} className="transition-opacity duration-700" />
          <g ref={blades}>
            {[0, 120, 240].map((turn) => (
              <path
                key={turn}
                d={BLADE}
                transform={`rotate(${turn} 32 32)`}
                fill={on ? `url(#${gradient})` : undefined}
                className={cn('transition-[fill] duration-500', !on && 'fill-zinc-300 dark:fill-zinc-600')}
              />
            ))}
          </g>
          {/* The guard over them: rings and spokes */}
          <g fill="none" className="stroke-foreground/25" strokeWidth="1.1">
            <circle cx="32" cy="32" r="29.5" strokeWidth="2" />
            <circle cx="32" cy="32" r="20" />
            <path d={SPOKES} strokeWidth="0.8" />
          </g>
          <circle
            cx="32"
            cy="32"
            r="5"
            className="fill-card stroke-foreground/30"
            strokeWidth="1.5"
            style={on && effects.on ? { filter: `drop-shadow(0 0 ${3 * effects.k}px ${rgba(color, 0.8)})` } : undefined}
          />
        </svg>
      </div>
    </div>
  );
};
