import { useId } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import type { Tone } from './alarmModel';
import { stateIcon, TONE_COLOR } from './modes';

const OUTLINE = 'M24 3 L43 10 V26 C43 39 35 48 24 53 C13 48 5 39 5 26 V10 Z';

// The panel as a shield: an outline with a tint while disarmed, filled
// while armed. On the way (arming, pending) its edge runs out like a
// countdown; triggered, it glows red with waves spreading from it.
export const Shield = ({ state, tone }: { state: string; tone: Tone }) => {
  const effects = useEffects();
  const gradient = useId();
  const color = TONE_COLOR[tone];
  const Icon = stateIcon(state);
  const filled = tone === 'armed' || tone === 'triggered';
  const busy = tone === 'busy';
  const glow = effects.on && tone !== 'disarmed' && tone !== 'unknown';
  return (
    <div aria-hidden className="relative flex size-14 shrink-0 items-center justify-center">
      {effects.on &&
        tone === 'triggered' &&
        [0, 0.6, 1.2].map((delay) => (
          <span
            key={delay}
            className="fx-wave absolute inset-0 rounded-full border-2"
            style={{ borderColor: rgba(color, 0.55), animationDelay: `${delay}s` }}
          />
        ))}
      <svg
        viewBox="0 0 48 56"
        className="relative h-14 w-12 transition-[filter] duration-500"
        style={glow ? { filter: `drop-shadow(0 0 ${7 * effects.k}px ${rgba(color, 0.5 * effects.k)})` } : undefined}
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={filled ? 0.8 : 0.22} />
            <stop offset="1" stopColor={color} stopOpacity={filled ? 1 : 0.1} />
          </linearGradient>
        </defs>
        <path d={OUTLINE} fill={`url(#${gradient})`} className="transition-[fill] duration-500" />
        {/* The edge: whole, or running out while the panel counts down */}
        <path
          d={OUTLINE}
          fill="none"
          stroke={color}
          strokeOpacity={busy ? 0.25 : 1}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {busy && (
          <path
            d={OUTLINE}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            className={cn(effects.on && 'fx-drain')}
          />
        )}
      </svg>
      <span
        className={cn(
          'absolute top-[15px] left-1/2 flex -translate-x-1/2 [&_svg]:size-[22px]',
          filled ? 'text-white' : '',
          tone === 'triggered' && effects.on && 'fx-pulse',
        )}
        style={filled ? undefined : { color }}
      >
        <Icon />
      </span>
    </div>
  );
};
