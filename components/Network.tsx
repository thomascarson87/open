
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
            <h1 className="text-3xl font-bold text-gray-900">Your Network</h1>
            <p className="text-gray-500 mt-2">Manage verified connections and leverage them for referrals.</p>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" /> Sync Contacts
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Connections */}
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Verified Ex-Colleagues
           </h3>
           {connections.length === 0 ? (
               <div className="text-gray-500 bg-white p-8 rounded-xl border border-gray-200 text-center border-dashed">
                   No verified connections yet.
                   <br/>
                   <span className="text-xs text-gray-400 mt-2 block">Go to Profile → Verifications to invite colleagues.</span>
               </div>
           ) : (
               connections.map(conn => (
               <div key={conn.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex items-start justify-between">
                       <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg overflow-hidden">
                               {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover"/> : conn.name.charAt(0)}
                           </div>
                           <div>
                               <h4 className="font-bold text-gray-900">{conn.name}</h4>
                               <p className="text-sm text-gray-500">{conn.headline}</p>
                           </div>
                       </div>
                       <button className="text-gray-400 hover:text-blue-600 transition-colors">
                           <ExternalLink className="w-4 h-4" />
                       </button>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                             <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                             Works at <span className="font-semibold ml-1 text-gray-900">{conn.company}</span>
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {conn.sharedHistory}
                        </div>
                   </div>
                   
                   <div className="mt-4">
                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                            Ask for Referral
                        </button>
                   </div>
               </div>
           )))}
        </div>

        {/* Pending / Suggestions */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <Users className="w-5 h-5 mr-2 text-blue-500" /> Suggested from Work History
           </h3>
           <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-blue-900 mb-2">Connect your work email</h4>
                <p className="text-sm text-blue-700 mb-6">We can automatically verify colleagues from past companies.</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md">
                    Connect Work Email
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Network;
