
import React from 'react';
import { User, Briefcase, ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

interface Props {
    onSelectRole: (role: 'candidate' | 'recruiter') => void;
}

const LandingPage: React.FC<Props> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">O</div>
                    <span className="text-xl font-bold tracking-tight">Open</span>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    The precise matchmaking platform.
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 pb-20">
                
                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                        <Zap className="w-3 h-3 mr-1" /> Now in Public Beta
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight">
                        Hiring, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aligned.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Stop filtering through noise. Open connects high-intent technical talent with companies that match their values, skills, and expectations.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">
                    
                    {/* Talent Card */}
                    <button 
                        onClick={() => onSelectRole('candidate')}
                        className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-200 hover:border-blue-500 transition-all duration-300 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                                <User className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm Talent</h3>
                            <p className="text-gray-500 mb-8 h-12">
                                I'm looking for a role where my skills, values, and compensation expectations are met.
                            </p>
                            
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Private by default
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Salary transparency
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Direct hiring manager access
                                </li>
                            </ul>

                            <div className="flex items-center font-bold text-blue-600 group-hover:translate-x-2 transition-transform">
                                Create Candidate Profile <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </button>

                    {/* Hiring Card */}
                    <button 
                        onClick={() => onSelectRole('recruiter')}
                        className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-200 hover:border-gray-900 transition-all duration-300 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-gray-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                                <Briefcase className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm Hiring</h3>
                            <p className="text-gray-500 mb-8 h-12">
                                I'm looking for high-quality candidates with precise alignment to our tech stack.
                            </p>
                            
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> 85%+ Match Rate
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> Pay only for connections
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 mr-2 text-gray-900" /> Team collaboration tools
                                </li>
                            </ul>

                            <div className="flex items-center font-bold text-gray-900 group-hover:translate-x-2 transition-transform">
                                Post a Job <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </button>

                </div>
            </main>

            <footer className="py-8 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Open Recruitment Platform. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;

