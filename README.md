# patient-segmentation
AI-powered Patient Segmentation Dashboard using React, TensorFlow.js, and K-Means clustering to analyze healthcare data, identify patient groups, visualize clusters, and evaluate segmentation performance.
Project Overview

Patient segmentation is the process of grouping patients based on similarities in their characteristics and healthcare behavior.

This project applies K-Means clustering to patient data and presents the results through an interactive dashboard. Users can explore different patient segments, visualize clusters, and evaluate clustering performance using metrics such as Inertia and Silhouette Score.

Features
Interactive healthcare analytics dashboard
K-Means patient segmentation
TensorFlow.js-based machine learning
Configurable number of clusters from K = 2 to K = 6
Data preprocessing and validation
Missing-value handling
Duplicate patient ID removal
Feature standardization
Cluster visualization using interactive charts
Inertia calculation
Silhouette Score calculation
Patient segment summaries
Patient behavior comparison
Healthcare analysis
PDF report generation
Fully client-side application
Technologies Used
Technology	Purpose
React	User interface
Vite	Development and build tool
TensorFlow.js	K-Means clustering
Recharts	Data visualization
Tailwind CSS	User interface styling
PapaParse	CSV data parsing
Lucide React	Icons
jsPDF	PDF report generation
html2canvas	Dashboard/chart capture
JavaScript	Application logic
Machine Learning Workflow
Patient Dataset
      |
      v
Data Validation
      |
      v
Missing Value Handling
      |
      v
Duplicate Removal
      |
      v
Feature Extraction
      |
      v
Feature Standardization
      |
      v
K-Means Clustering
      |
      v
Cluster Assignment
      |
      v
Segment Generation
      |
      v
Performance Evaluation
      |
      v
Interactive Visualization
Features Used for Clustering

The following numerical features are used for patient segmentation:

Age
BMI
Resting Heart Rate
Systolic Blood Pressure
Diastolic Blood Pressure
Visit Frequency
Physical Activity
Sleep Hours

Numerical features are standardized before clustering so that features with different value ranges do not disproportionately affect the results.

K-Means Clustering

The project uses K-Means clustering through TensorFlow.js.

The algorithm performs the following steps:

Initializes cluster centroids.
Calculates the distance between patients and cluster centroids.
Assigns each patient to the nearest cluster.
Recalculates the cluster centroids.
Repeats the process until the assignments stabilize or the maximum number of iterations is reached.
Calculates clustering performance metrics.

The application allows users to experiment with different values of K:

K = 2
K = 3
K = 4
K = 5
K = 6
Clustering Evaluation
Inertia

Inertia measures the total squared distance between patients and their assigned cluster centroids.

A lower inertia generally indicates more compact clusters.

Silhouette Score

The Silhouette Score evaluates how well-separated the generated clusters are.

Closer to 1  -> Better-separated clusters
Around 0     -> Overlapping clusters
Below 0      -> Potentially poor clustering
Dataset

The project includes a patient dataset containing 120 records.

The dataset contains the following fields:

patient_id
age
gender
height
weight
bmi
resting_heart_rate
systolic_bp
diastolic_bp
visit_frequency
physical_activity
sleep_hours
smoking_status

The dataset is provided for educational and analytical purposes.

Data Preprocessing

The application performs several preprocessing steps before clustering.

Missing Numerical Values

Missing numerical values are handled using median imputation.

Missing Categorical Values

Missing categorical values are handled using the most frequent value, also known as mode imputation.

BMI Calculation

If BMI is missing or invalid, it can be calculated using height and weight.

BMI = Weight / Height²

Height is converted from centimeters to meters before calculating BMI.

Duplicate Records

Duplicate patient IDs are removed to prevent duplicate records from affecting the clustering results.

Project Structure
patient-segmentation/
|
├── public/
│   └── data/
│       └── patients.csv
|
├── src/
│   ├── components/
│   │   ├── ChartCard.jsx
│   │   ├── ClusterVisualization.jsx
│   │   ├── Header.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── PatientTable.jsx
│   │   ├── ReportButton.jsx
│   │   ├── SegmentCard.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   │
│   ├── ml/
│   │   ├── clustering.js
│   │   ├── kmeans.js
│   │   └── preprocessing.js
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── PatientSegments.jsx
│   │   ├── HealthcareAnalysis.jsx
│   │   └── ClusterPerformance.jsx
│   │
│   ├── services/
│   │   └── dataset.js
│   │
│   ├── utils/
│   │   ├── reportGenerator.js
│   │   └── segmentInsights.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
|
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
Getting Started
Clone the Repository
git clone https://github.com/your-username/patient-segmentation.git
Navigate to the Project Directory
cd patient-segmentation
Install Dependencies
npm install
Start the Development Server
npm run dev

Open the local URL displayed in the terminal to access the application.

Build for Production

To create a production build:

npm run build

To preview the production build:

npm run preview
Dashboard Modules
Dashboard

Provides an overview of the patient dataset and segmentation results.

Patient Segments

Displays the generated patient groups and their characteristics.

Healthcare Analysis

Provides analytical insights based on patient health, lifestyle, and healthcare-utilization data.

Cluster Performance

Allows users to change the number of clusters and evaluate the clustering results using Inertia and Silhouette Score.

Project Objectives

The main objectives of this project are:

Apply unsupervised machine learning to healthcare data.
Identify groups of patients with similar characteristics.
Demonstrate the practical use of K-Means clustering.
Visualize machine-learning results through an interactive dashboard.
Analyze healthcare utilization patterns.
Evaluate cluster quality using standard clustering metrics.
Demonstrate browser-based machine learning using TensorFlow.js.
Future Enhancements
Add DBSCAN clustering.
Add Hierarchical Clustering.
Add PCA, t-SNE, or UMAP visualization.
Add automatic optimal-K selection.
Support custom CSV file uploads.
Add database integration.
Add authentication and user management.
Add downloadable CSV clustering results.
Add model comparison.
Add advanced statistical analysis.
