import React, { useState, useEffect } from 'react';
import { Experience } from '../../types';
import { SlidePanel } from '../ui/SlidePanel';
import { EditableList } from '../ui/EditableList';
import { TagInput } from '../ui/TagInput';
import { LocationAutocomplete } from '../ui/LocationAutocomplete';
import { CheckCircle } from 'lucide-react';

interface ExperienceEditPanelProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: Experience) => void;
  onDelete?: (id: string) => void;
}

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Temporary',
];

function getEmptyExperience(): Partial<Experience> {
  return {
    id: '',
    company: '',
    role: '',
    startDate: '',
    endDate: null,
    isCurrentRole: false,
    type: 'Full-time',
    location: '',
    description: '',
    responsibilities: [],
    achievements: [],
    skillsAcquired: [],
    teamSize: undefined,
    reportingTo: '',
  };
}

export function ExperienceEditPanel({
  experience,
  isOpen,
  onClose,
  onSave,
  onDelete
}: ExperienceEditPanelProps) {
  const [formData, setFormData] = useState<Partial<Experience>>(
    experience || getEmptyExperience()
  );

  useEffect(() => {
    setFormData(experience || getEmptyExperience());
  }, [experience]);

  const handleSave = () => {
    const savedExperience: Experience = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
    } as Experience;
    onSave(savedExperience);
    onClose();
  };

  const isValid = formData.role && formData.company && formData.startDate;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={experience ? 'Edit Position' : 'Add Position'}
      width="lg"
    >
      <div className="space-y-8 p-6">

        {/* Basic Info Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Basic Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Acme Inc."
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.type || ''}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Select type...</option>
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location
              </label>
              <LocationAutocomplete
                value={formData.location || ''}
                onChange={value => setFormData({ ...formData, location: value })}
                placeholder="City, Country"
                focusRegion="europe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="month"
                value={formData.startDate || ''}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="month"
                value={formData.endDate || ''}
                onChange={e => setFormData({ ...formData, endDate: e.target.value || null })}
                disabled={formData.isCurrentRole}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCurrentRole || false}
                  onChange={e => setFormData({
                    ...formData,
                    isCurrentRole: e.target.checked,
                    endDate: e.target.checked ? null : formData.endDate
                  })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">I currently work here</span>
              </label>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Role Description
          </h4>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Summary
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe your role and main focus..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </section>

        {/* Responsibilities Section */}
        <section className="space-y-4">
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Key Responsibilities
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Add your main responsibilities in this role. These help recruiters understand your scope.
            </p>
          </div>

          <EditableList
            items={formData.responsibilities || []}
            onChange={items => setFormData({ ...formData, responsibilities: items })}
            placeholder="e.g., Led a team of 5 engineers to deliver..."
            addButtonText="Add Responsibility"
          />
        </section>

        {/* Achievements Section */}
        <section className="space-y-4">
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Key Achievements
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Highlight measurable accomplishments. Use numbers where possible.
            </p>
          </div>

          <EditableList
            items={formData.achievements || []}
            onChange={items => setFormData({ ...formData, achievements: items })}
            placeholder="e.g., Reduced API latency by 40% through optimization..."
            addButtonText="Add Achievement"
          />
        </section>

        {/* Skills Acquired Section */}
        <section className="space-y-4">
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Skills Gained
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              What skills did you develop or strengthen in this role?
            </p>
          </div>

          <TagInput
            tags={formData.skillsAcquired || []}
            onChange={tags => setFormData({ ...formData, skillsAcquired: tags })}
            placeholder="Type a skill and press Enter..."
          />
        </section>

        {/* Additional Context Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Additional Context
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                value={formData.teamSize || ''}
                onChange={e => setFormData({
                  ...formData,
                  teamSize: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="e.g., 8"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reported To
              </label>
              <input
                type="text"
                value={formData.reportingTo || ''}
                onChange={e => setFormData({ ...formData, reportingTo: e.target.value })}
                placeholder="e.g., VP of Engineering"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Verification Status (read-only display) */}
        {experience?.isVerified && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">This position has been verified</span>
            </div>
            {experience.verifiedBy && experience.verifiedBy.length > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                Verified by {experience.verifiedBy.length} connection(s)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
        <div>
          {experience && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this position?')) {
                  onDelete(experience.id);
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-bold"
            >
              Delete Position
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Position
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}

export default ExperienceEditPanel;
