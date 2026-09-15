/**
 * Utility module for generating dynamic segment insights and patient behavior matrices.
 */

/**
 * Generate bullet points of key segment insights dynamically from cluster results.
 */
export function generateDynamicInsights(segmentationResult) {
  if (!segmentationResult || !segmentationResult.segments) return [];

  const { segments, totalPatients } = segmentationResult;
  const insights = [];

  // 1. Largest Segment Insight
  const sortedByCount = [...segments].sort((a, b) => b.patientCount - a.patientCount);
  const largest = sortedByCount[0];
  if (largest) {
    insights.push(
      `${largest.segmentId} ("${largest.name}") contains the largest patient cohort with ${largest.patientCount} patients (${largest.percentage}% of total dataset).`
    );
  }

  // 2. Highest Visit Frequency Insight
  const sortedByVisit = [...segments].sort((a, b) => b.averages.visitFrequency - a.averages.visitFrequency);
  const highestVisit = sortedByVisit[0];
  if (highestVisit) {
    insights.push(
      `${highestVisit.segmentId} ("${highestVisit.name}") has the highest average healthcare visit frequency at ${highestVisit.averages.visitFrequency} visits/year.`
    );
  }

  // 3. Physical Activity & Lifestyle Insight
  const activeSegments = segments.filter(s => s.averages.physicalActivity === 'High');
  if (activeSegments.length > 0) {
    const actNames = activeSegments.map(s => `${s.segmentId} ("${s.name}")`).join(', ');
    insights.push(
      `${actNames} represents the group with the highest physical activity levels across dataset cohorts.`
    );
  } else {
    const sortedByActivity = [...segments].sort((a, b) => b.averages.visitFrequency - a.averages.visitFrequency);
    insights.push(
      `Physical activity patterns vary across segments, with ${sortedByActivity[sortedByActivity.length - 1].segmentId} showing moderate to balanced lifestyle engagement.`
    );
  }

  // 4. BMI & Age Pattern Insight
  const sortedByBmi = [...segments].sort((a, b) => b.averages.bmi - a.averages.bmi);
  const highestBmi = sortedByBmi[0];
  if (highestBmi) {
    insights.push(
      `${highestBmi.segmentId} ("${highestBmi.name}") records the highest average BMI (${highestBmi.averages.bmi}) and an average resting heart rate of ${highestBmi.averages.heartRate} bpm.`
    );
  }

  return insights;
}

/**
 * Generate a short 1-2 sentence dashboard summary text.
 */
export function generateDashboardSummary(segmentationResult) {
  if (!segmentationResult || !segmentationResult.segments) {
    return 'Patient segmentation analysis is currently loading...';
  }

  const { segments } = segmentationResult;
  const sortedByCount = [...segments].sort((a, b) => b.patientCount - a.patientCount);
  const largest = sortedByCount[0];
  const sortedByVisit = [...segments].sort((a, b) => b.averages.visitFrequency - a.averages.visitFrequency);
  const highestVisit = sortedByVisit[0];

  return `${largest.segmentId} ("${largest.name}") represents the largest patient cohort (${largest.percentage}%). Meanwhile, ${highestVisit.segmentId} demonstrates the highest visit frequency at ${highestVisit.averages.visitFrequency} visits/year.`;
}

/**
 * Build comparison matrix table data across segments.
 */
export function buildBehaviorMatrix(segmentationResult) {
  if (!segmentationResult || !segmentationResult.segments) return [];

  return segmentationResult.segments.map(s => ({
    segmentId: s.segmentId,
    name: s.name,
    patientCount: s.patientCount,
    percentage: s.percentage,
    avgAge: s.averages.age,
    avgBmi: s.averages.bmi,
    visitFrequency: s.averages.visitFrequency,
    activityLevel: s.averages.physicalActivity,
    sleepHours: s.averages.sleepHours,
    heartRate: s.averages.heartRate,
    systolicBp: s.averages.systolicBp
  }));
}
