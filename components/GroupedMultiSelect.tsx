
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import SkillIcon from './SkillIcon';

interface Props {
  label: string;
  options: string[] | Record<string, string[]>;  // Array or categorized object
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  grouped?: boolean;
  searchable?: boolean;
  maxSelections?: number;
  helpText?: string;
  hideSelectedTags?: boolean;  // Hide the selected tags display (when using external pill editor)
}

const GroupedMultiSelect: React.FC<Props> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search and select...",
  grouped = false,
  searchable = true,
  maxSelections,
  helpText,
  hideSelectedTags = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Click-outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Robustly determine flat options to avoid crashes if props don't match
  const flatOptions = grouped 
    ? Object.values(options as Record<string, string[]>).flat()
    : (Array.isArray(options) ? options : []); // Fallback to empty array if not an array

  const filteredOptions = searchable
    ? flatOptions.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    : flatOptions;

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        alert(`Maximum ${maxSelections} selections allowed`);
        return;
      }
      onChange([...selected, option]);
    }
  };

  const removeSelected = (option: string) => {
    onChange(selected.filter(s => s !== option));
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
        {label}
        {maxSelections && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-2">
            (Max {maxSelections})
          </span>
        )}
      </label>
      
      {helpText && (
        <p className="text-xs text-muted mb-2">{helpText}</p>
      )}

      {/* Selected Tags */}
      {!hideSelectedTags && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-2 bg-accent-coral-bg text-accent-coral px-3 py-2 rounded-xl text-sm font-medium border border-accent-coral-light"
            >
              <SkillIcon skillName={item} size={20} showFallback={false} />
              <span>{item}</span>
              <button
                onClick={() => removeSelected(item)}
                className="ml-1 text-accent-coral hover:text-accent-coral"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-left hover:border-accent-coral focus:outline-none focus:ring-2 focus:ring-accent-coral bg-white dark:bg-surface"
        >
          <span className={selected.length ? "text-primary" : "text-muted"}>{placeholder}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div ref={dropdownRef} className="absolute z-50 mt-2 w-full bg-white dark:bg-surface border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-auto">
            {searchable && (
              <div className="sticky top-0 bg-white dark:bg-surface p-3 border-b border-border z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-coral"
                    placeholder="Search..."
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="p-2">
              {grouped && typeof options === 'object' && !Array.isArray(options) ? (
                // Render categories
                Object.entries(options as Record<string, string[]>).map(([category, items]) => {
                  const visibleItems = items.filter(item => 
                    !searchQuery || item.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider bg-gray-50 dark:bg-gray-900 rounded mt-2 mb-1">
                        {category}
                      </div>
                      {visibleItems.map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleOption(item)}
                          className="w-full text-left px-3 py-2 hover:bg-accent-coral-bg rounded flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <SkillIcon skillName={item} size={20} showFallback={false} />
                            <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600">{item}</span>
                          </div>
                          {selected.includes(item) && (
                            <Check className="w-4 h-4 text-accent-coral" />
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })
              ) : (
                // Render flat list
                filteredOptions.length > 0 ? (
                  filteredOptions.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleOption(item)}
                      className="w-full text-left px-3 py-2 hover:bg-accent-coral-bg rounded flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <SkillIcon skillName={item} size={20} showFallback={false} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600">{item}</span>
                      </div>
                      {selected.includes(item) && (
                        <Check className="w-4 h-4 text-accent-coral" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted text-center">No options found.</div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedMultiSelect;
