import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Hass } from './types';

// The current hass object and the card's host element, for the tiles that
// call services or open HA's more-info dialog
export interface HassContextValue {
  hass: Hass;
  host: HTMLElement;
}

export const HassContext = createContext<HassContextValue | null>(null);

export const useHass = () => {
  const value = useContext(HassContext);
  if (!value) throw new Error('useHass outside of a Kachelwerk card');
  return value;
};

// Calls a service; the tiles don't wait for it, the entity's new state
// arrives with the next hass object
export const useCallService = () => {
  const { hass } = useHass();
  return (domain: string, service: string, data: Record<string, unknown>) => {
    hass.callService(domain, service, data).catch((error: unknown) => console.error('kachelwerk:', error));
  };
};

// HA's own dialog with history and settings of an entity, as a tap on a
// tile's name opens it in HA's cards
export const useMoreInfo = () => {
  const { host } = useHass();
  return (entityId: string) =>
    host.dispatchEvent(
      new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }),
    );
};
