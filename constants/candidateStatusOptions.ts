export interface JobSearchStatusOption {
  value: string;
  label: string;
  badgeColor: string;
  description: string;
}

export const JOB_SEARCH_STATUS_OPTIONS: JobSearchStatusOption[] = [
  {
    value: 'actively_looking',
    label: 'Actively Looking',
    badgeColor: 'bg-green-500',
    description: 'Ready for new opportunities now'
  },
  {
    value: 'open_to_offers',
    label: 'Open to Offers',
    badgeColor: 'bg-accent-coral',
    description: 'Not searching but would consider the right role'
  },
  {
    value: 'casually_browsing',
    label: 'Casually Browsing',
    badgeColor: 'bg-yellow-500',
    description: 'Just exploring, not urgent'
  },
  {
    value: 'not_looking',
    label: 'Not Looking',
    badgeColor: 'bg-gray-400',
    description: 'Not interested in new roles right now'
  },
];

export function getStatusOption(value: string | undefined): JobSearchStatusOption | undefined {
  return JOB_SEARCH_STATUS_OPTIONS.find(o => o.value === value);
}

export function getStatusBadgeClasses(value: string | undefined): string {
  const option = getStatusOption(value);
  if (!option || value === 'not_looking') return '';
  return `${option.badgeColor} text-white`;
}
