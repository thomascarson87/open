
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { SKILLS_LIST } from '../constants/matchingData';
import SkillIcon from './SkillIcon';

interface SkillSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skillName: string) => void;
  alreadySelected: string[];
}

/**
 * Full-screen modal for selecting skills from SKILLS_LIST
 * Much better UX than tiny dropdown for large lists
 */
const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
  alreadySelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Object.keys(SKILLS_LIST);
  
  // Filter skills based on search and category
  const getFilteredSkills = () => {
    let skillsToShow: { category: string; skills: string[] }[] = [];
    
    Object.entries(SKILLS_LIST).forEach(([category, skills]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) return;
      
      const filtered = skills.filter(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alreadySelected.includes(skill)
      );
      
      if (filtered.length > 0) {
        skillsToShow.push({ category, skills: filtered });
      }
    });
    
    return skillsToShow;
  };

  const filteredSkills = getFilteredSkills();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Add Technical Skill</h2>
            <p className="text-sm text-gray-600 mt-1">Select from hundreds of technologies</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b bg-white sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Search React, Python, AWS..."
              autoFocus
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-6 py-4 border-b bg-gray-50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSkills.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No skills found matching "{searchQuery}"</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredSkills.map(({ category, skills }) => (
                <div key={category}>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {skills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => {
                          onSelectSkill(skill);
                          onClose();
                        }}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                      >
                        <SkillIcon skillName={skill} size={32} />
                        <span className="font-medium text-gray-900 group-hover:text-blue-700 text-sm flex-1 min-w-0 truncate">
                          {skill}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {alreadySelected.length} skill{alreadySelected.length !== 1 ? 's' : ''} already added
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillSelectorModal;
