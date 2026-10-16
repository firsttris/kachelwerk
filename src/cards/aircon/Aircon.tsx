import PowerIcon from '~icons/lucide/power';
import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatTemperature } from '../../lib/format';
import { cn } from '../../lib/utils';
import { type AirconView, paceOf, swinging } from './airconModel';
import { Big, SingleTarget } from './AirconTarget';
import { AirconUnit } from './AirconUnit';
import { actionText, modeText } from './labels';
import { ModeButtons } from './ModeButtons';
import { type ChoiceKind, OptionChips } from './OptionChips';
import { RangeTarget } from './RangeTarget';
import { TONE_ACTIVE, TONE_COLOR, TONE_TEXT } from './tones';

export interface AirconProps {
  name: string;
  view: AirconView;
  status?: TileStatus;
  onTemperature: (temp: number) => void;
  onRange: (low: number, high: number) => void;
  onMode: (mode: string) => void;
  onPower: () => void;
  onChoice: (kind: ChoiceKind, value: string) => void;
  onName?: () => void;
}

// An air conditioner: the indoor unit with the air streaming out in the
// mode's color, the target with − and +, the modes, fan and swing below
export const Aircon = ({ name, view, status, onTemperature, onRange, onMode, onPower, onChoice, onName }: AirconProps) => {
  const effects = useEffects();
  const { off, tone, current, humidity, limits } = view;
  const color = TONE_COLOR[tone];
  const range = { ...limits, off: limits.min };
  // What it does now (hvac_action), else the mode
  const doing = view.action ? actionText(view.action) : modeText(view.mode);
  const hasTarget = view.target !== null || view.low !== null;
  // Under the target the room's temperature; without a target it is the big number
  const reading = [
    current === null ? null : hasTarget ? `${m.ACTUAL()} ${formatTemperature(current)}°` : m.ACTUAL(),
    humidity !== null ? `${Math.round(humidity)} %` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const readingLine = reading ? <span className="mt-1 text-[11px] text-muted-foreground tabular-nums">{reading}</span> : null;

  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={effects.on && view.blowing ? { boxShadow: `0 24px 60px -28px ${rgba(color, 0.55 * effects.k)}` } : undefined}
    >
      <div className="flex flex-col gap-2.5 px-2.5 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-2 pl-1">
          <button type="button" onClick={onName} className="flex min-w-0 flex-col pt-0.5 text-left">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
              {name}
            </span>
            <span role="status" className={cn('truncate text-xs font-medium', TONE_TEXT[view.blowing ? tone : 'off'])}>
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
                off ? 'bg-background/60 text-muted-foreground hover:bg-accent' : cn(TONE_ACTIVE[tone], 'border-transparent'),
              )}
              style={!off && effects.on ? { boxShadow: `0 0 ${14 * effects.k}px ${rgba(color, 0.35 * effects.k)}` } : undefined}
            >
              <PowerIcon />
            </button>
          )}
        </div>

        <div className="relative flex flex-col items-center pt-10">
          <AirconUnit color={color} blowing={view.blowing} off={off} pace={paceOf(view.fan)} swing={swinging(view.swing)} />
          <div className="relative flex w-full flex-col items-center">
            {view.low !== null && view.high !== null ? (
              <RangeTarget reading={readingLine} low={view.low} high={view.high} range={range} onRange={onRange} />
            ) : (
              <>
                {view.target !== null ? (
                  <SingleTarget label={name} target={view.target} range={range} color={color} onTemperature={onTemperature} />
                ) : (
                  // No target (off, fan only): the room's temperature
                  current !== null && <Big value={current} color={color} muted />
                )}
                {readingLine}
              </>
            )}
          </div>
        </div>

        {view.modes.length > 1 && <ModeButtons modes={view.modes} mode={view.mode} onMode={onMode} />}
        <OptionChips view={view} onChoice={onChoice} />
      </div>
    </Tile>
  );
};
