import React from 'react';

export const StatCard = ({ title, value, unit = '', icon: Icon, change, changeType = 'positive', description, color = 'emerald' }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-800 text-lime-400',
      text: 'text-emerald-950',
      border: 'border-emerald-100'
    },
    lime: {
      bg: 'bg-lime-50/60',
      iconBg: 'bg-lime-500 text-emerald-950',
      text: 'text-slate-900',
      border: 'border-lime-200'
    },
    blue: {
      bg: 'bg-blue-50/60',
      iconBg: 'bg-blue-600 text-white',
      text: 'text-slate-900',
      border: 'border-blue-100'
    },
    amber: {
      bg: 'bg-amber-50/60',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-slate-900',
      border: 'border-amber-100'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-2xl p-5 border ${scheme.border} shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${scheme.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1 mb-1">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${scheme.text}`}>{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
      </div>

      {(change || description) && (
        <div className="flex items-center space-x-2 text-xs">
          {change && (
            <span className={`font-bold px-1.5 py-0.5 rounded-md ${
              changeType === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {change}
            </span>
          )}
          {description && <span className="text-slate-500 font-medium truncate">{description}</span>}
        </div>
      )}
    </div>
  );
};
