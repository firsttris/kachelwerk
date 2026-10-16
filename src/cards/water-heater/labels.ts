import type { ComponentType } from 'preact';
import LeafIcon from '~icons/lucide/leaf';
import ZapIcon from '~icons/lucide/zap';
import FlameIcon from '~icons/lucide/flame';
import WavesIcon from '~icons/lucide/waves';
import TrendingUpIcon from '~icons/lucide/trending-up';
import RocketIcon from '~icons/lucide/rocket';
import CircleDotIcon from '~icons/lucide/circle-dot';
import { m } from '../../i18n/messages';

// The operation modes' texts and icons: STATE_* in homeassistant/components/
// water_heater/const.py, named as in its strings.json, with Lucide's
// counterparts of its icons.json (mdi:leaf, lightning-bolt, fire-circle,
// heat-wave, finance, rocket-launch; circle-medium for the rest). Modes HA
// doesn't name (an integration's own) as they come, "vacation" as "Vacation".
const OPERATIONS: Record<string, { text: () => string; icon: ComponentType }> = {
  eco: { text: m.ECO, icon: LeafIcon },
  electric: { text: m.OPERATION_ELECTRIC, icon: ZapIcon },
  gas: { text: m.GAS, icon: FlameIcon },
  heat_pump: { text: m.OPERATION_HEAT_PUMP, icon: WavesIcon },
  high_demand: { text: m.OPERATION_HIGH_DEMAND, icon: TrendingUpIcon },
  performance: { text: m.OPERATION_PERFORMANCE, icon: RocketIcon },
  off: { text: m.OFF, icon: CircleDotIcon },
  on: { text: m.ON, icon: CircleDotIcon },
};

const humanize = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const operationText = (mode: string) =>
  Object.hasOwn(OPERATIONS, mode) ? OPERATIONS[mode].text() : humanize(mode);

export const operationIcon = (mode: string) => (Object.hasOwn(OPERATIONS, mode) ? OPERATIONS[mode].icon : CircleDotIcon);
