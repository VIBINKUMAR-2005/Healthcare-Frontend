import React from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    pending:   'badge-pending',
    approved:  'badge-approved',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };
  return <span className={map[status] || 'badge-pending'}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
};

export default StatusBadge;
