import React, { useState, useEffect } from 'react';
import { Education } from '../../types';
import { SlidePanel } from '../ui/SlidePanel';
import { LocationAutocomplete } from '../ui/LocationAutocomplete';

interface EducationEditPanelProps {
  education: Education | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (education: Education) => void;
  onDelete?: (id: string) => void;
}

const DEGREE_OPTIONS = [
  'High School Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Professional Degree (MD, JD, etc.)',
  'Bootcamp / Certificate Program',
  'Self-Taught / Online Courses',
  'Other',
];

const FIELD_OF_STUDY_OPTIONS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Economics',
  'Finance',
  'Marketing',
  'Design',
  'Mathematics',
  'Physics',
  'Psychology',
  'Communications',
  'Law',
  'Medicine',
  'Other',
];

function getEmptyEducation(): Partial<Education> {
  return {
    id: '',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    specialization: '',
    graduationYear: null,
    isOngoing: false,
    grade: '',
    location: '',
  };
}

export function EducationEditPanel({
  education,
  isOpen,
  onClose,
  onSave,
  onDelete
}: EducationEditPanelProps) {
  const [formData, setFormData] = useState<Partial<Education>>(
    education || getEmptyEducation()
  );
  const [customField, setCustomField] = useState('');

  useEffect(() => {
    setFormData(education || getEmptyEducation());
    setCustomField('');
  }, [education]);

  const handleSave = () => {
    const savedEducation: Education = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      fieldOfStudy: formData.fieldOfStudy === 'Other' ? customField : formData.fieldOfStudy,
    } as Education;
    onSave(savedEducation);
    onClose();
  };

  const isValid = formData.institution &&
    formData.degree &&
    (formData.fieldOfStudy && (formData.fieldOfStudy !== 'Other' || customField)) &&
    (formData.isOngoing || formData.graduationYear);

  // Generate graduation year options
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: 60 },
    (_, i) => currentYear + 5 - i
  );

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={education ? 'Edit Education' : 'Add Education'}
      width="md"
    >
      <div className="space-y-6 p-6">

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Institution *
          </label>
          <input
            type="text"
            value={formData.institution || ''}
            onChange={e => setFormData({ ...formData, institution: e.target.value })}
            placeholder="e.g., University of Cambridge"
            className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Degree / Level *
          </label>
          <select
            value={formData.degree || ''}
            onChange={e => setFormData({ ...formData, degree: e.target.value })}
            className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
          >
            <option value="">Select degree level...</option>
            {DEGREE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Field of Study *
          </label>
          <select
            value={formData.fieldOfStudy || ''}
            onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
            className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
          >
            <option value="">Select field...</option>
            {FIELD_OF_STUDY_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {formData.fieldOfStudy === 'Other' && (
            <input
              type="text"
              value={customField}
              onChange={e => setCustomField(e.target.value)}
              placeholder="Specify your field of study"
              className="w-full p-3 border border-border rounded-xl mt-2 focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Specialization / Concentration
          </label>
          <input
            type="text"
            value={formData.specialization || ''}
            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="e.g., Artificial Intelligence, Corporate Finance"
            className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Location
          </label>
          <LocationAutocomplete
            value={formData.location || ''}
            onChange={value => setFormData({ ...formData, location: value })}
            placeholder="City, Country"
            focusRegion="global"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOngoing || false}
              onChange={e => setFormData({
                ...formData,
                isOngoing: e.target.checked,
                graduationYear: e.target.checked ? null : formData.graduationYear
              })}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-accent-coral"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">I'm currently studying here</span>
          </label>
        </div>

        {!formData.isOngoing && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
              Graduation Year *
            </label>
            <select
              value={formData.graduationYear || ''}
              onChange={e => setFormData({
                ...formData,
                graduationYear: e.target.value ? parseInt(e.target.value) : null
              })}
              className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
            >
              <option value="">Select year...</option>
              {graduationYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
            Grade / GPA
          </label>
          <input
            type="text"
            value={formData.grade || ''}
            onChange={e => setFormData({ ...formData, grade: e.target.value })}
            placeholder="e.g., First Class Honours, 3.8/4.0 GPA"
            className="w-full p-3 border border-border rounded-xl focus:border-accent-coral focus:ring-1 focus:ring-accent-coral outline-none"
          />
        </div>

      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-surface border-t p-4 flex items-center justify-between">
        <div>
          {education && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this education entry?')) {
                  onDelete(education.id);
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-bold"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted hover:text-gray-800 dark:text-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="px-6 py-2 bg-accent-coral text-white rounded-xl font-bold hover:bg-accent-coral disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}

export default EducationEditPanel;
