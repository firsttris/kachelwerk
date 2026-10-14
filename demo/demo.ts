import '../src/main';
import type { Hass, HassEntity } from '../src/ha/types';
import { examples } from './examples';

// A stand-in for HA's hass object: the example entities, and services that
// change them as HA would (a cover travels in steps, then stands)
let states: Record<string, HassEntity> = Object.fromEntries(examples.flatMap((e) => e.entities).map((e) => [e.entity_id, e]));
const cards: { el: HTMLElement & { hass?: Hass }; dark: boolean }[] = [];

const hassFor = (dark: boolean): Hass => ({
  states,
  language: 'de',
  locale: { language: new URLSearchParams(location.search).get('lang') ?? 'de' },
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
    (window as unknown as { setState: unknown }).setState = set;
  },
});

const push = () => cards.forEach((c) => (c.el.hass = hassFor(c.dark)));

(window as unknown as { calls: unknown[] }).calls = [];
for (const dark of [false, true]) {
  const parent = document.getElementById(dark ? 'dark' : 'light')!;
  for (const { config } of examples) {
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
