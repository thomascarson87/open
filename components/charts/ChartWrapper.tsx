import React from 'react';

interface ChartWrapperProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-4">
          {title && (
            <h3 className="text-base font-bold text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  );
};

export default ChartWrapper;
