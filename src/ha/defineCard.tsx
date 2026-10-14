import { type ComponentType, render } from 'preact';
import { EffectsProvider } from '../contexts/EffectsContext';
import { setLocale } from '../i18n/messages';
import { adoptStyles } from './styles';
import { HassContext } from './context';
import type { BaseConfig, Hass } from './types';

export interface CardProps<C extends BaseConfig> {
  hass: Hass;
  config: C;
}

// One entry of HA's card picker
interface CustomCardInfo {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}

declare global {
  interface Window {
    customCards?: CustomCardInfo[];
  }
}

export interface CardDefinition<C extends BaseConfig> {
  // Without "custom:", e.g. kachelwerk-shutter
  type: string;
  name: string;
  description: string;
  component: ComponentType<CardProps<C>>;
  // Domains the entity may come from, checked in setConfig and used for the
  // card picker's preview
  domains: string[];
  // Which entities the card shows: it renders again only when one of them
  // changes, not on every state change in the house
  entitiesOf?: (config: C) => string[];
  // Columns in a sections view (12 is a full row)
  columns?: number;
  // The visual editor: HA draws it from this schema (ha-form)
  schema?: Record<string, unknown>[];
  // Further YAML the preview in the card picker gets
  stubExtra?: (hass: Hass, entityId: string) => Partial<C>;
}

const DOCS = 'https://github.com/firsttris/Kachelwerk';

const languageOf = (hass: Hass) => hass.locale?.language ?? hass.language ?? 'en';

// A Lovelace card is a custom element with setConfig and a hass setter.
// Custom elements must be classes; everything else stays in functions.
export const defineCard = <C extends BaseConfig>(definition: CardDefinition<C>) => {
  const { type, domains, component: Component } = definition;
  const entitiesOf = definition.entitiesOf ?? ((config: C) => [config.entity]);
  if (customElements.get(type)) return;

  class KachelwerkCard extends HTMLElement {
    private config?: C;
    private current?: Hass;
    private mount?: HTMLDivElement;

    setConfig(config: C) {
      if (!config?.entity) throw new Error('entity fehlt / entity is required');
      const domain = config.entity.split('.')[0];
      if (!domains.includes(domain)) throw new Error(`${config.entity}: ${domains.join(', ')} erwartet / expected`);
      this.config = config;
      this.update();
    }

    set hass(hass: Hass) {
      const previous = this.current;
      this.current = hass;
      const changed =
        !previous ||
        !this.config ||
        languageOf(previous) !== languageOf(hass) ||
        previous.themes?.darkMode !== hass.themes?.darkMode ||
        entitiesOf(this.config).some((id) => previous.states[id] !== hass.states[id]);
      if (changed) this.update();
    }

    get hass(): Hass | undefined {
      return this.current;
    }

    connectedCallback() {
      this.update();
    }

    disconnectedCallback() {
      if (this.mount) render(null, this.mount);
    }

    getCardSize() {
      return 3;
    }

    getGridOptions() {
      const columns = definition.columns ?? 6;
      return { columns, min_columns: Math.min(columns, 6), rows: 'auto' };
    }

    static getStubConfig(hass: Hass) {
      const entityId =
        Object.keys(hass.states).find((id) => domains.includes(id.split('.')[0])) ?? `${domains[0]}.example`;
      return { entity: entityId, ...definition.stubExtra?.(hass, entityId) };
    }

    static getConfigForm() {
      return definition.schema ? { schema: definition.schema } : undefined;
    }

    private update() {
      if (!this.config || !this.current || !this.isConnected) return;
      if (!this.mount) {
        const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
        adoptStyles(root);
        this.mount = document.createElement('div');
        root.append(this.mount);
      }
      setLocale(languageOf(this.current));
      this.mount.className = this.current.themes?.darkMode ? 'kw dark' : 'kw';
      render(
        <HassContext.Provider value={{ hass: this.current, host: this }}>
          <EffectsProvider level={this.config.effects ?? 'subtle'}>
            <Component hass={this.current} config={this.config} />
          </EffectsProvider>
        </HassContext.Provider>,
        this.mount,
      );
    }
  }

  customElements.define(type, KachelwerkCard);
  window.customCards = window.customCards ?? [];
  window.customCards.push({
    type,
    name: definition.name,
    description: definition.description,
    preview: true,
    documentationURL: DOCS,
  });
};
