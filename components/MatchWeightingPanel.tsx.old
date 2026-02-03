
import React from 'react';
import { Target, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface MatchWeights {
  skills: number;
  compensation: number;
  culture: number;
}

interface Props {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}

const MatchWeightingPanel: React.FC<Props> = ({ weights, onChange, onReset }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const updateWeight = (key: keyof MatchWeights, value: number) => {
    onChange({ ...weights, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 sticky top-20 z-30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">What Matters Most to You?</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Adjust sliders to prioritize your feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300">
          {/* Skills Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Skills Match
              </label>
              <span className="text-sm font-black text-blue-600">{weights.skills}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={weights.skills}
              onChange={(e) => updateWeight('skills', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Prioritize roles requiring your exact technical stack</p>
          </div>

          {/* Compensation Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Compensation
              </label>
              <span className="text-sm font-black text-green-600">{weights.compensation}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={weights.compensation}
              onChange={(e) => updateWeight('compensation', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-green-600"
            />
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Boost roles that meet or exceed your salary floor</p>
          </div>

          {/* Culture Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Culture Fit
              </label>
              <span className="text-sm font-black text-purple-600">{weights.culture}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={weights.culture}
              onChange={(e) => updateWeight('culture', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Focus on values, team cadence, and work-style alignment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchWeightingPanel;
