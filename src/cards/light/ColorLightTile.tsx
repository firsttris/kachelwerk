import { Tile, type TileStatus } from '../../components/Tile';
import { LevelBar } from '../../components/light/LevelBar';
import { litTileStyle, PendantLamp } from '../../components/light/PendantLamp';
import { useEffects } from '../../contexts/EffectsContext';
import { useHold } from '../../hooks/useHold';
import { useSliderDrag } from '../../hooks/useSliderDrag';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { hsvToRgb, kelvinToRgb } from './colors';
import type { LightCaps, LightColor } from './lightModel';
import { useStateChanges } from './useStateChanges';

const WHITES = [2700, 4000, 6500];
const COLORS = [0, 30, 55, 120, 200, 275];

export const HueBar = ({ label, hue, onChange }: { label: string; hue: number; onChange: (hue: number) => void }) => {
  const { ref, shown, handlers } = useSliderDrag<HTMLDivElement>({
    value: hue,
    axis: 'x',
    valueAt: (fraction) => Math.round(fraction * 360),
    onCommit: onChange,
  });
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={shown}
      {...handlers}
      onKeyDown={(event) => {
        const delta = event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0;
        if (!delta) return;
        event.preventDefault();
        onChange((hue + delta + 360) % 360);
      }}
      className="relative h-4 cursor-ew-resize touch-none rounded-full outline-none after:absolute after:inset-x-0 after:-inset-y-3 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      style={{ background: 'linear-gradient(90deg,#f00,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00)' }}
    >
      <div
        className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md"
        style={{ left: `${(shown / 360) * 100}%`, background: `rgb(${hsvToRgb(shown, 1).join(',')})` }}
      />
    </div>
  );
};

export interface ColorLightTileProps {
  name: string;
  // 0..100
  level: number;
  color: LightColor;
  caps: LightCaps;
  status?: TileStatus;
  onToggle: () => void;
  onLevel: (percent: number) => void;
  onHue: (hue: number) => void;
  onWhite: (kelvin: number) => void;
  onHold?: () => void;
}

// MUI's ColorLightControl: the lamp shines in the light's color;
// brightness, hue and a few quick colors and whites below. What can be set
// follows the light's color modes.
export const ColorLightTile = ({
  name,
  level,
  color,
  caps,
  status,
  onToggle,
  onLevel,
  onHue,
  onWhite,
  onHold,
}: ColorLightTileProps) => {
  const effects = useEffects();
  const on = level > 0;
  const { changes, markRequested } = useStateChanges(on);
  const hold = useHold(onHold);
  const { hasHue, hasWhite } = caps;
  const { hue, saturation, kelvin, rgb } = color;
  const toggle = hold.wrapClick(() => {
    markRequested(!on);
    onToggle();
  });
  // Quick whites within the light's range
  const whites = hasWhite ? WHITES.filter((k) => k >= caps.minKelvin - 200 && k <= caps.maxKelvin + 200) : WHITES;

  const state = on ? m.DIMMED_TO({ percent: level }) : m.OFF();
  // 28 px to look at, 44 px to tap (the ::after)
  const swatch =
    'press relative size-7 rounded-full border border-black/10 ring-offset-2 ring-offset-card after:absolute after:-inset-2 dark:border-white/15';
  return (
    <Tile status={status} lit={on} style={litTileStyle(level / 100, rgb, effects.on, effects.k)}>
      <button
        type="button"
        onClick={toggle}
        {...hold.handlers}
        aria-pressed={on}
        aria-label={`${name}: ${state}`}
        className="press relative flex h-[112px] flex-col items-start justify-end overflow-hidden px-3.5 pb-2 text-left"
      >
        <PendantLamp level={level / 100} color={rgb} changes={changes} />
        <span className="relative flex w-full min-w-0 flex-col gap-0.5">
          <span className="line-clamp-2 text-[15px] leading-snug font-medium" title={name}>
            {name}
          </span>
          <span className={cn('text-[13px]', on ? 'text-foreground/80' : 'text-muted-foreground')}>{state}</span>
        </span>
      </button>
      <div className="flex flex-col gap-3 px-3.5 pb-3.5">
        <LevelBar label={m.BRIGHTNESS_OF({ name })} value={level} color={rgb} onChange={onLevel} />
        {hasHue && <HueBar label={m.COLOR_OF({ name })} hue={hue} onChange={onHue} />}
        <div className="flex flex-wrap gap-x-3 gap-y-4 p-1" role="group" aria-label={m.QUICK_COLORS()}>
          {(hasWhite || hasHue) &&
            whites.map((k) => (
              <button
                key={k}
                type="button"
                aria-label={`${k} K`}
                title={`${k} K`}
                onClick={() => onWhite(k)}
                className={cn(
                  swatch,
                  hasWhite &&
                    on &&
                    Math.abs(kelvin - k) < 300 &&
                    (!hasHue || saturation < 0.05) &&
                    'ring-2 ring-foreground/70',
                )}
                style={{ background: `rgb(${kelvinToRgb(k).join(',')})` }}
              />
            ))}
          {hasHue &&
            COLORS.map((h) => (
              <button
                key={h}
                type="button"
                aria-label={`${m.COLOR()} ${h}°`}
                title={`${h}°`}
                onClick={() => onHue(h)}
                className={cn(swatch, on && saturation > 0.5 && Math.abs(hue - h) < 8 && 'ring-2 ring-foreground/70')}
                style={{ background: `rgb(${hsvToRgb(h, 1).join(',')})` }}
              />
            ))}
        </div>
      </div>
    </Tile>
  );
};
