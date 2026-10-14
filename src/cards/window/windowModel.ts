import type { HassEntity } from '../../ha/types';

export type WindowState = 'closed' | 'tilted' | 'open' | 'unknown';

// A contact is a binary_sensor (on: open). A window handle comes as a
// sensor with the states closed, tilted and open (homematicip_local's
// rotary handles); anything else is unknown, as in MUI's windowState.
export const windowStateOf = (entity: HassEntity | undefined): WindowState => {
  const state = entity?.state;
  if (state === 'on' || state === 'open') return 'open';
  if (state === 'off' || state === 'closed') return 'closed';
  if (state === 'tilted') return 'tilted';
  return 'unknown';
};

// Handles turn their knob; a sensor with three states is one
export const isHandle = (entity: HassEntity | undefined) => entity?.entity_id.startsWith('sensor.') ?? false;
