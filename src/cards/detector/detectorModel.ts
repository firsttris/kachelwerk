import type { HassEntity } from '../../ha/types';

export type DetectorKind = 'smoke' | 'motion' | 'presence' | 'water' | 'siren' | 'rain' | 'power';

const KINDS: DetectorKind[] = ['smoke', 'motion', 'presence', 'water', 'siren', 'rain', 'power'];

// BinarySensorDeviceClass (homeassistant/components/binary_sensor/__init__.py)
// to MUI's detector tiles
const BY_CLASS: Record<string, DetectorKind> = {
  smoke: 'smoke',
  gas: 'smoke',
  carbon_monoxide: 'smoke',
  heat: 'smoke',
  safety: 'smoke',
  motion: 'motion',
  vibration: 'motion',
  occupancy: 'presence',
  presence: 'presence',
  moisture: 'water',
  power: 'power',
};

export const detectorKindOf = (entity: HassEntity | undefined, kind?: string): DetectorKind => {
  if (kind && KINDS.includes(kind as DetectorKind)) return kind as DetectorKind;
  if (entity?.entity_id.startsWith('siren.')) return 'siren';
  return BY_CLASS[String(entity?.attributes.device_class ?? '')] ?? 'motion';
};

export const isOn = (entity: HassEntity | undefined) => entity?.state === 'on';

// When a motion sensor last went quiet: HA's last_changed while it is off
export const lastMotionOf = (entity: HassEntity | undefined): number | null => {
  if (!entity || entity.state !== 'off') return null;
  const at = Date.parse(entity.last_changed);
  return Number.isFinite(at) ? at : null;
};

// Battery smoke detectors (e.g. Tuya TS0601 via Zigbee2MQTT) only send their
// smoke state on a change, so it stays unknown while the device itself
// reports fine. Only an unavailable entity is unreachable.
export const isUnreachable = (entity: HassEntity | undefined) => !entity || entity.state === 'unavailable';

// on, off, or null while the entity has no state
export const onOff = (entity: HassEntity | undefined): boolean | null =>
  entity?.state === 'on' ? true : entity?.state === 'off' ? false : null;
