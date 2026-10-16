import '../src/main';
import type { Hass, HassEntity } from '../src/ha/types';
import { english } from './english';
import { examples } from './examples';

// ?only=light,thermostat  only these cards
// ?theme=light|dark       one theme, without its heading (for screenshots)
// ?lang=en                English texts and device names
// ?width=540              the grid's width in px (a narrow HA section)
// ?ids=a,b                 only the cards of these entities, in this order
const params = new URLSearchParams(location.search);
const only = params.get('only')?.split(',');
const theme = params.get('theme');
const lang = params.get('lang') ?? 'de';
const width = params.get('width');
const ids = params.get('ids')?.split(',');
if (width) document.documentElement.style.setProperty('--demo-width', `${width}px`);
const translate = <T,>(name: T): T =>
  lang === 'en' && typeof name === 'string' ? ((english[name] ?? name) as T) : name;
const picked = ids ? ids.flatMap((id) => examples.filter(({ config }) => config.entity === id)) : examples;
const shown = picked
  .filter(({ config }) => !only || only.includes(config.type.replace('custom:kachelwerk-', '')))
  .map(({ config, entities }) => ({
    config: { ...config, name: translate(config.name) },
    entities: entities.map((e) => ({ ...e, attributes: { ...e.attributes, friendly_name: translate(e.attributes.friendly_name) } })),
  }));

// A stand-in for HA's hass object: the example entities, and services that
// change them as HA would (a cover travels in steps, then stands)
let states: Record<string, HassEntity> = Object.fromEntries(shown.flatMap((e) => e.entities).map((e) => [e.entity_id, e]));
const cards: { el: HTMLElement & { hass?: Hass }; dark: boolean }[] = [];

const hassFor = (dark: boolean): Hass => ({
  states,
  language: lang,
  locale: { language: lang },
  themes: { darkMode: dark },
  callService: async (domain, service, data = {}) => {
    console.log('callService', domain, service, JSON.stringify(data));
    (window as unknown as { calls: unknown[] }).calls.push({ domain, service, data });
    const id = String(data.entity_id);
    const entity = states[id];
    if (!entity) return;
    const set = (patch: Partial<HassEntity>, attributes: Record<string, unknown> = {}) => {
      states = { ...states, [id]: { ...entity, ...patch, attributes: { ...entity.attributes, ...attributes } } };
      push();
    };
    if (domain === 'cover') {
      const to = service === 'set_cover_position' ? Number(data.position) : service === 'open_cover' ? 100 : service === 'close_cover' ? 0 : null;
      if (to !== null) set({ state: to > Number(entity.attributes.current_position ?? 0) ? 'opening' : 'closing' });
      if (service === 'set_cover_tilt_position') set({}, { current_tilt_position: Number(data.tilt_position) });
    }
    if (domain === 'lock') set({ state: service === 'lock' ? 'locking' : service === 'unlock' ? 'unlocking' : 'opening' });
    if (domain === 'climate') {
      if (service === 'set_temperature' && 'temperature' in data) set({}, { temperature: data.temperature });
      if (service === 'set_temperature' && 'target_temp_low' in data)
        set({}, { target_temp_low: data.target_temp_low, target_temp_high: data.target_temp_high });
      if (service === 'set_hvac_mode') set({ state: String(data.hvac_mode) }, climateAction(entity, String(data.hvac_mode)));
      if (service === 'turn_off') set({ state: 'off' }, climateAction(entity, 'off'));
      if (service === 'turn_on') {
        const modes = (entity.attributes.hvac_modes as string[] | undefined) ?? [];
        const mode = modes.find((m) => m !== 'off') ?? 'heat';
        set({ state: mode }, climateAction(entity, mode));
      }
      if (service === 'set_preset_mode') set({}, { preset_mode: data.preset_mode });
      if (service === 'set_fan_mode') set({}, { fan_mode: data.fan_mode });
      if (service === 'set_swing_mode') set({}, { swing_mode: data.swing_mode });
    }
    if (service === 'toggle') set({ state: entity.state === 'on' ? 'off' : 'on' });
    if (domain === 'light' && service === 'turn_off') set({ state: 'off' });
    if (domain === 'light' && service === 'turn_on') {
      const a: Record<string, unknown> = {};
      if (data.brightness_pct !== undefined) a.brightness = Math.round((Number(data.brightness_pct) / 100) * 255);
      if (data.hs_color) Object.assign(a, { hs_color: data.hs_color, color_mode: 'hs' });
      if (data.color_temp_kelvin) Object.assign(a, { color_temp_kelvin: data.color_temp_kelvin, color_mode: 'color_temp' });
      set({ state: 'on' }, a);
    }
  },
});

// What a climate entity does in a mode (hvac_action), only where it reports one
const climateAction = (entity: HassEntity, mode: string): Record<string, unknown> => {
  const actions: Record<string, string> = { off: 'off', cool: 'cooling', heat: 'heating', heat_cool: 'cooling', auto: 'heating', dry: 'drying', fan_only: 'fan' };
  return 'hvac_action' in entity.attributes ? { hvac_action: actions[mode] ?? 'idle' } : {};
};

const push = () => cards.forEach((c) => (c.el.hass = hassFor(c.dark)));

(window as unknown as { calls: unknown[] }).calls = [];

// A state change as Home Assistant reports it (a wall switch, an automation): the animations in
// tests/animations.spec.ts play their scenes with it
(window as unknown as { kachelwerk: unknown }).kachelwerk = {
  set: (entityId: string, state?: string, attributes: Record<string, unknown> = {}) => {
    const entity = states[entityId];
    if (!entity) throw new Error(`no ${entityId} in the demo`);
    const changed = state !== undefined && state !== entity.state;
    const at = new Date().toISOString();
    states = {
      ...states,
      [entityId]: {
        ...entity,
        state: state ?? entity.state,
        attributes: { ...entity.attributes, ...attributes },
        last_changed: changed ? at : entity.last_changed,
        last_updated: at,
      },
    };
    push();
  },
};
for (const dark of [false, true]) {
  const parent = document.getElementById(dark ? 'dark' : 'light')!;
  if (theme && theme !== (dark ? 'dark' : 'light')) {
    parent.remove();
    continue;
  }
  if (theme) {
    parent.classList.add('bare');
    // The page around it in the theme's color too (the animations crop with a margin)
    document.body.style.background = dark ? '#111111' : '#fafafa';
  }
  for (const { config } of shown) {
    const el = document.createElement(config.type.replace('custom:', '')) as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass?: Hass;
    };
    el.setConfig(config);
    el.dataset.entity = String(config.entity);
    parent.append(el);
    cards.push({ el, dark });
  }
}
push();
// Each card as wide as it asks for, like in a sections view (12 columns)
for (const { el } of cards) {
  const opts = (el as unknown as { getGridOptions: () => { columns: number } }).getGridOptions();
  el.style.setProperty('--cols', String(opts.columns));
}
