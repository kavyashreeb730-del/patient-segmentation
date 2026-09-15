import { standardizeFeatures, denormalizeVector, REVERSE_ACTIVITY_MAP } from './preprocessing';
import { runKMeans } from './kmeans';

/**
 * Generates descriptive segment names based on centroid statistics.
 */
export function generateSegmentLabel(centroid, overallAverages, clusterIndex) {
  const { age, bmi, resting_heart_rate, systolic_bp, visit_frequency, physical_activity_num } = centroid;

  const isOlder = age > 55 || age > overallAverages.age + 5;
  const isYounger = age < 38 || age < overallAverages.age - 5;
  const isHighActivity = physical_activity_num > 2.2;
  const isLowActivity = physical_activity_num < 1.7;
  const isFrequentVisitor = visit_frequency > 7 || visit_frequency > overallAverages.visit_frequency + 2;
  const isHighBMI = bmi > 27.5 || bmi > overallAverages.bmi + 2;
  const isElevatedBP = systolic_bp > 135;

  if (isYounger && isHighActivity) {
    return 'Younger Active Patients';
  }
  if (isOlder && isFrequentVisitor) {
    return 'Older Frequent Visitors';
  }
  if (isHighActivity && visit_frequency <= 3) {
    return 'Higher Activity Patients';
  }
  if (isFrequentVisitor && (isElevatedBP || isHighBMI)) {
    return 'Regular Healthcare Visitors';
  }
  if (isHighBMI && isLowActivity) {
    return 'Higher Measurement Group';
  }
  if (isLowActivity) {
    return 'Low Activity Patients';
  }
  if (Math.abs(bmi - overallAverages.bmi) < 3 && Math.abs(age - overallAverages.age) < 10) {
    return 'Balanced Health Profiles';
  }

  // Fallback pool of unique descriptive names
  const fallbacks = [
    'General Health Segment',
    'Moderate Care Profile',
    'Active Lifestyle Cohort',
    'Extended Care Visitors',
    'Standard Demographic Group',
    'Wellness Focused Group'
  ];

  return `${fallbacks[clusterIndex % fallbacks.length]}`;
}

/**
 * Execute full clustering pipeline on dataset.
 * @param {Array<Object>} patients - Raw cleaned patient records
 * @param {number} k - Number of clusters (2..6)
 */
export async function performPatientSegmentation(patients, k) {
  if (!patients || patients.length === 0) {
    throw new Error('No patient data available for clustering.');
  }

  // 1. Standardize features
  const { normalizedMatrix, means, stds, featureKeys } = standardizeFeatures(patients);

  // 2. Run K-Means
  const kResult = await runKMeans(normalizedMatrix, k);
  const { assignments, centroids, inertia, silhouetteScore, iterations } = kResult;

  // 3. Attach segment assignment to patients
  const segmentedPatients = patients.map((p, idx) => ({
    ...p,
    cluster: assignments[idx],
    segmentId: `Segment ${assignments[idx] + 1}`
  }));

  // 4. Overall Dataset Averages
  const totalPatients = patients.length;
  const overallAverages = {
    age: Number((patients.reduce((s, p) => s + p.age, 0) / totalPatients).toFixed(1)),
    bmi: Number((patients.reduce((s, p) => s + p.bmi, 0) / totalPatients).toFixed(1)),
    resting_heart_rate: Number((patients.reduce((s, p) => s + p.resting_heart_rate, 0) / totalPatients).toFixed(1)),
    systolic_bp: Number((patients.reduce((s, p) => s + p.systolic_bp, 0) / totalPatients).toFixed(1)),
    diastolic_bp: Number((patients.reduce((s, p) => s + p.diastolic_bp, 0) / totalPatients).toFixed(1)),
    visit_frequency: Number((patients.reduce((s, p) => s + p.visit_frequency, 0) / totalPatients).toFixed(1)),
    sleep_hours: Number((patients.reduce((s, p) => s + p.sleep_hours, 0) / totalPatients).toFixed(1))
  };

  // Median Age for Healthcare Analysis Page
  const sortedAges = [...patients.map(p => p.age)].sort((a, b) => a - b);
  const midAgeIdx = Math.floor(sortedAges.length / 2);
  const medianAge = sortedAges.length % 2 !== 0
    ? sortedAges[midAgeIdx]
    : Number(((sortedAges[midAgeIdx - 1] + sortedAges[midAgeIdx]) / 2).toFixed(1));

  overallAverages.medianAge = medianAge;

  // 5. Build Segment Summaries
  const usedNames = new Set();
  const segments = centroids.map((cNorm, clusterIdx) => {
    const denorm = denormalizeVector(cNorm, means, stds);
    const centroidObj = {};
    featureKeys.forEach((key, fIdx) => {
      centroidObj[key] = denorm[fIdx];
    });

    // Filter patients belonging to this cluster
    const clusterPatients = segmentedPatients.filter(p => p.cluster === clusterIdx);
    const count = clusterPatients.length;
    const percentage = Number(((count / totalPatients) * 100).toFixed(1));

    // Calculate actual cluster means from cluster patients
    const avgAge = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.age, 0) / count).toFixed(1)) : 0;
    const avgBmi = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.bmi, 0) / count).toFixed(1)) : 0;
    const avgHeartRate = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.resting_heart_rate, 0) / count).toFixed(1)) : 0;
    const avgSystolic = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.systolic_bp, 0) / count).toFixed(1)) : 0;
    const avgDiastolic = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.diastolic_bp, 0) / count).toFixed(1)) : 0;
    const avgVisitFreq = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.visit_frequency, 0) / count).toFixed(1)) : 0;
    const avgSleepHours = count > 0 ? Number((clusterPatients.reduce((s, p) => s + p.sleep_hours, 0) / count).toFixed(1)) : 0;

    // Physical Activity breakdown
    const actCounts = { Low: 0, Moderate: 0, High: 0 };
    clusterPatients.forEach(p => {
      if (actCounts[p.physical_activity] !== undefined) actCounts[p.physical_activity]++;
    });
    const dominantActivity = Object.entries(actCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Moderate';

    // Generate descriptive label
    let name = generateSegmentLabel(
      {
        age: avgAge,
        bmi: avgBmi,
        resting_heart_rate: avgHeartRate,
        systolic_bp: avgSystolic,
        visit_frequency: avgVisitFreq,
        physical_activity_num: centroidObj.physical_activity_num
      },
      overallAverages,
      clusterIdx
    );

    // Guarantee unique names if collision occurs
    if (usedNames.has(name)) {
      name = `${name} (${clusterIdx + 1})`;
    }
    usedNames.add(name);

    return {
      clusterIndex: clusterIdx,
      segmentId: `Segment ${clusterIdx + 1}`,
      name,
      patientCount: count,
      percentage,
      averages: {
        age: avgAge,
        bmi: avgBmi,
        heartRate: avgHeartRate,
        systolicBp: avgSystolic,
        diastolicBp: avgDiastolic,
        visitFrequency: avgVisitFreq,
        sleepHours: avgSleepHours,
        physicalActivity: dominantActivity
      },
      patientIds: clusterPatients.map(p => p.patient_id)
    };
  });

  return {
    k,
    totalPatients,
    segmentedPatients,
    segments,
    overallAverages,
    performance: {
      inertia,
      silhouetteScore,
      iterations
    }
  };
}
