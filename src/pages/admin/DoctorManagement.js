import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const BLANK_FORM = {
  name: '', email: '', password: '', phone: '',
  specialization: '', qualification: '', experience: '',
  licenseNumber: '', consultationFee: '', bio: '',
  availability: [],
};

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/doctors/admin/all${params}`);
      setDoctors(data.doctors || []);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []); // eslint-disable-line

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleAvailability = (day) => {
    const exists = form.availability.find((a) => a.day === day);
    if (exists) {
      setForm({ ...form, availability: form.availability.filter((a) => a.day !== day) });
    } else {
      setForm({ ...form, availability: [...form.availability, { day, startTime: '09:00', endTime: '17:00' }] });
    }
  };

  const updateAvailTime = (day, field, value) => {
    setForm({
      ...form,
      availability: form.availability.map((a) => (a.day === day ? { ...a, [field]: value } : a)),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.post('/doctors', {
        ...form,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
      });
      toast.success('Doctor added successfully!');
      setShowForm(false);
      setForm(BLANK_FORM);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (docId, name) => {
    if (!window.confirm(`Deactivate Dr. ${name}?`)) return;
    setActionId(docId);
    try {
      await api.delete(`/doctors/${docId}`);
      toast.success('Doctor deactivated');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
          <p className="text-gray-500 text-sm mt-1">Add and manage doctors on the platform</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {/* Add doctor form */}
      {showForm && (
        <div className="card border border-blue-100 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">Add New Doctor</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account details */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Account Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Dr. Firstname Lastname" required />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="doctor@email.com" required />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min. 6 characters" required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="9876543210" />
                </div>
              </div>
            </div>

            {/* Professional details */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Professional Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Specialization *</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} className="input-field" placeholder="e.g. General Physician" required />
                </div>
                <div>
                  <label className="label">Qualification *</label>
                  <input name="qualification" value={form.qualification} onChange={handleChange} className="input-field" placeholder="e.g. MBBS, MD" required />
                </div>
                <div>
                  <label className="label">License Number *</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="input-field" placeholder="e.g. MH-GP-12345" required />
                </div>
                <div>
                  <label className="label">Experience (years)</label>
                  <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Consultation Fee (₹)</label>
                  <input name="consultationFee" type="number" min="0" value={form.consultationFee} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <input name="bio" value={form.bio} onChange={handleChange} className="input-field" placeholder="Short bio..." />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Availability (select working days)</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailability(day)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.availability.find((a) => a.day === day)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {form.availability.map((av) => (
                <div key={av.day} className="flex items-center gap-3 mb-2">
                  <span className="w-10 text-sm font-medium text-blue-700">{av.day}</span>
                  <input type="time" value={av.startTime}
                    onChange={(e) => updateAvailTime(av.day, 'startTime', e.target.value)}
                    className="input-field w-36 text-sm" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" value={av.endTime}
                    onChange={(e) => updateAvailTime(av.day, 'endTime', e.target.value)}
                    className="input-field w-36 text-sm" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary px-8 flex items-center gap-2">
                {saving && <Spinner size="sm" />}
                {saving ? 'Adding...' : 'Add Doctor'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(BLANK_FORM); }} className="btn-secondary px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
            className="input-field pl-9 text-sm"
            placeholder="Search doctors..."
          />
        </div>
        <button onClick={fetchDoctors} className="btn-primary px-5 text-sm">Search</button>
        <span className="self-center text-sm text-gray-500">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Doctor list */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No doctors found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className={`card border border-gray-100 ${!doc.user?.isActive ? 'opacity-60' : ''}`}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {doc.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{doc.user?.name}</p>
                    <p className="text-blue-600 text-xs">{doc.specialization}</p>
                    <p className="text-gray-400 text-xs">{doc.qualification}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {doc.user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div><span className="text-gray-400">Experience:</span> {doc.experience} yrs</div>
                <div><span className="text-gray-400">Fee:</span> ₹{doc.consultationFee}</div>
                <div><span className="text-gray-400">Consultations:</span> {doc.totalConsultations}</div>
                <div><span className="text-gray-400">License:</span> {doc.licenseNumber}</div>
              </div>

              {/* Availability */}
              {doc.availability?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {doc.availability.map((av, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {av.day}
                    </span>
                  ))}
                </div>
              )}

              {/* Email + Joined */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-gray-400 text-xs truncate">{doc.user?.email}</p>
                <p className="text-gray-400 text-xs flex-shrink-0">
                  {doc.createdAt ? format(new Date(doc.createdAt), 'MMM yyyy') : ''}
                </p>
              </div>

              {/* Actions */}
              {doc.user?.isActive && (
                <button
                  onClick={() => handleDeactivate(doc._id, doc.user?.name)}
                  disabled={actionId === doc._id}
                  className="mt-3 w-full text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {actionId === doc._id ? 'Processing...' : 'Deactivate Doctor'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;
