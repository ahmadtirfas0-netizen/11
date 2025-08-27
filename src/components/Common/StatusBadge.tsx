import React from 'react';

interface StatusBadgeProps {
  status: 'Pending' | 'Viewed' | 'Completed' | 'incoming' | 'outgoing';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'معلق', className: 'status-pending' };
      case 'Viewed':
        return { label: 'مُشاهد', className: 'status-viewed' };
      case 'Completed':
        return { label: 'مكتمل', className: 'status-completed' };
      case 'incoming':
        return { label: 'وارد', className: 'status-viewed' };
      case 'outgoing':
        return { label: 'صادر', className: 'status-pending' };
      default:
        return { label: status, className: 'status-pending' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span className={`${statusInfo.className} ${className}`}>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;