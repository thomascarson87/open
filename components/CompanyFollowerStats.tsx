import React, { useState, useEffect } from 'react';
import { Heart, Users, TrendingUp } from 'lucide-react';
import { companyFollowService } from '../services/companyFollowService';

interface CompanyFollowerStatsProps {
  companyId: string;
  initialCount?: number;
}

const CompanyFollowerStats: React.FC<CompanyFollowerStatsProps> = ({
  companyId,
  initialCount
}) => {
  const [followerCount, setFollowerCount] = useState(initialCount ?? 0);
  const [loading, setLoading] = useState(initialCount === undefined);

  useEffect(() => {
    if (initialCount === undefined) {
      companyFollowService.getFollowerCount(companyId)
        .then(count => {
          setFollowerCount(count);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [companyId, initialCount]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-pink-100 rounded mb-2" />
          <div className="h-8 w-16 bg-pink-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-pink-100 p-2 rounded-lg">
          <Heart className="w-5 h-5 text-pink-600 fill-current" />
        </div>
        <span className="text-sm font-bold text-pink-700 uppercase tracking-wider">
          Company Followers
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-gray-900">
          {followerCount.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">
          {followerCount === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Candidates interested in your company will see new job postings in their feed.
      </p>
    </div>
  );
};

export default CompanyFollowerStats;
