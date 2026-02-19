import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Skill, SeniorityLevel } from '../types';
import { Loader2, X, Search, Star, Plus } from 'lucide-react';
import { getSkillLevelForSeniority, getImpactScopeForSeniority } from '../constants/seniorityData';

interface RoleResult {
  id: string;
  name: string;
  slug: string;
  family_name: string;
  is_emerging: boolean;
}

interface SelectedRole {
  id: string;
  name: string;
}

interface CandidateRoleSelectorProps {
  primaryRole?: SelectedRole;
  secondaryRoles?: SelectedRole[];
  currentSeniority?: SeniorityLevel;
  onPrimaryRoleChange: (role: SelectedRole | undefined, skills: Skill[]) => void;
  onSecondaryRolesChange: (roles: SelectedRole[], additionalSkills: Skill[]) => void;
  onSeniorityChange: (seniority: SeniorityLevel) => void;
}

// Use actual SeniorityLevel enum values from types.ts
const SENIORITY_OPTIONS: { value: SeniorityLevel; label: string; description: string }[] = [
  { value: SeniorityLevel.Entry, label: 'Entry Level', description: '0-2 years experience' },
  { value: SeniorityLevel.Mid, label: 'Mid-Level', description: '2-5 years experience' },
  { value: SeniorityLevel.Senior, label: 'Senior', description: '5-8 years experience' },
  { value: SeniorityLevel.Lead, label: 'Lead', description: '8+ years, leading teams' },
  { value: SeniorityLevel.Principal, label: 'Principal', description: 'Staff/Principal level' },
  { value: SeniorityLevel.Executive, label: 'Executive', description: 'Director/VP level' },
];

