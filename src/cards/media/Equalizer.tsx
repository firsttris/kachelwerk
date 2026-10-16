import { useEffect, useState } from 'preact/hooks';
import { useEffects } from '../../contexts/EffectsContext';
import { cn } from '../../lib/utils';
import { type Progress, playedAt } from './mediaModel';

// Each bar with its own pace, so the four never move as one
const BARS = [
  { height: 0.55, duration: 0.9, delay: 0 },
  { height: 1, duration: 1.15, delay: -0.4 },
  { height: 0.7, duration: 0.8, delay: -0.2 },
  { height: 0.85, duration: 1.05, delay: -0.65 },
];

// A small equalizer in front of "Playing": the bars dance while it plays
// (fx-eq), stand still without effects or with reduced motion
export const Equalizer = ({ moving }: { moving: boolean }) => {
  const effects = useEffects();
  return (
    <span aria-hidden className="flex h-3 w-3.5 shrink-0 items-end gap-[2px]">
      {BARS.map((bar) => (
        <span
          key={bar.delay}
          className={cn('h-full w-[2px] origin-bottom rounded-full bg-current', moving && effects.on && 'fx-eq')}
          style={{
            transform: `scaleY(${moving ? bar.height : 0.25})`,
            animationDuration: `${bar.duration}s`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </span>
  );
};

// The time now, once a second while something moves
const useNow = (ticking: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!ticking) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [ticking]);
  return now;
};

// How far the track is, a thin line under the title
export const ProgressLine = ({ progress, playing }: { progress: Progress; playing: boolean }) => {
  const played = playedAt(progress, playing, useNow(playing));
  return (
    <div aria-hidden className="h-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-violet-500/80 transition-[width] duration-1000 ease-linear"
        style={{ width: `${played * 100}%` }}
      />
    </div>
  );
};
