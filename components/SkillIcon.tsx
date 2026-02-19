
import React from 'react';
import { getSkillIconUrl } from '../constants/skillIconMapping';

interface SkillIconProps {
  skillName: string;
  size?: number;
  className?: string;
  showFallback?: boolean;
}

/**
 * Display a technology icon for a skill using skill-icons.dev CDN
 * Falls back to text initials if no icon mapping exists
 */
const SkillIcon: React.FC<SkillIconProps> = ({ 
  skillName, 
  size = 32,
  className = '',
  showFallback = true
}) => {
  const iconUrl = getSkillIconUrl(skillName);
  
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={`${skillName} icon`}
        className={`inline-block object-contain flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          if (!showFallback) {
            e.currentTarget.style.display = 'none';
            return;
          }
          
          const target = e.currentTarget;
          target.style.display = 'none';
          
          const fallback = document.createElement('div');
          fallback.className = `inline-flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 dark:text-gray-300 dark:text-gray-600 font-bold rounded-lg flex-shrink-0 ${className}`;
          fallback.style.width = `${size}px`;
          fallback.style.height = `${size}px`;
          fallback.style.fontSize = `${size * 0.35}px`;
          fallback.textContent = getInitials(skillName);
          
          target.parentNode?.insertBefore(fallback, target);
        }}
      />
    );
  }
  
  if (!showFallback) return null;
  
  return (
    <div 
      className={`inline-flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 dark:text-gray-300 dark:text-gray-600 font-bold rounded-lg flex-shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size,
        fontSize: size * 0.35
      }}
      title={skillName}
    >
      {getInitials(skillName)}
    </div>
  );
};

function getInitials(skillName: string): string {
  const cleaned = skillName
    .replace(/\.js|\.net|\.core/gi, '')
    .replace(/[()]/g, '')
    .trim();
  
  const words = cleaned.split(/[\s-]+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default SkillIcon;
