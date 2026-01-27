
import React, { useState } from 'react';
import { CandidateProfile } from '../types';
import { Lock, MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

type UnlockErrorCode = 'INSUFFICIENT_CREDITS' | 'ALREADY_UNLOCKED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_REQUEST';

interface UnlockError {
  message: string;
  code: UnlockErrorCode;
}

interface Props {
  candidate: CandidateProfile;
  onUnlock: (id: string) => Promise<{ success: boolean; error?: UnlockError }>;
  onBack: () => void;
}

const CandidateDetailsLocked: React.FC<Props> = ({ candidate, onUnlock, onBack }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<UnlockError | null>(null);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      const result = await onUnlock(candidate.id);

      if (!result.success && result.error) {
        setError(result.error);
      }
      // On success, parent will re-render with unlocked profile
    } catch (e) {
      setError({
        message: 'An unexpected error occurred. Please try again.',
        code: 'INVALID_REQUEST'
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.code) {
      case 'INSUFFICIENT_CREDITS':
        return 'Insufficient credits. Purchase more credits to unlock this profile.';
      case 'NOT_FOUND':
        return 'Candidate profile not found.';
      case 'UNAUTHORIZED':
        return 'You are not authorized to unlock profiles. Please log in again.';
      default:
        return error.message;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Search
      </button>

      {/* Locked Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold border-4 border-white shadow-lg">
            {candidate.name.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold mb-3">
                <Lock className="w-3 h-3 mr-1" /> Profile Locked
             </div>
             <h1 className="text-3xl font-black text-gray-300 blur-sm select-none mb-1">
               {candidate.name}
             </h1>
             <p className="text-2xl font-bold text-gray-900 mb-2">{candidate.headline}</p>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {candidate.location}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-2">
             <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className={`${
                  isUnlocking
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                } text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center min-w-[160px] justify-center`}
             >
                {isUnlocking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Unlocking...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Unlock (1 Credit)
                  </>
                )}
             </button>

             {error && (
               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl max-w-xs">
                 <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-red-700">{getErrorMessage()}</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsLocked;
