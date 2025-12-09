

import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill, TalentSearchCriteria } from '../types';

export const calculateMatch = (job: JobPosting, candidate: CandidateProfile): MatchBreakdown => {
  // Defensive guards - ensure data exists
  if (!candidate || !job) {
    return {
      overallScore: 0,
      details: {
          skills: { score: 0, reason: 'Data unavailable' },
          salary: { score: 0, reason: 'Data unavailable' },
          contract: { score: 0, reason: 'Data unavailable' },
          location: { score: 0, reason: 'Data unavailable' },
          workMode: { score: 0, reason: 'Data unavailable' },
          seniority: { score: 0, reason: 'Data unavailable' },
          culture: { score: 0, reason: 'Data unavailable' },
          perks: { score: 0, reason: 'Data unavailable' },
          industry: { score: 0, reason: 'Data unavailable' },
          traits: { score: 0, reason: 'Data unavailable' }
      },
      dealBreakers: ['Invalid candidate or job data'],
      recommendations: []
    };
  }

  // Ensure all candidate arrays are initialized
  const safeCandidate = {
    ...candidate,
    skills: candidate.skills || [],
    contractTypes: candidate.contractTypes || [],
    preferredWorkMode: candidate.preferredWorkMode || [],
    values: candidate.values || [],
    characterTraits: candidate.characterTraits || [],
    desiredPerks: candidate.desiredPerks || [],
    interestedIndustries: candidate.interestedIndustries || [],
    desiredSeniority: candidate.desiredSeniority || [],
    nonNegotiables: candidate.nonNegotiables || [],
    location: candidate.location || ''
  };

  let score = 0;
  let totalWeights = 0;
  const dealBreakers: string[] = [];
  const recommendations: string[] = [];

  // --- 1. SKILLS MATCH (Weight: 30%) ---
  let skillsScore = 0;
  let requiredSkillsCount = 0;
  let skillsMatchedWeight = 0;

  if (job.requiredSkills && job.requiredSkills.length > 0) {
    job.requiredSkills.forEach(jobSkill => {
      const candidateSkill = safeCandidate.skills.find(
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
  if (job.salaryMax && safeCandidate.salaryMin) {
      if (safeCandidate.salaryMin > job.salaryMax) {
          const diff = safeCandidate.salaryMin - job.salaryMax;
          const percentDiff = (diff / job.salaryMax);
          salaryScore = Math.max(0, 100 - (percentDiff * 200)); // Drop fast if over budget
          
          if (safeCandidate.nonNegotiables.includes('salary')) {
              dealBreakers.push('Salary expectation exceeds budget (Non-negotiable)');
              salaryScore = 0;
          } else {
              recommendations.push('Salary expectation is higher than budget range');
          }
      } else if (job.salaryMin && safeCandidate.salaryMin < job.salaryMin) {
          // Candidate is cheaper than range - technically a match, but maybe overqualified?
          // Keeping it 100 for now.
      }
  }

  // --- 3. CONTRACT TYPE MATCH (Weight: 8%) ---
  let contractScore = 0;
  const sharedContracts = job.contractTypes.filter(t => safeCandidate.contractTypes.includes(t));
  if (sharedContracts.length > 0) {
      contractScore = 100;
  } else {
      dealBreakers.push(`Job requires ${job.contractTypes.join('/')} contract`);
  }

  // --- 4. WORK MODE & LOCATION (Weight: 12%) ---
  let locationScore = 0;
  let workModeScore = 0;

  // Work Mode
  if (safeCandidate.preferredWorkMode.includes(job.workMode)) {
      workModeScore = 100;
  } else {
      if (safeCandidate.nonNegotiables.includes('work_mode')) {
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
      if (safeCandidate.location.toLowerCase().includes(job.location.toLowerCase()) || job.location.toLowerCase().includes(safeCandidate.location.toLowerCase())) {
          locationScore = 100;
      } else {
          if (safeCandidate.nonNegotiables.includes('location')) {
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
  
  if (safeCandidate.desiredSeniority.includes(job.seniority)) {
      seniorityScore = 100;
  } else {
      // Check if candidate desired levels are close
      const hasCloseLevel = safeCandidate.desiredSeniority.some(ds => {
          const idx = levels.indexOf(ds);
          return Math.abs(idx - jobLevelIdx) <= 1;
      });
      
      if (hasCloseLevel) seniorityScore = 70;
      else seniorityScore = 0;
  }

  // --- 6. CULTURE & VALUES (Weight: 12%) ---
  let cultureScore = 0;
  if (job.values.length > 0 && safeCandidate.values.length > 0) {
      const sharedValues = job.values.filter(v => safeCandidate.values.includes(v));
      cultureScore = (sharedValues.length / Math.max(job.values.length, safeCandidate.values.length)) * 100;
      
      if (sharedValues.length === 0) {
        recommendations.push('No shared cultural values - consider if there\'s alignment');
      }
  } else {
      cultureScore = 100;
  }

  // --- 7. PERKS (Weight: 7%) ---
  let perkScore = 100;
  if (safeCandidate.desiredPerks.length > 0) {
    const sharedPerks = job.perks.filter(p => safeCandidate.desiredPerks.includes(p));
    perkScore = (sharedPerks.length / safeCandidate.desiredPerks.length) * 100;
    
    const missingImportantPerks = safeCandidate.desiredPerks.filter(p => !job.perks.includes(p));
    if (missingImportantPerks.length > 0 && safeCandidate.nonNegotiables.includes('perks')) {
      dealBreakers.push(`Missing important perks: ${missingImportantPerks.slice(0, 2).join(', ')}`);
      perkScore = Math.min(perkScore, 30);
    }
  }

  // --- 8. INDUSTRY MATCH (Weight: 5%) ---
  let industryScore = 0;
  if (safeCandidate.interestedIndustries && safeCandidate.interestedIndustries.length > 0) {
    // Check if job's company industry matches candidate interests
    if (job.companyIndustry && job.companyIndustry.some(ind => safeCandidate.interestedIndustries.includes(ind))) {
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
    const hasRequiredTraits = job.requiredTraits.filter(t => safeCandidate.characterTraits.includes(t));
    const requiredRatio = hasRequiredTraits.length / job.requiredTraits.length;
    
    if (requiredRatio < 1.0) {
      const missingTraits = job.requiredTraits.filter(t => !safeCandidate.characterTraits.includes(t));
      dealBreakers.push(`Missing required traits: ${missingTraits.slice(0, 2).join(', ')}`);
      traitsScore = 0;
    } else {
      // Check desired traits (bonus points)
      if (job.desiredTraits && job.desiredTraits.length > 0) {
        const hasDesiredTraits = job.desiredTraits.filter(t => safeCandidate.characterTraits.includes(t));
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

export const calculateCandidateMatch = (
  criteria: TalentSearchCriteria,
  candidate: CandidateProfile
): MatchBreakdown => {
  // Defensive guards
  if (!candidate || !criteria) {
     return {
        overallScore: 0,
        details: {
            skills: { score: 0, reason: 'N/A' },
            salary: { score: 0, reason: 'N/A' },
            contract: { score: 0, reason: 'N/A' },
            location: { score: 0, reason: 'N/A' },
            workMode: { score: 0, reason: 'N/A' },
            seniority: { score: 0, reason: 'N/A' },
            culture: { score: 0, reason: 'N/A' },
            perks: { score: 0, reason: 'N/A' },
            industry: { score: 0, reason: 'N/A' },
            traits: { score: 0, reason: 'N/A' }
        },
        dealBreakers: ['Invalid data'],
        recommendations: []
     };
  }

  // Ensure all candidate arrays are initialized
  const safeCandidate = {
    ...candidate,
    skills: candidate.skills || [],
    contractTypes: candidate.contractTypes || [],
    preferredWorkMode: candidate.preferredWorkMode || [],
    values: candidate.values || [],
    characterTraits: candidate.characterTraits || [],
    desiredPerks: candidate.desiredPerks || [],
    interestedIndustries: candidate.interestedIndustries || [],
    desiredSeniority: candidate.desiredSeniority || [],
    nonNegotiables: candidate.nonNegotiables || [],
    location: candidate.location || ''
  };

  // Map TalentSearchCriteria to JobPosting fields for reuse
  // We treat the search criteria as the "Job" requirements
  
  // 1. Skills
  const jobLikeStruct: any = {
      requiredSkills: criteria.requiredSkills || [],
      salaryMin: criteria.salaryMin,
      salaryMax: criteria.salaryMax,
      contractTypes: criteria.contractTypes || [],
      workMode: criteria.workMode && criteria.workMode.length > 0 ? criteria.workMode[0] : null, // Assuming search can have multiple but we pick first for main check or adapt logic
      location: criteria.location || '',
      seniority: criteria.seniority && criteria.seniority.length > 0 ? criteria.seniority[0] : null,
      values: criteria.values || [],
      perks: criteria.desiredPerks || [],
      companyIndustry: criteria.interestedIndustries || [],
      requiredTraits: criteria.requiredTraits || [],
      desiredTraits: criteria.desiredTraits || []
  };

  // We need to adapt the matching function to handle arrays in criteria where JobPosting has single values (like workMode)
  // Or we modify the logic here to perform specific checks for the search context.
  
  const dealBreakers: string[] = [];
  const recommendations: string[] = [];
  
  // --- 1. SKILLS MATCH (30%) ---
  // Same logic as job match
  let skillsScore = 0;
  let requiredSkillsCount = 0;
  let skillsMatchedWeight = 0;

  if (jobLikeStruct.requiredSkills.length > 0) {
      jobLikeStruct.requiredSkills.forEach((jobSkill: JobSkill) => {
          const candidateSkill = safeCandidate.skills.find(s => s.name.toLowerCase() === jobSkill.name.toLowerCase());
          const isRequired = jobSkill.weight === 'required';
          if (isRequired) requiredSkillsCount++;

          if (candidateSkill) {
              let skillPoints = 100;
              if (candidateSkill.years < jobSkill.minimumYears) {
                  skillPoints -= (jobSkill.minimumYears - candidateSkill.years) * 20;
                  if (isRequired) recommendations.push(`Missing experience years for ${jobSkill.name}`);
              }
              skillPoints = Math.max(0, skillPoints);
              skillsMatchedWeight += isRequired ? skillPoints * 2 : skillPoints;
          } else {
              if (isRequired) {
                  dealBreakers.push(`Missing required skill: ${jobSkill.name}`);
              } else {
                  recommendations.push(`Consider candidate learning ${jobSkill.name}`);
              }
          }
      });
      const totalPossibleWeight = jobLikeStruct.requiredSkills.reduce((acc: number, s: JobSkill) => acc + (s.weight === 'required' ? 200 : 100), 0);
      skillsScore = totalPossibleWeight > 0 ? (skillsMatchedWeight / totalPossibleWeight) * 100 : 100;
  } else {
      skillsScore = 100;
  }

  // --- 2. SALARY MATCH (15%) ---
  let salaryScore = 100;
  // Inverted: Criteria Salary Max vs Candidate Min
  if (criteria.salaryMax && safeCandidate.salaryMin) {
      if (safeCandidate.salaryMin > criteria.salaryMax) {
          const diff = safeCandidate.salaryMin - criteria.salaryMax;
          const percentDiff = (diff / criteria.salaryMax);
          salaryScore = Math.max(0, 100 - (percentDiff * 200));
          if (criteria.dealBreakers?.includes('salary')) {
             dealBreakers.push(`Salary request ${safeCandidate.salaryMin} exceeds max budget ${criteria.salaryMax}`);
             salaryScore = 0;
          }
      }
  }

  // --- 3. CONTRACT TYPE MATCH (8%) ---
  let contractScore = 0;
  if (criteria.contractTypes && criteria.contractTypes.length > 0) {
      const shared = criteria.contractTypes.filter(t => safeCandidate.contractTypes.includes(t));
      if (shared.length > 0) contractScore = 100;
      else {
          if (criteria.dealBreakers?.includes('contract_type')) {
              dealBreakers.push('Contract type mismatch');
          }
      }
  } else {
      contractScore = 100;
  }

  // --- 4. WORK MODE & LOCATION (12%) ---
  let locationScore = 100;
  let workModeScore = 100;
  
  if (criteria.workMode && criteria.workMode.length > 0) {
      const sharedMode = criteria.workMode.filter(m => safeCandidate.preferredWorkMode.includes(m));
      if (sharedMode.length === 0) {
          workModeScore = 0;
          if (criteria.dealBreakers?.includes('work_mode')) dealBreakers.push('Work mode mismatch');
      }
  }

  if (criteria.location) {
      if (!safeCandidate.location.toLowerCase().includes(criteria.location.toLowerCase())) {
          locationScore = 20; // Partial match logic
           if (criteria.dealBreakers?.includes('location')) {
               dealBreakers.push(`Location mismatch: Need ${criteria.location}`);
               locationScore = 0;
           }
      }
  }
  const locWorkScore = (locationScore + workModeScore) / 2;

  // --- 5. SENIORITY (8%) ---
  let seniorityScore = 100;
  if (criteria.seniority && criteria.seniority.length > 0) {
      // Check if candidate desires the seniority we are looking for
      const sharedSen = criteria.seniority.filter(s => safeCandidate.desiredSeniority.includes(s));
      if (sharedSen.length === 0) {
          seniorityScore = 20;
          if (criteria.dealBreakers?.includes('seniority')) {
              dealBreakers.push('Seniority level mismatch');
              seniorityScore = 0;
          }
      }
  }

  // --- 6. CULTURE (12%) ---
  let cultureScore = 100;
  if (criteria.values && criteria.values.length > 0 && safeCandidate.values.length > 0) {
      const shared = criteria.values.filter(v => safeCandidate.values.includes(v));
      cultureScore = (shared.length / criteria.values.length) * 100;
  }

  // --- 7. PERKS (7%) ---
  let perkScore = 100; 
  // Less critical in search, usually. We check if we offer what they want (inverted).
  // But here we check if candidate wants perks we specified as "Desired Perks" in search? 
  // Actually, usually recruiter searches for candidates who want X.
  if (criteria.desiredPerks && criteria.desiredPerks.length > 0) {
     const shared = criteria.desiredPerks.filter(p => safeCandidate.desiredPerks.includes(p));
     perkScore = (shared.length / criteria.desiredPerks.length) * 100;
  }

  // --- 8. INDUSTRY (5%) ---
  let industryScore = 100;
  if (criteria.interestedIndustries && criteria.interestedIndustries.length > 0) {
      // Does candidate want to work in these industries?
      const shared = criteria.interestedIndustries.filter(i => safeCandidate.interestedIndustries.includes(i));
      if (shared.length === 0) industryScore = 20;
  }

  // --- 9. TRAITS (3%) ---
  let traitsScore = 100;
  if (criteria.requiredTraits && criteria.requiredTraits.length > 0) {
      const hasReq = criteria.requiredTraits.filter(t => safeCandidate.characterTraits.includes(t));
      if (hasReq.length < criteria.requiredTraits.length) {
          traitsScore = 0;
          if (criteria.dealBreakers?.includes('traits')) dealBreakers.push('Missing required character traits');
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

   if (dealBreakers.length > 0) {
       overallScore = Math.min(overallScore, 45); 
   }

   return {
       overallScore,
       details: {
           skills: { score: Math.round(skillsScore), reason: `${Math.round(skillsScore)}% skill match` },
           salary: { score: Math.round(salaryScore), reason: 'Budget fit' },
           contract: { score: Math.round(contractScore), reason: 'Contract fit' },
           location: { score: Math.round(locationScore), reason: 'Location match' },
           workMode: { score: Math.round(workModeScore), reason: 'Mode match' },
           seniority: { score: Math.round(seniorityScore), reason: 'Level match' },
           culture: { score: Math.round(cultureScore), reason: 'Values match' },
           perks: { score: Math.round(perkScore), reason: 'Perks match' },
           industry: { score: Math.round(industryScore), reason: 'Industry fit' },
           traits: { score: Math.round(traitsScore), reason: 'Traits match' }
       },
       dealBreakers,
       recommendations
   };
}
