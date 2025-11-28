import React from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { Notification } from '../types';

interface Props {
    notifications: Notification[];
}

const Notifications: React.FC<Props> = ({ notifications }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
            {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No new notifications
                </div>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className={`bg-white p-4 rounded-xl border ${n.isRead ? 'border-gray-100' : 'border-blue-100 shadow-sm'} flex items-start space-x-4`}>
                        <div className={`p-2 rounded-full ${n.type === 'match' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {n.type === 'match' ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{n.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(n.timestamp).toLocaleDateString()}</p>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                    </div>
                ))
            )}
        </div>
    );
};

export default Notifications;