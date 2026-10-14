import { useCallService } from '../../ha/context';
import type { CardProps } from '../../ha/defineCard';
import { type BaseConfig, isUnavailable } from '../../ha/types';
import { Buttons, keyLabels } from './Buttons';

export interface KeyConfig {
  entity: string;
  name?: string;
  // Pressed on a long press
  hold?: string;
}

export interface ButtonsConfig extends BaseConfig {
  entities?: (string | KeyConfig)[];
}

// The first key is the card's entity, the others follow
export const keysOf = (config: ButtonsConfig): KeyConfig[] => [
  { entity: config.entity },
  ...(config.entities ?? []).map((key) => (typeof key === 'string' ? { entity: key } : key)),
];

// What pressing a key does: buttons are pressed, scripts and scenes run;
// event entities only show presses at the device
export const keyCall = (entityId: string): { domain: string; service: string } | null => {
  const domain = entityId.split('.')[0];
  if (domain === 'button' || domain === 'input_button') return { domain, service: 'press' };
  if (domain === 'script' || domain === 'scene' || domain === 'automation') {
    return { domain, service: domain === 'automation' ? 'trigger' : 'turn_on' };
  }
  return null;
};

export const ButtonsCard = ({ hass, config }: CardProps<ButtonsConfig>) => {
  const call = useCallService();
  const keys = keysOf(config);
  const names = keys.map((key) => key.name ?? hass.states[key.entity]?.attributes.friendly_name ?? key.entity);
  const { title, labels } = keyLabels(names);
  const press = (entityId?: string) => {
    const target = entityId ? keyCall(entityId) : null;
    if (target && entityId) call(target.domain, target.service, { entity_id: entityId });
  };
  return (
    <Buttons
      title={config.name ?? title}
      status={{ UNREACH: keys.every((key) => isUnavailable(hass.states[key.entity])) }}
      keys={keys.map((key, i) => ({
        id: key.entity,
        label: key.name ?? labels[i],
        // An event entity's state is the time of its last event
        pressedAt: key.entity.startsWith('event.') ? hass.states[key.entity]?.state : undefined,
        onShort: () => press(key.entity),
        onLong: key.hold ? () => press(key.hold) : undefined,
      }))}
    />
  );
};

export const buttonsEntities = (config: ButtonsConfig) =>
  keysOf(config).flatMap((key) => [key.entity, ...(key.hold ? [key.hold] : [])]);

const KEY_DOMAINS = ['button', 'input_button', 'script', 'scene', 'automation', 'event'];

export const buttonsSchema = [
  { name: 'entity', required: true, selector: { entity: { domain: KEY_DOMAINS } } },
  { name: 'entities', selector: { entity: { domain: KEY_DOMAINS, multiple: true } } },
  { name: 'name', selector: { text: {} } },
  { name: 'effects', selector: { select: { mode: 'dropdown', options: ['off', 'subtle', 'strong'] } } },
];
