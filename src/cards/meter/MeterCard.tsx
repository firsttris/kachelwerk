import { useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf } from '../../ha/types';
import { m } from '../../i18n/messages';
import { Meter } from './Meter';
import { type MeterConfigPart, meterEntityIds, readMeter } from './meterModel';

export type MeterConfig = BaseConfig & MeterConfigPart;

export const MeterCard = ({ hass, config }: CardProps<MeterConfig>) => {
  const entity = hass.states[config.entity];
  const moreInfo = useMoreInfo();
  return (
    <Meter
      name={nameOf(config, entity)}
      {...readMeter(hass, config, { reading: m.METER_READING(), feedIn: m.FEED_IN() })}
      status={{ UNREACH: isUnavailable(entity) }}
      onName={() => moreInfo(config.entity)}
    />
  );
};

export const meterEntities = (config: MeterConfig) => meterEntityIds(config);

const sensor = { entity: { domain: 'sensor' } };

export const meterSchema = [
  { name: 'entity', required: true, selector: sensor },
  { name: 'name', selector: { text: {} } },
  { name: 'power', selector: { entity: { domain: 'sensor', device_class: 'power' } } },
  { name: 'energy', selector: { entity: { domain: 'sensor', device_class: 'energy', multiple: true } } },
  { name: 'feed_in', selector: { entity: { domain: 'sensor', device_class: 'energy' } } },
  { name: 'voltage', selector: { entity: { domain: 'sensor', device_class: 'voltage' } } },
  { name: 'current', selector: { entity: { domain: 'sensor', device_class: 'current' } } },
  { name: 'frequency', selector: { entity: { domain: 'sensor', device_class: 'frequency' } } },
  { name: 'gas', selector: { entity: { domain: 'sensor', device_class: 'gas' } } },
  { name: 'gas_flow', selector: sensor },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
