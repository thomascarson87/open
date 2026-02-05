
import React, { useState, useRef, useEffect } from 'react';
import { Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase, LogOut, User, Layout, Bell, MessageSquare,
  Calendar, PlusCircle, Users, Building, Search,
  ClipboardList, Code, ChevronDown, Video, Settings, Target, Clock, Heart
} from 'lucide-react';

interface NavigationProps {
  role: Role;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  notificationCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ role, currentView, setCurrentView, onLogout, notificationCount }) => {
  const { teamRole } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Check if user can access HM preferences
  const canAccessHMPreferences = teamRole === 'hiring_manager' || teamRole === 'admin';

  // Check if user can see pending approvals
  const canSeePendingApprovals = teamRole === 'hiring_manager' || teamRole === 'finance' || teamRole === 'admin';
  
  // Custom reactive searchParams implementation
  const [searchParams, setSearchParamsState] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => setSearchParamsState(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSearchParams = (newParams: any) => {
    const nextSearch = new URLSearchParams(newParams).toString();
    window.history.pushState({}, '', `${window.location.pathname}?${nextSearch}`);
    window.dispatchEvent(new Event('popstate'));
    setSearchParamsState(new URLSearchParams(nextSearch));
  };

  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideNav = navRef.current?.contains(target);
      const insideProfile = profileRef.current?.contains(target);
      
      if (!insideNav && !insideProfile) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!role) return null;

  // Build jobs children based on role permissions
  const jobsChildren = [
    { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, description: 'Manage your postings' },
    ...(canSeePendingApprovals ? [{ id: 'pending-approvals', label: 'Pending Approvals', icon: Clock, description: 'Jobs awaiting your review' }] : []),
    { id: 'ats', label: 'Tracker', icon: ClipboardList, description: 'Applicant pipeline' }
  ];

  const recruiterNav = [
    {
      id: 'find', label: 'Find', icon: Search,
      children: [
        { id: 'talent-matcher', label: 'Match Talent', icon: Users, description: 'Advanced precision search' },
        { id: 'create-job', label: 'Post Job', icon: PlusCircle, description: 'Create a new opportunity' },
        { id: 'dashboard', label: 'Talent Feed', icon: Layout, description: 'Browse recent candidates' }
      ]
    },
    {
      id: 'jobs-group', label: 'Jobs', icon: Briefcase,
      children: jobsChildren
    },
    {
      id: 'interview-group', label: 'Interview', icon: Video,
      children: [
        { id: 'messages', label: 'Chat', icon: MessageSquare, description: 'Candidate messaging' },
        { id: 'schedule', label: 'Calendar', icon: Calendar, description: 'Interview schedule' }
      ]
    },
    { id: 'talent-market', label: 'Talent Market', icon: Layout }
  ];

  const candidateNav = [
    { id: 'dashboard', label: 'Discover', icon: Layout },
    {
      id: 'network-group', label: 'Network', icon: Users,
      children: [
        { id: 'network', label: 'Connections', icon: Users, description: 'Your professional network' },
        { id: 'following', label: 'Saved & Following', icon: Heart, description: 'Jobs and companies you follow' }
      ]
    },
    { id: 'applications', label: 'Applications', icon: ClipboardList },
    { id: 'market-pulse', label: 'Market Pulse', icon: Layout }
  ];

  const handleNavItemClick = (id: string, tab?: string) => {
    setCurrentView(id);
    setActiveDropdown(null);
    if (tab) setSearchParams({ view: id, tab });
    else setSearchParams({ view: id });
  };

  const isParentActive = (item: any) => {
    if (currentView === item.id) return true;
    return item.children?.some((child: any) => child.id === currentView);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNavItemClick('dashboard')}>
                <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2 group-hover:bg-black transition-colors">c</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">chime</span>
              </div>
              
              <div className="hidden md:flex md:space-x-1" ref={navRef}>
                {role === 'recruiter' ? recruiterNav.map(group => (
                  group.children ? (
                    <div key={group.id} className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === group.id ? null : group.id)}
                        className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${isParentActive(group) ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <group.icon className="w-4 h-4 mr-2 opacity-70" />
                        {group.label}
                        <ChevronDown className={`ml-1.5 w-3.5 h-3.5 transition-transform ${activeDropdown === group.id ? 'rotate-180' : ''}`} />
                      </button>
                      {activeDropdown === group.id && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {group.children.map(child => (
                            <button key={child.id} onClick={() => handleNavItemClick(child.id)} className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${currentView === child.id ? 'bg-blue-50/50' : ''}`}>
                              <div className={`p-2 rounded-lg ${currentView === child.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}><child.icon className="w-4 h-4" /></div>
                              <div>
                                <div className={`text-sm font-bold ${currentView === child.id ? 'text-blue-700' : 'text-gray-900'}`}>{child.label}</div>
                                <div className="text-xs text-gray-400 font-medium">{child.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button key={group.id} onClick={() => handleNavItemClick(group.id)} className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${currentView === group.id ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                      <group.icon className="w-4 h-4 mr-2 opacity-70" />{group.label}
                    </button>
                  )
                )) : candidateNav.map(item => (
                  item.children ? (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${isParentActive(item) ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <item.icon className="w-4 h-4 mr-2 opacity-70" />
                        {item.label}
                        <ChevronDown className={`ml-1.5 w-3.5 h-3.5 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {activeDropdown === item.id && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {item.children.map((child: any) => (
                            <button key={child.id} onClick={() => handleNavItemClick(child.id)} className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${currentView === child.id ? 'bg-blue-50/50' : ''}`}>
                              <div className={`p-2 rounded-lg ${currentView === child.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}><child.icon className="w-4 h-4" /></div>
                              <div>
                                <div className={`text-sm font-bold ${currentView === child.id ? 'text-blue-700' : 'text-gray-900'}`}>{child.label}</div>
                                <div className="text-xs text-gray-400 font-medium">{child.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button key={item.id} onClick={() => handleNavItemClick(item.id)} className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${currentView === item.id ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                      <item.icon className="w-4 h-4 mr-2 opacity-70" />{item.label}
                    </button>
                  )
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={() => handleNavItemClick('notifications')} className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />}
              </button>
              
              <div className="relative" ref={profileRef}>
                <button onClick={() => setActiveDropdown(activeDropdown === 'profile-drop' ? null : 'profile-drop')} className={`p-2 rounded-full transition-all ${currentView === 'profile' ? 'text-gray-900 bg-gray-100 shadow-inner' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {role === 'recruiter' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </button>
                {activeDropdown === 'profile-drop' && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p></div>
                    <button onClick={() => handleNavItemClick('profile', 'profile')} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"><Settings className="w-4 h-4 mr-3 text-gray-400" />{role === 'recruiter' ? 'Company Settings' : 'My Profile'}</button>
                    {role === 'recruiter' && canAccessHMPreferences && <button onClick={() => handleNavItemClick('hm-preferences')} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"><Target className="w-4 h-4 mr-3 text-blue-500" />My Team Preferences</button>}
                    {role === 'recruiter' && <button onClick={() => handleNavItemClick('profile', 'widget')} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"><Code className="w-4 h-4 mr-3 text-purple-500" />Career Widget<span className="ml-auto text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-black">NEW</span></button>}
                    <div className="h-px bg-gray-50 my-1"></div>
                    <button onClick={onLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4 mr-3" />Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-1">
           {(role === 'recruiter' ? [{ id: 'talent-matcher', label: 'Find', icon: Search }, { id: 'ats', label: 'Jobs', icon: Briefcase }, { id: 'messages', label: 'Chat', icon: MessageSquare }, { id: 'profile', label: 'Profile', icon: Building }] : candidateNav).map(item => (
             <button key={item.id} onClick={() => handleNavItemClick(item.id)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === item.id || (role === 'recruiter' && item.id === 'ats' && currentView === 'my-jobs') ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-gray-900/10' : ''}`} strokeWidth={currentView === item.id ? 2.5 : 1.5} />
               <span className={`text-[10px] font-medium ${currentView === item.id ? 'font-bold' : ''}`}>{item.label}</span>
             </button>
           ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;
