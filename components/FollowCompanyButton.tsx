import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { companyFollowService } from '../services/companyFollowService';
import { useAuth } from '../contexts/AuthContext';

interface FollowCompanyButtonProps {
  companyId: string;
  companyName?: string;
  variant?: 'icon' | 'button';
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowCompanyButton: React.FC<FollowCompanyButtonProps> = ({
  companyId,
  companyName,
  variant = 'icon',
  initialFollowing,
  onFollowChange
}) => {
  const { user, devProfileRole } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(initialFollowing !== undefined);

  // In production, devProfileRole is null but user is logged in
  // In dev mode, devProfileRole is set explicitly
  // Button should render if user is logged in (candidates see job cards, so they can follow)
  const isCandidate = devProfileRole === 'candidate' || (devProfileRole === null && user?.id);

  // Check initial follow status if not provided
  useEffect(() => {
    if (user?.id && initialFollowing === undefined && isCandidate) {
      companyFollowService.isFollowing(user.id, companyId)
        .then(status => {
          setIsFollowing(status);
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [user?.id, companyId, initialFollowing, isCandidate]);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user?.id || loading || !isCandidate) return;

    setLoading(true);
    try {
      const newStatus = await companyFollowService.toggleFollow(user.id, companyId);
      setIsFollowing(newStatus);
      onFollowChange?.(newStatus);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, companyId, loading, isCandidate, onFollowChange]);

  // Don't render if user not logged in
  if (!user?.id) {
    return null;
  }

  // Don't render until initialized to prevent flash
  if (!initialized) {
    return (
      <div className={variant === 'icon' ? 'p-2' : 'px-4 py-2'}>
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
          isFollowing
            ? 'bg-pink-50 text-pink-500 hover:bg-pink-100'
            : 'text-gray-300 hover:text-pink-500 hover:bg-pink-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isFollowing ? `Unfollow ${companyName || 'company'}` : `Follow ${companyName || 'company'}`}
        aria-label={isFollowing ? `Unfollow ${companyName || 'company'}` : `Follow ${companyName || 'company'}`}
      >
        <Heart className={`w-5 h-5 transition-all ${isFollowing ? 'fill-current' : ''}`} />
      </button>
    );
  }

  // variant === 'button'
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
        isFollowing
          ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isFollowing ? `Unfollow ${companyName || 'company'}` : `Follow ${companyName || 'company'}`}
    >
      <Heart className={`w-4 h-4 transition-all ${isFollowing ? 'fill-current' : ''}`} />
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowCompanyButton;
