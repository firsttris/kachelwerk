import { type Hass, type HassEntity, numberState } from '../../ha/types';
import type { Register } from './Meter';

export interface MeterConfigPart {
  // The main value: power, energy, gas volume or gas flow, by its unit
  entity: string;
  power?: string;
  // Meter readings (kWh): one register each
  energy?: string | string[];
  feed_in?: string;
  voltage?: string;
  current?: string;
  frequency?: string;
  gas?: string;
  gas_flow?: string;
}

// Factors to MUI's units: W, kWh, mA, m³, m³/h
const POWER: Record<string, number> = { W: 1, kW: 1000, MW: 1e6 };
const ENERGY: Record<string, number> = { Wh: 0.001, kWh: 1, MWh: 1000 };
const CURRENT: Record<string, number> = { mA: 1, A: 1000 };
const VOLUME: Record<string, number> = { 'm³': 1, L: 0.001 };
const FLOW: Record<string, number> = { 'm³/h': 1, 'L/min': 0.06, 'L/h': 0.001 };

export type MeterRole = 'power' | 'energy' | 'gas' | 'gas_flow' | 'unknown';

const unitOf = (entity: HassEntity | undefined) => String(entity?.attributes.unit_of_measurement ?? '');

// What the main entity is, by its unit (device classes differ between
// integrations, units don't)
export const roleOf = (entity: HassEntity | undefined): MeterRole => {
  const unit = unitOf(entity);
  if (unit in POWER) return 'power';
  if (unit in ENERGY) return 'energy';
  if (unit in FLOW) return 'gas_flow';
  if (unit in VOLUME) return 'gas';
  return 'unknown';
};

const scaled = (entity: HassEntity | undefined, factors: Record<string, number>) => {
  const value = numberState(entity);
  return value === undefined ? undefined : value * (factors[unitOf(entity)] ?? 1);
};

const listOf = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

export const readMeter = (hass: Hass, config: MeterConfigPart, labels: { reading: string; feedIn: string }) => {
  const get = (id?: string) => (id ? hass.states[id] : undefined);
  const main = get(config.entity);
  const role = roleOf(main);
  const powerEntity = get(config.power) ?? (role === 'power' ? main : undefined);
  const energyIds = [...(role === 'energy' ? [config.entity] : []), ...listOf(config.energy)];
  const registers: Register[] = energyIds.flatMap((id, index) => {
    const value = scaled(get(id), ENERGY);
    if (value === undefined) return [];
    const name = get(id)?.attributes.friendly_name;
    return [{ key: id, label: index === 0 ? labels.reading : String(name ?? labels.reading), value }];
  });
  const feedIn = scaled(get(config.feed_in), ENERGY);
  if (feedIn !== undefined) registers.push({ key: 'feed-in', label: labels.feedIn, value: feedIn });
  return {
    power: scaled(powerEntity, POWER),
    registers,
    voltage: numberState(get(config.voltage)),
    currentMa: scaled(get(config.current), CURRENT),
    frequency: numberState(get(config.frequency)),
    gasFlow: scaled(get(config.gas_flow) ?? (role === 'gas_flow' ? main : undefined), FLOW),
    gasVolume: scaled(get(config.gas) ?? (role === 'gas' ? main : undefined), VOLUME),
  };
};

export const meterEntityIds = (config: MeterConfigPart) =>
  [
    config.entity,
    config.power,
    ...listOf(config.energy),
    config.feed_in,
    config.voltage,
    config.current,
    config.frequency,
    config.gas,
    config.gas_flow,
  ].filter((id): id is string => !!id);
