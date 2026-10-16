import { useId } from 'preact/hooks';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import type { RobotActivity, RobotKind } from './robotModel';
import { RobotBody } from './RobotBody';

interface RobotSceneProps {
  kind: RobotKind;
  activity: RobotActivity;
  // The color of what it does (the LED, the glow)
  color: string;
  className?: string;
}

// The floor (or lawn) in a 120 × 84 box; the station at the top left. The
// robot drives its lanes from the station and back (ROUTES), the cleaned or
// mown stripe stays behind it (LANES). The keyframes in src/styles.css
// (fx-drive, fx-lanes) know these lengths: lanes 387, back home 51.
const LANES = 'M18 17 H102 V34 H18 V51 H102 V68 H18';
const LANES_LENGTH = 387;
// Shown when nothing moves (effects off, reduced motion): the robot 45 % on its lanes
const STILL = 0.45;
// Where the robot drives: its lanes while it works (paused, it stops where it
// is), home to the station while it returns (fx-home, once)
const ROUTES: Partial<Record<RobotActivity, { path: string; fx: string; at: number }>> = {
  working: { path: `${LANES} V17`, fx: 'fx-drive', at: STILL },
  paused: { path: `${LANES} V17`, fx: 'fx-drive', at: STILL },
  returning: { path: 'M66 51 H18 V17', fx: 'fx-home', at: 0 },
};
// Where a robot stands that doesn't drive, and where it looks (deg)
const STAND: Partial<Record<RobotActivity, [x: number, y: number, deg: number]>> = {
  docked: [18, 17, -90],
  idle: [60, 42, 0],
  error: [74, 51, 155],
  unknown: [60, 42, 0],
};

const DUST = [
  [34, 26],
  [71, 23],
  [92, 41],
  [48, 44],
  [27, 60],
  [83, 63],
  [61, 74],
];

const Floor = ({ kind, pattern }: { kind: RobotKind; pattern: string }) =>
  kind === 'vacuum' ? (
    <>
      <rect width="120" height="84" rx="10" className="fill-stone-200 dark:fill-stone-800" />
      {/* Floorboards */}
      <g className="stroke-stone-300/80 dark:stroke-stone-700/80" strokeWidth="0.6">
        {[14, 28, 42, 56, 70].map((y) => (
          <line key={y} x1="0" x2="120" y1={y} y2={y} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <line key={row} x1={row % 2 ? 44 : 78} x2={row % 2 ? 44 : 78} y1={row * 14} y2={row * 14 + 14} />
        ))}
      </g>
      <g className="fill-stone-400/70 dark:fill-stone-500/70">
        {DUST.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" />
        ))}
      </g>
    </>
  ) : (
    <>
      <defs>
        <pattern id={pattern} width="6" height="5" patternUnits="userSpaceOnUse">
          <path d="M1 5 L1.6 2.6 M4 5 L4.5 2.2" className="stroke-lime-800/40 dark:stroke-lime-950/70" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="120" height="84" rx="10" className="fill-[#86b55c] dark:fill-[#2c4a24]" />
      <rect width="120" height="84" rx="10" fill={`url(#${pattern})`} />
    </>
  );

// The charging station: a dock at the wall, or a mower's station with a roof
const Station = ({ kind, charging, color }: { kind: RobotKind; charging: boolean; color: string }) => {
  const effects = useEffects();
  return (
    <g>
      {kind === 'mower' && <path d="M6 10 L18 1.5 L30 10 Z" className="fill-zinc-500 dark:fill-zinc-600" />}
      <rect x="9" y={kind === 'mower' ? 7 : 1} width="18" height="6" rx="2" className="fill-zinc-600 dark:fill-zinc-500" />
      <circle
        cx="18"
        cy={kind === 'mower' ? 10 : 4}
        r="1.1"
        fill={charging ? '#22c55e' : color}
        opacity={charging ? 1 : 0.35}
        className={cn('origin-center [transform-box:fill-box]', charging && effects.on && 'fx-pulse')}
      />
    </g>
  );
};

// A robot vacuum on its floor or a mower on its lawn, doing what HA says
export const RobotScene = ({ kind, activity, color, className }: RobotSceneProps) => {
  const effects = useEffects();
  const pattern = useId();
  // Working and paused: on its lanes (paused stops where it is)
  const onLanes = activity === 'working' || activity === 'paused';
  const moving = effects.on && onLanes;
  const route = ROUTES[activity];
  const stand = STAND[activity];
  // Cleaned or mown so far: the lanes behind it, half of them where it stopped with an error
  const trail = onLanes || activity === 'error';
  const done = activity === 'error' ? 0.5 : STILL * (438 / LANES_LENGTH);

  return (
    <svg viewBox="0 0 120 84" aria-hidden className={cn('block h-auto shrink-0 overflow-visible', className)}>
      <Floor kind={kind} pattern={pattern} />
      {trail && (
        <path
          d={LANES}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={LANES_LENGTH}
          className={cn(
            kind === 'vacuum' ? 'stroke-stone-50 dark:stroke-stone-700' : 'stroke-[#a8d27c] dark:stroke-[#3d6431]',
            moving && 'fx-lanes',
            activity === 'paused' && '[animation-play-state:paused]',
          )}
          style={{ strokeDashoffset: LANES_LENGTH * (1 - Math.min(1, done)) }}
        />
      )}
      {activity === 'returning' && (
        // The way home, its dashes running to the station
        <path
          d="M66 51 H18 V24"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 12"
          opacity="0.7"
          className={effects.on ? 'fx-flow' : undefined}
        />
      )}
      <Station kind={kind} charging={activity === 'docked'} color={color} />
      {route ? (
        <g
          className={cn(effects.on && route.fx, activity === 'paused' && '[animation-play-state:paused]')}
          style={{ offsetPath: `path('${route.path}')`, offsetRotate: 'auto', offsetDistance: `${route.at * 100}%` }}
        >
          <RobotBody kind={kind} color={color} />
        </g>
      ) : (
        stand && (
          <g transform={`translate(${stand[0]} ${stand[1]}) rotate(${stand[2]})`}>
            {activity === 'error' && (
              <circle
                r="11"
                fill={rgba('#ef4444', 0.3)}
                stroke="#ef4444"
                strokeWidth="1"
                className={cn('origin-center [transform-box:fill-box]', effects.on && 'fx-pulse')}
              />
            )}
            <RobotBody kind={kind} color={color} />
          </g>
        )
      )}
    </svg>
  );
};
