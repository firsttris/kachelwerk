import { type HassEntity, supports } from '../../ha/types';

// What the alarm panel tile shows, read from a HA alarm_control_panel
// entity. States, features and code formats:
// homeassistant/components/alarm_control_panel/const.py
// (AlarmControlPanelState, AlarmControlPanelEntityFeature, CodeFormat);
// the attributes code_format, changed_by and code_arm_required:
// alarm_control_panel/__init__.py (state_attributes); the services and
// their optional code: alarm_control_panel/services.py and services.yaml.

// AlarmControlPanelEntityFeature (const.py)
export const FEATURE = {
  ARM_HOME: 1,
  ARM_AWAY: 2,
  ARM_NIGHT: 4,
  TRIGGER: 8,
  ARM_CUSTOM_BYPASS: 16,
  ARM_VACATION: 32,
} as const;

// The modes one can switch to: disarmed and the armed states
export type Mode =
  | 'disarmed'
  | 'armed_home'
  | 'armed_away'
  | 'armed_night'
  | 'armed_vacation'
  | 'armed_custom_bypass';

// What a tap asks for: a mode, or the alarm itself
export type Action = Mode | 'trigger';

// The arm modes in the order the tile shows them, each with the feature
// that offers it (the services' supported_features in services.yaml)
const ARM_MODES: { mode: Mode; feature: number }[] = [
  { mode: 'armed_home', feature: FEATURE.ARM_HOME },
  { mode: 'armed_away', feature: FEATURE.ARM_AWAY },
  { mode: 'armed_night', feature: FEATURE.ARM_NIGHT },
  { mode: 'armed_vacation', feature: FEATURE.ARM_VACATION },
  { mode: 'armed_custom_bypass', feature: FEATURE.ARM_CUSTOM_BYPASS },
];

// The service of an action (SERVICE_ALARM_* in services.py)
const SERVICE: Record<Action, string> = {
  disarmed: 'alarm_disarm',
  armed_home: 'alarm_arm_home',
  armed_away: 'alarm_arm_away',
  armed_night: 'alarm_arm_night',
  armed_vacation: 'alarm_arm_vacation',
  armed_custom_bypass: 'alarm_arm_custom_bypass',
  trigger: 'alarm_trigger',
};

// The colors: green disarmed, blue armed, amber on the way (arming,
// pending, disarming), red triggered
export type Tone = 'disarmed' | 'armed' | 'busy' | 'triggered' | 'unknown';

const STATE_TONE: Record<string, Tone> = {
  disarmed: 'disarmed',
  armed_home: 'armed',
  armed_away: 'armed',
  armed_night: 'armed',
  armed_vacation: 'armed',
  armed_custom_bypass: 'armed',
  arming: 'busy',
  pending: 'busy',
  disarming: 'busy',
  triggered: 'triggered',
};

export type CodeFormat = 'number' | 'text';

export interface AlarmView {
  // The entity's state (AlarmControlPanelState), unknown as it comes
  state: string;
  tone: Tone;
  // disarmed and the arm modes the entity supports
  modes: Mode[];
  // The mode the panel is in now, null on the way and when triggered
  active: Mode | null;
  canTrigger: boolean;
  // null: no code at all (CodeFormat in const.py)
  codeFormat: CodeFormat | null;
  // Arming needs the code too; HA's default is true
  // (_attr_code_arm_required in __init__.py)
  codeArmRequired: boolean;
  changedBy: string | null;
}

export const toneOf = (state: string): Tone => STATE_TONE[state] ?? 'unknown';

const isMode = (state: string): state is Mode => state === 'disarmed' || ARM_MODES.some((m) => m.mode === state);

// code_format is "number" or "text"; anything else that is set (an old
// integration's regex) is typed as text
export const codeFormatOf = (entity: HassEntity | undefined): CodeFormat | null => {
  const value = entity?.attributes.code_format;
  if (typeof value !== 'string' || value === '') return null;
  return value === 'number' ? 'number' : 'text';
};

export const viewOfAlarm = (entity: HassEntity | undefined): AlarmView => {
  const state = entity?.state ?? 'unknown';
  const supported = ARM_MODES.filter(({ feature }) => supports(entity, feature)).map(({ mode }) => mode);
  // The mode it is in, even when its feature isn't announced
  const modes: Mode[] = ['disarmed', ...ARM_MODES.map(({ mode }) => mode).filter((mode) => supported.includes(mode) || mode === state)];
  const changedBy = entity?.attributes.changed_by;
  return {
    state,
    tone: toneOf(state),
    modes,
    active: isMode(state) ? state : null,
    canTrigger: supports(entity, FEATURE.TRIGGER),
    codeFormat: codeFormatOf(entity),
    codeArmRequired: entity?.attributes.code_arm_required !== false,
    changedBy: typeof changedBy === 'string' && changedBy !== '' ? changedBy : null,
  };
};

// Whether the tile asks for the code first: disarming always when the panel
// has one (the integration checks it), arming only with code_arm_required
// (check_code_arm_required in __init__.py); the alarm itself is sent without
export const needsCode = (view: AlarmView, action: Action) => {
  if (view.codeFormat === null || action === 'trigger') return false;
  return action === 'disarmed' || view.codeArmRequired;
};

// While the alarm sounds or is about to (pending), disarming is what one
// wants: the keypad is there without a tap
export const urgent = (view: AlarmView) => view.state === 'triggered' || view.state === 'pending';

export interface ServiceCall {
  service: string;
  data: Record<string, unknown>;
}

// The code goes along only when one was typed (ATTR_CODE is optional in
// ALARM_SERVICE_SCHEMA, services.py)
export const actionCall = (action: Action, code?: string): ServiceCall => ({
  service: SERVICE[action],
  data: code ? { code } : {},
});
