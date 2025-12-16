
import React from 'react';
import { IMPACT_SCOPE_METADATA } from '../constants/matchingData';
import { Info, Check } from 'lucide-react';

interface Props {
  currentScope?: number;
  desiredScopes?: number[];
  onChangeCurrent: (scope: number) => void;
  onChangeDesired: (scopes: number[]) => void;
}

const ImpactScopeSelector: React.FC<Props> = ({ currentScope, desiredScopes = [], onChangeCurrent, onChangeDesired }) => {
  
  const toggleDesired = (scope: number) => {
      if (desiredScopes.includes(scope)) {
          onChangeDesired(desiredScopes.filter(s => s !== scope));
      } else {
          onChangeDesired([...desiredScopes, scope].sort());
      }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
          <div>
              <h3 className="text-lg font-bold text-gray-900">Impact Scope</h3>
              <p className="text-sm text-gray-500">Measure the breadth of your influence, regardless of title.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">New Framework</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Current Scope */}
          <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide">Current Role Impact</h4>
              <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(scope => {
                      const meta = IMPACT_SCOPE_METADATA[scope];
                      const isSelected = currentScope === scope;
                      return (
                          <div 
                            key={scope}
                            onClick={() => onChangeCurrent(scope)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${
                                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                            }`}
                          >
                              <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                  }`}>
                                      {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                  <div>
                                      <div className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                          {meta.label}
                                      </div>
                                      <div className="text-xs text-gray-500">{meta.descriptor}</div>
                                  </div>
                              </div>

                              {/* Tooltip */}
                              <div className="hidden group-hover:block absolute z-20 left-0 bottom-full mb-2 w-64 bg-gray-900 text-white p-3 rounded-lg text-xs shadow-xl">
                                  <div className="font-bold mb-1">Typical Roles:</div>
                                  <div className="mb-2 text-gray-300">{meta.typicalRoles.join(', ')}</div>
                                  <div className="font-bold mb-1">Characteristics:</div>
                                  <ul className="list-disc list-inside text-gray-300">
                                      {meta.characteristics.slice(0, 2).map((c, i) => <li key={i}>{c}</li>)}
                                  </ul>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Desired Scope */}
          <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide">Desired Next Role(s)</h4>
              <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(scope => {
                      const meta = IMPACT_SCOPE_METADATA[scope];
                      const isSelected = desiredScopes.includes(scope);
                      const isGrowth = currentScope && scope > currentScope;
                      
                      return (
                          <div 
                            key={scope}
                            onClick={() => toggleDesired(scope)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'
                            }`}
                          >
                              <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center border-2 ${
                                      isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                  }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className={`font-bold text-sm ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                                      {meta.label}
                                  </span>
                              </div>
                              {isGrowth && (
                                  <span className="text-[10px] uppercase font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">Growth</span>
                              )}
                          </div>
                      );
                  })}
              </div>
              <div className="mt-6 bg-gray-50 p-4 rounded-lg text-xs text-gray-500 leading-relaxed">
                  <Info className="w-4 h-4 inline mr-1 mb-0.5 text-gray-400"/>
                  Select all impact levels you are open to. Choosing levels above your current scope indicates ambition for growth.
              </div>
          </div>
      </div>
    </div>
  );
};

export default ImpactScopeSelector;
