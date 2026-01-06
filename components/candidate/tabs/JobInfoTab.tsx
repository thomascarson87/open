
import React from 'react';
import { 
  MapPin, DollarSign, Briefcase, Zap, Check, Code, 
  Heart, Gift, Building2, Users, TrendingUp 
} from 'lucide-react';
import { ApplicationHubItem } from '../../../types';

interface JobInfoTabProps {
  application: ApplicationHubItem;
}

const JobInfoTab: React.FC<JobInfoTabProps> = ({ application }) => {
  const { job } = application;

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap gap-2">
        {job.location && (
          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {job.location}
          </span>
        )}
        {job.salary_range && (
          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
            <DollarSign className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {job.salary_range}
          </span>
        )}
        {job.work_mode && (
          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {job.work_mode}
          </span>
        )}
        {job.seniority && (
          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {job.seniority}
          </span>
        )}
      </div>

      {application.match_score > 0 && (
        <div className={`
          p-4 rounded-xl border-2
          ${application.match_score >= 80 
            ? 'bg-green-50 border-green-200' 
            : application.match_score >= 60 
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Match Score</span>
            <span className={`text-2xl font-black ${
              application.match_score >= 80 ? 'text-green-600' :
              application.match_score >= 60 ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {application.match_score}%
            </span>
          </div>
        </div>
      )}

      {job.description && (
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-gray-500" />
            About the Role
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      )}

      {job.impact_statement && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Your Impact
          </h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            {job.impact_statement}
          </p>
        </div>
      )}

      {job.responsibilities && job.responsibilities.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            What You'll Do
          </h3>
          <ul className="space-y-2">
            {job.responsibilities.map((item, i) => (
              <li key={i} className="flex items-start text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {job.tech_stack && job.tech_stack.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Code className="w-4 h-4 mr-2 text-indigo-500" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.tech_stack.map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.values_list && job.values_list.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Company Values
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.values_list.map((value, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.perks && job.perks.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-purple-500" />
            Benefits & Perks
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.perks.map((perk, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
};

export default JobInfoTab;
