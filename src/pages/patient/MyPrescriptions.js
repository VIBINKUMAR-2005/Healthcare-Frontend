import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api
      .get('/prescriptions/my')
      .then(({ data }) => setPrescriptions(data.prescriptions || []))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  // ─── PDF Download ──────────────────────────────────────────────────────────
  const downloadPDF = (rx) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RuralCare Telemedicine', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Prescription Receipt', 14, 20);
    doc.text(`Issued: ${format(new Date(rx.issuedDate || rx.createdAt), 'dd MMM yyyy')}`, pageW - 14, 20, { align: 'right' });

    // Reset text color
    doc.setTextColor(30, 30, 30);

    // Doctor & Patient info block
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(0, 30, pageW, 30, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor:', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.doctor?.name || 'N/A', 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.patient?.name || 'N/A', 40, 50);

    if (rx.appointment?.appointmentDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Visit Date:', pageW / 2, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(rx.appointment.appointmentDate), 'dd MMM yyyy'), pageW / 2 + 22, 40);
    }

    // Diagnosis
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Diagnosis', 14, 70);
    doc.setDrawColor(37, 99, 235);
    doc.line(14, 72, 60, 72);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const diagLines = doc.splitTextToSize(rx.diagnosis || '', pageW - 28);
    doc.text(diagLines, 14, 80);

    // Medicines table
    const tableStartY = 80 + diagLines.length * 6 + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Prescribed Medicines', 14, tableStartY);
    doc.line(14, tableStartY + 2, 80, tableStartY + 2);
    doc.setTextColor(30, 30, 30);

    autoTable(doc, {
      startY: tableStartY + 6,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: (rx.medicines || []).map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.duration,
        m.instructions || '—',
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      margin: { left: 14, right: 14 },
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // Advice
    if (rx.advice) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Doctor\'s Advice', 14, finalY);
      doc.line(14, finalY + 2, 65, finalY + 2);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const advLines = doc.splitTextToSize(rx.advice, pageW - 28);
      doc.text(advLines, 14, finalY + 10);
      finalY += advLines.length * 6 + 14;
    }

    // Follow-up
    if (rx.followUpDate) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Follow-up Date: ', 14, finalY);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(rx.followUpDate), 'dd MMM yyyy'), 55, finalY);
      finalY += 10;
    }

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(239, 246, 255);
    doc.rect(0, pageH - 16, pageW, 16, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated prescription. RuralCare Telemedicine Platform.', pageW / 2, pageH - 6, { align: 'center' });

    doc.save(`Prescription_${rx.patient?.name?.replace(/ /g, '_')}_${format(new Date(rx.issuedDate || rx.createdAt), 'ddMMMyyyy')}.pdf`);
    toast.success('Prescription downloaded!');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Prescriptions</h2>
        <p className="text-gray-500 text-sm mt-1">View and download all your prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="card text-center py-16">
          <svg
            className="h-16 w-16 text-gray-200 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <p className="text-gray-500 font-medium">No prescriptions yet</p>
          <p className="text-gray-400 text-sm mt-1">Your prescriptions will appear here after a completed consultation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => {
            const isOpen = expanded === rx._id;
            return (
              <div
                key={rx._id}
                className="card border border-gray-100 hover:shadow-card-hover transition-shadow"
              >
                {/* Summary row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Doctor avatar */}
                    <div className="bg-blue-600 h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {rx.doctor?.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">{rx.doctor?.name}</p>
                      <p className="text-gray-500 text-sm">
                        {rx.appointment?.appointmentDate
                          ? format(new Date(rx.appointment.appointmentDate), 'dd MMM yyyy')
                          : format(new Date(rx.createdAt), 'dd MMM yyyy')}
                        {rx.appointment?.timeSlot && ` · ${rx.appointment.timeSlot}`}
                      </p>
                      <p className="text-blue-700 text-sm font-medium mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                        {rx.diagnosis}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => downloadPDF(rx)}
                      className="flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : rx._id)}
                      className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isOpen ? 'Hide' : 'View'}
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
                    {/* Medicines */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">💊</span> Prescribed Medicines
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="text-left px-3 py-2 text-xs font-semibold text-blue-700 rounded-l-lg">Medicine</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-blue-700">Dosage</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-blue-700">Frequency</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-blue-700">Duration</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-blue-700 rounded-r-lg">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(rx.medicines || []).map((med, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800">{med.name}</td>
                                <td className="px-3 py-2 text-gray-600">{med.dosage}</td>
                                <td className="px-3 py-2 text-gray-600">{med.frequency}</td>
                                <td className="px-3 py-2 text-gray-600">{med.duration}</td>
                                <td className="px-3 py-2 text-gray-500 text-xs">{med.instructions || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Advice */}
                    {rx.advice && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1">
                          <span>📋</span> Doctor's Advice
                        </p>
                        <p className="text-amber-900 text-sm">{rx.advice}</p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {rx.followUpDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-purple-700">Follow-up on:</span>
                        <span>{format(new Date(rx.followUpDate), 'EEEE, dd MMMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;
