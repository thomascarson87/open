import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, ArrowRight, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
          <div className="flex items-center space-x-2 mx-auto">
            <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
            <span className="text-xl font-bold tracking-tight">chime</span>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-2">Check your email</h1>
              <p className="text-gray-500 mb-6">
                We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Back to login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center relative">
        <button
          onClick={() => navigate('/')}
          className="absolute left-6 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-2 mx-auto">
          <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-lg">c</div>
          <span className="text-xl font-bold tracking-tight">chime</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Forgot password?</h1>
            <p className="text-gray-500">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Sending...' : 'Send reset link'} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            Remember your password?
            <button
              onClick={() => navigate('/')}
              className="ml-1 font-bold text-gray-900 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
