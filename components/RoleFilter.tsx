import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { JobSkill } from '../types';
import { Search, X, Loader2, Users, ChevronDown } from 'lucide-react';

interface RoleResult {
  id: string;
  name: string;
  slug: string;
  family_id: string;
  family_name: string;
  is_emerging: boolean;
}

interface SelectedRole {
  id: string;
  name: string;
  slug: string;
  family_id: string;
  family_name: string;
}

// Export for use in TalentSearchForm
export type { SelectedRole };

interface RoleFilterProps {
  selectedRoles: SelectedRole[];
  includeRelatedRoles: boolean;
  onRolesChange: (roles: SelectedRole[], skills: JobSkill[]) => void;
  onIncludeRelatedChange: (include: boolean) => void;
  defaultSkillLevel?: 1 | 2 | 3 | 4 | 5;
}

const RoleFilter: React.FC<RoleFilterProps> = ({
  selectedRoles,
  includeRelatedRoles,
  onRolesChange,
  onIncludeRelatedChange,
  defaultSkillLevel = 3,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RoleResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleResult[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isFetchingSkills, setIsFetchingSkills] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch skills for selected roles
  const fetchSkillsForRoles = useCallback(async (roles: SelectedRole[]): Promise<JobSkill[]> => {
    if (roles.length === 0) return [];

    const allSkills: JobSkill[] = [];
    const seenSkillNames = new Set<string>();

    for (const role of roles) {
      // Try RPC first
      try {
        const { data, error } = await supabase
          .rpc('get_role_skill_template', { role_slug: role.slug });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          data.forEach((skill: any) => {
            const skillName = skill.skill_name.toLowerCase();
            if (!seenSkillNames.has(skillName)) {
              seenSkillNames.add(skillName);
              allSkills.push({
                name: skill.skill_name,
                required_level: defaultSkillLevel,
                weight: skill.is_core ? 'required' : 'preferred',
              });
            }
          });
          continue;
        }
      } catch (err) {
        console.error('RPC error:', err);
      }

      // Fallback to direct query
      try {
        const { data: templateData, error: templateError } = await supabase
          .from('role_skill_templates')
          .select('skill_name, is_core, display_order')
          .eq('role_id', role.id)
          .order('display_order');

        if (!templateError && templateData && templateData.length > 0) {
          templateData.forEach((skill: any) => {
            const skillName = skill.skill_name.toLowerCase();
            if (!seenSkillNames.has(skillName)) {
              seenSkillNames.add(skillName);
              allSkills.push({
                name: skill.skill_name,
                required_level: defaultSkillLevel,
                weight: skill.is_core ? 'required' : 'preferred',
              });
            }
          });
        }
      } catch (err) {
        console.error('Direct query error:', err);
      }
    }

    return allSkills;
  }, [defaultSkillLevel]);

  // Load all roles on mount for grouped display
  useEffect(() => {
    const loadRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const { data, error } = await supabase
          .from('canonical_roles')
          .select(`
            id,
            name,
            slug,
            family_id,
            is_emerging,
            display_order,
            job_families!inner(id, name, display_order)
          `)
          .order('display_order');

        if (!error && data) {
          const roles = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            family_id: r.family_id,
            family_name: r.job_families?.name || '',
            is_emerging: r.is_emerging,
          }));
          setAllRoles(roles);
        }
      } catch (err) {
        console.error('Error loading roles:', err);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

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

  // Filter roles based on search query
  const filterRoles = useCallback((query: string) => {
    if (query.length < 1) {
      setSearchResults(allRoles);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allRoles.filter(
      role =>
        role.name.toLowerCase().includes(lowerQuery) ||
        role.family_name.toLowerCase().includes(lowerQuery)
    );
    setSearchResults(filtered);
  }, [allRoles]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      filterRoles(value);
    }, 150);
  };

  // Handle role selection
  const handleSelectRole = async (role: RoleResult) => {
    let newRoles: SelectedRole[];

    if (selectedRoles.some(r => r.id === role.id)) {
      // Remove if already selected
      newRoles = selectedRoles.filter(r => r.id !== role.id);
    } else {
      // Add to selection (include slug for skill fetching)
      newRoles = [...selectedRoles, {
        id: role.id,
        name: role.name,
        slug: role.slug,
        family_id: role.family_id,
        family_name: role.family_name,
      }];
    }

    // Fetch skills for the updated role selection
    setIsFetchingSkills(true);
    try {
      const skills = await fetchSkillsForRoles(newRoles);
      onRolesChange(newRoles, skills);
    } catch (err) {
      console.error('Error fetching skills for roles:', err);
      onRolesChange(newRoles, []);
    } finally {
      setIsFetchingSkills(false);
    }
  };

  // Remove role
  const handleRemoveRole = async (roleId: string) => {
    const newRoles = selectedRoles.filter(r => r.id !== roleId);

    // Fetch skills for remaining roles
    setIsFetchingSkills(true);
    try {
      const skills = await fetchSkillsForRoles(newRoles);
      onRolesChange(newRoles, skills);
    } catch (err) {
      console.error('Error fetching skills for roles:', err);
      onRolesChange(newRoles, []);
    } finally {
      setIsFetchingSkills(false);
    }
  };

  // Open dropdown
  const handleOpenDropdown = () => {
    setSearchResults(allRoles);
    setIsDropdownOpen(true);
    setSearchQuery('');
  };

  // Group results by family
  const groupedResults = searchResults.reduce((acc, role) => {
    if (!acc[role.family_name]) {
      acc[role.family_name] = [];
    }
    acc[role.family_name].push(role);
    return acc;
  }, {} as Record<string, RoleResult[]>);

  // Get unique families from selected roles
  const selectedFamilies = [...new Set(selectedRoles.map(r => r.family_name))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">
          Filter by Role
        </label>
        {selectedRoles.length > 0 && (
          <button
            type="button"
            onClick={() => onRolesChange([], [])}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-muted"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected roles */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedRoles.map(role => (
            <span
              key={role.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-coral-bg text-accent-coral rounded-lg text-sm font-medium border border-accent-coral-light"
            >
              <Users className="w-3.5 h-3.5" />
              {role.name}
              <button
                type="button"
                onClick={() => handleRemoveRole(role.id)}
                className="text-accent-coral-light hover:text-accent-coral ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div
          className="flex items-center bg-surface border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 dark:border-gray-700 transition-colors"
          onClick={handleOpenDropdown}
        >
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleOpenDropdown}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 dark:text-gray-200"
            placeholder="Search roles (e.g., Frontend Developer, Product Manager)..."
          />
          {isLoadingRoles ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          )}
        </div>

        {/* Dropdown */}
        {isDropdownOpen && !isLoadingRoles && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-surface border rounded-xl shadow-xl max-h-80 overflow-y-auto"
          >
            {Object.entries(groupedResults).length > 0 ? (
              Object.entries(groupedResults).map(([familyName, roles]) => (
                <div key={familyName}>
                  <div className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 sticky top-0">
                    {familyName}
                  </div>
                  {roles.map((role) => {
                    const isSelected = selectedRoles.some(r => r.id === role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-accent-coral-bg transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-accent-coral-bg' : ''
                        }`}
                      >
                        <span className={`font-medium text-sm ${isSelected ? 'text-accent-coral' : 'text-gray-800 dark:text-gray-200'}`}>
                          {role.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {role.is_emerging && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              emerging
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-bold text-accent-coral bg-accent-coral-bg px-2 py-0.5 rounded-full">
                              selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted">
                No roles found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Include related roles toggle */}
      {selectedRoles.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">Include related roles</p>
            <p className="text-xs text-muted">
              Also match candidates in the same family
              {selectedFamilies.length > 0 && (
                <span className="text-accent-coral"> ({selectedFamilies.join(', ')})</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onIncludeRelatedChange(!includeRelatedRoles)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeRelatedRoles ? 'bg-accent-coral' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${
                includeRelatedRoles ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleFilter;
