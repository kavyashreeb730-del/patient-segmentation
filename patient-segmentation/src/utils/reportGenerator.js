import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateDynamicInsights } from './segmentInsights';

/**
 * Client-Side PDF Report Generator using jsPDF and html2canvas.
 */
export async function generatePatientSegmentationReport(segmentationResult, elementToCaptureId = null) {
  if (!segmentationResult || !segmentationResult.segments) {
    throw new Error('Please complete patient segmentation first.');
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Helper for adding new page if yPos exceeds limit
    const checkNewPage = (neededHeight = 20) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        // Page header bar
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 8, 'F');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Healthcare Patient Segmentation Analytics Report', margin, 5);
        yPos = 16;
      }
    };

    // ----------------------------------------------------
    // COVER HEADER / BANNER
    // ----------------------------------------------------
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(45, 212, 191); // Teal-400
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Segmentation Report', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Unsupervised K-Means Machine Learning Healthcare Analytics', margin, 26);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${reportDate} | Source: patients.csv`, margin, 34);

    yPos = 50;

    // ----------------------------------------------------
    // DATASET SUMMARY CARDS
    // ----------------------------------------------------
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Dataset & Clustering Summary', margin, yPos);
    yPos += 6;

    const { totalPatients, k, overallAverages, performance, segments } = segmentationResult;

    // Summary Box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 26, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);

    const colWidth = (pageWidth - (margin * 2)) / 5;
    const statsList = [
      { label: 'Total Patients', val: totalPatients.toString() },
      { label: 'Selected K', val: `${k} Clusters` },
      { label: 'Avg Age', val: `${overallAverages.age} yrs` },
      { label: 'Avg BMI', val: `${overallAverages.bmi}` },
      { label: 'Avg Visit Freq', val: `${overallAverages.visit_frequency} / yr` }
    ];

    statsList.forEach((st, idx) => {
      const x = margin + (idx * colWidth) + 4;
      doc.text(st.label, x, yPos + 8);
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text(st.val, x, yPos + 18);
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
    });

    yPos += 34;

    // ----------------------------------------------------
    // PATIENT SEGMENTS BREAKDOWN
    // ----------------------------------------------------
    checkNewPage(40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Patient Segment Breakdown', margin, yPos);
    yPos += 8;

    segments.forEach((seg) => {
      checkNewPage(24);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 20, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${seg.segmentId}: ${seg.name}`, margin + 4, yPos + 6);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Cohort Size: ${seg.patientCount} patients (${seg.percentage}%)`, margin + 4, yPos + 12);

      const metricsText = `Avg Age: ${seg.averages.age} | Avg BMI: ${seg.averages.bmi} | Visit Freq: ${seg.averages.visitFrequency}/yr | Heart Rate: ${seg.averages.heartRate} bpm | Activity: ${seg.averages.physicalActivity}`;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(metricsText, margin + 4, yPos + 17);

      yPos += 24;
    });

    // ----------------------------------------------------
    // CLUSTER PERFORMANCE METRICS
    // ----------------------------------------------------
    checkNewPage(40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. Machine Learning Performance Metrics', margin, yPos);
    yPos += 8;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 20, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Cluster Count (K): ${k}`, margin + 6, yPos + 8);
    doc.text(`Inertia (Within-SS): ${performance.inertia}`, margin + 6, yPos + 14);

    doc.text(`Silhouette Score: ${performance.silhouetteScore}`, margin + (pageWidth / 2), yPos + 8);
    doc.text(`Convergence Iterations: ${performance.iterations}`, margin + (pageWidth / 2), yPos + 14);

    yPos += 28;

    // ----------------------------------------------------
    // DYNAMIC ANALYTICS INSIGHTS
    // ----------------------------------------------------
    checkNewPage(40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. Analytical Insights', margin, yPos);
    yPos += 8;

    const insightsList = generateDynamicInsights(segmentationResult);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    insightsList.forEach((ins) => {
      checkNewPage(12);
      const splitText = doc.splitTextToSize(`•  ${ins}`, pageWidth - (margin * 2));
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * 5) + 3;
    });

    // ----------------------------------------------------
    // CHART SNAPSHOT (IF PROVIDED)
    // ----------------------------------------------------
    if (elementToCaptureId) {
      const chartElem = document.getElementById(elementToCaptureId);
      if (chartElem) {
        try {
          const canvas = await html2canvas(chartElem, { scale: 1.5, backgroundColor: '#0f172a' });
          const imgData = canvas.toDataURL('image/png');
          checkNewPage(65);

          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text('5. Cluster Visualization Snapshot', margin, yPos);
          yPos += 6;

          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const renderHeight = Math.min(imgHeight, 60);

          doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, renderHeight);
          yPos += renderHeight + 10;
        } catch (e) {
          console.warn('Could not capture chart element:', e);
        }
      }
    }

    // ----------------------------------------------------
    // DISCLAIMER FOOTER
    // ----------------------------------------------------
    checkNewPage(25);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // Red warning
    doc.text('ANALYTICAL & EDUCATIONAL DISCLAIMER:', margin, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const disclaimerText = 'This report is generated automatically by a browser-based machine learning model for educational and analytical demonstration purposes only. It does not provide medical diagnosis, clinical treatment, or medical advice.';
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - (margin * 2));
    doc.text(splitDisclaimer, margin, yPos);

    // Save and download automatically
    doc.save('patient_segmentation_report.pdf');
  } catch (err) {
    console.error('PDF Generation Error:', err);
    throw new Error('Unable to generate report. Please try again.');
  }
}
