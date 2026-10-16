import type { ComponentChildren } from 'preact';
import MinusIcon from '~icons/lucide/minus';
import PlusIcon from '~icons/lucide/plus';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import { useThermostatState } from '../thermostat/hooks/useThermostatState';
import type { TemperatureLimits } from './waterHeaterModel';

const stepButton =
  'press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-background/60 hover:bg-accent disabled:opacity-40 [&_svg]:size-5 @max-[220px]:w-full';

// A temperature with as many decimals as the step has (water heaters mostly
// step by whole degrees)
export const degrees = (value: number, step: number) => formatNumber(value, step % 1 === 0 ? 0 : 1);

// The big number: 40 px, smaller on a narrow card; the unit beside it, on a
// narrow card only the degree sign
export const Big = ({ value, unit, muted }: { value: string; unit: string; muted?: boolean }) => (
  <span
    className={cn(
      'text-[40px] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums @max-[300px]:text-[32px]',
      muted && 'text-muted-foreground',
    )}
  >
    {value}
    <span className="ml-0.5 align-top text-base font-medium text-muted-foreground @max-[300px]:text-sm">
      °<span className="@max-[300px]:hidden">{unit.replace('°', '')}</span>
    </span>
  </span>
);

interface TankTargetProps {
  label: string;
  target: number;
  limits: TemperatureLimits;
  unit: string;
  // The line under the number (the water's temperature)
  reading: ComponentChildren;
  onTemperature: (temp: number) => void;
}

// The target between − and +, on a narrow card above them; quick steps are
// sent once (the thermostat's debounce)
export const TankTarget = ({ label, target, limits, unit, reading, onTemperature }: TankTargetProps) => {
  const range = { min: limits.min, max: limits.max, off: limits.min, step: limits.step };
  const { localTarget, decreaseTemperature, increaseTemperature } = useThermostatState({
    targetTemperature: target,
    onCommit: onTemperature,
    range,
  });
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 @max-[220px]:grid-cols-2 @max-[220px]:gap-y-2">
      <button
        type="button"
        className={cn(stepButton, '@max-[220px]:row-start-2')}
        onClick={decreaseTemperature}
        disabled={localTarget <= range.min}
        title={m.DECREASE_TEMPERATURE()}
        aria-label={m.DECREASE_TEMPERATURE()}
      >
        <MinusIcon />
      </button>
      <div className="flex min-w-0 flex-col items-center @max-[220px]:col-span-2 @max-[220px]:row-start-1">
        <output aria-label={`${m.TARGET_TEMPERATURE()} ${label}`}>
          <Big value={degrees(localTarget, limits.step)} unit={unit} />
        </output>
        {reading}
      </div>
      <button
        type="button"
        className={cn(stepButton, '@max-[220px]:row-start-2')}
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
