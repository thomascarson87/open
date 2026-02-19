
import React from 'react';
import { Check, AlertCircle, Edit2, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ElementType;
  completionPercent: number;
  summary: string;
  onEdit: () => void;
}

const ProfileReviewCard: React.FC<Props> = ({
  title,
  icon: Icon,
  completionPercent,
  summary,
  onEdit
}) => {
  const isComplete = completionPercent >= 100;
  const isWarning = completionPercent > 0 && completionPercent < 100;
  
  return (
    <div 
      className={`group relative overflow-hidden p-6 rounded-3xl border-2 transition-all hover:shadow-lg cursor-pointer ${
        isComplete 
          ? 'border-green-100 bg-green-50/20' 
          : isWarning 
          ? 'border-yellow-100 bg-yellow-50/20' 
          : 'border-border bg-gray-50 dark:bg-gray-900/20'
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${
            isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-primary">{title}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-accent-coral'}`} 
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                isComplete ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {completionPercent}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className={`w-5 h-5 ${isWarning ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
          )}
          <div className="p-1.5 bg-white dark:bg-surface rounded-lg border border-border text-gray-400 dark:text-gray-500 group-hover:text-accent-coral group-hover:border-accent-coral-light transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed line-clamp-2">
        {summary || 'No data entered yet.'}
      </p>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Section Status</span>
        <div className="flex items-center text-xs font-bold text-accent-coral">
          Edit Section <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default ProfileReviewCard;
