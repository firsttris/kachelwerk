import { useId } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';

interface AirconUnitProps {
  color: string;
  // Air comes out (hvac_action cooling, heating, drying, fan)
  blowing: boolean;
  off: boolean;
  // How fast the air flows (by the fan speed), 1 is normal
  pace: number;
  // The louvre swings
  swing: boolean;
}

// The streams fan out from the outlet: start and end across the width
const STREAMS = [
  [24, 8],
  [40, 32],
  [56, 54],
  [72, 76],
  [88, 98],
  [104, 122],
].map(([from, to]) => `M ${from} 0 C ${from} 14, ${to} 20, ${to} 40`);

// The indoor unit of a split air conditioner: a white box with its outlet
// and LED; the air streams out below in the mode's color while it runs
export const AirconUnit = ({ color, blowing, off, pace, swing }: AirconUnitProps) => {
  const gradient = useId();
  const effects = useEffects();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center">
      <div className="relative h-8 w-[84%] max-w-[230px] rounded-[12px] border bg-gradient-to-b from-card to-muted shadow-sm">
        {/* The outlet: the flap opens while the unit runs */}
        <div className="absolute inset-x-3 bottom-1 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            className={cn(
              'h-full origin-top rounded-full bg-foreground/25 transition-transform duration-700',
              off ? 'scale-y-100' : 'scale-y-[0.35]',
            )}
          />
        </div>
        <span
          className="absolute top-2 right-3 size-1.5 rounded-full transition-colors duration-500"
          style={{
            background: off ? 'var(--muted-foreground)' : color,
            opacity: off ? 0.35 : 1,
            boxShadow: !off && effects.on ? `0 0 ${6 * effects.k}px ${rgba(color, 0.9)}` : undefined,
          }}
        />
      </div>
      {blowing && (
        <svg
          viewBox="0 0 128 40"
          preserveAspectRatio="none"
          className={cn('h-14 w-[76%] max-w-[210px] overflow-visible', effects.on && swing && 'fx-sway')}
          style={{ '--pace': String(pace) }}
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={color} stopOpacity={effects.on ? Math.min(1, 0.55 * effects.k + 0.2) : 0.45} />
              <stop offset="1" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {STREAMS.map((d, i) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={`url(#${gradient})`}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeDasharray="12 12"
              vectorEffect="non-scaling-stroke"
              className={effects.on ? 'fx-air' : undefined}
              // Each stream a little ahead of the next, so they don't pulse together
              style={{ animationDelay: `${-((i * 0.53) % 1.5) / pace}s` }}
            />
          ))}
        </svg>
      )}
    </div>
  );
};
