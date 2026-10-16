import { m } from '../../i18n/messages';
import { optionText } from '../aircon/labels';

// The texts of the presets. HA names no fan presets (each integration has
// its own, fan/__init__.py: preset_modes), so the common ones are here;
// auto, eco, sleep, boost as the air conditioner's, others as they come.
// Humidifier modes: MODE_* in homeassistant/components/humidifier/const.py,
// worded as humidifier/strings.json (state_attributes.mode).
const OWN: Record<string, () => string> = {
  '': m.PRESET_MANUAL,
  smart: m.FAN_SMART,
  nature: m.FAN_NATURE,
  natural: m.FAN_NATURE,
  breeze: m.FAN_BREEZE,
  turbo: m.FAN_TURBO,
  quiet: m.FAN_QUIET,
  silent: m.FAN_QUIET,
  normal: m.FAN_NORMAL,
  baby: m.MODE_BABY,
};

export const presetText = (value: string) => (Object.hasOwn(OWN, value) ? OWN[value]() : optionText(value));
