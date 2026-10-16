import FanIcon from '~icons/lucide/fan';
import ChevronDownIcon from '~icons/lucide/chevron-down';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import { type FanSpeed, LOW_BATTERY } from './robotModel';
import { speedText } from './tones';

// The battery as a small bar with its percent
export const Battery = ({ percent, charging }: { percent: number; charging: boolean }) => (
  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground tabular-nums" title={m.ROBOT_BATTERY()}>
    <span aria-hidden className="relative h-2.5 w-5 shrink-0 rounded-[3px] border border-current p-px after:absolute after:top-1/2 after:-right-[3px] after:h-1 after:w-0.5 after:-translate-y-1/2 after:rounded-r-sm after:bg-current">
      <span
        className={cn(
          'block h-full rounded-[1px] transition-[width] duration-700',
          percent < LOW_BATTERY ? 'bg-red-500' : charging ? 'bg-green-500' : 'bg-current',
        )}
        style={{ width: `${Math.max(8, percent)}%` }}
      />
    </span>
    <span className="sr-only">{m.ROBOT_BATTERY()}</span>
    {percent} %
  </span>
);

// Suction power: a chip with the value, the native select over it opens
// the phone's own picker
export const FanChip = ({ fan, onChange, className }: { fan: FanSpeed; onChange: (speed: string) => void; className?: string }) => (
  <label
    className={cn(
      'press relative flex h-11 min-w-0 items-center gap-1.5 rounded-xl border bg-background/60 px-2.5 hover:bg-accent focus-within:ring-2 focus-within:ring-ring/50',
      className,
    )}
  >
    <FanIcon className="size-4 shrink-0 text-muted-foreground" />
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="flex items-center gap-0.5 text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
        <span className="truncate">{m.ROBOT_FAN_SPEED()}</span>
        <ChevronDownIcon className="size-3 shrink-0" />
      </span>
      <span className="truncate text-[13px] font-medium">{fan.value ? speedText(fan.value) : '–'}</span>
    </span>
    <select
      aria-label={m.ROBOT_FAN_SPEED()}
      value={fan.value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
    >
      {/* A speed HA reports but doesn't list stays selectable as it is */}
      {!fan.options.includes(fan.value) && <option value={fan.value}>{speedText(fan.value) || '–'}</option>}
      {fan.options.map((option) => (
        <option key={option} value={option}>
          {speedText(option)}
        </option>
      ))}
    </select>
  </label>
);