const CandidateRoleSelector: React.FC<CandidateRoleSelectorProps> = ({
  primaryRole,
  secondaryRoles = [],
  currentSeniority,
  onPrimaryRoleChange,
  onSecondaryRolesChange,
  onSeniorityChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RoleResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'primary' | 'secondary'>('primary');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for roles
  const searchRoles = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search canonical_roles
      const { data, error } = await supabase
        .from('canonical_roles')
        .select(`
          id,
          name,
          slug,
          is_emerging,
          display_order,
          job_families!inner(name, display_order)
        `)
        .or(`name.ilike.%${query}%`)
        .order('display_order');

      if (error) throw error;

      // Also search aliases
      const { data: aliasData, error: aliasError } = await supabase
        .from('role_aliases')
        .select(`
          role_id,
          alias,
          canonical_roles!inner(
            id,
            name,
            slug,
            is_emerging,
            display_order,
            job_families!inner(name, display_order)
          )
        `)
        .ilike('alias', `%${query}%`);

      if (aliasError) console.error('Alias search error:', aliasError);

      // Combine and deduplicate
      const roleMap = new Map<string, RoleResult>();

      (data || []).forEach((role: any) => {
        roleMap.set(role.id, {
          id: role.id,
          name: role.name,
          slug: role.slug,
          family_name: role.job_families?.name || '',
          is_emerging: role.is_emerging,
        });
      });

      (aliasData || []).forEach((alias: any) => {
        const role = alias.canonical_roles;
        if (role && !roleMap.has(role.id)) {
          roleMap.set(role.id, {
            id: role.id,
            name: role.name,
            slug: role.slug,
            family_name: role.job_families?.name || '',
            is_emerging: role.is_emerging,
          });
        }
      });

      const results = Array.from(roleMap.values());
      results.sort((a, b) => a.family_name.localeCompare(b.family_name));

      setSearchResults(results);
      setIsDropdownOpen(true);
      setHighlightedIndex(-1);
    } catch (err) {
      console.error('Error searching roles:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchRoles(value);
    }, 300);
  };

  // Fetch skills for a role
  const fetchSkillsForRole = async (roleSlug: string, roleId: string): Promise<Skill[]> => {
    // Try RPC first
    try {
      const { data, error } = await supabase
        .rpc('get_role_skill_template', { role_slug: roleSlug });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const skillLevel = getSkillLevelForSeniority(currentSeniority);
        return data.map((skill: any) => ({
          name: skill.skill_name,
          level: skillLevel,
          years: 0,
        }));
      }
    } catch (err) {
      console.error('RPC error:', err);
    }

    // Fallback to direct query
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('role_skill_templates')
        .select('skill_name, is_core, display_order')
        .eq('role_id', roleId)
        .order('display_order');

      if (!templateError && templateData && templateData.length > 0) {
        const skillLevel = getSkillLevelForSeniority(currentSeniority);
        return templateData.map((skill: any) => ({
          name: skill.skill_name,
          level: skillLevel,
          years: 0,
        }));
      }
    } catch (err) {
      console.error('Direct query error:', err);
    }

    return [];
  };

  // Handle role selection
  const handleSelectRole = async (role: RoleResult) => {
    setIsDropdownOpen(false);
    setSearchQuery('');

    if (searchTarget === 'primary') {
      const skills = await fetchSkillsForRole(role.slug, role.id);
      onPrimaryRoleChange({ id: role.id, name: role.name }, skills);
    } else {
      // Check if already selected as primary or secondary
      if (primaryRole?.id === role.id) {
        return; // Can't add primary as secondary
      }
      if (secondaryRoles.some(r => r.id === role.id)) {
        return; // Already added
      }
      if (secondaryRoles.length >= 2) {
        return; // Max 2 secondary roles
      }

      const skills = await fetchSkillsForRole(role.slug, role.id);
      const newSecondaryRoles = [...secondaryRoles, { id: role.id, name: role.name }];
      onSecondaryRolesChange(newSecondaryRoles, skills);
    }
  };

  // Remove primary role
  const handleRemovePrimaryRole = () => {
    onPrimaryRoleChange(undefined, []);
  };

  // Remove secondary role
  const handleRemoveSecondaryRole = (roleId: string) => {
    const updated = secondaryRoles.filter(r => r.id !== roleId);
    onSecondaryRolesChange(updated, []);
  };

  // Open search for adding roles
  const openSearch = (target: 'primary' | 'secondary') => {
    setSearchTarget(target);
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handleSelectRole(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        break;
    }
  };

  // Group results by family
  const groupedResults = searchResults.reduce((acc, role) => {
    if (!acc[role.family_name]) {
      acc[role.family_name] = [];
    }
    acc[role.family_name].push(role);
    return acc;
  }, {} as Record<string, RoleResult[]>);

  let flatIndex = 0;

  return (
    <div className="space-y-8">
      {/* Seniority Selector */}
      <div>
        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Current Seniority Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSeniorityChange(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                currentSeniority === opt.value
                  ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                  : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
              }`}
            >
              <p className="font-black text-sm">{opt.label}</p>
              <p className="text-[10px] text-muted">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Role */}
      <div>
        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center">
          <Star className="w-4 h-4 mr-1 text-yellow-500" /> Primary Role *
        </label>

        {primaryRole ? (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-accent-coral to-accent-green border-2 border-accent-coral-light rounded-2xl">
            <div className="flex-1">
              <p className="font-black text-lg text-primary">{primaryRole.name}</p>
              <p className="text-xs text-muted">Your main professional identity</p>
            </div>
            <button
              type="button"
              onClick={handleRemovePrimaryRole}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center bg-gray-50 dark:bg-gray-900 border-2 border-border rounded-2xl px-4 py-3 focus-within:border-accent-coral-light focus-within:bg-white dark:bg-surface transition-all">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchTarget === 'primary' ? searchQuery : ''}
                onChange={handleSearchChange}
                onFocus={() => {
                  setSearchTarget('primary');
                  if (searchQuery.length >= 2) searchRoles(searchQuery);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none font-bold text-gray-800 dark:text-gray-200"
                placeholder="Search for your role (e.g., Software Engineer, Product Manager)..."
              />
              {isSearching && <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-gray-500" />}
            </div>

            {/* Dropdown */}
            {isDropdownOpen && searchTarget === 'primary' && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full mt-2 bg-white dark:bg-surface border rounded-2xl shadow-xl max-h-80 overflow-y-auto"
              >
                {Object.entries(groupedResults).map(([familyName, roles]) => (
                  <div key={familyName}>
                    <div className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 sticky top-0">
                      {familyName}
                    </div>
                    {roles.map((role) => {
                      const idx = flatIndex++;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleSelectRole(role)}
                          className={`w-full px-4 py-3 text-left hover:bg-accent-coral-bg transition-colors flex items-center justify-between ${
                            highlightedIndex === idx ? 'bg-accent-coral-bg' : ''
                          }`}
                        >
                          <span className="font-bold text-gray-800 dark:text-gray-200">{role.name}</span>
                          {role.is_emerging && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              emerging
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Roles */}
      <div>
        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Secondary Roles <span className="text-gray-300 dark:text-gray-600">(optional, up to 2)</span>
        </label>

        <div className="space-y-3">
          {secondaryRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl"
            >
              <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-gray-200">{role.name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSecondaryRole(role.id)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {secondaryRoles.length < 2 && (
            <div className="relative">
              {searchTarget === 'secondary' && !isDropdownOpen ? (
                <div className="flex items-center bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-border rounded-xl px-4 py-3 focus-within:border-accent-coral-light focus-within:bg-white dark:bg-surface transition-all">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-3" />
                  <input
                    type="text"
                    value={searchTarget === 'secondary' ? searchQuery : ''}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      setSearchTarget('secondary');
                      if (searchQuery.length >= 2) searchRoles(searchQuery);
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none font-medium text-gray-800 dark:text-gray-200 text-sm"
                    placeholder="Add a secondary role..."
                  />
                  {isSearching && searchTarget === 'secondary' && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openSearch('secondary')}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-accent-coral hover:text-accent-coral border-2 border-dashed border-border rounded-xl hover:border-accent-coral-light transition-all w-full"
                >
                  <Plus className="w-4 h-4" />
                  Add secondary role
                </button>
              )}

              {/* Secondary dropdown */}
              {isDropdownOpen && searchTarget === 'secondary' && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-surface border rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                  {(() => { flatIndex = 0; return null; })()}
                  {Object.entries(groupedResults).map(([familyName, roles]) => (
                    <div key={familyName}>
                      <div className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 sticky top-0">
                        {familyName}
                      </div>
                      {roles.map((role) => {
                        const isDisabled = primaryRole?.id === role.id || secondaryRoles.some(r => r.id === role.id);
                        const idx = flatIndex++;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => !isDisabled && handleSelectRole(role)}
                            disabled={isDisabled}
                            className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                              isDisabled
                                ? 'opacity-40 cursor-not-allowed'
                                : highlightedIndex === idx
                                ? 'bg-accent-coral-bg'
                                : 'hover:bg-accent-coral-bg'
                            }`}
                          >
                            <span className="font-bold text-gray-800 dark:text-gray-200">{role.name}</span>
                            {isDisabled && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">already selected</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateRoleSelector;
