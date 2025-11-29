'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Skill } from '@/types/skills';

interface SkillAccordionProps {
  skill: Skill;
}

export function SkillAccordion({ skill }: SkillAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      id={`skill-${skill.id}`}
      className="apple-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{skill.name}</h3>
          <p className="text-sm text-[#86868b] mt-0.5 line-clamp-1">{skill.summary}</p>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[#86868b] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-6 border-t border-[rgba(0,0,0,0.06)]">
          {/* Source text */}
          <div className="pt-5">
            <h4 className="apple-section-title">Исходная формулировка</h4>
            <p className="text-[15px] text-[#86868b] leading-relaxed bg-[#f5f5f7] rounded-xl p-4">
              {skill.source.text}
            </p>
          </div>

          {/* Details */}
          <div>
            <h4 className="apple-section-title">Что нужно знать</h4>
            <ul className="space-y-2">
              {skill.details.map((detail, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-[#1d1d1f]">
                  <span className="text-[#86868b]">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="apple-section-title">Технологии</h4>
            <div className="flex flex-wrap gap-2">
              {skill.coreTechnologies.map((tech, i) => (
                <span key={i} className="apple-tag">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Check questions */}
          <div>
            <h4 className="apple-section-title">Вопросы для самопроверки</h4>
            <ol className="space-y-2">
              {skill.checkQuestions.map((question, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-[#1d1d1f]">
                  <span className="text-[#86868b] font-medium w-5 flex-shrink-0">{i + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Project */}
          <div>
            <h4 className="apple-section-title">Проект</h4>
            <div className="bg-[#f5f5f7] rounded-xl p-5 space-y-4">
              <div>
                <h5 className="text-[17px] font-semibold text-[#1d1d1f]">{skill.project.title}</h5>
                <p className="text-[15px] text-[#86868b] mt-1 leading-relaxed">{skill.project.description}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Требования</p>
                <ul className="space-y-1.5">
                  {skill.project.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                      <span className="text-[#86868b]">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Результаты</p>
                <ul className="space-y-1.5">
                  {skill.project.deliverables.map((del, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                      <span className="text-[#86868b]">•</span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skill.project.focusSkills.map((fs, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-xs font-medium text-[#1d1d1f] rounded-full">
                    {fs}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
