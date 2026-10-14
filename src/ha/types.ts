// The parts of Home Assistant's frontend objects the cards use. HA hands
// every card a new `hass` object on each state change anywhere in the house.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    supported_features?: number;
    device_class?: string;
    unit_of_measurement?: string;
  };
  last_changed: string;
  last_updated: string;
}

export interface Hass {
  states: Record<string, HassEntity | undefined>;
  callService: (domain: string, service: string, data?: Record<string, unknown>) => Promise<unknown>;
  language?: string;
  locale?: { language?: string };
  themes?: { darkMode?: boolean };
}

// What every card's YAML has
export interface BaseConfig {
  type: string;
  entity: string;
  name?: string;
  // Glow and motion: off, subtle (default) or strong, as MUI's effects menu
  effects?: 'off' | 'subtle' | 'strong';
}

// Unavailable entity: the device is unreachable (or its integration is down)
export const isUnavailable = (entity: HassEntity | undefined) =>
  !entity || entity.state === 'unavailable' || entity.state === 'unknown';

export const nameOf = (config: BaseConfig, entity: HassEntity | undefined) =>
  config.name ?? entity?.attributes.friendly_name ?? config.entity;

export const supports = (entity: HassEntity | undefined, feature: number) =>
  ((entity?.attributes.supported_features ?? 0) & feature) !== 0;

export const numberAttr = (entity: HassEntity | undefined, key: string): number | null => {
  const value = entity?.attributes[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};
