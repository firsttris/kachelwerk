import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { actionCall, codeFormatOf, FEATURE, needsCode, toneOf, urgent, viewOfAlarm } from './alarmModel';

const panel = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'alarm_control_panel.haus',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// As HA's manual alarm reports itself: home, away, night, vacation,
// custom bypass and trigger, a number code that arming needs too
const manual = {
  code_format: 'number',
  code_arm_required: true,
  changed_by: null,
  supported_features: 63,
};

describe('viewOfAlarm', () => {
  it('lists disarmed and the supported arm modes in a fixed order', () => {
    const view = viewOfAlarm(panel('disarmed', manual));
    expect(view.modes).toEqual([
      'disarmed',
      'armed_home',
      'armed_away',
      'armed_night',
      'armed_vacation',
      'armed_custom_bypass',
    ]);
    expect(view.canTrigger).toBe(true);
    expect(view.active).toBe('disarmed');
    expect(view.tone).toBe('disarmed');
  });

  it('shows only the features the entity announces', () => {
    const view = viewOfAlarm(panel('armed_away', { supported_features: FEATURE.ARM_HOME | FEATURE.ARM_AWAY }));
    expect(view.modes).toEqual(['disarmed', 'armed_home', 'armed_away']);
    expect(view.canTrigger).toBe(false);
    expect(view.active).toBe('armed_away');
    expect(view.tone).toBe('armed');
  });

  it('keeps the mode it is in even without its feature', () => {
    expect(viewOfAlarm(panel('armed_night', { supported_features: FEATURE.ARM_AWAY })).modes).toEqual([
      'disarmed',
      'armed_away',
      'armed_night',
    ]);
  });

  it('has no active mode on the way or when triggered', () => {
    for (const state of ['arming', 'pending', 'disarming', 'triggered']) {
      expect(viewOfAlarm(panel(state, manual)).active).toBeNull();
    }
  });

  it('reads code_arm_required as HA defaults it (true) and changed_by', () => {
    expect(viewOfAlarm(panel('disarmed', { code_format: 'number' })).codeArmRequired).toBe(true);
    const view = viewOfAlarm(panel('armed_home', { code_arm_required: false, changed_by: 'Tristan' }));
    expect(view.codeArmRequired).toBe(false);
    expect(view.changedBy).toBe('Tristan');
  });

  it('copes with a missing entity', () => {
    const view = viewOfAlarm(undefined);
    expect(view.state).toBe('unknown');
    expect(view.tone).toBe('unknown');
    expect(view.modes).toEqual(['disarmed']);
    expect(view.codeFormat).toBeNull();
  });
});

describe('toneOf', () => {
  it('colors the states', () => {
    expect(toneOf('disarmed')).toBe('disarmed');
    expect(toneOf('armed_vacation')).toBe('armed');
    expect(toneOf('arming')).toBe('busy');
    expect(toneOf('pending')).toBe('busy');
    expect(toneOf('disarming')).toBe('busy');
    expect(toneOf('triggered')).toBe('triggered');
    expect(toneOf('unavailable')).toBe('unknown');
  });
});

describe('codeFormatOf', () => {
  it('knows number and text, takes anything else set as text', () => {
    expect(codeFormatOf(panel('disarmed', { code_format: 'number' }))).toBe('number');
    expect(codeFormatOf(panel('disarmed', { code_format: 'text' }))).toBe('text');
    expect(codeFormatOf(panel('disarmed', { code_format: '^\\d{4}$' }))).toBe('text');
    expect(codeFormatOf(panel('disarmed', { code_format: null }))).toBeNull();
    expect(codeFormatOf(panel('disarmed'))).toBeNull();
  });
});

describe('needsCode', () => {
  it('asks for the code to disarm, and to arm with code_arm_required', () => {
    const strict = viewOfAlarm(panel('armed_away', manual));
    expect(needsCode(strict, 'disarmed')).toBe(true);
    expect(needsCode(strict, 'armed_home')).toBe(true);
    expect(needsCode(strict, 'trigger')).toBe(false);
    const easy = viewOfAlarm(panel('disarmed', { ...manual, code_arm_required: false }));
    expect(needsCode(easy, 'armed_away')).toBe(false);
    expect(needsCode(easy, 'disarmed')).toBe(true);
  });

  it('never without a code_format', () => {
    const open = viewOfAlarm(panel('armed_home', { supported_features: 3, code_arm_required: true }));
    expect(needsCode(open, 'disarmed')).toBe(false);
    expect(needsCode(open, 'armed_away')).toBe(false);
  });
});

describe('urgent', () => {
  it('while triggered or pending', () => {
    expect(urgent(viewOfAlarm(panel('triggered', manual)))).toBe(true);
    expect(urgent(viewOfAlarm(panel('pending', manual)))).toBe(true);
    expect(urgent(viewOfAlarm(panel('arming', manual)))).toBe(false);
  });
});

describe('actionCall', () => {
  it('maps actions to services, with the code only when typed', () => {
    expect(actionCall('armed_away', '1234')).toEqual({ service: 'alarm_arm_away', data: { code: '1234' } });
    expect(actionCall('armed_custom_bypass')).toEqual({ service: 'alarm_arm_custom_bypass', data: {} });
    expect(actionCall('disarmed', '')).toEqual({ service: 'alarm_disarm', data: {} });
    expect(actionCall('armed_vacation')).toEqual({ service: 'alarm_arm_vacation', data: {} });
    expect(actionCall('trigger')).toEqual({ service: 'alarm_trigger', data: {} });
  });
});
