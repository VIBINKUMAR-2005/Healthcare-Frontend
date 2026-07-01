import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

const DoctorAppointments = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/appointments/doctor${params}`);
      setAppointments(data.appointments || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]); // eslint-disable-line

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const STATUSES = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  const filtered = appointments.filter((a) =>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.patient?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and review patient appointments</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
            placeholder="Search patient..."
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <svg className="h-16 w-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          No appointments found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="card border border-gray-100 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Patient info */}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {appt.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{appt.patient?.name}</p>
                    <p className="text-gray-500 text-sm">{appt.patient?.phone || appt.patient?.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        📅 {format(new Date(appt.appointmentDate), 'dd MMM yyyy')} · {appt.timeSlot}
                      </span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {appt.consultationType === 'video' ? '🎥' : appt.consultationType === 'chat' ? '💬' : '🏥'} {appt.consultationType}
                      </span>
                    </div>

                    {/* Symptoms */}
                    {appt.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {appt.symptoms.map((s) => (
                          <span key={s} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full capitalize">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {appt.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">"{appt.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={appt.status} />

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Approve */}
                    {appt.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(appt._id, 'approved')}
                        disabled={updating === appt._id}
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {updating === appt._id ? '...' : '✓ Approve'}
                      </button>
                    )}

                    {/* Complete */}
                    {appt.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(appt._id, 'completed')}
                        disabled={updating === appt._id}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {updating === appt._id ? '...' : '✓ Complete'}
                      </button>
                    )}

                    {/* View detail */}
                    <Link
                      to={`/doctor/appointments/${appt._id}`}
                      className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
