import { useId } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import type { HumidifierKind } from './humidifierModel';

interface HumidifierArtProps {
  kind: HumidifierKind;
  color: string;
  on: boolean;
  // Mist rises (humidifier) or drops fall into the tank (dehumidifier)
  working: boolean;
}

// The puffs of mist: where they start across the nozzle, how far they drift
const PUFFS = [
  { x: -2, drift: -4, delay: 0 },
  { x: 2, drift: 4, delay: -0.7 },
  { x: 0, drift: -1, delay: -1.4 },
  { x: 1, drift: 2, delay: -2.1 },
];

const Led = ({ x, y, color, on }: { x: number; y: number; color: string; on: boolean }) => {
  const effects = useEffects();
  return (
    <circle
      cx={x}
      cy={y}
      r="1.6"
      fill={on ? color : 'currentColor'}
      opacity={on ? 1 : 0.25}
      style={on && effects.on ? { filter: `drop-shadow(0 0 ${2.5 * effects.k}px ${rgba(color, 0.9)})` } : undefined}
    />
  );
};

// An ultrasonic humidifier: a tank with water, mist rising from its nozzle
const Mist = ({ color, on, working }: Omit<HumidifierArtProps, 'kind'>) => {
  const effects = useEffects();
  const clip = useId();
  return (
    <>
      <svg viewBox="0 0 64 76" className="absolute inset-0 size-full overflow-visible">
        <defs>
          <clipPath id={clip}>
            <rect x="22" y="44" width="20" height="21" rx="5" />
          </clipPath>
        </defs>
        <rect x="22" y="25" width="20" height="9" rx="4.5" className="fill-zinc-200 dark:fill-zinc-600" />
        <rect x="28" y="26.5" width="8" height="2.6" rx="1.3" className="fill-zinc-400 dark:fill-zinc-800" />
        <rect x="15" y="31" width="34" height="42" rx="11" className="fill-card stroke-foreground/20" strokeWidth="1.5" />
        {/* The tank's window, with its water */}
        <rect x="22" y="44" width="20" height="21" rx="5" className="fill-muted" />
        <rect
          x="22"
          y="51"
          width="20"
          height="14"
          clipPath={`url(#${clip})`}
          fill={color}
          opacity={on ? 0.45 : 0.2}
          className="transition-opacity duration-500"
        />
        <Led x={32} y={38} color={color} on={on} />
      </svg>
      {working &&
        PUFFS.map(({ x, drift, delay }) => (
          <span
            key={delay}
            className={cn('absolute top-[20%] left-1/2 size-3.5 rounded-full blur-[3px]', effects.on ? 'fx-mist' : 'opacity-50')}
            style={{
              marginLeft: `${x}px`,
              background: rgba(color, effects.on ? Math.min(0.85, 0.5 * effects.k) : 0.5),
              '--drift': `${drift}px`,
              animationDelay: `${delay}s`,
              transform: effects.on ? undefined : 'translate(-50%, -6px)',
            }}
          />
        ))}
    </>
  );
};

// A dehumidifier: a cabinet with its intake grille; drops fall into the
// tank below while it dries
const Drops = ({ color, on, working }: Omit<HumidifierArtProps, 'kind'>) => {
  const effects = useEffects();
  const clip = useId();
  return (
    <svg viewBox="0 0 64 76" className="absolute inset-0 size-full overflow-visible">
      <defs>
        <clipPath id={clip}>
          <rect x="20" y="45" width="24" height="21" rx="4" />
        </clipPath>
      </defs>
      <rect x="13" y="12" width="38" height="61" rx="8" className="fill-card stroke-foreground/20" strokeWidth="1.5" />
      <g className="stroke-foreground/25" strokeWidth="1.6" strokeLinecap="round">
        <path d="M21 20 H43 M21 25 H43 M21 30 H43" />
      </g>
      <Led x={43} y={38} color={color} on={on} />
      <rect x="20" y="45" width="24" height="21" rx="4" className="fill-muted" />
      <rect x="20" y="58" width="24" height="8" clipPath={`url(#${clip})`} fill={color} opacity={on ? 0.5 : 0.22} />
      {working &&
        [
          { x: 29, delay: 0 },
          { x: 35, delay: -0.8 },
        ].map(({ x, delay }) => (
          <path
            key={x}
            d={`M ${x} 46.5 c -1.6 2.4 -2.2 3.4 -2.2 4.4 a 2.2 2.2 0 0 0 4.4 0 c 0 -1 -0.6 -2 -2.2 -4.4 Z`}
            fill={color}
            className={effects.on ? 'fx-drip' : undefined}
            style={{ transformBox: 'fill-box', animationDelay: `${delay}s`, opacity: effects.on ? undefined : 0.8 }}
          />
        ))}
    </svg>
  );
};

// The picture of the humidifier tile, as big as the fan's
export const HumidifierArt = ({ kind, ...props }: HumidifierArtProps) => (
  <div
    aria-hidden
    className="pointer-events-none relative h-[76px] w-16 shrink-0 text-foreground @max-[200px]:h-[64px] @max-[200px]:w-[54px]"
  >
    {kind === 'dehumidifier' ? <Drops {...props} /> : <Mist {...props} />}
  </div>
);
