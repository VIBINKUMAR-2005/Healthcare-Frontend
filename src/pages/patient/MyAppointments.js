import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const statuses = ['all', 'pending', 'approved', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
        <p className="text-gray-500 text-sm mt-1">Track all your past and upcoming appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
            }`}
          >
            {s} {s === 'all' ? `(${appointments.length})` : `(${appointments.filter((a) => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="h-16 w-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appt) => (
            <div key={appt._id} className="card border border-gray-100 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {appt.doctor?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{appt.doctor?.name}</p>
                    <p className="text-gray-500 text-sm">
                      {format(new Date(appt.appointmentDate), 'EEEE, MMMM dd yyyy')} at {appt.timeSlot}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {appt.consultationType === 'video' ? '🎥' : appt.consultationType === 'chat' ? '💬' : '🏥'} {appt.consultationType}
                      </span>
                      {appt.symptoms?.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded capitalize">{s}</span>
                      ))}
                    </div>
                    {appt.diagnosis && (
                      <p className="mt-2 text-sm text-gray-600 bg-green-50 border border-green-100 rounded-lg p-2">
                        <span className="font-medium text-green-700">Diagnosis:</span> {appt.diagnosis}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={appt.status} />
                  {(appt.status === 'pending' || appt.status === 'approved') && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={cancelling === appt._id}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                    >
                      {cancelling === appt._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>

              {appt.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500"><span className="font-medium">Notes:</span> {appt.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
