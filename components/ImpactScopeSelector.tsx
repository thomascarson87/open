
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
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {level}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${active ? 'text-blue-900' : 'text-gray-900'}`}>{meta.label}</h4>
                    {active && <Check className="w-5 h-5 text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-500 leading-tight mb-3">{meta.descriptor}</p>
                  
                  {/* Expanded Content */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-dashed transition-all ${
                    active ? 'border-blue-200 opacity-100 max-h-40' : 'border-gray-100 opacity-60 group-hover:opacity-100 max-h-40 overflow-hidden'
                  }`}>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Typical Roles</div>
                      <div className="flex flex-wrap gap-1">
                        {meta.typicalRoles.slice(0, 3).map(role => (
                          <span key={role} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Characteristics</div>
                      <ul className="text-[10px] text-gray-500 space-y-0.5 list-disc list-inside">
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
      
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200 border-dashed">
        <Info className="w-4 h-4 text-gray-400" />
        <p>Impact scope measures the breadth of your influence beyond your job title. You can select up to {maxSelections} levels you are open to.</p>
      </div>
    </div>
  );
};

export default ImpactScopeSelector;
