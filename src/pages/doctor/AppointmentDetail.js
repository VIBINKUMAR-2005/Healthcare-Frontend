import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Prescription form state
  const [rxForm, setRxForm] = useState({
    diagnosis: '',
    advice: '',
    followUpDate: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/appointments/${id}`);
        setAppointment(data.appointment);
        // Try to fetch existing prescription
        const rxRes = await api.get('/prescriptions/doctor');
        const existing = rxRes.data.prescriptions?.find(
          (rx) => rx.appointment?._id === id || rx.appointment === id
        );
        if (existing) {
          setPrescription(existing);
          setRxForm({
            diagnosis: existing.diagnosis,
            advice: existing.advice || '',
            followUpDate: existing.followUpDate ? existing.followUpDate.split('T')[0] : '',
            medicines: existing.medicines,
          });
        } else {
          setRxForm((prev) => ({ ...prev, diagnosis: data.appointment.diagnosis || '' }));
        }
      } catch (err) {
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Medicine row helpers
  const updateMedicine = (idx, field, value) => {
    setRxForm((prev) => {
      const meds = [...prev.medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, medicines: meds };
    });
  };
  const addMedicine = () =>
    setRxForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    }));
  const removeMedicine = (idx) =>
    setRxForm((prev) => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }));

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/appointments/${id}/status`, { status, diagnosis: rxForm.diagnosis });
      setAppointment((prev) => ({ ...prev, status }));
      toast.success(`Appointment ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrescription = async (e) => {
    e.preventDefault();
    if (prescription) return toast('Prescription already issued for this appointment.', { icon: 'ℹ️' });
    if (!rxForm.diagnosis) return toast.error('Diagnosis is required');
    const incompleteMed = rxForm.medicines.find((m) => !m.name || !m.dosage || !m.frequency || !m.duration);
    if (incompleteMed) return toast.error('Please fill all medicine fields');

    setSaving(true);
    try {
      const { data } = await api.post('/prescriptions', {
        appointment: id,
        patient: appointment.patient._id,
        diagnosis: rxForm.diagnosis,
        medicines: rxForm.medicines,
        advice: rxForm.advice,
        followUpDate: rxForm.followUpDate || undefined,
      });
      setPrescription(data.prescription);
      // Mark as completed if not already
      if (appointment.status !== 'completed') {
        await api.put(`/appointments/${id}/status`, { status: 'completed', diagnosis: rxForm.diagnosis });
        setAppointment((prev) => ({ ...prev, status: 'completed', diagnosis: rxForm.diagnosis }));
      }
      toast.success('Prescription issued and appointment completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!appointment) return <div className="card text-center py-16 text-gray-500">Appointment not found</div>;

  const patient = appointment.patient;
  const alreadyPrescribed = !!prescription;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Appointments
      </button>

      {/* Appointment Info */}
      <div className="card border border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {patient?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{patient?.name}</h2>
              <p className="text-gray-500 text-sm">{patient?.email}</p>
              {patient?.phone && <p className="text-gray-500 text-sm">{patient?.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={appointment.status} />
            {appointment.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updatingStatus}
                className="btn-primary text-sm py-1.5 px-4"
              >
                {updatingStatus ? 'Approving...' : 'Approve'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
            <p className="font-medium text-gray-700 mt-0.5">{format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
            <p className="font-medium text-gray-700 mt-0.5">{appointment.timeSlot}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Type</p>
            <p className="font-medium text-gray-700 mt-0.5 capitalize">{appointment.consultationType}</p>
          </div>
        </div>

        {/* Symptoms */}
        {appointment.symptoms?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Reported Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {appointment.symptoms.map((s) => (
                <span key={s} className="bg-orange-50 text-orange-700 border border-orange-100 text-xs px-3 py-1 rounded-full capitalize">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Patient notes */}
        {appointment.notes && (
          <div className="mt-4 bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Patient Notes</p>
            <p className="text-gray-700 text-sm italic">"{appointment.notes}"</p>
          </div>
        )}
      </div>

      {/* Prescription Form / Existing Prescription */}
      <div className="card border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800">
            {alreadyPrescribed ? '✅ Prescription Issued' : '📝 Issue Prescription'}
          </h3>
          {alreadyPrescribed && (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Issued {format(new Date(prescription.issuedDate || prescription.createdAt), 'dd MMM yyyy')}
            </span>
          )}
        </div>

        <form onSubmit={handlePrescription} className="space-y-5">
          {/* Diagnosis */}
          <div>
            <label className="label">Diagnosis *</label>
            <textarea
              value={rxForm.diagnosis}
              onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Enter diagnosis..."
              disabled={alreadyPrescribed}
              required
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Medicines *</label>
              {!alreadyPrescribed && (
                <button type="button" onClick={addMedicine} className="text-xs text-blue-600 hover:underline font-medium">
                  + Add medicine
                </button>
              )}
            </div>

            <div className="space-y-3">
              {rxForm.medicines.map((med, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Medicine {idx + 1}</p>
                    {!alreadyPrescribed && rxForm.medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(idx)} className="text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label text-xs">Name</label>
                      <input value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        className="input-field text-sm" placeholder="e.g. Paracetamol" disabled={alreadyPrescribed} required />
                    </div>
                    <div>
                      <label className="label text-xs">Dosage</label>
                      <input value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        className="input-field text-sm" placeholder="e.g. 500mg" disabled={alreadyPrescribed} required />
                    </div>
                    <div>
                      <label className="label text-xs">Frequency</label>
                      <input value={med.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                        className="input-field text-sm" placeholder="e.g. Twice a day" disabled={alreadyPrescribed} required />
                    </div>
                    <div>
                      <label className="label text-xs">Duration</label>
                      <input value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        className="input-field text-sm" placeholder="e.g. 7 days" disabled={alreadyPrescribed} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Instructions</label>
                      <input value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        className="input-field text-sm" placeholder="e.g. After meals" disabled={alreadyPrescribed} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="label">General Advice</label>
            <textarea
              value={rxForm.advice}
              onChange={(e) => setRxForm({ ...rxForm, advice: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Rest advice, dietary instructions, lifestyle changes..."
              disabled={alreadyPrescribed}
            />
          </div>

          {/* Follow-up */}
          <div className="max-w-xs">
            <label className="label">Follow-up Date (optional)</label>
            <input
              type="date"
              value={rxForm.followUpDate}
              onChange={(e) => setRxForm({ ...rxForm, followUpDate: e.target.value })}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
              disabled={alreadyPrescribed}
            />
          </div>

          {!alreadyPrescribed && (
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-3 flex items-center gap-2"
            >
              {saving && <Spinner size="sm" />}
              {saving ? 'Issuing...' : 'Issue Prescription & Complete'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AppointmentDetail;
