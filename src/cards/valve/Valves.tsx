import DropletIcon from '~icons/lucide/droplet';
import DropletOffIcon from '~icons/lucide/droplet-off';
import ArrowUpIcon from '~icons/lucide/arrow-up-to-line';
import ArrowDownIcon from '~icons/lucide/arrow-down-to-line';
import SquareIcon from '~icons/lucide/square';
import GaugeIcon from '~icons/lucide/gauge';
import WavesIcon from '~icons/lucide/waves';
import type { TileStatus } from '../../components/Tile';
import { m } from '../../i18n/messages';
import { ActuatorTile, button } from './ActuatorTile';

interface Common {
  name: string;
  status?: TileStatus;
  onName?: () => void;
}

// MUI's WaterSwitchControl: irrigation, the valve open or closed
export const WaterSwitch = ({
  name,
  status,
  onName,
  running,
  onSet,
}: Common & { running: boolean; onSet: (on: boolean) => void }) => (
  <ActuatorTile
    name={name}
    tileStatus={status}
    onName={onName}
    status={running ? m.WATER_RUNNING() : m.WATER_CLOSED()}
    active={running}
    icon={running ? <DropletIcon /> : <DropletOffIcon />}
  >
    <div className="flex gap-2">
      <button type="button" className={button} onClick={() => onSet(true)} aria-pressed={running}>
        <DropletIcon />
        {m.OPEN()}
      </button>
      <button type="button" className={button} onClick={() => onSet(false)} aria-pressed={!running}>
        <DropletOffIcon />
        {m.CLOSE()}
      </button>
    </div>
  </ActuatorTile>
);

const stateText = (level: number | null, open: () => string, closed: () => string, partly: (p: number) => string) =>
  level === null ? m.WINDOW_UNKNOWN() : level >= 100 ? open() : level <= 0 ? closed() : partly(level);

// MUI's ValveControl: a shut-off valve (HA's valve domain)
export const Valve = ({
  name,
  status,
  onName,
  level,
  onOpen,
  onClose,
  onStop,
}: Common & { level: number | null; onOpen: () => void; onClose: () => void; onStop?: () => void }) => (
  <ActuatorTile
    name={name}
    tileStatus={status}
    onName={onName}
    status={stateText(level, m.VALVE_OPEN, m.VALVE_CLOSED, (percent) => m.VALVE_PARTLY({ percent }))}
    active={(level ?? 0) > 0}
    icon={<WavesIcon />}
  >
    <div className="flex gap-2">
      <button type="button" className={button} onClick={onOpen}>
        <DropletIcon />
        {m.OPEN()}
      </button>
      <button type="button" className={button} onClick={onClose}>
        <DropletOffIcon />
        {m.CLOSE()}
      </button>
      {onStop && (
        <button type="button" className={`${button} max-w-12`} onClick={onStop} aria-label={m.BLIND_STOP()}>
          <SquareIcon className="fill-current !size-3.5" />
        </button>
      )}
    </div>
  </ActuatorTile>
);

// MUI's WindowDriveControl: open, close, stop; two rows, the window
// sections are narrow
export const WindowDrive = ({
  name,
  status,
  onName,
  level,
  onOpen,
  onClose,
  onStop,
}: Common & { level: number | null; onOpen: () => void; onClose: () => void; onStop: () => void }) => (
  <ActuatorTile
    name={name}
    tileStatus={status}
    onName={onName}
    status={stateText(level, m.DRIVE_OPEN, m.DRIVE_CLOSED, (percent) => m.DRIVE_PARTLY({ percent }))}
    active={(level ?? 0) > 0}
    icon={<GaugeIcon />}
  >
    <div className="flex gap-2">
      <button type="button" className={button} onClick={onOpen}>
        <ArrowUpIcon />
        {m.OPEN()}
      </button>
      <button type="button" className={button} onClick={onClose}>
        <ArrowDownIcon />
        {m.CLOSE()}
      </button>
    </div>
    <div className="flex gap-2">
      <button type="button" className={button} onClick={onStop}>
        <SquareIcon className="fill-current !size-3.5" />
        {m.BLIND_STOP()}
      </button>
    </div>
  </ActuatorTile>
);
