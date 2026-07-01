import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const Ico = ({ d }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/doctors/me/stats'), api.get('/appointments/doctor')])
      .then(([sRes, aRes]) => {
        setStats(sRes.data.stats);
        setAppointments(aRes.data.appointments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = MONTH_NAMES.map((month, idx) => {
    const found = (stats?.monthly || []).find((m) => m._id === idx + 1);
    return { month, consultations: found ? found.count : 0 };
  });

  const todayStr   = new Date().toDateString();
  const todayAppts = appointments.filter((a) => new Date(a.appointmentDate).toDateString() === todayStr);
  const pendingAppts = appointments.filter((a) => a.status === 'pending').slice(0, 5);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Welcome banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white
                      bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900
                      shadow-lg">
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full
                        bg-teal-400/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-20 w-20 rounded-full
                        bg-cyan-400/10 blur-2xl pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-0.5">Doctor Portal</p>
          <h2 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}! 👨‍⚕️</h2>
          <p className="text-slate-300/80 text-sm mt-1">
            <span className="text-white font-semibold">{todayAppts.length}</span> appointment{todayAppts.length !== 1 ? 's' : ''} today
            {' · '}
            <span className="text-amber-300 font-semibold">{stats?.pending || 0}</span> pending approval{stats?.pending !== 1 ? 's' : ''}
          </p>
          <Link to="/doctor/appointments"
            className="inline-flex items-center gap-1.5 mt-4 bg-teal-500 hover:bg-teal-400
                       text-white text-sm font-semibold px-5 py-2 rounded-xl
                       shadow-sm transition-all duration-200">
            View All Appointments →
          </Link>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total"     value={stats?.total || 0}     color="teal"
          icon={() => <Ico d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} />
        <StatCard title="Completed" value={stats?.completed || 0} color="green"
          icon={() => <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <StatCard title="Pending"   value={stats?.pending || 0}   color="orange"
          icon={() => <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <StatCard title="Approved"  value={stats?.approved || 0}  color="cyan"
          icon={() => <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />} />
      </div>

      {/* ── Charts + pending ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly bar chart */}
        <div className="card card-inset">
          <h3 className="section-title text-base mb-0.5">Monthly Consultations</h3>
          <p className="section-subtitle text-xs mb-4">{new Date().getFullYear()} overview</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                cursor={{ fill: 'rgba(13,148,136,0.06)' }}
              />
              <Bar dataKey="consultations" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending approvals */}
        <div className="card card-inset">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base mb-0.5">Pending Approvals</h3>
              <p className="section-subtitle text-xs">Awaiting your confirmation</p>
            </div>
            <Link to="/doctor/appointments?status=pending"
              className="text-teal-600 text-xs font-semibold hover:underline underline-offset-2">
              View all →
            </Link>
          </div>

          {pendingAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">All clear!</p>
              <p className="text-xs mt-0.5">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingAppts.map((appt) => (
                <Link key={appt._id} to={`/doctor/appointments/${appt._id}`}
                  className="flex items-center justify-between p-3
                             bg-amber-50/60 border border-amber-100
                             rounded-xl hover:bg-amber-50 hover:border-amber-200
                             transition-all duration-150">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 h-9 w-9 rounded-xl flex items-center
                                    justify-center text-white font-bold text-sm flex-shrink-0">
                      {appt.patient?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{appt.patient?.name}</p>
                      <p className="text-slate-500 text-xs">
                        {format(new Date(appt.appointmentDate), 'dd MMM')} · {appt.timeSlot}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Today's schedule ──────────────────────────────────────── */}
      <div className="card card-inset">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center
                          justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title text-base">Today's Schedule</h3>
            <p className="section-subtitle text-xs">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          </div>
        </div>

        {todayAppts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8 font-medium">
            No appointments scheduled for today
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppts.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[48px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {appt.timeSlot?.split(' ')[1]}
                    </p>
                    <p className="font-bold text-teal-700 text-sm leading-tight">
                      {appt.timeSlot?.split(' ')[0]}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{appt.patient?.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{appt.consultationType} consultation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={appt.status} />
                  <Link to={`/doctor/appointments/${appt._id}`}
                    className="text-teal-600 hover:text-teal-800 text-xs font-semibold hover:underline">
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
