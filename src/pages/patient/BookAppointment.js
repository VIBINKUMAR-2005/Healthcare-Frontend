import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { useNavigate } from 'react-router-dom';

const TIME_SLOTS = [
  '09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '02:00 PM','03:00 PM','04:00 PM','05:00 PM',
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    consultationType: 'video',
    symptoms: [],
    notes: '',
  });
  const [allSymptoms, setAllSymptoms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drRes, symRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/symptoms/list'),
        ]);
        setDoctors(drRes.data.doctors || []);
        setAllSymptoms(symRes.data.symptoms || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/doctors?search=${search}`);
      setDoctors(data.doctors || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (s) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter((x) => x !== s)
        : [...prev.symptoms, s],
    }));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Please select a doctor');
    if (!form.appointmentDate) return toast.error('Please select a date');
    if (!form.timeSlot) return toast.error('Please select a time slot');

    setBooking(true);
    try {
      await api.post('/appointments', {
        doctor: selected.userInfo._id,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        consultationType: form.consultationType,
        symptoms: form.symptoms,
        notes: form.notes,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  // Tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
        <p className="text-gray-500 text-sm mt-1">Search and select a doctor to book your consultation</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1"
            placeholder="Search by doctor name or specialization..."
          />
          <button onClick={handleSearch} className="btn-primary px-6">Search</button>
          {search && <button onClick={() => { setSearch(''); api.get('/doctors').then(r => setDoctors(r.data.doctors)); }} className="btn-secondary">Clear</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Available Doctors ({doctors.length})</h3>
          {doctors.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No doctors found</div>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setSelected(doc)}
                className={`card cursor-pointer transition-all border-2 ${
                  selected?._id === doc._id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {doc.userInfo?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{doc.userInfo?.name}</p>
                      <span className="text-blue-600 font-semibold text-sm">₹{doc.consultationFee}</span>
                    </div>
                    <p className="text-blue-600 text-sm">{doc.specialization}</p>
                    <p className="text-gray-500 text-xs">{doc.qualification} · {doc.experience} yrs exp</p>
                    {doc.bio && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{doc.bio}</p>}
                    {/* Availability */}
                    {doc.availability?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.availability.map((av, i) => (
                          <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                            {av.day} {av.startTime}–{av.endTime}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {selected?._id === doc._id && (
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Booking Form */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Appointment Details</h3>
          <form onSubmit={handleBook} className="card space-y-4">
            {selected && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-800">Selected: {selected.userInfo?.name}</p>
                <p className="text-xs text-blue-600">{selected.specialization}</p>
              </div>
            )}

            <div>
              <label className="label">Appointment Date</label>
              <input
                type="date"
                value={form.appointmentDate}
                onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                className="input-field"
                min={minDate}
                required
              />
            </div>

            <div>
              <label className="label">Time Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm({ ...form, timeSlot: slot })}
                    className={`text-xs py-2 rounded-lg border transition-colors ${
                      form.timeSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Consultation Type</label>
              <div className="flex gap-3">
                {['video', 'chat', 'in-person'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, consultationType: type })}
                    className={`flex-1 text-sm py-2 rounded-lg border transition-colors capitalize ${
                      form.consultationType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {type === 'video' ? '🎥' : type === 'chat' ? '💬' : '🏥'} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="label">Symptoms (optional)</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {allSymptoms.slice(0, 20).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
                      form.symptoms.includes(s)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows={3}
                placeholder="Describe your condition briefly..."
              />
            </div>

            <button type="submit" disabled={booking || !selected} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {booking && <Spinner size="sm" />}
              {booking ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
