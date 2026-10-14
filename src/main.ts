import { defineCard } from './ha/defineCard';
import { ShutterCard, type ShutterConfig, shutterSchema } from './cards/shutter/ShutterCard';

// Every card of Kachelwerk, registered with HA's card picker
defineCard<ShutterConfig>({
  type: 'kachelwerk-shutter',
  name: 'Kachelwerk Rollladen',
  description: 'Rollladen als Fenster zum Ziehen, mit Fahrt und Lamellen',
  component: ShutterCard,
  domains: ['cover'],
  schema: shutterSchema,
});

console.info(`%c KACHELWERK %c ${__VERSION__} `, 'background:#0f766e;color:#fff;padding:2px 4px', 'padding:2px 4px');
