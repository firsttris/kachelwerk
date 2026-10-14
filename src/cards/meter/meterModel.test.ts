import { describe, expect, it } from 'vitest';
import type { Hass, HassEntity } from '../../ha/types';
import { readMeter, roleOf } from './meterModel';

const sensor = (entity_id: string, state: string, unit: string, name?: string): HassEntity => ({
  entity_id,
  state,
  attributes: { unit_of_measurement: unit, friendly_name: name },
  last_changed: '',
  last_updated: '',
});
const hassWith = (...entities: HassEntity[]) =>
  ({ states: Object.fromEntries(entities.map((e) => [e.entity_id, e])) }) as unknown as Hass;
const labels = { reading: 'Zählerstand', feedIn: 'Einspeisung' };

describe('roleOf', () => {
  it('tells the main entity by its unit', () => {
    expect(roleOf(sensor('sensor.p', '1', 'kW'))).toBe('power');
    expect(roleOf(sensor('sensor.e', '1', 'Wh'))).toBe('energy');
    expect(roleOf(sensor('sensor.g', '1', 'm³'))).toBe('gas');
    expect(roleOf(sensor('sensor.f', '1', 'm³/h'))).toBe('gas_flow');
    expect(roleOf(sensor('sensor.x', '1', '%'))).toBe('unknown');
  });
});

describe('readMeter', () => {
  it('reads power, readings and feed-in in MUI’s units', () => {
    const hass = hassWith(
      sensor('sensor.leistung', '-1.2', 'kW'),
      sensor('sensor.bezug', '12345678', 'Wh'),
      sensor('sensor.einspeisung', '2345.6', 'kWh'),
      sensor('sensor.strom', '0.5', 'A'),
    );
    const meter = readMeter(
      hass,
      { entity: 'sensor.leistung', energy: 'sensor.bezug', feed_in: 'sensor.einspeisung', current: 'sensor.strom' },
      labels,
    );
    expect(meter.power).toBe(-1200);
    expect(meter.registers).toEqual([
      { key: 'sensor.bezug', label: 'Zählerstand', value: 12345.678 },
      { key: 'feed-in', label: 'Einspeisung', value: 2345.6 },
    ]);
    expect(meter.currentMa).toBe(500);
  });

  it('takes a gas meter as the main entity', () => {
    const meter = readMeter(hassWith(sensor('sensor.gas', '4711.25', 'm³')), { entity: 'sensor.gas' }, labels);
    expect(meter).toMatchObject({ gasVolume: 4711.25, power: undefined, registers: [] });
  });
});
