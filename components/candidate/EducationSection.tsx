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
      className={`p-5 bg-white border border-gray-200 rounded-2xl ${
        isEditable ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-lg">{education.degree}</h4>
            <p className="text-gray-600 font-medium">{education.institution}</p>
            <p className="text-blue-600 font-medium text-sm">{education.fieldOfStudy}</p>
            {education.specialization && (
              <p className="text-gray-500 text-sm">
                Specialization: {education.specialization}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
              {education.isOngoing ? (
                <span className="text-green-600 font-medium">Currently studying</span>
              ) : education.graduationYear ? (
                <span>Graduated {education.graduationYear}</span>
              ) : null}
              {education.grade && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{education.grade}</span>
                </>
              )}
              {education.location && (
                <>
                  <span className="text-gray-300">•</span>
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
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Education
        </h3>
        {isEditable && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}
      </div>

      {sortedEducation.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No education added yet</p>
          {isEditable && (
            <button
              onClick={onAdd}
              className="mt-3 text-blue-600 text-sm font-bold hover:text-blue-700"
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
