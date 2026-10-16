import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { m } from '../../i18n/messages';
import { formatTemperature } from '../../lib/format';
import { cn } from '../../lib/utils';
import { ControlButtons } from '../thermostat/ControlButtons';
import type { TemperatureRange } from '../thermostat/constants';
import { useThermostatState } from '../thermostat/hooks/useThermostatState';
import { TONE_COLOR } from './tones';

interface RangeTargetProps {
  // The room's temperature, between the ends and the buttons
  reading?: ComponentChildren;
  low: number;
  high: number;
  range: TemperatureRange;
  onRange: (low: number, high: number) => void;
}

const End = ({
  label,
  value,
  color,
  selected,
  onSelect,
}: {
  label: string;
  value: number;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    aria-label={`${label} ${formatTemperature(value)} °C`}
    className={cn(
      'press flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-transparent px-1 py-1 transition-colors',
      // Opaque, so the air streams behind don't run through the figures
      selected ? 'border-border bg-card shadow-sm' : 'bg-card text-muted-foreground hover:bg-accent',
    )}
  >
    <span className="max-w-full truncate text-[10px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
      {label}
    </span>
    <span className="text-[clamp(20px,9cqw,28px)] leading-tight font-semibold tracking-[-0.03em] tabular-nums">
      {formatTemperature(value)}°
    </span>
    <span
      className="mt-0.5 h-[3px] w-6 rounded-full transition-opacity"
      style={{ background: color, opacity: selected ? 1 : 0.35 }}
    />
  </button>
);

// heat_cool: heat below the low end, cool above the high one. A tap picks
// an end, − and + move it; one never passes the other, and both are sent
// together (climate/services.py wants them as a pair)
export const RangeTarget = ({ reading, low, high, range, onRange }: RangeTargetProps) => {
  const [end, setEnd] = useState<'low' | 'high'>('high');
  const lowState = useThermostatState({
    targetTemperature: low,
    onCommit: (temp) => onRange(temp, highState.localTarget),
    range: { ...range, max: high },
  });
  const highState = useThermostatState({
    targetTemperature: high,
    onCommit: (temp) => onRange(lowState.localTarget, temp),
    range: { ...range, min: low },
  });
  const active = end === 'low' ? lowState : highState;
  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <div className="flex w-full items-stretch gap-1.5">
        <End
          label={m.HEAT_TO()}
          value={lowState.localTarget}
          color={TONE_COLOR.heat}
          selected={end === 'low'}
          onSelect={() => setEnd('low')}
        />
        <End
          label={m.COOL_TO()}
          value={highState.localTarget}
          color={TONE_COLOR.cool}
          selected={end === 'high'}
          onSelect={() => setEnd('high')}
        />
      </div>
      {reading}
      <ControlButtons onDecrease={active.decreaseTemperature} onIncrease={active.increaseTemperature} />
    </div>
  );
};
