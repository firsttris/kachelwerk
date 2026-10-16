import SlidersIcon from '~icons/lucide/sliders-horizontal';
import MoveHorizontalIcon from '~icons/lucide/move-horizontal';
import RotateCwIcon from '~icons/lucide/rotate-cw';
import RotateCcwIcon from '~icons/lucide/rotate-ccw';
import { Tile, type TileStatus } from '../../components/Tile';
import { LevelBar } from '../../components/light/LevelBar';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { Chip } from '../aircon/OptionChips';
import { DeviceHeader } from './DeviceHeader';
import { FanArt } from './FanArt';
import { type Direction, type FanView, snapPercentage } from './fanModel';
import { presetText } from './labels';
import { ToggleChip } from './ToggleChip';

// The fan's color: the air, cyan
export const FAN_COLOR = '#22D3EE';
const FAN_RGB: [number, number, number] = [34, 211, 238];
const ACTIVE = 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300';

export interface FanProps {
  name: string;
  view: FanView;
  status?: TileStatus;
  onPower: () => void;
  onPercentage: (percentage: number) => void;
  onPreset: (preset: string) => void;
  onOscillate: (oscillating: boolean) => void;
  onDirection: (direction: Direction) => void;
  onName?: () => void;
}

// What the fan does: its preset, else its speed as a step (with a handful
// of speeds; the bar shows the percent)
const stateOf = (view: FanView) => {
  if (!view.on) return m.OFF();
  if (view.preset?.value) return presetText(view.preset.value);
  if (view.percentage !== null && view.speeds <= 10 && view.speed > 0)
    return m.FAN_SPEED_STEP({ speed: view.speed, count: view.speeds });
  return m.ON();
};

// A fan: its blades turn with the speed, the head sweeps while it
// oscillates; below the speed as a bar (snapped to the fan's speeds), the
// presets, oscillation and direction as far as the fan has them
export const Fan = ({ name, view, status, onPower, onPercentage, onPreset, onOscillate, onDirection, onName }: FanProps) => {
  const effects = useEffects();
  const { on, preset, oscillating, direction } = view;
  const canPower = view.canOn || view.canOff;
  const hasChips = preset !== null || oscillating !== null || direction !== null;
  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={on && effects.on ? { boxShadow: `0 24px 60px -30px ${rgba(FAN_COLOR, 0.5 * effects.k)}` } : undefined}
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        <DeviceHeader
          art={
            <FanArt
              color={FAN_COLOR}
              on={on}
              spin={view.spin}
              reverse={direction === 'reverse'}
              oscillating={oscillating === true}
            />
          }
          name={name}
          state={stateOf(view)}
          stateClass={on ? 'text-cyan-700 dark:text-cyan-300' : 'text-muted-foreground'}
          activeClass={ACTIVE}
          color={FAN_COLOR}
          on={on}
          onPower={canPower ? onPower : undefined}
          powerDisabled={on ? !view.canOff : !view.canOn}
          onName={onName}
        />
        {view.percentage !== null && (
          <LevelBar
            label={m.SPEED_OF({ name })}
            value={view.percentage}
            color={FAN_RGB}
            snapTo={(value) => snapPercentage(value, view.speeds)}
            step={100 / view.speeds}
            onChange={onPercentage}
          />
        )}
        {hasChips && (
          <div className="flex flex-wrap gap-1.5">
            {preset && (
              <Chip
                label={m.PRESET_MODE()}
                icon={SlidersIcon}
                choice={preset}
                // No preset: "Manual" while the speed is set by hand, else a dash
                text={(value) => (value === '' && !(on && view.percentage !== null) ? '–' : presetText(value))}
                onChange={onPreset}
              />
            )}
            {oscillating !== null && (
              <ToggleChip
                label={m.OSCILLATE()}
                value={oscillating ? m.ON() : m.OFF()}
                icon={MoveHorizontalIcon}
                pressed={oscillating}
                activeClass={ACTIVE}
                onClick={() => onOscillate(!oscillating)}
              />
            )}
            {direction !== null && (
              <ToggleChip
                label={m.DIRECTION()}
                value={direction === 'reverse' ? m.DIRECTION_REVERSE() : m.DIRECTION_FORWARD()}
                icon={direction === 'reverse' ? RotateCcwIcon : RotateCwIcon}
                onClick={() => onDirection(direction === 'reverse' ? 'forward' : 'reverse')}
              />
            )}
          </div>
        )}
      </div>
    </Tile>
  );
};
