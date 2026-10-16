import type { ComponentChildren } from 'preact';
import PowerIcon from '~icons/lucide/power';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';

interface DeviceHeaderProps {
  // The device's picture, top left
  art: ComponentChildren;
  name: string;
  state: string;
  // Tailwind classes of the state line and of the power button while on
  stateClass: string;
  activeClass: string;
  color: string;
  on: boolean;
  // No power button where the device can't be switched either way
  onPower?: () => void;
  // The way it can't go now (a fan that turns on but not off)
  powerDisabled?: boolean;
  onName?: () => void;
}

// The top of the fan and humidifier tiles: the device's picture, its name
// and state, the power button; a tap on the name opens more-info
export const DeviceHeader = ({
  art,
  name,
  state,
  stateClass,
  activeClass,
  color,
  on,
  onPower,
  powerDisabled,
  onName,
}: DeviceHeaderProps) => {
  const effects = useEffects();
  return (
    // Beside the picture the name and state; on a phone (a card below
    // 200 px) they go below it
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
      {art}
      <button
        type="button"
        onClick={onName}
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left @max-[200px]:order-last @max-[200px]:basis-full"
      >
        <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
          {name}
        </span>
        <span role="status" className={cn('truncate text-[13px]', stateClass)}>
          {state}
        </span>
      </button>
      {onPower && (
        <button
          type="button"
          onClick={onPower}
          disabled={powerDisabled}
          aria-pressed={on}
          title={on ? m.POWER_OFF() : m.POWER_ON()}
          aria-label={on ? m.POWER_OFF() : m.POWER_ON()}
          className={cn(
            'press ml-auto flex size-11 shrink-0 items-center justify-center self-start rounded-full border disabled:opacity-40 [&_svg]:size-5',
            on ? cn(activeClass, 'border-transparent') : 'bg-background/60 text-muted-foreground hover:bg-accent',
          )}
          style={on && effects.on ? { boxShadow: `0 0 ${14 * effects.k}px ${rgba(color, 0.35 * effects.k)}` } : undefined}
        >
          <PowerIcon />
        </button>
      )}
    </div>
  );
};
