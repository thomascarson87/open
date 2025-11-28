import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Video } from 'lucide-react';

const Schedule: React.FC = () => {
    const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const events = [
        { time: "09:00 AM", title: "Intro Call with Alex", type: "Screening" },
        { time: "02:00 PM", title: "Technical Interview", type: "Interview" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Schedule</h2>
                    <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-500"/></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-500"/></button>
                    </div>
                </div>
                
                {/* Simplified Calendar View */}
                <div className="grid grid-cols-7 gap-4 mb-6 text-center">
                    {dates.map((d, i) => (
                        <div key={i} className={`p-2 rounded-lg cursor-pointer transition-colors ${i === 0 ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <div className="text-xs font-medium uppercase mb-1 opacity-70">{d.toLocaleDateString('en-US', {weekday: 'short'})}</div>
                            <div className="text-lg font-bold">{d.getDate()}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today</div>
                    {events.map((e, i) => (
                        <div key={i} className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group bg-white">
                            <div className="w-24 text-sm font-bold text-gray-900">{e.time}</div>
                            <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900">{e.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === 'Screening' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {e.type}
                                </span>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-blue-600">
                                <Video className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    
                     <div className="flex items-center p-4 border border-dashed border-gray-200 rounded-lg justify-center text-gray-400 text-sm hover:bg-gray-50 cursor-pointer">
                        + Add new slot
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold mb-2">Upcoming Interview</h3>
                    <p className="text-indigo-200 text-sm mb-6">Technical Screen with Sarah Design.</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                             <CalendarIcon className="w-4 h-4 mr-2 text-indigo-300"/>
                             <span className="text-sm font-medium">Today, Oct 28</span>
                        </div>
                        <div className="flex items-center">
                             <Clock className="w-4 h-4 mr-2 text-indigo-300"/>
                             <span className="text-sm font-medium">02:00 PM - 03:00 PM</span>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                    <Video className="w-4 h-4 mr-2" /> Join Meeting
                </button>
            </div>
        </div>
    )
}

export default Schedule;