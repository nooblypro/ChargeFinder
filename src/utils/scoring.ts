import type { HubSignals, SignalWeightConfig, HubScoreResult, SignalCalculationBreakdown, SignalType } from '../types/charging.js';
import { DEFAULT_WEIGHTS, SUPPRESSION_THRESHOLD_ECS } from '../data/fixtures.js';

export const SIGNAL_LABELS: Record<SignalType, string> = {
  venue: 'Venue Pressure Proxy',
  hardware: 'Hardware Reliability',
  regional: 'Regional Baseline',
  corridor: 'Corridor Alerts',
};

export const EPISTEMIC_LABELS: Record<SignalType, string> = {
  venue: 'Venue Pressure Proxy',
  hardware: 'Hardware Reliability',
  regional: 'Low specificity — does not directly describe this station',
  corridor: 'Low specificity — does not directly describe this station',
};

export const STATEWIDE_WEIGHTS: SignalWeightConfig = {
  venue: 0.35,
  hardware: 0.45,
  regional: 0.10,
  corridor: 0.10,
};

/**
 * Calculates raw CSDS (Charging Stop Desirability Score):
 * CSDS = 100 * [ sum_{available}(w_i * (1 - r_i)) / sum_{available}(w_i) ]
 */
export function calculateCSDS(signals: HubSignals, weights: SignalWeightConfig = DEFAULT_WEIGHTS): { rawCsds: number; availableWeightSum: number } {
  let numeratorSum = 0;
  let availableWeightSum = 0;

  const signalKeys: SignalType[] = ['venue', 'hardware', 'regional', 'corridor'];

  for (const key of signalKeys) {
    const signal = signals?.[key];
    const w = weights?.[key] ?? 0;

    if (signal && signal.available && signal.r_value !== null) {
      const r = signal.r_value;
      numeratorSum += w * (1 - r);
      availableWeightSum += w;
    }
  }

  if (availableWeightSum === 0) {
    return { rawCsds: 0, availableWeightSum: 0 };
  }

  const rawCsds = 100 * (numeratorSum / availableWeightSum);
  return { rawCsds, availableWeightSum };
}

/**
 * Calculates ECS (Evidence Confidence Score):
 * ECS = 100 * sum(w_i * c_i)
 */
export function calculateECS(signals: HubSignals, weights: SignalWeightConfig = DEFAULT_WEIGHTS): number {
  let ecsSum = 0;
  const signalKeys: SignalType[] = ['venue', 'hardware', 'regional', 'corridor'];

  for (const key of signalKeys) {
    const signal = signals?.[key];
    const w = weights?.[key] ?? 0;
    const c = signal?.c_value ?? 0;

    ecsSum += w * c;
  }

  return 100 * ecsSum;
}

/**
 * Evaluates complete Hub Score object with breakdown, suppression, and friction classification
 */
export function evaluateHubScore(
  signals: HubSignals,
  weights: SignalWeightConfig = DEFAULT_WEIGHTS,
  suppressionThreshold: number = SUPPRESSION_THRESHOLD_ECS
): HubScoreResult {
  const { rawCsds, availableWeightSum } = calculateCSDS(signals, weights);
  const ecsScore = calculateECS(signals, weights);

  const csdsRounded = Math.round(rawCsds * 10) / 10;
  const ecsRounded = Math.round(ecsScore * 10) / 10;

  const isSuppressed = ecsRounded < suppressionThreshold;
  const displayCSDS = isSuppressed ? "Suppressed" : `${csdsRounded.toFixed(1)}%`;

  let frictionLevel: HubScoreResult['frictionLevel'] = 'LOW_FRICTION';
  if (isSuppressed) {
    frictionLevel = 'SUPPRESSED';
  } else if (csdsRounded < 50) {
    frictionLevel = 'HIGH_FRICTION';
  } else if (csdsRounded < 75) {
    frictionLevel = 'MODERATE_FRICTION';
  } else {
    frictionLevel = 'LOW_FRICTION';
  }

  const signalKeys: SignalType[] = ['venue', 'hardware', 'regional', 'corridor'];
  const breakdown: SignalCalculationBreakdown[] = signalKeys.map((key) => {
    const signal = signals?.[key] || { available: false, r_value: null, c_value: 0.0, text: 'Signal unavailable' };
    const w = weights?.[key] ?? 0;
    const isAvail = signal.available && signal.r_value !== null;
    const rVal = signal.r_value;
    const cVal = signal.c_value ?? 0;

    return {
      type: key,
      label: SIGNAL_LABELS[key],
      weight: w,
      available: signal.available ?? false,
      r_value: rVal,
      c_value: cVal,
      effectiveFrictionTerm: isAvail && rVal !== null ? w * (1 - rVal) : null,
      effectiveConfidenceTerm: w * cVal,
      text: signal.text || 'No signal details provided.',
      source: signal.source,
      retrieved_at: signal.retrieved_at,
      diagnostics: signal.diagnostics,
    };
  });

  const totalWeightSum = (Object.values(weights) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);

  return {
    csdsRaw: csdsRounded,
    ecsScore: ecsRounded,
    isSuppressed,
    displayCSDS,
    availableWeightSum,
    totalWeightSum,
    breakdown,
    frictionLevel,
  };
}
