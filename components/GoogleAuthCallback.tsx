
import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom'; // Removed due to missing exports
import { googleCalendar } from '../services/googleCalendar';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuthCallback: React.FC = () => {
  // Custom navigation implementation since useNavigate is missing
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Custom implementation of searchParams since useSearchParams is missing
  const [searchParams] = React.useMemo(() => {
    return [new URLSearchParams(window.location.search)] as const;
  }, [window.location.search]);

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
        console.log('Exchanging code for tokens...');
        const tokens = await googleCalendar.handleCallback(code);
        
        console.log('Storing tokens for user:', user.id);
        await googleCalendar.storeTokens(user.id, tokens);
        
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
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-red-500 font-medium">{message}</p>
            <button 
              onClick={() => navigate('/?view=schedule')}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
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
