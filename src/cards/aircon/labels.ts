import { m } from '../../i18n/messages';

// The texts of HA's values (HVACMode, HVACAction, FAN_*, SWING_*, PRESET_*
// in homeassistant/components/climate/const.py), in the tile's language;
// values HA doesn't name (an integration's own fan speeds) as they come,
// "quiet_mode" as "Quiet mode"
const humanize = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const MODES: Record<string, () => string> = {
  off: m.OFF,
  cool: m.HVAC_COOL,
  heat: m.HVAC_HEAT,
  heat_cool: m.HVAC_HEAT_COOL,
  auto: m.HVAC_AUTO,
  dry: m.HVAC_DRY,
  fan_only: m.HVAC_FAN_ONLY,
};

const ACTIONS: Record<string, () => string> = {
  cooling: m.ACTION_COOLING,
  heating: m.HEATING,
  preheating: m.ACTION_PREHEATING,
  drying: m.ACTION_DRYING,
  defrosting: m.ACTION_DEFROSTING,
  fan: m.ACTION_FAN,
  idle: m.IDLE,
  off: m.OFF,
};

// Fan, swing and preset share on, off and auto
const OPTIONS: Record<string, () => string> = {
  on: m.ON,
  off: m.OFF,
  auto: m.AUTO,
  low: m.FAN_LOW,
  medium: m.FAN_MEDIUM,
  high: m.FAN_HIGH,
  top: m.FAN_TOP,
  middle: m.FAN_MIDDLE,
  focus: m.FAN_FOCUS,
  diffuse: m.FAN_DIFFUSE,
  both: m.SWING_BOTH,
  vertical: m.SWING_VERTICAL,
  horizontal: m.SWING_HORIZONTAL,
  none: m.PRESET_NONE,
  eco: m.ECO,
  away: m.PRESET_AWAY,
  boost: m.BOOST,
  comfort: m.COMFORT,
  home: m.PRESET_HOME,
  sleep: m.PRESET_SLEEP,
  activity: m.PRESET_ACTIVITY,
};

const lookup = (table: Record<string, () => string>) => (value: string) =>
  Object.hasOwn(table, value) ? table[value]() : humanize(value);

export const modeText = lookup(MODES);
export const actionText = lookup(ACTIONS);
export const optionText = lookup(OPTIONS);
