import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { CoverFeature, levelCall, reportOfCover, slatsOfCover } from './coverModel';

const cover = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'cover.kueche',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

const positioned = CoverFeature.OPEN | CoverFeature.CLOSE | CoverFeature.STOP | CoverFeature.SET_POSITION;

describe('reportOfCover', () => {
  it('reads the position and whether the cover travels', () => {
    expect(reportOfCover(cover('open', { current_position: 60 }))).toEqual({ level: 60, moving: false });
    expect(reportOfCover(cover('closing', { current_position: 60 }))).toEqual({ level: 60, moving: true });
    expect(reportOfCover(cover('opening', { current_position: 0 }))).toEqual({ level: 0, moving: true });
    expect(reportOfCover(cover('open', { current_position: 28.999999 }))).toEqual({ level: 29, moving: false });
  });

  it('draws a cover without positions fully open or closed', () => {
    expect(reportOfCover(cover('open'))).toEqual({ level: 100, moving: false });
    expect(reportOfCover(cover('closed'))).toEqual({ level: 0, moving: false });
    expect(reportOfCover(cover('closing'))).toEqual({ level: 100, moving: true });
    expect(reportOfCover(undefined)).toEqual({ level: 0, moving: false });
  });
});

describe('slatsOfCover', () => {
  it('shows slats only when the tilt can be set', () => {
    expect(slatsOfCover(cover('open', { supported_features: positioned, current_tilt_position: 40 }))).toBeNull();
    expect(
      slatsOfCover(
        cover('open', {
          supported_features: positioned | CoverFeature.SET_TILT_POSITION,
          current_tilt_position: 40,
        }),
      ),
    ).toBe(40);
  });
});

describe('levelCall', () => {
  it('sets the position where the cover can', () => {
    expect(levelCall(cover('open', { supported_features: positioned }), 30)).toEqual({
      service: 'set_cover_position',
      data: { position: 30 },
    });
  });

  it('opens or closes a cover without positions', () => {
    const simple = cover('open', { supported_features: CoverFeature.OPEN | CoverFeature.CLOSE });
    expect(levelCall(simple, 80).service).toBe('open_cover');
    expect(levelCall(simple, 20).service).toBe('close_cover');
  });
});
