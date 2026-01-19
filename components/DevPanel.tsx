import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DevPanel: React.FC = () => {
  const { isDevMode, devLogin, devLogout, user, session } = useAuth();

  // Only render on localhost
  if (!isDevMode) return null;

  const isLoggedIn = !!session;
  const currentRole = localStorage.getItem('dev_user')
    ? JSON.parse(localStorage.getItem('dev_user') || '{}').role
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#fffbeb',
        border: '2px solid #fb923c',
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#ea580c',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isLoggedIn ? '#22c55e' : '#ef4444',
            display: 'inline-block',
          }}
        />
        Dev Mode
      </div>

      {isLoggedIn && currentRole && (
        <div
          style={{
            fontSize: 11,
            color: '#78716c',
            marginBottom: 8,
            padding: '4px 8px',
            backgroundColor: '#fff',
            borderRadius: 4,
            border: '1px solid #e7e5e4',
          }}
        >
          Logged in as: <strong style={{ color: '#292524' }}>{currentRole}</strong>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => devLogin('candidate')}
          disabled={currentRole === 'candidate'}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: currentRole === 'candidate' ? '#d1d5db' : '#3b82f6',
            color: currentRole === 'candidate' ? '#6b7280' : '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: currentRole === 'candidate' ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Candidate
        </button>

        <button
          onClick={() => devLogin('recruiter')}
          disabled={currentRole === 'recruiter'}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: currentRole === 'recruiter' ? '#d1d5db' : '#1f2937',
            color: currentRole === 'recruiter' ? '#6b7280' : '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: currentRole === 'recruiter' ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Recruiter
        </button>

        {isLoggedIn && (
          <button
            onClick={devLogout}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#fff',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default DevPanel;
