import type { RobotKind } from './robotModel';

// The robot seen from above, centered on 0,0 and heading right (+x)
export const RobotBody = ({ kind, color }: { kind: RobotKind; color: string }) =>
  kind === 'vacuum' ? (
    <g>
      <circle r="7" className="fill-white stroke-zinc-300 dark:fill-zinc-300 dark:stroke-zinc-500" strokeWidth="0.7" />
      {/* The bumper at the front, the laser turret, the LED */}
      <path d="M4.2 -5.6 A7 7 0 0 1 4.2 5.6" fill="none" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.3" />
      <circle r="2.4" className="fill-zinc-700 dark:fill-zinc-800" />
      <circle cx="-4" r="0.9" fill={color} />
    </g>
  ) : (
    <g>
      {/* Wheels, body, cover with the LED */}
      <rect x="-6.5" y="-7.6" width="5" height="2.4" rx="1" className="fill-zinc-800" />
      <rect x="-6.5" y="5.2" width="5" height="2.4" rx="1" className="fill-zinc-800" />
      <rect x="-8" y="-6" width="16" height="12" rx="4.5" className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-300 dark:stroke-zinc-600" strokeWidth="0.6" />
      <rect x="-5" y="-3.6" width="9" height="7.2" rx="2.6" className="fill-zinc-700 dark:fill-zinc-800" />
      <circle cx="5.6" r="0.9" fill={color} />
    </g>
  );
