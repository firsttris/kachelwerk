import PowerIcon from '~icons/lucide/power';
import CalendarIcon from '~icons/lucide/calendar-clock';
import HandIcon from '~icons/lucide/hand';
import FlameIcon from '~icons/lucide/flame';
import SunIcon from '~icons/lucide/sun';
import MoonIcon from '~icons/lucide/moon';
import { useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';

interface ThermostatIconButtonsProps {
  manualMode: boolean;
  canBoost: boolean;
  boostMode: boolean;
  onPowerOff: () => void;
  // Missing where the thermostat has no automatic mode (HA: no hvac_mode auto)
  onToggleMode?: () => void;
  onToggleBoost: () => void;
  // BidCos: comfort and lowering temperature
  onComfort?: () => void;
  onLowering?: () => void;
}

// Sized by the dial (cqw) like the readout, so on a narrow card they stay in
// the arc's gap instead of covering it; the ::after keeps a finger's width
const iconButton =
  'press relative flex size-[clamp(28px,18cqw,40px)] items-center justify-center rounded-full text-muted-foreground after:absolute after:-inset-1.5 hover:bg-accent hover:text-foreground [&_svg]:size-[clamp(16px,9cqw,20px)]';

export const ThermostatIconButtons = ({
  manualMode,
  canBoost,
  boostMode,
  onPowerOff,
  onToggleMode,
  onToggleBoost,
  onComfort,
  onLowering,
}: ThermostatIconButtonsProps) => {
  const effects = useEffects();
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-[clamp(2px,2cqw,4px)]">
      <button
        type="button"
        className={iconButton}
        onClick={onPowerOff}
        title={m.POWER_OFF()}
        aria-label={m.POWER_OFF()}
      >
        <PowerIcon />
      </button>
      {onToggleMode && (
        <button
          type="button"
          className={cn(iconButton, manualMode && 'bg-sky-500/15 text-sky-600 hover:text-sky-600 dark:text-sky-300')}
          onClick={onToggleMode}
          title={manualMode ? m.SWITCH_MANUAL() : m.SWITCH_AUTO()}
          aria-label={manualMode ? m.MANUAL() : m.AUTOMATIC()}
        >
          {manualMode ? <HandIcon /> : <CalendarIcon />}
        </button>
      )}
      {onComfort && (
        <button
          type="button"
          className={iconButton}
          onClick={onComfort}
          title={m.COMFORT_TEMPERATURE()}
          aria-label={m.COMFORT_TEMPERATURE()}
        >
          <SunIcon />
        </button>
      )}
      {onLowering && (
        <button
          type="button"
          className={iconButton}
          onClick={onLowering}
          title={m.LOWERING_TEMPERATURE()}
          aria-label={m.LOWERING_TEMPERATURE()}
        >
          <MoonIcon />
        </button>
      )}
      {canBoost && (
        <button
          type="button"
          className={cn(
            iconButton,
            boostMode && 'bg-orange-500/15 text-orange-600 hover:text-orange-600 dark:text-orange-300',
          )}
          onClick={onToggleBoost}
          title={m.BOOST()}
          aria-label={m.BOOST()}
          aria-pressed={boostMode}
          style={
            boostMode && effects.on
              ? { boxShadow: `0 0 ${16 * effects.k}px rgba(255,112,67,${Math.min(1, 0.45 * effects.k)})` }
              : undefined
          }
        >
          <FlameIcon />
        </button>
      )}
    </div>
  );
};
