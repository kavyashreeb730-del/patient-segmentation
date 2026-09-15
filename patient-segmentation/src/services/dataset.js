import Papa from 'papaparse';

/**
 * Load and preprocess raw patients CSV from public/data/patients.csv
 * Includes validation, numeric conversion, median/mode imputation, and deduplication.
 */
export async function loadPatientsDataset() {
  return new Promise((resolve, reject) => {
    Papa.parse('/data/patients.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error('Dataset is empty or could not be loaded.');
          }

          const rawData = results.data;
          const requiredCols = [
            'patient_id', 'age', 'gender', 'height', 'weight', 'bmi',
            'resting_heart_rate', 'systolic_bp', 'diastolic_bp',
            'visit_frequency', 'physical_activity', 'sleep_hours', 'smoking_status'
          ];

          // Validate required headers
          const firstRow = rawData[0];
          for (const col of requiredCols) {
            if (!(col in firstRow)) {
              throw new Error(`Missing required column in dataset: ${col}`);
            }
          }

          // Compute Medians for Numeric Imputation
          const numericCols = [
            'age', 'height', 'weight', 'bmi', 'resting_heart_rate',
            'systolic_bp', 'diastolic_bp', 'visit_frequency', 'sleep_hours'
          ];

          const medians = {};
          numericCols.forEach(col => {
            const vals = rawData
              .map(r => parseFloat(r[col]))
              .filter(v => !isNaN(v))
              .sort((a, b) => a - b);

            if (vals.length > 0) {
              const mid = Math.floor(vals.length / 2);
              medians[col] = vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
            } else {
              medians[col] = 0;
            }
          });

          // Mode for Categoricals
          const modeCategorical = (col, fallback) => {
            const counts = {};
            rawData.forEach(r => {
              const val = r[col]?.trim();
              if (val) counts[val] = (counts[val] || 0) + 1;
            });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            return sorted.length > 0 ? sorted[0][0] : fallback;
          };

          const defaultGender = modeCategorical('gender', 'Female');
          const defaultActivity = modeCategorical('physical_activity', 'Moderate');
          const defaultSmoking = modeCategorical('smoking_status', 'Never');

          // Clean & parse rows, deduplicating patient_id
          const seenIds = new Set();
          const cleanedPatients = [];

          rawData.forEach((row, idx) => {
            let pid = row.patient_id?.trim();
            if (!pid) pid = `P_GEN_${idx + 1000}`;
            if (seenIds.has(pid)) return; // skip duplicates
            seenIds.add(pid);

            const age = isNaN(parseFloat(row.age)) ? medians.age : Math.max(1, Math.min(120, parseFloat(row.age)));
            const height = isNaN(parseFloat(row.height)) ? medians.height : parseFloat(row.height);
            const weight = isNaN(parseFloat(row.weight)) ? medians.weight : parseFloat(row.weight);

            // Recompute or use BMI
            let bmi = parseFloat(row.bmi);
            if (isNaN(bmi) || bmi <= 0) {
              bmi = (weight && height) ? Number((weight / Math.pow(height / 100, 2)).toFixed(1)) : medians.bmi;
            }

            const resting_heart_rate = isNaN(parseFloat(row.resting_heart_rate))
              ? medians.resting_heart_rate
              : parseFloat(row.resting_heart_rate);

            const systolic_bp = isNaN(parseFloat(row.systolic_bp))
              ? medians.systolic_bp
              : parseFloat(row.systolic_bp);

            const diastolic_bp = isNaN(parseFloat(row.diastolic_bp))
              ? medians.diastolic_bp
              : parseFloat(row.diastolic_bp);

            const visit_frequency = isNaN(parseFloat(row.visit_frequency))
              ? medians.visit_frequency
              : Math.max(0, parseFloat(row.visit_frequency));

            const sleep_hours = isNaN(parseFloat(row.sleep_hours))
              ? medians.sleep_hours
              : parseFloat(row.sleep_hours);

            const gender = (row.gender?.trim() === 'Male' || row.gender?.trim() === 'Female')
              ? row.gender.trim()
              : defaultGender;

            const physical_activity = ['Low', 'Moderate', 'High'].includes(row.physical_activity?.trim())
              ? row.physical_activity.trim()
              : defaultActivity;

            const smoking_status = ['Never', 'Former', 'Current'].includes(row.smoking_status?.trim())
              ? row.smoking_status.trim()
              : defaultSmoking;

            cleanedPatients.push({
              patient_id: pid,
              age,
              gender,
              height,
              weight,
              bmi: Number(bmi.toFixed(1)),
              resting_heart_rate: Math.round(resting_heart_rate),
              systolic_bp: Math.round(systolic_bp),
              diastolic_bp: Math.round(diastolic_bp),
              visit_frequency: Math.round(visit_frequency),
              physical_activity,
              sleep_hours: Number(sleep_hours.toFixed(1)),
              smoking_status
            });
          });

          if (cleanedPatients.length < 5) {
            throw new Error('Insufficient patient records for clustering (minimum 5 required).');
          }

          resolve(cleanedPatients);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(new Error(`Failed to load patients CSV: ${err.message}`));
      }
    });
  });
}
