
import React, { useEffect, useState, useRef } from 'react';
import { googleCalendar } from '../services/googleCalendar';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from '../hooks/useSearchParams';

const GoogleAuthCallback: React.FC = () => {
  // Custom navigation implementation since useNavigate is missing
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const [searchParams] = useSearchParams();

  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Calendar...');
  
  // Prevent double-execution in React StrictMode
  const processedRef = useRef(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) return;
    
    // Prevent multiple runs
    if (processedRef.current) return;

    const processCallback = async () => {
      processedRef.current = true;

      // 1. Check for errors from Google
      const error = searchParams.get('error');
      if (error) {
        console.error('Google Auth Error:', error);
        setStatus('error');
        setMessage('Access denied or cancelled.');
        setTimeout(() => navigate('/?view=schedule'), 3000);
        return;
      }

      // 2. Check for code
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received.');
        setTimeout(() => navigate('/?view=schedule'), 3000);
        return;
      }

      // 3. Ensure user is logged in
      if (!user) {
        setStatus('error');
        setMessage('You must be logged in to connect calendar.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        console.log('Exchanging code for tokens via edge function...');
        await googleCalendar.handleCallback(code);

        setStatus('success');
        setMessage('Successfully Connected!');

        console.log('Connection complete. Redirecting...');
        setTimeout(() => navigate('/?view=schedule'), 2000);
      } catch (err: any) {
        console.error('Callback processing failed:', err);
        setStatus('error');
        setMessage('Failed to connect. Please try again.');
        setTimeout(() => navigate('/?view=schedule'), 4000);
      }
    };

    processCallback();
  }, [authLoading, user, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-xl border border-border max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-accent-coral-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
            </div>
            <h2 className="font-heading text-xl text-primary">Processing</h2>
            <p className="text-muted">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-heading text-xl text-primary">Success!</h2>
            <p className="text-green-600 font-medium">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-heading text-xl text-primary">Connection Failed</h2>
            <p className="text-red-500 font-medium">{message}</p>
            <button 
              onClick={() => navigate('/?view=schedule')}
              className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-border text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Schedule
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default GoogleAuthCallback;
