import React from 'react';

/**
 * StatCard — floats elegantly over the gradient dashboard canvas.
 * Pure white base + subtle tinted top gradient + floating shadow.
 */
const StatCard = ({ title, value, icon: Icon, color = 'teal', subtitle }) => {
  const colorMap = {
    teal:   {
      gradient: 'from-teal-50/80 to-white',
      icon: 'bg-teal-600',
      text: 'text-teal-700',
      border: 'border-teal-100/60',
      dot: 'bg-teal-400',
    },
    blue:   {
      gradient: 'from-sky-50/80 to-white',
      icon: 'bg-sky-600',
      text: 'text-sky-700',
      border: 'border-sky-100/60',
      dot: 'bg-sky-400',
    },
    green:  {
      gradient: 'from-emerald-50/80 to-white',
      icon: 'bg-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-100/60',
      dot: 'bg-emerald-400',
    },
    purple: {
      gradient: 'from-violet-50/80 to-white',
      icon: 'bg-violet-600',
      text: 'text-violet-700',
      border: 'border-violet-100/60',
      dot: 'bg-violet-400',
    },
    orange: {
      gradient: 'from-amber-50/80 to-white',
      icon: 'bg-amber-500',
      text: 'text-amber-700',
      border: 'border-amber-100/60',
      dot: 'bg-amber-400',
    },
    red:    {
      gradient: 'from-rose-50/80 to-white',
      icon: 'bg-rose-500',
      text: 'text-rose-700',
      border: 'border-rose-100/60',
      dot: 'bg-rose-400',
    },
    cyan:   {
      gradient: 'from-cyan-50/80 to-white',
      icon: 'bg-cyan-600',
      text: 'text-cyan-700',
      border: 'border-cyan-100/60',
      dot: 'bg-cyan-400',
    },
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${c.gradient}
        rounded-2xl border ${c.border}
        shadow-card-stat
        p-5
        transition-all duration-200
        hover:shadow-card-hover hover:-translate-y-0.5
      `}
    >
      {/* Decorative blurred circle — very subtle background accent */}
      <div
        className={`
          absolute -top-4 -right-4 h-20 w-20 rounded-full opacity-20 blur-xl
          ${c.dot.replace('bg-', 'bg-')}
        `}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Text side */}
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {title}
          </p>
          <p className={`text-3xl font-extrabold mt-1.5 leading-none ${c.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Icon box */}
        <div
          className={`
            flex-shrink-0 ${c.icon}
            h-11 w-11 rounded-xl
            flex items-center justify-center
            shadow-sm
          `}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
