import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Calendar, Briefcase } from 'lucide-react';
import { ApplicationHubItem } from '../../types';
import StatusBadge from '../StatusBadge';
import TimelineTab from './tabs/TimelineTab';
import JobInfoTab from './tabs/JobInfoTab';
import MessagesTab from './tabs/MessagesTab';
import ScheduleTab from './tabs/ScheduleTab';

interface ApplicationDetailPanelProps {
  application: ApplicationHubItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdate?: () => void;
}

type TabId = 'timeline' | 'messages' | 'schedule' | 'job';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const ApplicationDetailPanel: React.FC<ApplicationDetailPanelProps> = ({
  application,
  isOpen,
  onClose,
  onApplicationUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('timeline');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('timeline');
    }
  }, [application?.id, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!application) return null;

  const tabs: Tab[] = [
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageSquare, 
      badge: application.unreadCount
    },
    { 
      id: 'schedule', 
      label: 'Schedule', 
      icon: Calendar,
      badge: application.upcomingEvents.length
    },
    { id: 'job', label: 'Job Info', icon: Briefcase }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return <TimelineTab application={application} />;
      case 'messages':
        return (
          <MessagesTab 
            application={application} 
            onConversationCreated={() => onApplicationUpdate?.()}
          />
        );
      case 'schedule':
        return <ScheduleTab application={application} />;
      case 'job':
        return <JobInfoTab application={application} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`
          fixed inset-y-0 right-0 z-50
          w-full sm:w-[480px] lg:w-[560px]
          bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                {application.job.company_logo ? (
                  <img
                    src={application.job.company_logo}
                    alt={application.job.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Briefcase className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="min-w-0">
                <h2 id="panel-title" className="font-bold text-gray-900 truncate text-base leading-tight">
                  {application.job.title}
                </h2>
                <p className="text-xs font-bold text-gray-400 truncate uppercase tracking-wider mt-0.5">
                  {application.job.company_name}
                </p>
              </div>
            </div>
            
            <StatusBadge status={application.status} size="sm" />
          </div>

          <div className="flex border-b border-gray-100 px-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest
                  border-b-2 -mb-px transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200'
                  }
                `}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`
                    text-[10px] px-1.5 py-0.5 rounded-full font-black
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>

        <div className="h-safe flex-shrink-0" />
      </div>
    </>
  );
};

export default ApplicationDetailPanel;