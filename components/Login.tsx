
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ArrowRight, Github, ArrowLeft } from 'lucide-react';

interface Props {
    selectedRole?: 'candidate' | 'recruiter' | null;
    onBack?: () => void;
}

const Login: React.FC<Props> = ({ selectedRole, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
         {onBack && (
             <button onClick={onBack} className="absolute left-6 p-2 rounded-full hover:bg-gray-200 transition-colors">
                 <ArrowLeft className="w-5 h-5 text-gray-600" />
             </button>
         )}
         <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">O</div>
            <span className="text-xl font-bold tracking-tight">Open</span>
         </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-300">
           <div className="text-center mb-8">
              {selectedRole && (
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-4">
                      {selectedRole === 'candidate' ? 'For Talent' : 'For Companies'}
                  </span>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="text-gray-500">
                {isSignUp ? 'Join the precise matchmaking platform.' : 'Sign in to access your dashboard.'}
              </p>
           </div>

           {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
               {error}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')} <ArrowRight className="w-4 h-4 ml-2"/>
              </button>
           </form>

           <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-100"></div>
              <span className="px-4 text-xs text-gray-400 font-medium uppercase">Or continue with</span>
              <div className="flex-1 border-t border-gray-100"></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleOAuth('google')} className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                 <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Google
              </button>
              <button onClick={() => handleOAuth('github')} className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                 <Github className="w-4 h-4 mr-2"/> GitHub
              </button>
           </div>

           <p className="text-center mt-8 text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : 'No account yet?'} 
              <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-bold text-gray-900 hover:underline">
                 {isSignUp ? 'Sign In' : 'Create one'}
              </button>
           </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
