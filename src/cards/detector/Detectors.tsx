import { useEffect, useState } from 'preact/hooks';
import DropletIcon from '~icons/lucide/droplet';
import FlaskIcon from '~icons/lucide/flask-conical';
import SunDimIcon from '~icons/lucide/sun-dim';
import RadarIcon from '~icons/lucide/radar';
import SirenIcon from '~icons/lucide/siren';
import PersonIcon from '~icons/lucide/person-standing';
import { HoldButton } from '../../components/Gestures';
import { Switch } from '../../components/Switch';
import type { TileStatus } from '../../components/Tile';
import { m } from '../../i18n/messages';
import { formatNumber } from '../../lib/format';
import { cn } from '../../lib/utils';
import { DetectorTile, SmokeDetectorPicture } from './DetectorTile';

interface Common {
  name: string;
  status?: TileStatus;
  onName?: () => void;
}

// MUI's SmokeDetectorControl: calm green, red and pulsing on alarm. The
// smoke test sounds the siren, so it has to be held.
export const SmokeDetector = ({ name, status, onName, alarm, onTest }: Common & { alarm: boolean; onTest?: () => void }) => (
  <DetectorTile
    name={name}
    tileStatus={status}
    onName={onName}
    tone={alarm ? 'alarm' : 'calm'}
    waves={alarm}
    picture={<SmokeDetectorPicture alarm={alarm} />}
    status={alarm ? m.SMOKE_ALARM() : m.SMOKE_CALM()}
  >
    {onTest && !alarm && (
      <HoldButton
        label={m.SMOKE_TEST()}
        hint={m.SMOKE_TEST_HINT()}
        icon={<FlaskIcon />}
        tone="text-red-500"
        onConfirm={onTest}
      />
    )}
  </DetectorTile>
);

const minutesSince = (since: number) => Math.max(0, Math.round((Date.now() - since) / 60000));

// MUI's MotionDetectorControl: radar waves while something moves, the last
// movement (HA knows it: last_changed), the brightness, and detection on or
// off where there is a switch for it
export const MotionDetector = ({
  name,
  status,
  onName,
  detected,
  presence,
  lastMotion,
  illumination,
  active,
  onActive,
}: Common & {
  detected: boolean;
  presence: boolean;
  // ms since the epoch the sensor went quiet, null when unknown
  lastMotion: number | null;
  illumination?: number;
  active?: boolean;
  onActive?: (active: boolean) => void;
}) => {
  // The minutes tick on while the tile is open
  const [, tick] = useState(0);
  useEffect(() => {
    if (lastMotion === null || detected) return;
    const timer = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, [lastMotion, detected]);

  const label =
    active === false
      ? m.DETECTION_OFF()
      : detected
        ? presence
          ? m.PRESENCE_NOW()
          : m.MOTION_NOW()
        : presence
          ? m.NO_PRESENCE()
          : m.NO_MOTION();
  const detail =
    !detected && lastMotion !== null
      ? minutesSince(lastMotion) === 0
        ? m.MOTION_JUST_NOW()
        : m.MOTION_MINUTES_AGO({ minutes: minutesSince(lastMotion) })
      : undefined;
  return (
    <DetectorTile
      name={name}
      tileStatus={status}
      onName={onName}
      tone={detected && active !== false ? 'active' : 'calm'}
      waves={detected && active !== false}
      icon={presence ? <PersonIcon /> : <RadarIcon />}
      status={label}
      detail={detail}
    >
      {(illumination !== undefined || active !== undefined) && (
        <div className="flex items-center justify-between gap-2 text-[13px]">
          {illumination !== undefined ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <SunDimIcon className="size-4" aria-hidden />
              {formatNumber(illumination, 0)} lx
            </span>
          ) : (
            <span />
          )}
          {active !== undefined && onActive && (
            <label className="flex items-center gap-2 text-muted-foreground">
              {m.DETECTION()}
              <Switch aria-label={`${m.DETECTION()} ${name}`} checked={active} onCheckedChange={onActive} />
            </label>
          )}
        </div>
      )}
    </DetectorTile>
  );
};

// MUI's WaterDetectorControl: HA's moisture sensors know wet or dry
export const WaterDetector = ({ name, status, onName, wet }: Common & { wet: boolean }) => (
  <DetectorTile
    name={name}
    tileStatus={status}
    onName={onName}
    tone={wet ? 'alarm' : 'calm'}
    waves={wet}
    icon={<DropletIcon className={cn(wet ? 'fill-current' : '')} />}
    status={wet ? m.WATER_DETECTED() : m.WATER_DRY()}
  />
);

// MUI's SirenControl
export const Siren = ({ name, status, onName, sounding }: Common & { sounding: boolean }) => (
  <DetectorTile
    name={name}
    tileStatus={status}
    onName={onName}
    tone={sounding ? 'alarm' : 'calm'}
    waves={sounding}
    icon={<SirenIcon />}
    status={sounding ? m.SIREN_ACOUSTIC() : m.SIREN_QUIET()}
  />
);
