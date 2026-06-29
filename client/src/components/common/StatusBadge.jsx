import React from 'react';

const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toUpperCase() : 'PENDING';

  const statusStyles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    RESOLVED: 'bg-teal-50 text-teal-700 border-teal-200',
    CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REOPENED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const defaultStyle = 'bg-slate-50 text-slate-700 border-slate-200';
  const currentStyle = statusStyles[normalizedStatus] || defaultStyle;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${currentStyle}`}>
      {normalizedStatus.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
