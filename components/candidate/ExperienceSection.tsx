import React from 'react';
import { Experience } from '../../types';
import { Briefcase, Building2, ChevronRight, CheckCircle, Plus, MapPin } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: Experience[];
  onEdit: (experience: Experience) => void;
  onAdd: () => void;
  isEditable: boolean;
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : 'Present'}`;
}

function calculateDuration(startDate: string, endDate: string | null): string {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} yr${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} yr${years !== 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
  }
}

function ExperienceCard({
  experience,
  onClick,
  isEditable
}: {
  experience: Experience;
  onClick?: () => void;
  isEditable: boolean;
}) {
  const duration = calculateDuration(experience.startDate, experience.endDate);

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white border border-gray-200 rounded-2xl ${
        isEditable ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-lg">{experience.role}</h4>
            <p className="text-gray-600 font-medium">{experience.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
              <span>{formatDateRange(experience.startDate, experience.endDate)}</span>
              <span className="text-gray-300">•</span>
              <span>{duration}</span>
              {experience.location && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {experience.location}
                  </span>
                </>
              )}
              {experience.type && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{experience.type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {experience.isCurrentRole && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              Current
            </span>
          )}
          {experience.isVerified && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          {isEditable && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {experience.description && (
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
          {experience.description}
        </p>
      )}

      {experience.skillsAcquired && experience.skillsAcquired.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {experience.skillsAcquired.slice(0, 5).map(skill => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
          {experience.skillsAcquired.length > 5 && (
            <span className="text-xs text-gray-400 py-0.5">
              +{experience.skillsAcquired.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceSection({
  experiences,
  onEdit,
  onAdd,
  isEditable
}: ExperienceSectionProps) {
  // Sort by date, current roles first
  const sortedExperiences = [...experiences].sort((a, b) => {
    if (a.isCurrentRole && !b.isCurrentRole) return -1;
    if (!a.isCurrentRole && b.isCurrentRole) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Work Experience
        </h3>
        {isEditable && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        )}
      </div>

      {sortedExperiences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No work experience added yet</p>
          {isEditable && (
            <button
              onClick={onAdd}
              className="mt-3 text-blue-600 text-sm font-bold hover:text-blue-700"
            >
              Add your first position
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExperiences.map(exp => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onClick={() => isEditable && onEdit(exp)}
              isEditable={isEditable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExperienceSection;
