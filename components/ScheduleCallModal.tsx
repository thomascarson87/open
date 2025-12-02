
import React, { useState } from 'react';
import { X, Calendar as CalIcon, Clock, AlignLeft, CheckCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSchedule: (data: any) => Promise<void>;
}

const ScheduleCallModal: React.FC<Props> = ({ onClose, onSchedule }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Interview',
        type: 'screening',
        date: '',
        time: '10:00',
        duration: 30,
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSchedule(formData);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                    <h3 className="text-lg font-bold">Schedule Interview</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interview Type</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.type}
                            onChange={e => {
                                const type = e.target.value;
                                let title = 'Interview';
                                if (type === 'screening') title = 'Phone Screen';
                                if (type === 'technical_test') title = 'Technical Interview';
                                if (type === 'final_round') title = 'Final Round Interview';
                                setFormData({...formData, type, title});
                            }}
                        >
                            <option value="screening">Phone Screen</option>
                            <option value="technical_test">Technical Interview</option>
                            <option value="final_round">Final Round</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
                        <input 
                            required 
                            className="w-full p-3 border border-gray-200 rounded-xl" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                             <input 
                                type="date" 
                                required 
                                className="w-full p-3 border border-gray-200 rounded-xl" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                             <input 
                                type="time" 
                                required 
                                className="w-full p-3 border border-gray-200 rounded-xl" 
                                value={formData.time} 
                                onChange={e => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                         <div className="flex gap-2">
                             {[15, 30, 45, 60].map(m => (
                                 <button
                                    key={m}
                                    type="button"
                                    onClick={() => setFormData({...formData, duration: m})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formData.duration === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                                 >
                                     {m}m
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes / Agenda</label>
                        <textarea 
                            className="w-full p-3 border border-gray-200 rounded-xl h-20 text-sm" 
                            value={formData.notes} 
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add meeting link will be generated automatically..."
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : <><CheckCircle className="w-4 h-4 mr-2"/> Confirm & Send Invite</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleCallModal;
