/**
 * Preprocessing module for Healthcare Feature Engineering & Normalization.
 */

// Categorical mappings
export const MAPPINGS = {
  physical_activity: { Low: 1, Moderate: 2, High: 3 },
  smoking_status: { Never: 0, Former: 1, Current: 2 }
};

export const REVERSE_ACTIVITY_MAP = { 1: 'Low', 2: 'Moderate', 3: 'High' };

export const FEATURE_KEYS = [
  'age',
  'bmi',
  'resting_heart_rate',
  'systolic_bp',
  'diastolic_bp',
  'visit_frequency',
  'physical_activity_num',
  'sleep_hours'
];

/**
 * Encodes patient object into numerical feature vector.
 */
export function extractFeatureVector(patient) {
  const physical_activity_num = MAPPINGS.physical_activity[patient.physical_activity] || 2;
  const smoking_status_num = MAPPINGS.smoking_status[patient.smoking_status] || 0;

  return [
    patient.age,
    patient.bmi,
    patient.resting_heart_rate,
    patient.systolic_bp,
    patient.diastolic_bp,
    patient.visit_frequency,
    physical_activity_num,
    patient.sleep_hours
  ];
}

/**
 * Standardize feature matrix: (x - mean) / stdDev
 * Returns normalized matrix and scaling parameters (mean, stdDev).
 */
export function standardizeFeatures(patients) {
  const rawVectors = patients.map(extractFeatureVector);
  const numSamples = rawVectors.length;
  const numFeatures = FEATURE_KEYS.length;

  const means = new Array(numFeatures).fill(0);
  const stds = new Array(numFeatures).fill(0);

  // Compute Mean
  for (let f = 0; f < numFeatures; f++) {
    let sum = 0;
    for (let i = 0; i < numSamples; i++) {
      sum += rawVectors[i][f];
    }
    means[f] = sum / numSamples;
  }

  // Compute Standard Deviation
  for (let f = 0; f < numFeatures; f++) {
    let sumSq = 0;
    for (let i = 0; i < numSamples; i++) {
      sumSq += Math.pow(rawVectors[i][f] - means[f], 2);
    }
    const variance = sumSq / numSamples;
    stds[f] = variance > 0.000001 ? Math.sqrt(variance) : 1.0;
  }

  // Normalize
  const normalizedMatrix = rawVectors.map(vec =>
    vec.map((val, f) => (val - means[f]) / stds[f])
  );

  return {
    normalizedMatrix,
    rawVectors,
    means,
    stds,
    featureKeys: FEATURE_KEYS
  };
}

/**
 * Denormalize a feature vector back to real values.
 */
export function denormalizeVector(normalizedVec, means, stds) {
  return normalizedVec.map((val, f) => val * stds[f] + means[f]);
}
