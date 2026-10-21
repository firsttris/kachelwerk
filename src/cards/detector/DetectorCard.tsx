import { useCallService, useMoreInfo } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable, nameOf, numberState } from '../../ha/types';
import { detectorKindOf, isOn, isUnreachable, lastMotionOf, onOff } from './detectorModel';
import { MotionDetector, PowerMains, RainSensor, Siren, SmokeDetector, WaterDetector } from './Detectors';

export interface DetectorConfig extends BaseConfig {
  // smoke, motion, presence, water, siren, rain or power; else by the device class
  kind?: string;
  // Smoke detector: a button entity that starts the smoke test
  test_entity?: string;
  // Motion: the brightness it measures, and a switch for detection on/off
  illuminance_entity?: string;
  detection_entity?: string;
}

export const DetectorCard = ({ hass, config }: CardProps<DetectorConfig>) => {
  const entity = hass.states[config.entity];
  const call = useCallService();
  const moreInfo = useMoreInfo();
  const common = {
    name: nameOf(config, entity),
    status: { UNREACH: isUnavailable(entity) },
    onName: () => moreInfo(config.entity),
  };
  const kind = detectorKindOf(entity, config.kind);

  if (kind === 'smoke') {
    const test = config.test_entity;
    return (
      <SmokeDetector
        {...common}
        status={{ UNREACH: isUnreachable(entity) }}
        alarm={onOff(entity)}
        onTest={test ? () => call(test.split('.')[0], 'press', { entity_id: test }) : undefined}
      />
    );
  }
  if (kind === 'water') return <WaterDetector {...common} wet={isOn(entity)} />;
  if (kind === 'siren') return <Siren {...common} sounding={isOn(entity)} />;
  if (kind === 'rain') return <RainSensor {...common} raining={onOff(entity)} />;
  if (kind === 'power') {
    const on = onOff(entity);
    return <PowerMains {...common} failure={on === null ? null : !on} />;
  }
  const detection = config.detection_entity ? hass.states[config.detection_entity] : undefined;
  return (
    <MotionDetector
      {...common}
      detected={isOn(entity)}
      presence={kind === 'presence'}
      lastMotion={lastMotionOf(entity)}
      illumination={numberState(config.illuminance_entity ? hass.states[config.illuminance_entity] : undefined)}
      active={detection ? detection.state === 'on' : undefined}
      onActive={
        config.detection_entity
          ? (on) => call('homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: config.detection_entity })
          : undefined
      }
    />
  );
};

export const detectorEntities = (config: DetectorConfig) =>
  [config.entity, config.test_entity, config.illuminance_entity, config.detection_entity].filter(
    (id): id is string => !!id,
  );

export const detectorSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: ['binary_sensor', 'siren'] } } },
  { name: 'name', selector: { text: {} } },
  { name: 'kind', selector: { select: { mode: 'dropdown', options: ['smoke', 'motion', 'presence', 'water', 'siren', 'rain', 'power'] } } },
  { name: 'test_entity', selector: { entity: { domain: 'button' } } },
  { name: 'illuminance_entity', selector: { entity: { domain: 'sensor', device_class: 'illuminance' } } },
  { name: 'detection_entity', selector: { entity: { domain: ['switch', 'input_boolean'] } } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
