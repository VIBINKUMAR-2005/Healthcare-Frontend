import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ path, className = 'h-[18px] w-[18px]' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  profile:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  symptoms:     'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  book:         'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  appointments: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  prescription: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  users:        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  doctors:      'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  logout:       'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
};

const NAV_ITEMS = {
  patient: [
    { label: 'Dashboard',       path: '/patient/dashboard',     icon: 'dashboard' },
    { label: 'My Profile',      path: '/patient/profile',       icon: 'profile' },
    { label: 'Symptom Checker', path: '/patient/symptoms',      icon: 'symptoms' },
    { label: 'Book Appointment',path: '/patient/book',          icon: 'book' },
    { label: 'My Appointments', path: '/patient/appointments',  icon: 'appointments' },
    { label: 'My Prescriptions',path: '/patient/prescriptions', icon: 'prescription' },
  ],
  doctor: [
    { label: 'Dashboard',    path: '/doctor/dashboard',    icon: 'dashboard' },
    { label: 'Appointments', path: '/doctor/appointments', icon: 'appointments' },
  ],
  admin: [
    { label: 'Dashboard',      path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'User Management',path: '/admin/users',     icon: 'users' },
    { label: 'Manage Doctors', path: '/admin/doctors',   icon: 'doctors' },
  ],
};

const ROLE_COLOR = {
  patient: 'text-teal-300',
  doctor:  'text-cyan-300',
  admin:   'text-violet-300',
};

const Sidebar = ({ role, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS[role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-slate-900 text-white shadow-sidebar
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        {/* Teal cross icon */}
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
          <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-[15px] text-white leading-tight tracking-tight">RuralCare</p>
          <p className="text-slate-400 text-[11px] mt-0.5">Telemedicine Platform</p>
        </div>
      </div>

      {/* ── User info ─────────────────────────────────────────────────── */}
      <div className="px-4 py-4 mx-3 mt-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
            <p className={`text-[11px] capitalize font-medium ${ROLE_COLOR[user?.role] || 'text-slate-400'}`}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Nav group label */}
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`}>
                      <Icon path={ICONS[item.icon]} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Logout ───────────────────────────────────────────────────── */}
      <div className="px-3 pb-5 pt-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-150"
        >
          <Icon path={ICONS.logout} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
