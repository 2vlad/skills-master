import { z } from 'zod';

export const SkillProjectSchema = z.object({
  title: z.string().min(1, 'Название проекта обязательно'),
  description: z.string().min(1, 'Описание проекта обязательно'),
  requirements: z.array(z.string()).min(1, 'Требования не могут быть пустыми'),
  deliverables: z.array(z.string()).min(1, 'Результаты не могут быть пустыми'),
  focusSkills: z.array(z.string()).min(1, 'Фокус-скиллы не могут быть пустыми'),
});

export const SkillSchema = z.object({
  id: z.string().min(1),
  source: z.object({
    text: z.string().min(1),
    profileColumn: z.string().min(1),
  }),
  name: z.string().min(1, 'Название скилла обязательно'),
  summary: z.string().min(1, 'Краткое описание обязательно'),
  details: z.array(z.string()).min(3, 'Минимум 3 тезиса').max(15),
  coreTechnologies: z.array(z.string()).min(3, 'Минимум 3 технологии').max(15),
  checkQuestions: z.array(z.string()).length(10, 'Должно быть ровно 10 вопросов'),
  project: SkillProjectSchema,
});

export const SpecialistProfileSchema = z.object({
  title: z.string().min(1, 'Название профиля обязательно'),
  marketNames: z.object({
    us: z.array(z.string()).min(1),
    ru: z.array(z.string()).min(1),
    de: z.array(z.string()).min(1),
  }),
  avgSalary: z.object({
    usdYear: z.number().nullable(),
    rubMonth: z.number().nullable(),
    eurYearDe: z.number().nullable(),
    note: z.string().optional(),
  }),
  typicalProjects: z.array(z.string()).min(3, 'Минимум 3 типичных проекта'),
  mustAnswerQuestions: z.array(z.string()).min(5, 'Минимум 5 вопросов'),
  testProject: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    requirements: z.array(z.string()).min(1),
  }),
});

export const SkillsJsonSchema = z.object({
  meta: z.object({
    profileId: z.string().min(1),
    profileName: z.string().min(1),
    sourceFile: z.string().min(1),
    generatedAt: z.string().min(1),
    model: z.string().min(1),
  }),
  skills: z.array(SkillSchema).min(1, 'Минимум 1 скилл'),
  specialistProfile: SpecialistProfileSchema,
});

// Partial schema for LLM response (without id and source which are added later)
export const LLMSkillResponseSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(z.string()).min(3).max(15),
  coreTechnologies: z.array(z.string()).min(3).max(15),
  checkQuestions: z.array(z.string()).length(10),
  project: SkillProjectSchema,
});

export type LLMSkillResponse = z.infer<typeof LLMSkillResponseSchema>;
