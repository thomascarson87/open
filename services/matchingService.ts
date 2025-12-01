

import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill } from '../types';

export const calculateMatch = (job: JobPosting, candidate: CandidateProfile): MatchBreakdown => {
  let score = 0;
  let totalWeights = 0;
  const dealBreakers: string[] = [];
  const recommendations: string[] = [];

  // --- 1. SKILLS MATCH (Weight: 30%) ---
  let skillsScore = 0;
  let requiredSkillsCount = 0;
  let skillsMatchedWeight = 0;

  if (job.requiredSkills.length > 0) {
    job.requiredSkills.forEach(jobSkill => {
      const candidateSkill = candidate.skills.find(
        s => s.name.toLowerCase() === jobSkill.name.toLowerCase()
      );
      
      const isRequired = jobSkill.weight === 'required';
      if (isRequired) requiredSkillsCount++;

      if (candidateSkill) {
        // Found skill
        let skillPoints = 100;
        
        // Penalize if years of experience are less than required
        if (candidateSkill.years < jobSkill.minimumYears) {
          skillPoints -= (jobSkill.minimumYears - candidateSkill.years) * 20;
          if (isRequired) {
             recommendations.push(`Missing experience years for ${jobSkill.name}`);
          }
        }
        
        skillPoints = Math.max(0, skillPoints);
        
        if (isRequired) {
            skillsMatchedWeight += skillPoints * 2; // Required skills worth double
        } else {
            skillsMatchedWeight += skillPoints;
        }
      } else {
        // Missing skill
        if (isRequired) {
            dealBreakers.push(`Missing required skill: ${jobSkill.name}`);
        } else {
            recommendations.push(`Consider learning ${jobSkill.name}`);
        }
      }
    });
    
    // Calculate max possible points
    // Required skills * 200 (100 * 2 weight) + Preferred skills * 100
    const totalPossibleWeight = job.requiredSkills.reduce((acc, s) => acc + (s.weight === 'required' ? 200 : 100), 0);
    skillsScore = totalPossibleWeight > 0 ? (skillsMatchedWeight / totalPossibleWeight) * 100 : 100;
  } else {
      skillsScore = 100; // No skills required
  }

  // --- 2. SALARY MATCH (Weight: 15%) ---
  let salaryScore = 100;
  if (job.salaryMax && candidate.salaryMin) {
      if (candidate.salaryMin > job.salaryMax) {
          const diff = candidate.salaryMin - job.salaryMax;
          const percentDiff = (diff / job.salaryMax);
          salaryScore = Math.max(0, 100 - (percentDiff * 200)); // Drop fast if over budget
          
          if (candidate.nonNegotiables.includes('salary')) {
              dealBreakers.push('Salary expectation exceeds budget (Non-negotiable)');
              salaryScore = 0;
          } else {
              recommendations.push('Salary expectation is higher than budget range');
          }
      } else if (job.salaryMin && candidate.salaryMin < job.salaryMin) {
          // Candidate is cheaper than range - technically a match, but maybe overqualified?
          // Keeping it 100 for now.
      }
  }

  // --- 3. CONTRACT TYPE MATCH (Weight: 8%) ---
  let contractScore = 0;
  const sharedContracts = job.contractTypes.filter(t => candidate.contractTypes.includes(t));
  if (sharedContracts.length > 0) {
      contractScore = 100;
  } else {
      dealBreakers.push(`Job requires ${job.contractTypes.join('/')} contract`);
  }

  // --- 4. WORK MODE & LOCATION (Weight: 12%) ---
  let locationScore = 0;
  let workModeScore = 0;

  // Work Mode
  if (candidate.preferredWorkMode.includes(job.workMode)) {
      workModeScore = 100;
  } else {
      if (candidate.nonNegotiables.includes('work_mode')) {
          dealBreakers.push(`Work mode mismatch: Job is ${job.workMode}`);
      } else {
          workModeScore = 50; // Partial credit if negotiable
      }
  }

  // Location
  if (job.workMode === WorkMode.REMOTE) {
      locationScore = 100;
  } else {
      // Simple string check for demo. Real app needs geo-distance.
      if (candidate.location.toLowerCase().includes(job.location.toLowerCase()) || job.location.toLowerCase().includes(candidate.location.toLowerCase())) {
          locationScore = 100;
      } else {
          if (candidate.nonNegotiables.includes('location')) {
             dealBreakers.push(`Location mismatch: Job is in ${job.location}`);
          }
          // Assuming relocation possible if not non-negotiable
          locationScore = 20; 
      }
  }
  
  const locWorkScore = (locationScore + workModeScore) / 2;

  // --- 5. SENIORITY (Weight: 8%) ---
  let seniorityScore = 0;
  // Simple hierarchy map
  const levels = ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Manager', 'Director', 'Executive'];
  const jobLevelIdx = levels.indexOf(job.seniority);
  
  if (candidate.desiredSeniority.includes(job.seniority)) {
      seniorityScore = 100;
  } else {
      // Check if candidate desired levels are close
      const hasCloseLevel = candidate.desiredSeniority.some(ds => {
          const idx = levels.indexOf(ds);
          return Math.abs(idx - jobLevelIdx) <= 1;
      });
      
      if (hasCloseLevel) seniorityScore = 70;
      else seniorityScore = 0;
  }

  // --- 6. CULTURE & VALUES (Weight: 12%) ---
  let cultureScore = 0;
  if (job.values.length > 0 && candidate.values.length > 0) {
      const sharedValues = job.values.filter(v => candidate.values.includes(v));
      cultureScore = (sharedValues.length / Math.max(job.values.length, candidate.values.length)) * 100;
      
      if (sharedValues.length === 0) {
        recommendations.push('No shared cultural values - consider if there\'s alignment');
      }
  } else {
      cultureScore = 100;
  }

  // --- 7. PERKS (Weight: 7%) ---
  let perkScore = 100;
  if (candidate.desiredPerks.length > 0) {
    const sharedPerks = job.perks.filter(p => candidate.desiredPerks.includes(p));
    perkScore = (sharedPerks.length / candidate.desiredPerks.length) * 100;
    
    const missingImportantPerks = candidate.desiredPerks.filter(p => !job.perks.includes(p));
    if (missingImportantPerks.length > 0 && candidate.nonNegotiables.includes('perks')) {
      dealBreakers.push(`Missing important perks: ${missingImportantPerks.slice(0, 2).join(', ')}`);
      perkScore = Math.min(perkScore, 30);
    }
  }

  // --- 8. INDUSTRY MATCH (Weight: 5%) ---
  let industryScore = 0;
  if (candidate.interestedIndustries && candidate.interestedIndustries.length > 0) {
    // Check if job's company industry matches candidate interests
    if (job.companyIndustry && job.companyIndustry.some(ind => candidate.interestedIndustries.includes(ind))) {
        industryScore = 100;
    } else {
        industryScore = 20; // Some transferability assumed
    }
  } else {
    industryScore = 100; // No preference = matches everything
  }

  // --- 9. TRAITS MATCH (Weight: 3%) ---
  let traitsScore = 100;
  if (job.requiredTraits && job.requiredTraits.length > 0) {
    const hasRequiredTraits = job.requiredTraits.filter(t => candidate.characterTraits.includes(t));
    const requiredRatio = hasRequiredTraits.length / job.requiredTraits.length;
    
    if (requiredRatio < 1.0) {
      const missingTraits = job.requiredTraits.filter(t => !candidate.characterTraits.includes(t));
      dealBreakers.push(`Missing required traits: ${missingTraits.slice(0, 2).join(', ')}`);
      traitsScore = 0;
    } else {
      // Check desired traits (bonus points)
      if (job.desiredTraits && job.desiredTraits.length > 0) {
        const hasDesiredTraits = job.desiredTraits.filter(t => candidate.characterTraits.includes(t));
        const desiredRatio = hasDesiredTraits.length / job.desiredTraits.length;
        traitsScore = 70 + (desiredRatio * 30); // 70 base for having required, up to 100 with desired
      }
    }
  }


  // --- CALC OVERALL ---
  const weightedSum = 
      (skillsScore * 0.30) + 
      (salaryScore * 0.15) + 
      (contractScore * 0.08) + 
      (locWorkScore * 0.12) + 
      (seniorityScore * 0.08) + 
      (cultureScore * 0.12) + 
      (perkScore * 0.07) +
      (industryScore * 0.05) +
      (traitsScore * 0.03);

  let overallScore = Math.round(weightedSum);

  // Hard clamp if deal breakers exist
  if (dealBreakers.length > 0) {
      overallScore = Math.min(overallScore, 45); // Cap at 45% if dealbreakers
  }

  return {
      overallScore,
      details: {
          skills: { score: Math.round(skillsScore), reason: `${Math.round(skillsScore)}% skill match` },
          salary: { score: Math.round(salaryScore), reason: salaryScore === 100 ? 'Within budget' : 'Outside range' },
          contract: { score: Math.round(contractScore), reason: contractScore === 100 ? 'Type match' : 'Type mismatch' },
          location: { score: Math.round(locationScore), reason: locationScore === 100 ? 'Location match' : 'Relocation needed' },
          workMode: { score: Math.round(workModeScore), reason: workModeScore === 100 ? 'Mode match' : 'Mode mismatch' },
          seniority: { score: Math.round(seniorityScore), reason: seniorityScore === 100 ? 'Level align' : 'Level misalign' },
          culture: { score: Math.round(cultureScore), reason: 'Value alignment' },
          perks: { score: Math.round(perkScore), reason: 'Perks alignment' },
          industry: { score: Math.round(industryScore), reason: 'Industry fit' },
          traits: { score: Math.round(traitsScore), reason: 'Personality fit' }
      },
      dealBreakers,
      recommendations
  };
};
