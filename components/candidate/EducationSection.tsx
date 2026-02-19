import React from 'react';
import { Education } from '../../types';
import { GraduationCap, ChevronRight, Plus, MapPin } from 'lucide-react';

interface EducationSectionProps {
  education: Education[];
  onEdit: (edu: Education) => void;
  onAdd: () => void;
  isEditable: boolean;
}

function EducationCard({
  education,
  onClick,
  isEditable
}: {
  education: Education;
  onClick?: () => void;
  isEditable: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 bg-surface border border-border rounded-2xl ${
        isEditable ? 'cursor-pointer hover:border-accent-coral-light hover:shadow-md transition-all' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-coral to-accent-green rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-accent-coral" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-primary text-lg">{education.degree}</h4>
            <p className="text-muted font-medium">{education.institution}</p>
            <p className="text-accent-coral font-medium text-sm">{education.fieldOfStudy}</p>
            {education.specialization && (
              <p className="text-muted text-sm">
                Specialization: {education.specialization}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted">
              {education.isOngoing ? (
                <span className="text-green-600 font-medium">Currently studying</span>
              ) : education.graduationYear ? (
                <span>Graduated {education.graduationYear}</span>
              ) : null}
              {education.grade && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{education.grade}</span>
                </>
              )}
              {education.location && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {education.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {isEditable && (
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

export function EducationSection({
  education,
  onEdit,
  onAdd,
  isEditable
}: EducationSectionProps) {
  // Sort by graduation year, ongoing first, then most recent
  const sortedEducation = [...education].sort((a, b) => {
    if (a.isOngoing && !b.isOngoing) return -1;
    if (!a.isOngoing && b.isOngoing) return 1;
    return (b.graduationYear || 9999) - (a.graduationYear || 9999);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-primary flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-accent-coral" />
          Education
        </h3>
        {isEditable && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-sm font-bold text-accent-coral hover:text-accent-coral transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}
      </div>

      {sortedEducation.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-border">
          <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-muted font-medium">No education added yet</p>
          {isEditable && (
            <button
              onClick={onAdd}
              className="mt-3 text-accent-coral text-sm font-bold hover:text-accent-coral"
            >
              Add your education
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEducation.map(edu => (
            <EducationCard
              key={edu.id}
              education={edu}
              onClick={() => isEditable && onEdit(edu)}
              isEditable={isEditable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EducationSection;
