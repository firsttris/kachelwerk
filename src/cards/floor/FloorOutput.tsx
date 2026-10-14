import WavesIcon from '~icons/lucide/waves';
import { Switch } from '../../components/Switch';
import type { TileStatus } from '../../components/Tile';
import { m } from '../../i18n/messages';
import { DetectorTile } from '../detector/DetectorTile';

// MUI's FloorOutputControl: the pump or direct output of a floor heating
// controller, waves while it runs, a switch where it can be switched
export const FloorOutput = ({
  name,
  on,
  pump,
  dewPoint,
  status,
  onName,
  onSwitch,
}: {
  name: string;
  on: boolean | null;
  pump: boolean;
  // Dew point or humidity alarm: the floor must not cool any further
  dewPoint?: boolean;
  status?: TileStatus;
  onName?: () => void;
  onSwitch?: (on: boolean) => void;
}) => {
  const label =
    on === null ? m.WINDOW_UNKNOWN() : pump ? (on ? m.PUMP_ON() : m.PUMP_OFF()) : on ? m.ON() : m.OFF();
  return (
    <DetectorTile
      name={name}
      tileStatus={status}
      onName={onName}
      tone={dewPoint ? 'alarm' : on ? 'active' : 'calm'}
      waves={!!on && !dewPoint}
      icon={<WavesIcon />}
      status={label}
      detail={dewPoint ? m.FLOOR_DEW_POINT() : undefined}
    >
      {onSwitch && on !== null && (
        <label className="flex items-center justify-between gap-3 text-[13px]">
          {pump ? m.PUMP() : m.OUTPUT()}
          <Switch aria-label={`${pump ? m.PUMP() : m.OUTPUT()}: ${name}`} checked={on} onCheckedChange={onSwitch} />
        </label>
      )}
    </DetectorTile>
  );
};
