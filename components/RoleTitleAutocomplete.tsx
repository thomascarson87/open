import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { JobSkill } from '../types';
import { Loader2, X } from 'lucide-react';

interface RoleResult {
  id: string;
  name: string;
  slug: string;
  family_name: string;
  is_emerging: boolean;
}

interface RoleTitleAutocompleteProps {
  value: string;
  canonicalRoleId?: string;
  onTitleChange: (title: string) => void;
  onRoleSelect: (roleId: string | undefined, roleName: string, skills: JobSkill[]) => void;
}

const RoleTitleAutocomplete: React.FC<RoleTitleAutocompleteProps> = ({
  value,
  canonicalRoleId,
  onTitleChange,
  onRoleSelect,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RoleResult[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for roles
  const searchRoles = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Search canonical_roles and role_aliases
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

      // Combine and deduplicate results
      const roleMap = new Map<string, RoleResult>();

      // Add direct matches
      (data || []).forEach((role: any) => {
        roleMap.set(role.id, {
          id: role.id,
          name: role.name,
          slug: role.slug,
          family_name: role.job_families?.name || '',
          is_emerging: role.is_emerging,
        });
      });

      // Add alias matches (using canonical role data)
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

      const combinedResults = Array.from(roleMap.values());

      // Sort by family display order, then role display order
      combinedResults.sort((a, b) => a.family_name.localeCompare(b.family_name));

      setResults(combinedResults);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } catch (err) {
      console.error('Error searching roles:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onTitleChange(newValue);

    // Clear template indicator if user is typing something different
    if (selectedTemplateName && newValue !== selectedTemplateName) {
      // Keep the template linked unless they clear it entirely
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchRoles(newValue);
    }, 300);
  };

  // Fetch skills for a role - try RPC first, fallback to direct table query
  const fetchSkillsForRole = async (roleSlug: string, roleId: string): Promise<JobSkill[]> => {
    console.log('[RoleTitleAutocomplete] Fetching skills for slug:', roleSlug, 'roleId:', roleId);

    // First try the RPC
    try {
      const { data, error } = await supabase
        .rpc('get_role_skill_template', { role_slug: roleSlug });

      console.log('[RoleTitleAutocomplete] RPC response:', { data, error });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const skills = data.map((skill: any) => ({
          name: skill.skill_name,
          required_level: 3 as const,
          weight: skill.is_core ? 'required' as const : 'preferred' as const,
        }));
        console.log('[RoleTitleAutocomplete] Mapped skills from RPC:', skills);
        return skills;
      }
    } catch (err) {
      console.error('[RoleTitleAutocomplete] RPC error, trying direct query:', err);
    }

    // Fallback: query role_skill_templates table directly
    try {
      console.log('[RoleTitleAutocomplete] Trying direct table query for role_id:', roleId);
      const { data: templateData, error: templateError } = await supabase
        .from('role_skill_templates')
        .select('skill_name, is_core, display_order')
        .eq('role_id', roleId)
        .order('display_order');

      console.log('[RoleTitleAutocomplete] Direct query response:', { templateData, templateError });

      if (!templateError && templateData && templateData.length > 0) {
        const skills = templateData.map((skill: any) => ({
          name: skill.skill_name,
          required_level: 3 as const,
          weight: skill.is_core ? 'required' as const : 'preferred' as const,
        }));
        console.log('[RoleTitleAutocomplete] Mapped skills from direct query:', skills);
        return skills;
      }
    } catch (err) {
      console.error('[RoleTitleAutocomplete] Direct query error:', err);
    }

    console.log('[RoleTitleAutocomplete] No skills found');
    return [];
  };

  // Handle role selection
  const handleSelectRole = async (role: RoleResult) => {
    console.log('[RoleTitleAutocomplete] Selected role:', role);
    setIsLoading(true);
    setInputValue(role.name);
    setSelectedTemplateName(role.name);
    setIsOpen(false);

    // Fetch skills for this role FIRST, then update parent
    const skills = await fetchSkillsForRole(role.slug, role.id);
    console.log('[RoleTitleAutocomplete] Calling onRoleSelect with skills count:', skills.length);

    // Call onRoleSelect with all the data including skills
    onRoleSelect(role.id, role.name, skills);
    setIsLoading(false);
  };

  // Handle custom title selection
  const handleSelectCustom = () => {
    setSelectedTemplateName(null);
    setIsOpen(false);
    onRoleSelect(undefined, inputValue, []);
  };

  // Clear selection
  const handleClearTemplate = () => {
    setSelectedTemplateName(null);
    onRoleSelect(undefined, inputValue, []);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && inputValue.length >= 2) {
        searchRoles(inputValue);
      }
      return;
    }

    const totalItems = results.length + 1; // +1 for custom option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === results.length) {
          handleSelectCustom();
        } else if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelectRole(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Group results by family
  const groupedResults = results.reduce((acc, role) => {
    if (!acc[role.family_name]) {
      acc[role.family_name] = [];
    }
    acc[role.family_name].push(role);
    return acc;
  }, {} as Record<string, RoleResult[]>);

  // Calculate flat index for keyboard navigation
  let flatIndex = 0;
  const getFlatIndex = () => flatIndex++;

  return (
    <div className="relative">
      <label className="block text-xs font-black text-gray-400 uppercase mb-2">
        Role Title *
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && searchRoles(inputValue)}
          className="w-full p-4 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none pr-10"
          placeholder="Start typing to search roles..."
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Template indicator */}
      {selectedTemplateName && canonicalRoleId && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            Template: <span className="font-bold text-blue-600">{selectedTemplateName}</span>
          </span>
          <button
            type="button"
            onClick={handleClearTemplate}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (results.length > 0 || inputValue.length >= 2) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border rounded-2xl shadow-xl max-h-80 overflow-y-auto"
        >
          {Object.entries(groupedResults).map(([familyName, roles]) => (
            <div key={familyName}>
              <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                {familyName}
              </div>
              {roles.map((role) => {
                const idx = getFlatIndex();
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      highlightedIndex === idx - 1 ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="font-bold text-gray-800">{role.name}</span>
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

          {/* Custom title option */}
          {inputValue.length >= 2 && (
            <button
              type="button"
              onClick={handleSelectCustom}
              className={`w-full px-4 py-3 text-left border-t hover:bg-gray-50 transition-colors ${
                highlightedIndex === results.length ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-gray-600">
                Use "<span className="font-bold">{inputValue}</span>" as custom title
              </span>
            </button>
          )}

          {results.length === 0 && inputValue.length >= 2 && !isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching roles found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleTitleAutocomplete;
