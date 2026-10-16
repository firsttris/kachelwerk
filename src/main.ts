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
import { AirconCard, airconSchema } from './cards/aircon/AirconCard';
import { WindowCard, type WindowConfig, windowEntities, windowSchema } from './cards/window/WindowCard';
import { GarageCard, garageSchema } from './cards/garage/GarageCard';
import { LockCard, lockSchema } from './cards/lock/LockCard';
import {
  ClimateSensorCard,
  type ClimateSensorConfig,
  climateSensorEntities,
  climateSensorSchema,
} from './cards/climate-sensor/ClimateSensorCard';
import { MeterCard, type MeterConfig, meterEntities, meterSchema } from './cards/meter/MeterCard';
import { DetectorCard, type DetectorConfig, detectorEntities, detectorSchema } from './cards/detector/DetectorCard';
import { FloorCard, type FloorConfig, floorEntities, floorSchema } from './cards/floor/FloorCard';
import { SensorCard, type SensorConfig, sensorEntities, sensorSchema } from './cards/sensor/SensorCard';
import { ValveCard, valveSchema } from './cards/valve/ValveCard';
import { ButtonsCard, type ButtonsConfig, buttonsEntities, buttonsSchema } from './cards/buttons/ButtonsCard';
import type { BaseConfig } from './ha/types';

// Every card of Kachelwerk, registered with HA's card picker
defineCard<ShutterConfig>({
  type: 'kachelwerk-shutter',
  name: 'Kachelwerk Rollladen',
  description: 'Rollladen als Fenster zum Ziehen, mit Fahrt und Lamellen',
  component: ShutterCard,
  domains: ['cover'],
  columns: 6,
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

defineCard<BaseConfig>({
  type: 'kachelwerk-aircon',
  name: 'Kachelwerk Klimaanlage',
  description: 'Klimagerät mit ausströmender Luft: Zieltemperatur oder Bereich, Betriebsart, Lüfter, Lamellen',
  component: AirconCard,
  domains: ['climate'],
  columns: 6,
  schema: airconSchema,
});

defineCard<WindowConfig>({
  type: 'kachelwerk-window',
  name: 'Kachelwerk Fenster',
  description: 'Fenster- und Türkontakte, Fenstergriffe: gekippt, offen, zu als Bild',
  component: WindowCard,
  domains: ['binary_sensor', 'sensor'],
  entitiesOf: windowEntities,
  columns: 6,
  schema: windowSchema,
});

defineCard<BaseConfig>({
  type: 'kachelwerk-garage',
  name: 'Kachelwerk Garagentor',
  description: 'Garagentor mit Sektionaltor; Öffnen gedrückt halten, Lüften, Stopp',
  component: GarageCard,
  domains: ['cover'],
  columns: 6,
  schema: garageSchema,
});

defineCard<BaseConfig>({
  type: 'kachelwerk-lock',
  name: 'Kachelwerk Türschloss',
  description: 'Tür mit Riegel: Sperren tippen, Entsperren halten, Öffnen schieben',
  component: LockCard,
  domains: ['lock'],
  columns: 6,
  schema: lockSchema,
});

defineCard<ClimateSensorConfig>({
  type: 'kachelwerk-climate-sensor',
  name: 'Kachelwerk Raumklima',
  description: 'Temperatur groß, Luftfeuchte als Ring mit Taupunkt, dazu Wind, Regen, Helligkeit',
  component: ClimateSensorCard,
  domains: ['sensor', 'weather'],
  entitiesOf: climateSensorEntities,
  columns: 6,
  schema: climateSensorSchema,
});

defineCard<MeterConfig>({
  type: 'kachelwerk-meter',
  name: 'Kachelwerk Zähler',
  description: 'Ferraris-Zähler mit drehender Scheibe, Gaszähler mit laufender Rolle',
  component: MeterCard,
  domains: ['sensor'],
  entitiesOf: meterEntities,
  columns: 12,
  schema: meterSchema,
});

defineCard<DetectorConfig>({
  type: 'kachelwerk-detector',
  name: 'Kachelwerk Melder',
  description: 'Rauch-, Bewegungs-, Präsenz-, Wasser- und Regenmelder, Netzausfall, Sirenen',
  component: DetectorCard,
  domains: ['binary_sensor', 'siren'],
  entitiesOf: detectorEntities,
  columns: 6,
  schema: detectorSchema,
});

defineCard<FloorConfig>({
  type: 'kachelwerk-floor',
  name: 'Kachelwerk Fußbodenheizung',
  description: 'Heizkreis mit Rohrschleife, die sich mit warmem Wasser füllt; Pumpe und Ausgang',
  component: FloorCard,
  domains: ['number', 'sensor', 'input_number', 'switch', 'binary_sensor'],
  entitiesOf: floorEntities,
  columns: 6,
  schema: floorSchema,
});

defineCard<SensorConfig>({
  type: 'kachelwerk-sensor',
  name: 'Kachelwerk Messwert',
  description: 'Ein Messwert groß mit Einheit; CO₂, Feinstaub und Bodenfeuchte bewertet',
  component: SensorCard,
  domains: ['sensor', 'number', 'input_number'],
  entitiesOf: sensorEntities,
  columns: 6,
  schema: sensorSchema,
});

defineCard<BaseConfig>({
  type: 'kachelwerk-valve',
  name: 'Kachelwerk Ventil',
  description: 'Ventile (valve), Bewässerung (switch) und Fensterantriebe (cover)',
  component: ValveCard,
  domains: ['valve', 'switch', 'input_boolean', 'cover'],
  columns: 6,
  schema: valveSchema,
});

defineCard<ButtonsConfig>({
  type: 'kachelwerk-buttons',
  name: 'Kachelwerk Taster',
  description: 'Tastenfeld: kurz und lang drücken, Druck am Gerät leuchtet auf',
  component: ButtonsCard,
  domains: ['button', 'input_button', 'script', 'scene', 'automation', 'event'],
  entitiesOf: buttonsEntities,
  columns: 6,
  schema: buttonsSchema,
});

console.info(`%c KACHELWERK %c ${__VERSION__} `, 'background:#0f766e;color:#fff;padding:2px 4px', 'padding:2px 4px');
