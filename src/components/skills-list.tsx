'use client';

import { SkillAccordion } from './skill-accordion';
import { ProfileAccordion } from './profile-accordion';
import type { Skill, SpecialistProfile } from '@/types/skills';

interface SkillsListProps {
  skills: Skill[];
  profile: SpecialistProfile | null;
}

export function SkillsList({ skills, profile }: SkillsListProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Нет скиллов для отображения
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Skills navigation */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        {skills.map((skill, index) => (
          <a
            key={skill.id}
            href={`#skill-${skill.id}`}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-300 rounded-full transition-colors border border-gray-300"
          >
            {index + 1}. {skill.name}
          </a>
        ))}
      </div>

      {/* Skills accordions */}
      <div className="space-y-3">
        {skills.map((skill) => (
          <SkillAccordion key={skill.id} skill={skill} />
        ))}
      </div>

      {/* Profile accordion */}
      {profile && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <ProfileAccordion profile={profile} />
        </div>
      )}
    </div>
  );
}
