import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { HiringManagerPreferencesForm } from '../types';
import {
  dbToFormHMPreferences,
  formToDbHMPreferences,
  getDefaultHMPreferencesForm,
  validateHMPreferencesForm,
  countPreferencesSet
} from '../utils/hiringManagerUtils';
import {
  LEADERSHIP_STYLE_OPTIONS,
  FEEDBACK_FREQUENCY_OPTIONS,
  COMMUNICATION_PREFERENCE_OPTIONS,
  MEETING_CULTURE_OPTIONS,
  HM_TEAM_SIZE_OPTIONS,
  HM_REPORTING_STRUCTURE_OPTIONS,
  GROWTH_EXPECTATION_OPTIONS,
  MENTORSHIP_APPROACH_OPTIONS,
  HM_WORK_STYLE_DEALBREAKERS,
  HM_TRAIT_DEALBREAKERS,
  IMPACT_SCOPE_OPTIONS
} from '../constants/hiringManagerData';
import {
  WORK_INTENSITY_OPTIONS,
  AUTONOMY_LEVEL_OPTIONS,
  AMBIGUITY_TOLERANCE_OPTIONS,
  CHANGE_FREQUENCY_OPTIONS,
  COLLABORATION_FREQ_OPTIONS,
  PAIR_PROGRAMMING_OPTIONS,
  CROSS_FUNCTIONAL_OPTIONS
} from '../constants/workStyleData';
import { CHARACTER_TRAITS_CATEGORIES } from '../constants/matchingData';
import GroupedMultiSelect from '../components/GroupedMultiSelect';
import {
  Save,
  Users,
  Target,
  MessageSquare,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Shield,
  Zap,
  Handshake,
  Compass,
  Heart
} from 'lucide-react';

