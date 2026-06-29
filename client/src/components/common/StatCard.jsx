import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'violet', onClick }) => {
  const colorStyles = {
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  const selectedColor = colorStyles[color] || colorStyles.violet;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`rounded-xl border p-3 shadow-inner ${selectedColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
