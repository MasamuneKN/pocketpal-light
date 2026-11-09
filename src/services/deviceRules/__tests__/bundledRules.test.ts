import androidBundledRules from '../../../store/bundledDeviceRules/rules.android.json';
import {parseDeviceRules} from '../parse';
import type {Tier} from '../types';

const TIERS: Tier[] = ['low', 'mid', 'high', 'flagship'];
const APP_VERSION = '1.22.0';
const rawCandidatesOf = (raw: typeof androidBundledRules, tier: Tier) =>
  (raw.tiers as Record<string, {candidates: any[]}>)[tier].candidates;
const isGated = (value: any): boolean =>
  value !== undefined && value !== null && value.min_app_version !== undefined;

describe('bundled Android rules', () => {
  const raw = androidBundledRules;

  it('is a schema 2.0.0 document and retains all candidates at the shipped app version', () => {
    const rules = parseDeviceRules(raw, APP_VERSION);
    expect(rules.platform).toBe('android');
    expect(rules.schemaVersion).toBe('2.0.0');
    for (const tier of TIERS) {
      const rawCandidates = rawCandidatesOf(raw, tier);
      const models = rules.tiers[tier].models;
      expect(models.map(model => model.model)).toEqual(
        rawCandidates.map(candidate => candidate.model),
      );
      models.forEach((model, index) => {
        expect(model.draft !== undefined).toBe(
          rawCandidates[index].draft !== undefined,
        );
        expect(model.mmproj !== undefined).toBe(
          rawCandidates[index].mmproj !== undefined,
        );
      });
    }
  });

  it('drops only version-gated candidates when the app version is unknown', () => {
    const shipped = parseDeviceRules(raw, APP_VERSION);
    const unknown = parseDeviceRules(raw, 'unknown');
    for (const tier of TIERS) {
      const candidates = rawCandidatesOf(raw, tier);
      expect(unknown.tiers[tier].models).toEqual(
        shipped.tiers[tier].models.filter(
          (_model, index) => !isGated(candidates[index]),
        ),
      );
    }
  });

  it('does not version-gate projector or draft references', () => {
    for (const tier of TIERS) {
      for (const candidate of rawCandidatesOf(raw, tier)) {
        expect(isGated(candidate.mmproj)).toBe(false);
        expect(isGated(candidate.draft)).toBe(false);
      }
    }
  });

  it('keeps at least one ungated candidate in every tier', () => {
    for (const tier of TIERS) {
      expect(
        rawCandidatesOf(raw, tier).some(candidate => !isGated(candidate)),
      ).toBe(true);
    }
  });
});
