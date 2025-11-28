import React from 'react';
import { Role } from '../types';
import { Briefcase, LogOut, User, Layout, Bell, MessageSquare, Calendar, PlusCircle, Users, Building } from 'lucide-react';

interface NavigationProps {
  role: Role;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  notificationCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ role, currentView, setCurrentView, onLogout, notificationCount }) => {
  if (!role) return null;

  // Configuration for Navigation Items
  const navItems = [
    { 
      id: 'dashboard', 
      label: role === 'candidate' ? 'Discover' : 'Talent', 
      icon: Layout,
      show: true 
    },
    { 
      id: 'network', 
      label: 'Network', 
      icon: Users, 
      show: role === 'candidate' 
    },
    { 
      id: 'ats', 
      label: role === 'candidate' ? 'My Apps' : 'Tracker', 
      icon: Briefcase, 
      show: true 
    },
    { 
      id: 'messages', 
      label: 'Chat', 
      icon: MessageSquare, 
      show: true 
    },
    { 
      id: 'schedule', 
      label: 'Calendar', 
      icon: Calendar, 
      show: true 
    }
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Top Navigation (Desktop & Mobile Header) */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => setCurrentView('dashboard')}>
                <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2 group-hover:bg-black transition-colors">
                  O
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">Open</span>
              </div>
              
              {/* Desktop Nav Links */}
              <div className="hidden md:flex md:space-x-1">
                {visibleNavItems.map(item => (
                  <NavButton 
                    key={item.id}
                    active={currentView === item.id} 
                    onClick={() => setCurrentView(item.id)}
                    label={item.label}
                    icon={<item.icon className="w-4 h-4 mr-2" />}
                  />
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {role === 'recruiter' && (
                <button 
                  onClick={() => setCurrentView('create-job')}
                  className="hidden sm:flex items-center bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post Job
                </button>
              )}

              <button 
                onClick={() => setCurrentView('notifications')}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>
              
              <button 
                onClick={() => setCurrentView('profile')}
                className={`p-2 rounded-full transition-all ${currentView === 'profile' ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                title={role === 'recruiter' ? "Company Profile" : "User Profile"}
              >
                {role === 'recruiter' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </button>

              <button onClick={onLogout} className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-1">
           {visibleNavItems.map(item => (
             <button
               key={item.id}
               onClick={() => setCurrentView(item.id)}
               className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                 currentView === item.id 
                   ? 'text-gray-900' 
                   : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               <item.icon 
                  className={`w-6 h-6 ${currentView === item.id ? 'fill-gray-900/10' : ''}`} 
                  strokeWidth={currentView === item.id ? 2.5 : 1.5} 
                />
               <span className={`text-[10px] font-medium ${currentView === item.id ? 'font-bold' : ''}`}>
                 {item.label}
               </span>
             </button>
           ))}
        </div>
      </div>
    </>
  );
};

const NavButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`${
      active
        ? 'text-gray-900 bg-gray-100'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
  >
    <span className={`opacity-70 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`}>{icon}</span>
    {label}
  </button>
);

export default Navigation;