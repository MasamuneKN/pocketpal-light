import {
  Classifier,
  CpuHeuristicRule,
  DeviceSignals,
  SocClass,
  Tier,
} from './types';

// Pure, deterministic, no I/O. Always returns a tier: the wire rules carry a
// last-resort match (`{}`) for both the soc-class fallback and the tier matrix,
// and a hardcoded floor guarantees totality even if a malformed file lacks it.

const matchCpuHeuristic = (
  rules: CpuHeuristicRule[],
  signals: DeviceSignals,
): SocClass | null => {
  const features = signals.cpuFeatures ?? [];
  for (const rule of rules) {
    const {featuresAny, featuresAll, maxFreqMhzMin} = rule.match;
    if (
      featuresAny !== undefined &&
      !featuresAny.some(f => features.includes(f))
    ) {
      continue;
    }
    if (
      featuresAll !== undefined &&
      !featuresAll.every(f => features.includes(f))
    ) {
      continue;
    }
    if (
      maxFreqMhzMin !== undefined &&
      (signals.maxFreqMhz === undefined || signals.maxFreqMhz < maxFreqMhzMin)
    ) {
      continue;
    }
    return rule.class;
  }
  return null;
};

const resolveSocClass = (
  signals: DeviceSignals,
  classifier: Classifier,
): SocClass | null => {
  if (signals.socModel && classifier.socModelToClass) {
    // MediaTek SOC_MODEL strings carry a vendor suffix (e.g. "MT6769V/CZ"); the
    // classifier keys are the base model ("MT6769"). Strip it on a lookup miss.
    const cls =
      classifier.socModelToClass[signals.socModel] ??
      classifier.socModelToClass[
        signals.socModel.replace(/V\/[A-Z0-9]+$/i, '')
      ];
    if (cls) {
      return cls;
    }
  }
  if (signals.hardware && classifier.hardwareToClass) {
    const cls = classifier.hardwareToClass[signals.hardware];
    if (cls) {
      return cls;
    }
  }
  if (classifier.cpuHeuristic) {
    return matchCpuHeuristic(classifier.cpuHeuristic, signals);
  }
  return null;
};

const resolveRamBand = (
  ramBytes: number,
  classifier: Classifier,
): string | null => {
  for (const band of classifier.ramBands) {
    if (band.maxBytes === null || ramBytes <= band.maxBytes) {
      return band.id;
    }
  }
  return null;
};

export function classify(
  signals: DeviceSignals,
  classifier: Classifier,
): Tier {
  const socClass = resolveSocClass(signals, classifier);
  const ramBand = resolveRamBand(signals.ramBytes, classifier);

  if (socClass !== null && ramBand !== null) {
    const entry = classifier.tierMatrix.find(
      e => e.ramBand === ramBand && e.socClass === socClass,
    );
    if (entry) {
      return entry.tier;
    }
  }

  // Last-resort floor: an unclassifiable device gets the lowest tier so the
  // picker is never empty (totality invariant).
  return 'low';
}
