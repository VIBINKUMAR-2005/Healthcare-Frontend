import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const Ico = ({ d }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Teal-centric palette for charts
const PIE_COLORS = ['#0d9488','#06b6d4','#6366f1','#f59e0b','#10b981','#0891b2','#8b5cf6','#14b8a6','#f97316','#22d3ee'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = MONTH_NAMES.map((month, idx) => {
    const found = (stats?.monthlyConsultations || []).find((m) => m._id === idx + 1);
    return { month, consultations: found ? found.count : 0 };
  });

  const diseaseData = (stats?.diseaseTrends || []).map((d) => ({
    name: d._id,
    value: d.count,
  }));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="section-subtitle">Platform overview and analytics</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600
                        flex items-center justify-center shadow-sm">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Patients"     value={stats?.totalPatients ?? 0}     color="teal"
          subtitle="Active accounts"
          icon={() => <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />} />
        <StatCard title="Doctors"      value={stats?.totalDoctors ?? 0}      color="cyan"
          subtitle="Verified & active"
          icon={() => <Ico d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />} />
        <StatCard title="Consultations"value={stats?.totalConsultations ?? 0}color="green"
          subtitle="Completed"
          icon={() => <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <StatCard title="Appointments" value={stats?.totalAppointments ?? 0} color="purple"
          icon={() => <Ico d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} />
        <StatCard title="Pending"      value={stats?.pendingAppointments ?? 0}color="orange"
          subtitle="Awaiting approval"
          icon={() => <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} />
      </div>

      {/* ── Analytics charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly bar chart */}
        <div className="card card-inset">
          <h3 className="section-title text-base mb-0.5">Monthly Consultations</h3>
          <p className="section-subtitle text-xs mb-4">
            Completed consultations per month — {new Date().getFullYear()}
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                cursor={{ fill: 'rgba(13,148,136,0.06)' }}
                formatter={(v) => [v, 'Consultations']}
              />
              <Bar dataKey="consultations" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Disease trend pie chart */}
        <div className="card card-inset">
          <h3 className="section-title text-base mb-0.5">Disease Trend Analytics</h3>
          <p className="section-subtitle text-xs mb-4">
            Top conditions from symptom checker
          </p>
          {diseaseData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">
              No symptom check data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="48%"
                  outerRadius={82}
                  innerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {diseaseData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  formatter={(v) => (
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Disease trend table ───────────────────────────────────── */}
      {diseaseData.length > 0 && (
        <div className="card card-inset overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="section-title text-base">Disease Trend Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header w-12">#</th>
                  <th className="table-header">Disease</th>
                  <th className="table-header">Cases</th>
                  <th className="table-header">Share</th>
                </tr>
              </thead>
              <tbody>
                {diseaseData.map((d, idx) => {
                  const total = diseaseData.reduce((s, x) => s + x.value, 0);
                  const pct   = ((d.value / total) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="table-row-hover">
                      <td className="table-cell text-slate-400 font-medium">{idx + 1}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                          />
                          <span className="font-medium text-slate-800">{d.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-slate-600 font-semibold">{d.value}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[72px]">
                            <div
                              className="h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-slate-400 text-xs font-medium">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
