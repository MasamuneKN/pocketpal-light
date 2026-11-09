import {classify} from '../classify';
import {Classifier, DeviceSignals} from '../types';

const androidClassifier: Classifier = {
  ramBands: [
    {id: 'lt-4', maxBytes: 4294967296},
    {id: '4-6', maxBytes: 6442450944},
    {id: '6-8', maxBytes: 8589934592},
    {id: '8-12', maxBytes: 12884901888},
    {id: '12-plus', maxBytes: null},
  ],
  socModelToClass: {
    SM8650: 'flagship',
    'Tensor G3': 'mid',
    MT6769: 'mid',
    SM4350: 'budget',
  },
  hardwareToClass: {
    shiba: 'mid',
    sun: 'flagship',
    bengal: 'budget',
  },
  cpuHeuristic: [
    {match: {featuresAny: ['i8mm']}, class: 'flagship'},
    {match: {featuresAll: ['dotprod'], maxFreqMhzMin: 2400}, class: 'mid'},
    {match: {}, class: 'budget'},
  ],
  tierMatrix: [
    {ramBand: '4-6', socClass: 'flagship', tier: 'mid'},
    {ramBand: '6-8', socClass: 'mid', tier: 'mid'},
    {ramBand: '6-8', socClass: 'flagship', tier: 'high'},
    {ramBand: '8-12', socClass: 'flagship', tier: 'flagship'},
    {ramBand: 'lt-4', socClass: 'budget', tier: 'low'},
  ],
};

const GiB = 1024 * 1024 * 1024;

describe('classify', () => {
  it('classifies a mid-tier Android device by socModel', () => {
    const signals: DeviceSignals = {
      ramBytes: 8 * GiB,
      socModel: 'Tensor G3',
    };
    expect(classify(signals, androidClassifier)).toBe('mid');
  });

  it('falls back to hardware when socModel is unknown', () => {
    const signals: DeviceSignals = {
      ramBytes: 8 * GiB,
      socModel: 'UNKNOWN_SOC',
      hardware: 'shiba',
    };
    expect(classify(signals, androidClassifier)).toBe('mid');
  });

  it('falls back to cpu heuristic when soc and hardware miss', () => {
    const signals: DeviceSignals = {
      ramBytes: 8 * GiB,
      cpuFeatures: ['i8mm', 'dotprod'],
    };
    // i8mm -> flagship, ram 8GiB -> band 6-8 -> high
    expect(classify(signals, androidClassifier)).toBe('high');
  });

  it('strips a MediaTek vendor suffix to match the base socModel key', () => {
    const signals: DeviceSignals = {
      ramBytes: 8 * GiB,
      socModel: 'MT6769V/CZ',
    };
    // exact key miss -> strip "V/CZ" -> MT6769 -> mid; ram 6-8 + mid -> mid
    expect(classify(signals, androidClassifier)).toBe('mid');
  });

  it('matches the dotprod heuristic (alias surfaced by readDeviceSignals)', () => {
    const signals: DeviceSignals = {
      ramBytes: 8 * GiB,
      socModel: 'UNKNOWN_SOC',
      hardware: 'qcom',
      cpuFeatures: ['asimd', 'asimddp', 'dotprod'],
      maxFreqMhz: 2500,
    };
    // soc + hardware miss -> dotprod & freq>=2400 -> mid; ram 6-8 + mid -> mid
    expect(classify(signals, androidClassifier)).toBe('mid');
  });

  it('returns low for a device unknown to the classifier', () => {
    const signals: DeviceSignals = {
      ramBytes: 2 * GiB,
      socModel: 'TOTALLY_UNKNOWN',
    };
    // soc miss, no hardware, cpu_heuristic {} -> budget; ram 2GiB -> lt-4
    expect(classify(signals, androidClassifier)).toBe('low');
  });

  it('treats absent minRamGb / features as no-match in cpu heuristic', () => {
    const signals: DeviceSignals = {ramBytes: 8 * GiB};
    // no features, no freq -> only {} rule matches -> budget; 6-8 budget has no
    // matrix entry here -> floor low
    expect(classify(signals, androidClassifier)).toBe('low');
  });
});
