import MinusIcon from '~icons/lucide/minus';
import PlusIcon from '~icons/lucide/plus';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import { useThermostatState } from '../thermostat/hooks/useThermostatState';
import type { HumidityLimits } from './humidifierModel';

const stepButton =
  'press flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background/60 hover:bg-accent disabled:opacity-40 [&_svg]:size-5';

// A humidity large, as the air conditioner's temperature
export const BigPercent = ({ value, color, muted }: { value: number; color: string; muted?: boolean }) => {
  const effects = useEffects();
  return (
    <span
      className={cn(
        'text-[clamp(28px,17cqw,40px)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums',
        muted && 'text-muted-foreground',
      )}
      style={effects.on && !muted ? { textShadow: `0 0 ${16 * effects.k}px ${color}59` } : undefined}
    >
      {formatNumber(value, 0)}
      <span className="ml-0.5 text-[clamp(13px,6cqw,18px)] font-medium tracking-normal text-muted-foreground">%</span>
    </span>
  );
};

interface HumidityTargetProps {
  label: string;
  target: number;
  limits: HumidityLimits;
  color: string;
  // Off: the target stays settable, grey
  muted?: boolean;
  onHumidity: (humidity: number) => void;
}

// The target humidity between − and +; quick steps are sent once (the
// thermostat's debounce)
export const HumidityTarget = ({ label, target, limits, color, muted, onHumidity }: HumidityTargetProps) => {
  const { localTarget, decreaseTemperature, increaseTemperature } = useThermostatState({
    targetTemperature: target,
    onCommit: onHumidity,
    range: { ...limits, off: limits.min },
  });
  return (
    <div className="flex w-full items-center justify-between gap-1">
      <button
        type="button"
        className={stepButton}
        onClick={decreaseTemperature}
        disabled={localTarget <= limits.min}
        title={m.DECREASE_HUMIDITY()}
        aria-label={m.DECREASE_HUMIDITY()}
      >
        <MinusIcon />
      </button>
      <output aria-label={`${m.TARGET_HUMIDITY()} ${label}`} className="flex min-w-0 justify-center">
        <BigPercent value={localTarget} color={color} muted={muted} />
      </output>
      <button
        type="button"
        className={stepButton}
        onClick={increaseTemperature}
        disabled={localTarget >= limits.max}
        title={m.INCREASE_HUMIDITY()}
        aria-label={m.INCREASE_HUMIDITY()}
      >
        <PlusIcon />
      </button>
    </div>
  );
};
