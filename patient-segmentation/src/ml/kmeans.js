import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow.js K-Means Clustering Engine with Inertia and Silhouette Score.
 */

/**
 * Euclidean distance squared between two 1D arrays.
 */
function euclideanDistanceSq(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

function euclideanDistance(a, b) {
  return Math.sqrt(euclideanDistanceSq(a, b));
}

/**
 * Run K-Means Clustering on normalized matrix.
 * @param {Array<Array<number>>} dataMatrix - Normalized features (N x D)
 * @param {number} k - Number of clusters (2..6)
 * @param {number} maxIter - Max iterations (default 100)
 */
export async function runKMeans(dataMatrix, k, maxIter = 100) {
  return tf.tidy(() => {
    const numSamples = dataMatrix.length;
    const numFeatures = dataMatrix[0].length;

    // 1. Initialize Centroids (K-Means++ style or deterministic spread)
    const centroids = [];
    const usedIndices = new Set();

    // Pick first centroid randomly/deterministically
    const firstIdx = Math.floor(numSamples / 3) % numSamples;
    centroids.push([...dataMatrix[firstIdx]]);
    usedIndices.add(firstIdx);

    // K-means++ selection for remaining
    while (centroids.length < k) {
      const distances = new Array(numSamples).fill(Infinity);
      for (let i = 0; i < numSamples; i++) {
        for (const c of centroids) {
          const d = euclideanDistanceSq(dataMatrix[i], c);
          if (d < distances[i]) distances[i] = d;
        }
      }

      // Find max distance point
      let maxD = -1;
      let nextIdx = 0;
      for (let i = 0; i < numSamples; i++) {
        if (!usedIndices.has(i) && distances[i] > maxD) {
          maxD = distances[i];
          nextIdx = i;
        }
      }
      centroids.push([...dataMatrix[nextIdx]]);
      usedIndices.add(nextIdx);
    }

    let assignments = new Array(numSamples).fill(0);
    let converged = false;
    let iter = 0;

    // 2. Iterative Optimization Loop using TF Tensors for fast matrix distance
    const dataTensor = tf.tensor2d(dataMatrix);

    while (!converged && iter < maxIter) {
      iter++;
      const centroidsTensor = tf.tensor2d(centroids);

      // Distance calculation: ||X||^2 + ||C||^2 - 2 X C^T
      const xSq = dataTensor.square().sum(1).expandDims(1); // (N, 1)
      const cSq = centroidsTensor.square().sum(1).expandDims(0); // (1, K)
      const dot = dataTensor.matMul(centroidsTensor.transpose()); // (N, K)
      const distTensor = xSq.add(cSq).sub(dot.mul(2)); // (N, K)

      const newAssignmentsTensor = distTensor.argMin(1);
      const newAssignments = Array.from(newAssignmentsTensor.dataSync());
      newAssignmentsTensor.dispose();
      centroidsTensor.dispose();
      distTensor.dispose();
      xSq.dispose();
      cSq.dispose();
      dot.dispose();

      // Check convergence
      let changed = false;
      for (let i = 0; i < numSamples; i++) {
        if (newAssignments[i] !== assignments[i]) {
          changed = true;
          break;
        }
      }
      assignments = newAssignments;

      if (!changed) {
        converged = true;
      } else {
        // Recompute centroids
        for (let c = 0; c < k; c++) {
          const clusterPoints = [];
          for (let i = 0; i < numSamples; i++) {
            if (assignments[i] === c) {
              clusterPoints.push(dataMatrix[i]);
            }
          }
          if (clusterPoints.length > 0) {
            const newC = new Array(numFeatures).fill(0);
            for (const pt of clusterPoints) {
              for (let f = 0; f < numFeatures; f++) {
                newC[f] += pt[f];
              }
            }
            centroids[c] = newC.map(val => val / clusterPoints.length);
          }
        }
      }
    }

    // 3. Compute Inertia (Within-Cluster Sum of Squared Distances)
    let inertia = 0;
    for (let i = 0; i < numSamples; i++) {
      const c = assignments[i];
      inertia += euclideanDistanceSq(dataMatrix[i], centroids[c]);
    }

    // 4. Compute Silhouette Score
    const silhouetteScore = calculateSilhouetteScore(dataMatrix, assignments, k);

    return {
      assignments,
      centroids,
      inertia: Number(inertia.toFixed(2)),
      silhouetteScore: Number(silhouetteScore.toFixed(3)),
      iterations: iter
    };
  });
}

/**
 * Exact calculation of Silhouette Score across all samples.
 */
function calculateSilhouetteScore(dataMatrix, assignments, k) {
  const numSamples = dataMatrix.length;
  if (numSamples < 2 || k <= 1) return 0;

  // Group indices by cluster
  const clusterIndices = Array.from({ length: k }, () => []);
  for (let i = 0; i < numSamples; i++) {
    clusterIndices[assignments[i]].push(i);
  }

  let totalSilhouette = 0;
  let validCount = 0;

  for (let i = 0; i < numSamples; i++) {
    const ownClusterIdx = assignments[i];
    const ownClusterMembers = clusterIndices[ownClusterIdx];

    // a(i): Mean distance to other points in the same cluster
    let a = 0;
    if (ownClusterMembers.length > 1) {
      let sumDist = 0;
      for (const otherIdx of ownClusterMembers) {
        if (otherIdx !== i) {
          sumDist += euclideanDistance(dataMatrix[i], dataMatrix[otherIdx]);
        }
      }
      a = sumDist / (ownClusterMembers.length - 1);
    } else {
      a = 0; // Cluster with single element
    }

    // b(i): Min mean distance to points in any other cluster
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === ownClusterIdx) continue;
      const otherMembers = clusterIndices[c];
      if (otherMembers.length === 0) continue;

      let sumDist = 0;
      for (const otherIdx of otherMembers) {
        sumDist += euclideanDistance(dataMatrix[i], dataMatrix[otherIdx]);
      }
      const meanDist = sumDist / otherMembers.length;
      if (meanDist < b) {
        b = meanDist;
      }
    }

    if (b === Infinity) b = 0;

    const maxAB = Math.max(a, b);
    if (maxAB > 0) {
      const s = (b - a) / maxAB;
      totalSilhouette += s;
      validCount++;
    }
  }

  return validCount > 0 ? totalSilhouette / validCount : 0;
}
