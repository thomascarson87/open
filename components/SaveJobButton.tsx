import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { savedJobService } from '../services/savedJobService';
import { useAuth } from '../contexts/AuthContext';

interface SaveJobButtonProps {
  jobId: string;
  jobTitle?: string;
  variant?: 'icon' | 'button';
  initialSaved?: boolean;
  onSaveChange?: (isSaved: boolean) => void;
  className?: string;
}

const SaveJobButton: React.FC<SaveJobButtonProps> = ({
  jobId,
  jobTitle,
  variant = 'icon',
  initialSaved,
  onSaveChange,
  className = ''
}) => {
  const { user, devProfileRole } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(initialSaved !== undefined);

  // In production, devProfileRole is null but user is logged in
  // In dev mode, devProfileRole is set explicitly
  // Button should render if user is logged in (candidates see job cards, so they can save)
  const isCandidate = devProfileRole === 'candidate' || (devProfileRole === null && user?.id);

  // Check initial saved status if not provided
  useEffect(() => {
    if (user?.id && initialSaved === undefined && isCandidate) {
      savedJobService.isSaved(user.id, jobId)
        .then(status => {
          setIsSaved(status);
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [user?.id, jobId, initialSaved, isCandidate]);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user?.id || loading || !isCandidate) return;

    setLoading(true);
    try {
      const newStatus = await savedJobService.toggleSaved(user.id, jobId);
      setIsSaved(newStatus);
      onSaveChange?.(newStatus);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, jobId, loading, isCandidate, onSaveChange]);

  // Don't render if user not logged in
  if (!user?.id) {
    return null;
  }

  // Don't render until initialized to prevent flash
  if (!initialized) {
    return (
      <div className={`${variant === 'icon' ? 'p-2' : 'px-4 py-2'} ${className}`}>
        <Heart className={`w-5 h-5 text-gray-200 ${variant === 'button' ? 'w-4 h-4' : ''}`} />
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-xl transition-all ${
          isSaved
            ? 'bg-pink-50 text-pink-500 hover:bg-pink-100'
            : 'text-gray-300 hover:text-pink-500 hover:bg-pink-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        title={isSaved ? `Unsave ${jobTitle || 'job'}` : `Save ${jobTitle || 'job'}`}
        aria-label={isSaved ? `Unsave ${jobTitle || 'job'}` : `Save ${jobTitle || 'job'}`}
      >
        <Heart className={`w-5 h-5 transition-all ${isSaved ? 'fill-current' : ''}`} />
      </button>
    );
  }

  // variant === 'button'
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
        isSaved
          ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      aria-label={isSaved ? `Unsave ${jobTitle || 'job'}` : `Save ${jobTitle || 'job'}`}
    >
      <Heart className={`w-4 h-4 transition-all ${isSaved ? 'fill-current' : ''}`} />
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
};

export default SaveJobButton;
