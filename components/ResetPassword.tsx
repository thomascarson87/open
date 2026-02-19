import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ArrowRight, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'form' | 'success' | 'error' | 'checking'>('checking');

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    // Check if this is a valid password reset request
    // Supabase includes tokens in the URL hash or as query params
    const checkSession = async () => {
      // Wait a moment for Supabase to process the URL tokens
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('form');
      } else {
        // Try to get session from URL (Supabase auto-processes recovery tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        if (type === 'recovery') {
          // Supabase should auto-process this - wait and check again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (retrySession) {
            setStatus('form');
          } else {
            setStatus('error');
            setError('Invalid or expired reset link. Please request a new one.');
          }
        } else {
          setStatus('error');
          setError('Invalid reset link. Please request a new password reset.');
        }
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-primary">
        <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
          <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
            <span className="font-heading text-xl font-normal tracking-tight">chime</span>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border w-full max-w-md text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-muted">Verifying reset link...</p>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-primary">
        <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
          <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
            <span className="font-heading text-xl font-normal tracking-tight">chime</span>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-heading text-2xl tracking-tight mb-2">Invalid Link</h1>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Request new link
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-primary">
        <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
          <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
            <span className="font-heading text-xl font-normal tracking-tight">chime</span>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-heading text-2xl tracking-tight mb-2">Password updated!</h1>
            <p className="text-muted mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Sign in
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-primary">
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
        <div className="flex items-center space-x-2 mx-auto">
          <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
          <span className="font-heading text-xl font-normal tracking-tight">chime</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="font-heading text-3xl tracking-tight mb-2">Reset password</h1>
            <p className="text-muted">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl focus:ring-2 focus:ring-accent-coral outline-none transition-all"
                placeholder="Confirm new password"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Updating...' : 'Update password'} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
