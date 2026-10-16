import { useId } from 'preact/hooks';
import { cn } from '../../lib/utils';
import type { Scene } from './forecastModel';

// The weather drawn: sun or moon, clouds, and what falls from them. Large
// and moving for now, small and still in the forecast strip.

const delay = (s: number) => ({ animationDelay: `${s}s` });

const Sun = ({ small, moving }: { small: boolean; moving: boolean }) => {
  const [cx, cy, r, r1, r2] = small ? [23, 23, 8.5, 12.5, 16] : [32, 32, 11, 16, 21];
  return (
    <g>
      <g className={cn(moving && 'fx-wx-spin')}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-amber-400"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} className="fill-amber-400" />
    </g>
  );
};

const Moon = ({ small, moving }: { small: boolean; moving: boolean }) => {
  const id = useId();
  const [cx, cy, r] = small ? [24, 23, 10] : [30, 32, 14];
  return (
    <g>
      <mask id={id}>
        <rect width="64" height="64" fill="white" />
        <circle cx={cx + r * 0.55} cy={cy - r * 0.45} r={r * 0.85} fill="black" />
      </mask>
      <circle cx={cx} cy={cy} r={r} mask={`url(#${id})`} className="fill-amber-200 dark:fill-amber-100" />
      {!small && (
        <>
          <circle cx="48" cy="18" r="1.8" className={cn('fill-amber-300', moving && 'fx-wx-twinkle')} />
          <circle cx="52" cy="34" r="1.3" className={cn('fill-amber-300', moving && 'fx-wx-twinkle')} style={delay(1.2)} />
        </>
      )}
    </g>
  );
};

const CloudShape = ({ className }: { className: string }) => (
  <g className={className}>
    <circle cx="22" cy="38" r="8" />
    <circle cx="33" cy="32" r="11" />
    <circle cx="44" cy="38" r="7.5" />
    <rect x="14" y="36" width="37.5" height="10" rx="5" />
  </g>
);

const Clouds = ({ scene, moving }: { scene: Scene; moving: boolean }) => (
  <g>
    {scene.clouds === 2 && (
      <g transform="translate(17 -9) scale(0.78)">
        <CloudShape
          className={cn(
            scene.heavy ? 'fill-slate-400 dark:fill-slate-600' : 'fill-slate-200 dark:fill-slate-600',
            moving && 'fx-wx-drift-back',
          )}
        />
      </g>
    )}
    <CloudShape
      className={cn(
        scene.heavy ? 'fill-slate-500 dark:fill-slate-400' : 'fill-slate-300 dark:fill-slate-300',
        moving && 'fx-wx-drift',
      )}
    />
  </g>
);

const Falling = ({ scene, moving }: { scene: Scene; moving: boolean }) => {
  const drops = scene.rain === 2 ? [18, 26, 34, 42, 50] : scene.rain === 1 ? (scene.snow ? [24, 40] : [22, 32, 42]) : [];
  return (
    <g>
      {drops.map((x, i) => (
        <line
          key={`r${x}`}
          x1={x}
          y1="50"
          x2={x - 2}
          y2="56"
          strokeWidth="2.6"
          strokeLinecap="round"
          className={cn('stroke-sky-500 dark:stroke-sky-400', moving && 'fx-wx-rain')}
          style={moving ? delay(i * 0.27) : undefined}
        />
      ))}
      {scene.snow &&
        (scene.rain ? [32, 48] : [22, 32, 42]).map((x, i) => (
          <circle
            key={`s${x}`}
            cx={x}
            cy="53"
            r="2.3"
            className={cn('fill-sky-300 dark:fill-white', moving && 'fx-wx-snow')}
            style={moving ? delay(i * 0.6) : undefined}
          />
        ))}
      {scene.hail &&
        [22, 33, 44].map((x, i) => (
          <circle
            key={`h${x}`}
            cx={x}
            cy="53"
            r="2.8"
            strokeWidth="1.6"
            className={cn('fill-white stroke-sky-400 dark:fill-sky-100', moving && 'fx-wx-hail')}
            style={moving ? delay(i * 0.22) : undefined}
          />
        ))}
      {scene.bolt && (
        <polygon
          points="35,45 28,55 33,55 30,63 40,51 35,51 38,45"
          className={cn('fill-amber-400', moving && 'fx-wx-bolt')}
        />
      )}
      {scene.fog &&
        [51, 57].map((y, i) => (
          <line
            key={y}
            x1={14 + i * 6}
            y1={y}
            x2={50 - i * 2}
            y2={y}
            strokeWidth="3"
            strokeLinecap="round"
            className={cn('stroke-slate-400 dark:stroke-slate-500', moving && 'fx-wx-fog')}
            style={moving ? delay(i * 1.1) : undefined}
          />
        ))}
    </g>
  );
};

const GUSTS = ['M8 24h30a6 6 0 1 0-6-6', 'M8 34h44a6 6 0 1 1-6 6', 'M8 44h24'];

const Wind = ({ low, moving }: { low: boolean; moving: boolean }) => (
  <g transform={low ? 'translate(4 14) scale(0.85)' : undefined}>
    {GUSTS.map((d, i) => (
      <path
        key={d}
        d={d}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={moving ? '70 30' : undefined}
        className={cn('stroke-sky-400 dark:stroke-sky-300', moving && 'fx-wx-gust')}
        style={moving ? delay(i * 0.4) : undefined}
      />
    ))}
  </g>
);

const Alert = () => (
  <g>
    <path d="M32 10 56 52H8Z" strokeWidth="4" strokeLinejoin="round" className="fill-amber-400 stroke-amber-400" />
    <path d="M32 26v12M32 45v.5" strokeWidth="4.5" strokeLinecap="round" className="stroke-white dark:stroke-zinc-900" />
  </g>
);

export const WeatherArt = ({ scene, moving = false, className }: { scene: Scene; moving?: boolean; className?: string }) => {
  const clouds = (scene.clouds ?? 0) > 0;
  const falls = !!(scene.rain || scene.snow || scene.hail || scene.bolt || scene.fog);
  // Clouds without anything below sit lower; with wind they make room for it
  const cloudShift = scene.wind ? -8 : falls ? 0 : 5;
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('shrink-0 overflow-visible', className)}>
      {scene.sun && <Sun small={clouds} moving={moving} />}
      {scene.moon && <Moon small={clouds} moving={moving} />}
      {scene.wind && <Wind low={clouds} moving={moving} />}
      {clouds && (
        <g transform={`translate(0 ${cloudShift})`}>
          <Clouds scene={scene} moving={moving} />
        </g>
      )}
      <Falling scene={scene} moving={moving} />
      {scene.alert && <Alert />}
    </svg>
  );
};
