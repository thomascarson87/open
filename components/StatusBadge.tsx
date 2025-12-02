
import React from 'react';
import { atsService } from '../services/atsService';
import { ApplicationStatus } from '../types';

interface Props {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const info = atsService.getStatusDisplayInfo(status as ApplicationStatus);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap ${info.bgColor} ${info.textColor} ${sizeClasses[size]}`}>
      <span className="text-sm">{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
};

export default StatusBadge;
