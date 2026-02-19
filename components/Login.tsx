
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('OAuth error:', error.message);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-primary">
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
         {onBack && (
             <button onClick={onBack} className="absolute left-6 p-2 rounded-full hover:bg-border transition-colors">
                 <ArrowLeft className="w-5 h-5 text-muted" />
             </button>
         )}
         <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
            <span className="font-heading text-xl font-normal tracking-tight">chime</span>
         </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border w-full max-w-md animate-in fade-in zoom-in duration-300">
           <div className="text-center mb-8">
              {selectedRole && (
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-muted text-xs font-bold uppercase tracking-wider mb-4">
                      {selectedRole === 'candidate' ? 'For Talent' : 'For Companies'}
                  </span>
              )}
              <h1 className="font-heading text-3xl tracking-tight mb-2">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="text-muted">
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
                <label className="block text-xs font-bold text-muted uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')} <ArrowRight className="w-4 h-4 ml-2"/>
              </button>
              {!isSignUp && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState({}, '', '/forgot-password');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                    className="text-sm text-muted hover:text-gray-700 dark:text-gray-300 dark:text-gray-600 underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
           </form>

           <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">Or continue with</span>
              <div className="flex-1 border-t border-border"></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleOAuth('google')} className="flex items-center justify-center py-2.5 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 transition-colors font-medium text-sm">
                 <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Google
              </button>
              <button onClick={() => handleOAuth('github')} className="flex items-center justify-center py-2.5 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 transition-colors font-medium text-sm">
                 <Github className="w-4 h-4 mr-2"/> GitHub
              </button>
           </div>

           <p className="text-center mt-8 text-sm text-muted">
              {isSignUp ? 'Already have an account?' : 'No account yet?'} 
              <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-bold text-primary hover:underline">
                 {isSignUp ? 'Sign In' : 'Create one'}
              </button>
           </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
