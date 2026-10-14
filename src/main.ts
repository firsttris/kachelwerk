// Before anything renders: compat turns React's prop names (strokeWidth,
// stopColor, …) into the attributes the DOM knows, as MUI's code expects
import 'preact/compat';
import { defineCard } from './ha/defineCard';
import { ShutterCard, type ShutterConfig, shutterSchema } from './cards/shutter/ShutterCard';
import { LightCard, type LightConfig, lightColumns, lightSchema } from './cards/light/LightCard';
import {
  ThermostatCard,
  type ThermostatConfig,
  thermostatEntities,
  thermostatSchema,
} from './cards/thermostat/ThermostatCard';

// Every card of Kachelwerk, registered with HA's card picker
defineCard<ShutterConfig>({
  type: 'kachelwerk-shutter',
  name: 'Kachelwerk Rollladen',
  description: 'Rollladen als Fenster zum Ziehen, mit Fahrt und Lamellen',
  component: ShutterCard,
  domains: ['cover'],
  columns: 12,
  schema: shutterSchema,
});

defineCard<LightConfig>({
  type: 'kachelwerk-light',
  name: 'Kachelwerk Licht',
  description: 'Lampe mit Lichtkegel, Dimmer und Farblicht, oder Steckdose für Schalter',
  component: LightCard,
  domains: ['light', 'switch', 'input_boolean'],
  columns: lightColumns,
  schema: lightSchema,
});

defineCard<ThermostatConfig>({
  type: 'kachelwerk-thermostat',
  name: 'Kachelwerk Thermostat',
  description: 'Drehrad mit Soll- und Ist-Temperatur, Boost, Auto/Manuell und Fensterkontakt',
  component: ThermostatCard,
  domains: ['climate'],
  entitiesOf: thermostatEntities,
  columns: 6,
  schema: thermostatSchema,
});

console.info(`%c KACHELWERK %c ${__VERSION__} `, 'background:#0f766e;color:#fff;padding:2px 4px', 'padding:2px 4px');
