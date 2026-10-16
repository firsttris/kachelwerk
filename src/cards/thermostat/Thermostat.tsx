import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { cn } from '../../lib/utils';
import type { ClimateView } from './climateModel';
import { ControlButtons } from './ControlButtons';
import { useThermostatState } from './hooks/useThermostatState';
import { TemperatureDisplay } from './TemperatureDisplay';
import { ThermostatDial } from './ThermostatDial';
import { ThermostatIconButtons } from './ThermostatIconButtons';

export interface ThermostatProps {
  name: string;
  view: ClimateView;
  windowOpen: boolean;
  // Valve opening of a radiator thermostat in percent
  valve?: number;
  status?: TileStatus;
  onTemperature: (temp: number) => void;
  onPowerOff: () => void;
  onToggleMode: () => void;
  onToggleBoost: () => void;
  onComfort: () => void;
  onEco: () => void;
  onName?: () => void;
}

const BOOST_COLOR = '#FF7043';
// The arc says what the thermostat does: orange while it heats, a cool blue
// while it holds the temperature, grey when it is off
const HEATING_COLOR = '#FB923C';
const IDLE_COLOR = '#38BDF8';
const OFF_COLOR = '#A1A1AA';

// MUI's ThermostatControl: the dial with target and actual temperature,
// steps below, power, mode and boost in the dial
export const Thermostat = ({
  name,
  view,
  windowOpen,
  valve,
  status,
  onTemperature,
  onPowerOff,
  onToggleMode,
  onToggleBoost,
  onComfort,
  onEco,
  onName,
}: ThermostatProps) => {
  const effects = useEffects();
  const { range, current, humidity, manual, boost, holiday, off } = view;
  const { localTarget, updateLocalTarget, commitTemperatureChange, decreaseTemperature, increaseTemperature } =
    useThermostatState({ targetTemperature: view.target, onCommit: onTemperature, range });

  // Heating: what HA says, else as MUI guesses it (boost, the target above
  // the room, a radiator's valve open)
  const demand = !off && (view.heating ?? (boost || localTarget > current || (valve ?? 0) > 0));
  const color = boost ? BOOST_COLOR : off || localTarget < 5 ? OFF_COLOR : demand ? HEATING_COLOR : IDLE_COLOR;

  const badge = boost
    ? { text: m.BOOST(), className: 'bg-orange-500/15 text-orange-700 dark:text-orange-300' }
    : windowOpen
      ? { text: m.WINDOW_OPEN(), className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' }
      : holiday
        ? { text: m.HOLIDAY_MODE(), className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' }
        : off
          ? { text: m.OFF(), className: 'bg-muted text-muted-foreground' }
          : {
              // Without an automatic mode there is no manual either: the
              // preset says how it heats
              text: view.canToggleMode
                ? manual
                  ? m.MANUAL()
                  : m.AUTO()
                : view.preset === 'comfort'
                  ? m.COMFORT()
                  : view.preset === 'eco'
                    ? m.ECO()
                    : m.ON(),
              className: 'bg-muted text-muted-foreground',
            };

  const kind =
    valve !== undefined
      ? `${m.RADIATOR_THERMOSTAT()} · ${m.VALVE({ percent: valve })}`
      : view.heating === null || off
        ? ''
        : view.heating
          ? m.HEATING()
          : m.IDLE();

  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={effects.on && demand ? { boxShadow: `0 24px 60px -28px ${rgba(color, 0.55 * effects.k)}` } : undefined}
    >
      <div className="flex flex-col items-center gap-1 p-3.5">
        <div className="flex w-full items-start justify-between gap-2">
          <button type="button" onClick={onName} className="flex min-w-0 flex-col text-left">
            <span className="line-clamp-2 text-[15px] leading-snug font-medium break-words" title={name}>
              {name}
            </span>
            {kind && <span className="truncate text-xs text-muted-foreground">{kind}</span>}
          </button>
          <span
            className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors', badge.className)}
          >
            {badge.text}
          </span>
        </div>

        {/* Narrow, the round buttons move out of the dial's gap below it, so
            they don't cover the readout */}
        <div className="@container relative aspect-square w-full max-w-[220px] @max-[227px]:mb-8">
          <ThermostatDial
            range={range}
            label={name}
            currentTemperature={current}
            localTarget={localTarget}
            color={color}
            currentColor={OFF_COLOR}
            demand={demand}
            onTemperatureChange={updateLocalTarget}
            onInteractionEnd={commitTemperatureChange}
          />
          <TemperatureDisplay
            localTarget={localTarget}
            currentTemperature={current}
            humidity={humidity}
            windowOpen={windowOpen}
            color={color}
          />
          <ThermostatIconButtons
            manualMode={manual}
            canBoost={view.canBoost}
            boostMode={boost}
            onComfort={view.canComfort ? onComfort : undefined}
            onLowering={view.canEco ? onEco : undefined}
            onPowerOff={onPowerOff}
            onToggleMode={view.canToggleMode ? onToggleMode : undefined}
            onToggleBoost={onToggleBoost}
          />
        </div>

        <ControlButtons onDecrease={decreaseTemperature} onIncrease={increaseTemperature} />
      </div>
    </Tile>
  );
};
