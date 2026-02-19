
import React from 'react';
import { Connection } from '../types';
import { Users, CheckCircle, ExternalLink, Briefcase, UserPlus } from 'lucide-react';

interface Props {
  connections: Connection[];
}

const Network: React.FC<Props> = ({ connections }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-heading text-3xl text-primary">Your Network</h1>
            <p className="text-muted mt-2">Manage verified connections and leverage them for referrals.</p>
          </div>
          <button className="bg-surface border border-border text-gray-700 dark:text-gray-300 dark:text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 flex items-center shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" /> Sync Contacts
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Connections */}
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-primary flex items-center">
               <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Verified Ex-Colleagues
           </h3>
           {connections.length === 0 ? (
               <div className="text-muted bg-white dark:bg-surface p-8 rounded-xl border border-border text-center border-dashed">
                   No verified connections yet.
                   <br/>
                   <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">Go to Profile → Verifications to invite colleagues.</span>
               </div>
           ) : (
               connections.map(conn => (
               <div key={conn.id} className="bg-white dark:bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                   <div className="flex items-start justify-between">
                       <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-muted text-lg overflow-hidden">
                               {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover"/> : conn.name.charAt(0)}
                           </div>
                           <div>
                               <h4 className="font-bold text-primary">{conn.name}</h4>
                               <p className="text-sm text-muted">{conn.headline}</p>
                           </div>
                       </div>
                       <button className="text-gray-400 dark:text-gray-500 hover:text-accent-coral transition-colors">
                           <ExternalLink className="w-4 h-4" />
                       </button>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted">
                             <Briefcase className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                             Works at <span className="font-semibold ml-1 text-primary">{conn.company}</span>
                        </div>
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 text-muted px-2 py-1 rounded">
                            {conn.sharedHistory}
                        </div>
                   </div>
                   
                   <div className="mt-4">
                        <button className="w-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 text-primary py-2 rounded-lg text-sm font-medium transition-colors border border-border">
                            Ask for Referral
                        </button>
                   </div>
               </div>
           )))}
        </div>

        {/* Pending / Suggestions */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary flex items-center">
               <Users className="w-5 h-5 mr-2 text-accent-coral" /> Suggested from Work History
           </h3>
           <div className="bg-accent-coral-bg p-6 rounded-xl border border-accent-coral-bg text-center">
                <div className="w-16 h-16 bg-white dark:bg-surface rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Briefcase className="w-8 h-8 text-accent-coral" />
                </div>
                <h4 className="font-bold text-accent-coral mb-2">Connect your work email</h4>
                <p className="text-sm text-accent-coral mb-6">We can automatically verify colleagues from past companies.</p>
                <button className="bg-accent-coral text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-coral transition-colors shadow-md">
                    Connect Work Email
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
