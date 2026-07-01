import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

const SvgIcon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/appointments/my'), api.get('/prescriptions/my')])
      .then(([apptRes, rxRes]) => {
        setAppointments(apptRes.data.appointments || []);
        setPrescriptions(rxRes.data.prescriptions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = {
    total:         appointments.length,
    completed:     appointments.filter((a) => a.status === 'completed').length,
    pending:       appointments.filter((a) => a.status === 'pending').length,
    prescriptions: prescriptions.length,
  };
  const upcoming = appointments
    .filter((a) => a.status === 'pending' || a.status === 'approved')
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Welcome banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white
                      bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700
                      shadow-lg">
        {/* Decorative orbs */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full
                        bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full
                        bg-cyan-400/20 blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-teal-200 text-sm font-medium mb-0.5">Patient Portal</p>
          <h2 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-teal-100/80 text-sm mt-1">
            Your health is our priority. How can we help you today?
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/patient/symptoms"
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25
                         border border-white/25 text-white text-sm font-medium
                         px-4 py-2 rounded-xl transition-all duration-200">
              🩺 Check Symptoms
            </Link>
            <Link to="/patient/book"
              className="inline-flex items-center gap-1.5 bg-white text-teal-700
                         hover:bg-teal-50 text-sm font-semibold
                         px-4 py-2 rounded-xl shadow-sm transition-all duration-200">
              📅 Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total"        value={stats.total}         color="teal"   icon={() => <SvgIcon path={ICONS.calendar} />} />
        <StatCard title="Completed"    value={stats.completed}     color="green"  icon={() => <SvgIcon path={ICONS.check} />} />
        <StatCard title="Pending"      value={stats.pending}       color="orange" icon={() => <SvgIcon path={ICONS.clock} />} />
        <StatCard title="Prescriptions"value={stats.prescriptions} color="purple" icon={() => <SvgIcon path={ICONS.clipboard} />} />
      </div>

      {/* ── Upcoming appointments ─────────────────────────────────── */}
      <div className="card card-inset">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="section-title text-base">Upcoming Appointments</h3>
            <p className="section-subtitle text-xs">Your next scheduled consultations</p>
          </div>
          <Link to="/patient/appointments"
            className="text-teal-600 hover:text-teal-700 text-xs font-semibold
                       hover:underline underline-offset-2 transition-colors">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-10">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 flex items-center
                            justify-center text-slate-300 mb-3">
              <SvgIcon path={ICONS.calendar} />
            </div>
            <p className="text-slate-500 text-sm font-medium">No upcoming appointments</p>
            <Link to="/patient/book"
              className="text-teal-600 text-xs hover:underline mt-1 block font-semibold">
              Book your first appointment →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div key={appt._id}
                className="flex items-center justify-between p-4
                           bg-gradient-to-r from-teal-50/60 to-cyan-50/30
                           rounded-xl border border-teal-100/60
                           hover:border-teal-200 transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 h-10 w-10 rounded-xl flex items-center
                                  justify-center text-white font-bold text-sm flex-shrink-0
                                  shadow-sm">
                    {appt.doctor?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{appt.doctor?.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {format(new Date(appt.appointmentDate), 'MMM dd, yyyy')} · {appt.timeSlot}
                    </p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick action cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Symptom Checker',
            desc: 'Identify probable conditions from your symptoms',
            link: '/patient/symptoms',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            icon: '🩺',
            accent: 'hover:border-emerald-200',
          },
          {
            title: 'Find Doctors',
            desc: 'Browse specialists and book a consultation',
            link: '/patient/book',
            iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
            icon: '👨‍⚕️',
            accent: 'hover:border-teal-200',
          },
          {
            title: 'My Prescriptions',
            desc: 'View and download your prescriptions as PDF',
            link: '/patient/prescriptions',
            iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
            icon: '💊',
            accent: 'hover:border-violet-200',
          },
        ].map((item) => (
          <Link key={item.title} to={item.link}
            className={`card card-inset flex items-start gap-4
                        border border-slate-100/80 ${item.accent}
                        hover:shadow-card-hover hover:-translate-y-0.5
                        transition-all duration-200`}>
            <div className={`${item.iconBg} text-xl h-12 w-12 rounded-xl flex items-center
                             justify-center flex-shrink-0 shadow-sm`}>
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
