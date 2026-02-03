import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * AuthCallback - Handles OAuth callback from Supabase
 * URL: /auth/callback
 *
 * This is different from GoogleAuthCallback which handles Google Calendar OAuth.
 * This component handles the main Supabase authentication flow for Google/GitHub sign-in.
 */
const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign in...');

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || 'Authentication failed');
          setTimeout(() => navigate('/?error=auth_failed'), 3000);
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Sign in successful!');

          // Check user role and redirect appropriately
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          setTimeout(() => {
            if (profile?.role === 'candidate') {
              navigate('/?view=dashboard');
            } else if (profile?.role === 'recruiter') {
              navigate('/?view=dashboard');
            } else {
              // New user - needs to complete profile/select role
              navigate('/');
            }
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No session received');
          setTimeout(() => navigate('/?error=no_session'), 3000);
        }
      } catch (err: any) {
        console.error('Auth callback processing failed:', err);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
        setTimeout(() => navigate('/?error=callback_failed'), 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Processing</h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Success!</h2>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-gray-400 text-sm">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sign In Failed</h2>
            <p className="text-red-500 font-medium">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthCallback;
