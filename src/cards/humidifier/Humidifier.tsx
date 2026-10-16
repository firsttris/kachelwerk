import SlidersIcon from '~icons/lucide/sliders-horizontal';
import { Tile, type TileStatus } from '../../components/Tile';
import { rgba, useEffects } from '../../contexts/EffectsContext';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { Chip } from '../aircon/OptionChips';
import { DeviceHeader } from '../fan/DeviceHeader';
import { presetText } from '../fan/labels';
import { HumidifierArt } from './HumidifierArt';
import type { HumidifierTone, HumidifierView } from './humidifierModel';
import { BigPercent, HumidityTarget } from './HumidityTarget';

// Mist sky blue, drying teal (the air conditioner's dry mode), else grey
const TONE_COLOR: Record<HumidifierTone, string> = {
  humidify: '#38BDF8',
  dry: '#2DD4BF',
  idle: '#A1A1AA',
  off: '#A1A1AA',
};
const TONE_ACTIVE: Record<HumidifierTone, string> = {
  humidify: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  dry: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
  idle: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-200',
  off: 'bg-muted text-muted-foreground',
};
const TONE_TEXT: Record<HumidifierTone, string> = {
  humidify: 'text-sky-700 dark:text-sky-300',
  dry: 'text-teal-700 dark:text-teal-300',
  idle: 'text-muted-foreground',
  off: 'text-muted-foreground',
};

// HumidifierAction as humidifier/strings.json words it
const ACTIONS: Record<string, () => string> = {
  humidifying: m.ACTION_HUMIDIFYING,
  drying: m.ACTION_DRYING,
  idle: m.HUMIDIFIER_IDLE,
  off: m.OFF,
};

const stateOf = (view: HumidifierView) => {
  if (!view.on) return m.OFF();
  // The mode is on its chip
  return view.action && Object.hasOwn(ACTIONS, view.action) ? ACTIONS[view.action]() : m.ON();
};

export interface HumidifierProps {
  name: string;
  view: HumidifierView;
  status?: TileStatus;
  onPower: () => void;
  onHumidity: (humidity: number) => void;
  onMode: (mode: string) => void;
  onName?: () => void;
}

// A humidifier with mist rising, or a dehumidifier collecting drops; the
// target humidity with − and +, the room's humidity below, the modes
export const Humidifier = ({ name, view, status, onPower, onHumidity, onMode, onName }: HumidifierProps) => {
  const effects = useEffects();
  const { on, tone, target, current, mode } = view;
  const color = TONE_COLOR[tone];
  const actual = current === null ? null : `${m.ACTUAL()} ${formatNumber(current, 0)} %`;
  return (
    <Tile
      status={status}
      role="group"
      aria-label={name}
      style={view.working && effects.on ? { boxShadow: `0 24px 60px -30px ${rgba(color, 0.5 * effects.k)}` } : undefined}
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        <DeviceHeader
          art={<HumidifierArt kind={view.kind} color={color} on={on} working={view.working} />}
          name={name}
          state={stateOf(view)}
          stateClass={TONE_TEXT[tone]}
          activeClass={TONE_ACTIVE[tone]}
          color={color}
          on={on}
          onPower={onPower}
          onName={onName}
        />
        <div className="flex flex-col items-center gap-1">
          {target !== null ? (
            <HumidityTarget
              label={name}
              target={target}
              limits={view.limits}
              color={color}
              muted={!on}
              onHumidity={onHumidity}
            />
          ) : (
            // No target: the room's humidity large
            current !== null && <BigPercent value={current} color={color} muted />
          )}
          {actual && target !== null && (
            <span className="text-[13px] text-muted-foreground tabular-nums">{actual}</span>
          )}
        </div>
        {mode && (
          <div className="flex">
            <Chip label={m.HUMIDIFIER_MODE()} icon={SlidersIcon} choice={mode} text={presetText} onChange={onMode} />
          </div>
        )}
      </div>
    </Tile>
  );
};
