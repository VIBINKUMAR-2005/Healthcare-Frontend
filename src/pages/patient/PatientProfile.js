import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const [_, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    street: '', city: '', state: '', pincode: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    allergies: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/patients/profile');
        const p = data.patient;
        setProfile(p);
        setForm({
          name: p.user?.name || '',
          phone: p.user?.phone || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || '',
          bloodGroup: p.bloodGroup || '',
          street: p.address?.street || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          pincode: p.address?.pincode || '',
          emergencyName: p.emergencyContact?.name || '',
          emergencyPhone: p.emergencyContact?.phone || '',
          emergencyRelation: p.emergencyContact?.relation || '',
          allergies: (p.allergies || []).join(', '),
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update user name/phone
      await api.put('/auth/profile', { name: form.name, phone: form.phone });
      // Update patient profile
      await api.put('/patients/profile', {
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation },
        allergies: form.allergies.split(',').map((a) => a.trim()).filter(Boolean),
      });
      updateUser({ ...user, name: form.name, phone: form.phone });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your personal and medical information</p>
      </div>

      {/* Avatar + basic info */}
      <div className="card flex items-center gap-5">
        <div className="bg-blue-600 h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge-approved mt-1">Patient</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="input-field">
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Allergies (comma separated)</label>
              <input name="allergies" value={form.allergies} onChange={handleChange} className="input-field" placeholder="Penicillin, Pollen" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Street Address</label>
              <input name="street" value={form.street} onChange={handleChange} className="input-field" placeholder="House No., Street" />
            </div>
            <div>
              <label className="label">City / Village</label>
              <input name="city" value={form.city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">State</label>
              <input name="state" value={form.state} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">PIN Code</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input name="emergencyName" value={form.emergencyName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Relation</label>
              <input name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} className="input-field" placeholder="Spouse, Parent..." />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-8 py-3 flex items-center gap-2">
          {saving && <Spinner size="sm" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default PatientProfile;
