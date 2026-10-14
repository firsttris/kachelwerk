import { type HassEntity, numberAttr, numberState } from '../../ha/types';

// A valve opening in percent: HA's level numbers come in % (0–100) or, from
// some integrations, as 0–1 with max 1
export const valveOf = (entity: HassEntity | undefined): number => {
  const value = numberState(entity);
  if (value === undefined) return 0;
  const unit = entity?.attributes.unit_of_measurement;
  const max = numberAttr(entity, 'max');
  const percent = unit === '%' || (max !== null && max > 1) || value > 1 ? value : value * 100;
  return Math.round(Math.min(100, Math.max(0, percent)));
};

// The circuit or, for a switch or binary_sensor, the pump or output
export const isOutput = (entityId: string) => entityId.startsWith('switch.') || entityId.startsWith('binary_sensor.');
