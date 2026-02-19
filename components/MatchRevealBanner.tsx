import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';

interface MatchRevealBannerProps {
  notifications: Notification[];
  userRole: 'candidate' | 'recruiter';
  onNavigate: (view: string) => void;
  onNotificationsUpdate: () => void;
}

const SESSION_KEY = 'match_banner_dismissed';

const MatchRevealBanner: React.FC<MatchRevealBannerProps> = ({
  notifications,
  userRole,
  onNavigate,
  onNotificationsUpdate,
}) => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const unreadMatches = useMemo(
    () =>
      notifications
        .filter((n) => n.type === 'new_match' && !n.isRead)
        .sort((a, b) => (b.metadata?.matchScore ?? 0) - (a.metadata?.matchScore ?? 0)),
    [notifications]
  );

  const topMatch = unreadMatches[0];
  const otherCount = unreadMatches.length - 1;

  // Show banner after 800ms delay if there are unread matches and not dismissed this session
  useEffect(() => {
    if (!topMatch || sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
      // Trigger animation on next frame
      requestAnimationFrame(() => setAnimateIn(true));
    }, 800);

    return () => clearTimeout(timer);
  }, [topMatch]);

  const dismiss = () => {
    setAnimateIn(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
    // Wait for exit animation before hiding
    setTimeout(() => setVisible(false), 300);
  };

  const handleCtaClick = async () => {
    try {
      await notificationService.markAsRead(topMatch.id);
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
    onNotificationsUpdate();
    dismiss();

    // Navigate based on notification link or default
    if (topMatch.link) {
      onNavigate(topMatch.link);
    } else {
      onNavigate(userRole === 'candidate' ? 'dashboard' : 'talent-matcher');
    }
  };

  const handleSeeAll = async () => {
    try {
      const userId = topMatch.metadata?.userId;
      if (userId) {
        await notificationService.markAllAsRead(userId);
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
    onNotificationsUpdate();
    dismiss();
    onNavigate(userRole === 'candidate' ? 'dashboard' : 'talent-matcher');
  };

  const handleDismiss = () => {
    dismiss();
  };

  if (!visible || !topMatch) return null;

  const score = topMatch.metadata?.matchScore ?? 0;
  const ctaLabel =
    userRole === 'candidate' ? 'View Match' : 'Unlock Profile';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[45] transition-transform duration-300 ease-out ${
        animateIn ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-white dark:bg-surface shadow-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-6 relative">
          {/* Score */}
          <div className="border-l-4 border-black pl-4 flex-shrink-0">
            <div className="text-3xl font-black text-primary leading-none">
              {score}%
            </div>
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-1">
              Match
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-primary text-sm">
              {topMatch.title}
            </div>
            <div className="text-muted text-sm mt-0.5 truncate">
              {topMatch.description}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleCtaClick}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-colors"
            >
              {ctaLabel}
            </button>
            {otherCount > 0 && (
              <button
                onClick={handleSeeAll}
                className="text-sm font-bold text-muted hover:text-primary transition-colors whitespace-nowrap"
              >
                See all {unreadMatches.length} matches
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 text-gray-300 dark:text-gray-600 hover:text-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchRevealBanner;
