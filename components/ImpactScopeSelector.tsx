
import React from 'react';
import { IMPACT_SCOPE_METADATA } from '../constants/matchingData';
import { Check, Info } from 'lucide-react';

interface Props {
  currentScope?: number;
  desiredScopes?: number[];
  selected?: number[]; // Legacy support
  onChange?: (scopes: number[]) => void; // Legacy support
  onChangeCurrent?: (scope: number) => void;
  onChangeDesired?: (scopes: number[]) => void;
  maxSelections?: number;
}

const ImpactScopeSelector: React.FC<Props> = ({ 
  currentScope,
  desiredScopes = [],
  selected = [],
  onChange,
  onChangeCurrent,
  onChangeDesired,
  maxSelections = 3 
}) => {
  // Use either new props or fallback to legacy 'selected'
  const isSelected = (level: number) => {
    if (currentScope === level) return true;
    if (desiredScopes.includes(level)) return true;
    if (selected.includes(level)) return true;
    return false;
  };

  const handleToggle = (level: number) => {
    if (onChangeCurrent) {
        onChangeCurrent(level);
    }
    
    if (onChangeDesired) {
        const newDesired = desiredScopes.includes(level)
            ? desiredScopes.filter(s => s !== level)
            : [...desiredScopes, level].slice(0, maxSelections).sort((a, b) => a - b);
        onChangeDesired(newDesired);
    }

    if (onChange) {
        const newSelected = selected.includes(level)
            ? selected.filter(s => s !== level)
            : [...selected, level].slice(0, maxSelections).sort((a, b) => a - b);
        onChange(newSelected);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5].map((level) => {
          const meta = IMPACT_SCOPE_METADATA[level];
          const active = isSelected(level);
          
          return (
            <div 
              key={level}
              onClick={() => handleToggle(level)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative group ${
                active 
                  ? 'border-accent-coral bg-accent-coral-bg/50 shadow-sm' 
                  : 'border-border bg-white dark:bg-surface hover:border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${
                  active ? 'bg-accent-coral text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}>
                  {level}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${active ? 'text-accent-coral' : 'text-primary'}`}>{meta.label}</h4>
                    {active && <Check className="w-5 h-5 text-accent-coral" />}
                  </div>
                  <p className="text-sm text-muted leading-tight mb-3">{meta.descriptor}</p>
                  
                  {/* Expanded Content */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-dashed transition-all ${
                    active ? 'border-accent-coral-light opacity-100 max-h-40' : 'border-border opacity-60 group-hover:opacity-100 max-h-40 overflow-hidden'
                  }`}>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Typical Roles</div>
                      <div className="flex flex-wrap gap-1">
                        {meta.typicalRoles.slice(0, 3).map(role => (
                          <span key={role} className="text-[10px] bg-surface border border-border px-1.5 py-0.5 rounded text-muted">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Characteristics</div>
                      <ul className="text-[10px] text-muted space-y-0.5 list-disc list-inside">
                        {meta.characteristics.slice(0, 2).map((c, i) => (
                          <li key={i} className="truncate">{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs text-muted border border-border border-dashed">
        <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <p>Impact scope measures the breadth of your influence beyond your job title. You can select up to {maxSelections} levels you are open to.</p>
      </div>
    </div>
  );
};

export default ImpactScopeSelector;
