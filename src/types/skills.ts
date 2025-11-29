export interface SkillProject {
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  focusSkills: string[];
}

export interface Skill {
  id: string;
  source: {
    text: string;
    profileColumn: string;
  };
  name: string;
  summary: string;
  details: string[];
  coreTechnologies: string[];
  checkQuestions: string[]; // length = 10
  project: SkillProject;
}

export interface SpecialistProfile {
  title: string;
  marketNames: {
    us: string[];
    ru: string[];
    de: string[];
  };
  avgSalary: {
    usdYear: number | null;
    rubMonth: number | null;
    eurYearDe: number | null;
    note?: string;
  };
  typicalProjects: string[];
  mustAnswerQuestions: string[];
  testProject: {
    title: string;
    description: string;
    requirements: string[];
  };
}

export interface SkillsJsonMeta {
  profileId: string;
  profileName: string;
  sourceFile: string;
  generatedAt: string;
  model: string;
}

export interface SkillsJson {
  meta: SkillsJsonMeta;
  skills: Skill[];
  specialistProfile: SpecialistProfile;
}