// Leadership Style Card Icons
const LEADERSHIP_ICONS: Record<string, React.ReactNode> = {
  hands_off: <Compass className="w-5 h-5" />,
  coaching: <Target className="w-5 h-5" />,
  collaborative: <Handshake className="w-5 h-5" />,
  directive: <Shield className="w-5 h-5" />,
  servant_leader: <Heart className="w-5 h-5" />
};

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({
  title,
  description,
  icon,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
};

interface OptionCardProps {
  option: { value: string; label: string; description: string };
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, selected, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300 bg-white'
    }`}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
    <div className="flex items-start gap-3">
      {icon && (
        <div className={`p-2 rounded-lg ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          {icon}
        </div>
      )}
      <div>
        <div className={`font-bold ${selected ? 'text-blue-900' : 'text-gray-900'}`}>
          {option.label}
        </div>
        <div className={`text-sm mt-0.5 ${selected ? 'text-blue-700' : 'text-gray-500'}`}>
          {option.description}
        </div>
      </div>
    </div>
  </button>
);

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  options: readonly { value: string; label: string; description: string }[];
  onChange: (value: string) => void;
  helpText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange, helpText }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    {helpText && <p className="text-xs text-gray-500 mb-2">{helpText}</p>}
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function HiringManagerPreferences() {
  const { user, teamRole, companyId, isDevMode } = useAuth();
  const [form, setForm] = useState<HiringManagerPreferencesForm>(getDefaultHMPreferencesForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Access control check
  const hasAccess = teamRole === 'hiring_manager' || teamRole === 'admin';

  // Load existing preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('hiring_manager_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('is_default', true)
        .maybeSingle();

      if (fetchError) {
        // In dev mode, just use defaults
        if (isDevMode) {
          console.log('Dev mode: using default preferences');
          setForm(getDefaultHMPreferencesForm());
        } else {
          throw fetchError;
        }
      } else if (data) {
        setForm(dbToFormHMPreferences(data));
        setExistingId(data.id);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [user?.id, companyId, isDevMode]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Save preferences
  const handleSave = async () => {
    if (!user?.id || !companyId) {
      setError('Not authenticated');
      return;
    }

    // Validate
    const validationErrors = validateHMPreferencesForm({
      ...form,
      name: form.name || 'Default Preferences'
    });
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dbData = formToDbHMPreferences(
        { ...form, name: form.name || 'Default Preferences', isDefault: true },
        user.id,
        companyId
      );

      if (existingId) {
        // Update existing
        const { error: updateError } = await supabase
          .from('hiring_manager_preferences')
          .update(dbData)
          .eq('id', existingId);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { data: insertData, error: insertError } = await supabase
          .from('hiring_manager_preferences')
          .insert(dbData)
          .select()
          .single();

        if (insertError) throw insertError;
        if (insertData) setExistingId(insertData.id);
      }

      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Update form helper
  const updateForm = <K extends keyof HiringManagerPreferencesForm>(
    key: K,
    value: HiringManagerPreferencesForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  // Calculate progress
  const progress = countPreferencesSet(form);

  // Access denied view
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            This page is only available to Hiring Managers and Admins.
            Please contact your administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Team Preferences</h1>
              <p className="text-gray-500 mt-1">
                Define your default preferences for matching candidates to your team
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-500">Preferences Set:</div>
              <div className="text-sm font-bold text-gray-900">{progress.total} / 18</div>
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(progress.total / 18) * 100}%` }}
              />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Section 1: Team Structure */}
        <CollapsibleSection
          title="Team Structure"
          description="Define your team size and reporting structure"
          icon={<Users className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Team Size"
              value={form.teamSize}
              options={HM_TEAM_SIZE_OPTIONS}
              onChange={(v) => updateForm('teamSize', v as any)}
              helpText="The typical size of your direct team"
            />
            <SelectField
              label="Reporting Structure"
              value={form.reportingStructure}
              options={HM_REPORTING_STRUCTURE_OPTIONS}
              onChange={(v) => updateForm('reportingStructure', v as any)}
              helpText="How many levels in your org hierarchy"
            />
          </div>
        </CollapsibleSection>

        {/* Section 2: My Leadership Style */}
        <CollapsibleSection
          title="My Leadership Style"
          description="How you prefer to manage and communicate with your team"
          icon={<Target className="w-5 h-5" />}
        >
          {/* Leadership Approach Cards */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Leadership Approach
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LEADERSHIP_STYLE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  selected={form.leadershipStyle === option.value}
                  onClick={() => updateForm('leadershipStyle', option.value as any)}
                  icon={LEADERSHIP_ICONS[option.value]}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Feedback Frequency"
              value={form.feedbackFrequency}
              options={FEEDBACK_FREQUENCY_OPTIONS}
              onChange={(v) => updateForm('feedbackFrequency', v as any)}
              helpText="How often you provide feedback"
            />
            <SelectField
              label="Communication Style"
              value={form.communicationPreference}
              options={COMMUNICATION_PREFERENCE_OPTIONS}
              onChange={(v) => updateForm('communicationPreference', v as any)}
              helpText="Your preferred communication mode"
            />
            <SelectField
              label="Meeting Culture"
              value={form.meetingCulture}
              options={MEETING_CULTURE_OPTIONS}
              onChange={(v) => updateForm('meetingCulture', v as any)}
              helpText="How your team approaches meetings"
            />
          </div>
        </CollapsibleSection>

        {/* Section 3: Work Environment */}
        <CollapsibleSection
          title="Work Environment"
          description="The pace and style of work you expect"
          icon={<Zap className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Work Intensity"
              value={form.workIntensity}
              options={WORK_INTENSITY_OPTIONS}
              onChange={(v) => updateForm('workIntensity', v as any)}
              helpText="The typical pace of work"
            />
            <SelectField
              label="Autonomy Expected"
              value={form.autonomyLevel}
              options={AUTONOMY_LEVEL_OPTIONS}
              onChange={(v) => updateForm('autonomyLevel', v as any)}
              helpText="Level of independence expected"
            />
            <SelectField
              label="Ambiguity Tolerance"
              value={form.ambiguityTolerance}
              options={AMBIGUITY_TOLERANCE_OPTIONS}
              onChange={(v) => updateForm('ambiguityTolerance', v as any)}
              helpText="How much ambiguity the role involves"
            />
            <SelectField
              label="Change Frequency"
              value={form.changeFrequency}
              options={CHANGE_FREQUENCY_OPTIONS}
              onChange={(v) => updateForm('changeFrequency', v as any)}
              helpText="How often priorities shift"
            />
          </div>
        </CollapsibleSection>

        {/* Section 4: Team Collaboration */}
        <CollapsibleSection
          title="Team Collaboration"
          description="How your team works together"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Collaboration Frequency"
              value={form.collaborationFrequency}
              options={COLLABORATION_FREQ_OPTIONS}
              onChange={(v) => updateForm('collaborationFrequency', v as any)}
              helpText="How often team members collaborate"
            />
            <SelectField
              label="Pair Programming"
              value={form.pairProgramming}
              options={PAIR_PROGRAMMING_OPTIONS}
              onChange={(v) => updateForm('pairProgramming', v as any)}
              helpText="Frequency of pair/mob programming"
            />
            <SelectField
              label="Cross-Functional Work"
              value={form.crossFunctional}
              options={CROSS_FUNCTIONAL_OPTIONS}
              onChange={(v) => updateForm('crossFunctional', v as any)}
              helpText="Working with other departments"
            />
          </div>
        </CollapsibleSection>

        {/* Section 5: Candidate Requirements */}
        <CollapsibleSection
          title="Candidate Requirements"
          description="Traits and characteristics you value in candidates"
          icon={<Briefcase className="w-5 h-5" />}
        >
          <div className="space-y-6">
            <GroupedMultiSelect
              label="Required Traits"
              options={CHARACTER_TRAITS_CATEGORIES}
              selected={form.requiredTraits}
              onChange={(traits) => updateForm('requiredTraits', traits)}
              grouped
              maxSelections={5}
              helpText="Must-have characteristics (max 5)"
              placeholder="Select required traits..."
            />

            <GroupedMultiSelect
              label="Preferred Traits"
              options={CHARACTER_TRAITS_CATEGORIES}
              selected={form.preferredTraits}
              onChange={(traits) => updateForm('preferredTraits', traits)}
              grouped
              maxSelections={10}
              helpText="Nice-to-have characteristics (max 10)"
              placeholder="Select preferred traits..."
            />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Minimum Impact Scope
              </label>
              <p className="text-xs text-gray-500 mb-3">
                The minimum level of impact you expect from candidates
              </p>
              <div className="flex gap-2">
                {IMPACT_SCOPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateForm('impactScopeMin', option.value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
                      form.impactScopeMin === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-bold ${
                      form.impactScopeMin === option.value ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      form.impactScopeMin === option.value ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 6: Dealbreakers */}
        <CollapsibleSection
          title="Dealbreakers"
          description="Characteristics that would disqualify a candidate"
          icon={<AlertTriangle className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Work Style Dealbreakers
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Work style mismatches that would be problematic
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HM_WORK_STYLE_DEALBREAKERS.map((option) => {
                  const isSelected = form.workStyleDealbreakers.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateForm(
                            'workStyleDealbreakers',
                            form.workStyleDealbreakers.filter((v) => v !== option.value)
                          );
                        } else {
                          updateForm('workStyleDealbreakers', [
                            ...form.workStyleDealbreakers,
                            option.value
                          ]);
                        }
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-bold ${
                        isSelected ? 'text-red-800' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Trait Dealbreakers
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Character traits that would be disqualifying
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HM_TRAIT_DEALBREAKERS.map((option) => {
                  const isSelected = form.traitDealbreakers.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateForm(
                            'traitDealbreakers',
                            form.traitDealbreakers.filter((v) => v !== option.value)
                          );
                        } else {
                          updateForm('traitDealbreakers', [
                            ...form.traitDealbreakers,
                            option.value
                          ]);
                        }
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-bold ${
                        isSelected ? 'text-red-800' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isSelected ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Growth Section */}
        <CollapsibleSection
          title="Growth & Development"
          description="Your approach to team member growth"
          icon={<Target className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Growth Expectation"
              value={form.growthExpectation}
              options={GROWTH_EXPECTATION_OPTIONS}
              onChange={(v) => updateForm('growthExpectation', v as any)}
              helpText="Expected career trajectory"
            />
            <SelectField
              label="Mentorship Approach"
              value={form.mentorshipApproach}
              options={MENTORSHIP_APPROACH_OPTIONS}
              onChange={(v) => updateForm('mentorshipApproach', v as any)}
              helpText="How you approach mentoring"
            />
          </div>
        </CollapsibleSection>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
