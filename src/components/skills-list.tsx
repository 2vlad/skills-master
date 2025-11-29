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
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Skills navigation */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <a
            key={skill.id}
            href={`#skill-${skill.id}`}
            className="apple-tag hover:bg-[#e8e8ed] transition-colors"
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
        <div className="mt-8">
          <ProfileAccordion profile={profile} />
        </div>
      )}
    </div>
  );
}
