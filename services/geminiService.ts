
import { CandidateProfile, Skill } from "../types";

// AI Features disabled as per project requirements.
// These functions return empty/mock data to maintain type safety.

export const parseResume = async (resumeText: string): Promise<Partial<CandidateProfile>> => {
  return {
    headline: "Extracted from Resume",
    experience: [],
    skills: []
  };
};

export const suggestSkillsForRole = async (roleTitle: string): Promise<Skill[]> => {
  return [
    { name: "Communication", years: 3 },
    { name: "Problem Solving", years: 3 }
  ];
};

export const generateJobDescription = async (title: string, skills: Skill[]): Promise<string> => {
  return "This is a placeholder description. Please edit this to describe the role, responsibilities, and team culture.";
};

export const analyzeMatch = async (candidate: CandidateProfile, job: any): Promise<{ score: number, analysis: string }> => {
  return { score: 85, analysis: "AI Analysis is currently disabled." };
};
