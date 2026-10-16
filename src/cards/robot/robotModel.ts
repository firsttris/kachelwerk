import { type HassEntity, numberAttr, numberState, supports } from '../../ha/types';

// A robot vacuum (vacuum) or a robotic lawn mower (lawn_mower): one tile,
// two looks. States, services and feature flags as in Home Assistant's
// homeassistant/components/vacuum/const.py and lawn_mower/const.py.
export type RobotKind = 'vacuum' | 'mower';

// VacuumActivity and LawnMowerActivity; cleaning and mowing are both "working"
export type RobotActivity = 'working' | 'docked' | 'idle' | 'paused' | 'returning' | 'error' | 'unknown';

export type RobotAction = 'start' | 'pause' | 'stop' | 'dock' | 'locate' | 'spot';

// VacuumEntityFeature (vacuum/const.py)
export const VacuumFeature = {
  PAUSE: 4,
  STOP: 8,
  RETURN_HOME: 16,
  FAN_SPEED: 32,
  LOCATE: 512,
  CLEAN_SPOT: 1024,
  START: 8192,
} as const;

// LawnMowerEntityFeature (lawn_mower/const.py)
export const LawnMowerFeature = {
  START_MOWING: 1,
  PAUSE: 2,
  DOCK: 4,
  STOP: 8,
} as const;

interface Domain {
  domain: string;
  activities: Record<string, RobotActivity>;
  // Each action: its service and the feature flag the service requires
  // (vacuum/services.py and lawn_mower/services.py register them so)
  actions: Partial<Record<RobotAction, { service: string; feature: number }>>;
}

const DOMAINS: Record<RobotKind, Domain> = {
  vacuum: {
    domain: 'vacuum',
    activities: { cleaning: 'working', docked: 'docked', idle: 'idle', paused: 'paused', returning: 'returning', error: 'error' },
    actions: {
      start: { service: 'start', feature: VacuumFeature.START },
      pause: { service: 'pause', feature: VacuumFeature.PAUSE },
      stop: { service: 'stop', feature: VacuumFeature.STOP },
      dock: { service: 'return_to_base', feature: VacuumFeature.RETURN_HOME },
      locate: { service: 'locate', feature: VacuumFeature.LOCATE },
      spot: { service: 'clean_spot', feature: VacuumFeature.CLEAN_SPOT },
    },
  },
  mower: {
    domain: 'lawn_mower',
    activities: { mowing: 'working', docked: 'docked', idle: 'idle', paused: 'paused', returning: 'returning', error: 'error' },
    actions: {
      start: { service: 'start_mowing', feature: LawnMowerFeature.START_MOWING },
      pause: { service: 'pause', feature: LawnMowerFeature.PAUSE },
      stop: { service: 'stop', feature: LawnMowerFeature.STOP },
      dock: { service: 'dock', feature: LawnMowerFeature.DOCK },
    },
  },
};

export interface FanSpeed {
  value: string;
  options: string[];
}

export interface RobotView {
  kind: RobotKind;
  activity: RobotActivity;
  // The big button: start (or resume), pause, or stop where it can't pause
  primary: 'start' | 'pause' | 'stop' | null;
  canDock: boolean;
  canLocate: boolean;
  canSpot: boolean;
  // Suction power (vacuum only): fan_speed out of fan_speed_list
  fan: FanSpeed | null;
  // Percent, from a battery sensor or the legacy battery_level attribute
  battery: number | null;
}

export interface ServiceCall {
  domain: string;
  service: string;
  data?: Record<string, unknown>;
}

export const kindOf = (entityId: string): RobotKind => (entityId.startsWith('lawn_mower.') ? 'mower' : 'vacuum');

const can = (kind: RobotKind, entity: HassEntity | undefined, action: RobotAction) => {
  const known = DOMAINS[kind].actions[action];
  return !!known && supports(entity, known.feature);
};

// StateVacuumEntity has no battery any more (vacuum/__init__.py: only
// fan_speed and fan_speed_list are left); the integrations give a battery
// sensor instead. Older ones still report battery_level.
export const batteryOf = (entity: HassEntity | undefined, sensor?: HassEntity): number | null => {
  const value = numberState(sensor) ?? numberAttr(entity, 'battery_level');
  return value === null ? null :Math.max(0, Math.min(100, Math.round(value)));
};

// fan_speed_list is a capability attribute, fan_speed a state attribute,
// both only with VacuumEntityFeature.FAN_SPEED (vacuum/__init__.py)
const fanOf = (kind: RobotKind, entity: HassEntity | undefined): FanSpeed | null => {
  if (kind !== 'vacuum' || !supports(entity, VacuumFeature.FAN_SPEED)) return null;
  const options = entity?.attributes.fan_speed_list;
  if (!Array.isArray(options) || options.length === 0) return null;
  const value = entity?.attributes.fan_speed;
  return { value: typeof value === 'string' ? value : '', options: options.map(String) };
};

const primaryOf = (kind: RobotKind, entity: HassEntity | undefined, activity: RobotActivity): RobotView['primary'] => {
  if (activity === 'working') return can(kind, entity, 'pause') ? 'pause' : can(kind, entity, 'stop') ? 'stop' : null;
  return can(kind, entity, 'start') ? 'start' : null;
};

export const viewOfRobot = (entityId: string, entity: HassEntity | undefined, batterySensor?: HassEntity): RobotView => {
  const kind = kindOf(entityId);
  const activity = DOMAINS[kind].activities[entity?.state ?? ''] ?? 'unknown';
  return {
    kind,
    activity,
    primary: primaryOf(kind, entity, activity),
    canDock: can(kind, entity, 'dock'),
    canLocate: can(kind, entity, 'locate'),
    canSpot: can(kind, entity, 'spot'),
    fan: fanOf(kind, entity),
    battery: batteryOf(entity, batterySensor),
  };
};

// An action of the tile as a service call; null where the domain has none
export const robotCall = (kind: RobotKind, action: RobotAction): ServiceCall | null => {
  const known = DOMAINS[kind].actions[action];
  return known ? { domain: DOMAINS[kind].domain, service: known.service } : null;
};

export const fanSpeedCall = (speed: string): ServiceCall => ({
  domain: 'vacuum',
  service: 'set_fan_speed',
  data: { fan_speed: speed },
});

// Below this the battery is drawn as low
export const LOW_BATTERY = 20;
