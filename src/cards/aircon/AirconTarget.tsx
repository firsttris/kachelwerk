import MinusIcon from '~icons/lucide/minus';
import PlusIcon from '~icons/lucide/plus';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatTemperature } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { TemperatureRange } from '../thermostat/constants';
import { useThermostatState } from '../thermostat/hooks/useThermostatState';

const stepButton =
  'press flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background/60 hover:bg-accent [&_svg]:size-5';

export const Big = ({ value, color, muted }: { value: number; color: string; muted?: boolean }) => {
  const effects = useEffects();
  return (
    <span
      className={cn(
        'text-[clamp(24px,13cqw,38px)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums',
        muted && 'text-muted-foreground',
      )}
      style={effects.on && !muted ? { textShadow: `0 0 ${16 * effects.k}px ${color}59` } : undefined}
    >
      {formatTemperature(value)}
      {/* On a narrow card only the degree sign, so the number fits between − and + */}
      <span className="ml-0.5 align-top text-[clamp(12px,5cqw,16px)] font-medium text-muted-foreground">
        °<span className="@max-[220px]:hidden">C</span>
      </span>
    </span>
  );
};

interface SingleTargetProps {
  label: string;
  target: number;
  range: TemperatureRange;
  color: string;
  onTemperature: (temp: number) => void;
}

// One target temperature between − and +; quick steps are sent once (the
// thermostat's debounce)
export const SingleTarget = ({ label, target, range, color, onTemperature }: SingleTargetProps) => {
  const { localTarget, decreaseTemperature, increaseTemperature } = useThermostatState({
    targetTemperature: target,
    onCommit: onTemperature,
    range,
  });
  return (
    <div className="flex w-full items-center justify-between gap-1">
      <button
        type="button"
        className={stepButton}
        onClick={decreaseTemperature}
        disabled={localTarget <= range.min}
        title={m.DECREASE_TEMPERATURE()}
        aria-label={m.DECREASE_TEMPERATURE()}
      >
        <MinusIcon />
      </button>
      <output aria-label={`${m.TARGET_TEMPERATURE()} ${label}`} className="flex min-w-0 justify-center">
        <Big value={localTarget} color={color} />
      </output>
      <button
        type="button"
        className={stepButton}
        onClick={increaseTemperature}
        disabled={localTarget >= range.max}
        title={m.INCREASE_TEMPERATURE()}
        aria-label={m.INCREASE_TEMPERATURE()}
      >
        <PlusIcon />
      </button>
    </div>
  );
};
