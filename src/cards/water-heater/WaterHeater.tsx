import PowerIcon from '~icons/lucide/power';
import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import { operationText } from './labels';
import { ModeBar } from './ModeBar';
import { Big, degrees, TankTarget } from './TankTarget';
import { type WaterHeaterView, waterColor } from './waterHeaterModel';
import { WaterTank } from './WaterTank';

export interface WaterHeaterProps {
  name: string;
  view: WaterHeaterView;
  status?: TileStatus;
  onTemperature: (temp: number) => void;
  onMode: (mode: string) => void;
  onAway: (away: boolean) => void;
  onPower: () => void;
  onName?: () => void;
}

const HEAT = '#FB923C';

// What the heater does: off, heating up to the target or holding it; the
// operation mode where no mode buttons show it
const doingOf = (view: WaterHeaterView) => {
  if (view.off) return m.OFF();
  const doing = view.heating ? m.HEATING() : view.target !== null ? m.IDLE() : null;
  return [doing, view.modes.length > 1 ? null : operationText(view.mode)].filter(Boolean).join(' · ');
};

// A water heater: the tank, whose water shows its temperature, beside the
// name and the target with − and +; on a narrow card the tank goes below the
// name, next to the target. The operation modes and away mode below.
export const WaterHeater = ({ name, view, status, onTemperature, onMode, onAway, onPower, onName }: WaterHeaterProps) => {
  const effects = useEffects();
  const { off, current, target, limits, unit } = view;
  const currentText = current === null ? '' : `${formatNumber(current, 1)} ${unit}`;
  const band = view.low !== null && view.high !== null ? `${degrees(view.low, limits.step)}–${degrees(view.high, limits.step)}°` : null;
  const reading = [current !== null && target !== null ? `${m.ACTUAL()} ${formatNumber(current, 1)}°` : null, band]
    .filter(Boolean)
    .join(' · ');
  const readingLine = reading ? <span className="mt-1 text-[11px] text-muted-foreground tabular-nums">{reading}</span> : null;
  const doing = doingOf(view);

  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={effects.on && view.heating ? { boxShadow: `0 24px 60px -28px ${rgba(HEAT, 0.5 * effects.k)}` } : undefined}
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 @max-[300px]:gap-x-2.5">
          <WaterTank
            className="row-span-2 @max-[220px]:row-span-1 @max-[220px]:row-start-2"
            label={`${m.WATER_TEMPERATURE()} ${name}`}
            level={view.level}
            mark={view.mark}
            warmth={view.warmth}
            heating={view.heating}
            hot={view.hot}
            current={current}
            valueText={currentText}
            min={limits.min}
            max={limits.max}
          />
          <div className="col-start-2 row-start-1 flex items-start justify-between gap-2 @max-[220px]:col-span-2 @max-[220px]:col-start-1">
            <button type="button" onClick={onName} className="flex min-w-0 flex-col gap-0.5 pt-0.5 text-left">
              <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
                {name}
              </span>
              <span
                role="status"
                title={doing}
                className={cn(
                  'line-clamp-2 text-[13px] leading-snug font-medium',
                  off ? 'text-muted-foreground' : view.heating ? 'text-orange-700 dark:text-orange-300' : 'text-foreground/70',
                )}
              >
                {doing}
              </span>
            </button>
            {view.canPower && (
              <button
                type="button"
                onClick={onPower}
                aria-pressed={!off}
                title={off ? m.POWER_ON() : m.POWER_OFF()}
                aria-label={off ? m.POWER_ON() : m.POWER_OFF()}
                className={cn(
                  'press flex size-11 shrink-0 items-center justify-center rounded-full border [&_svg]:size-5',
                  off
                    ? 'bg-background/60 text-muted-foreground hover:bg-accent'
                    : 'border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-300',
                )}
                style={!off && effects.on ? { boxShadow: `0 0 ${14 * effects.k}px ${rgba(HEAT, 0.3 * effects.k)}` } : undefined}
              >
                <PowerIcon />
              </button>
            )}
          </div>
          <div className="col-start-2 row-start-2 flex flex-col justify-center">
            {target !== null ? (
              <TankTarget label={name} target={target} limits={limits} unit={unit} reading={readingLine} onTemperature={onTemperature} />
            ) : (
              // No target to set: the water's temperature large
              current !== null && (
                <div className="flex flex-col items-start">
                  <span style={effects.on && view.warmth !== null ? { textShadow: `0 0 16px ${waterColor(view.warmth, 0.35)}` } : undefined}>
                    <Big value={formatNumber(current, 1)} unit={unit} />
                  </span>
                  {readingLine ?? <span className="mt-1 text-[11px] text-muted-foreground">{m.ACTUAL()}</span>}
                </div>
              )
            )}
          </div>
        </div>
        <ModeBar modes={view.modes} mode={view.mode} away={view.away} onMode={onMode} onAway={onAway} />
      </div>
    </Tile>
  );
};
