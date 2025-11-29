'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Quote, Lightbulb, Wrench, HelpCircle, FolderKanban } from 'lucide-react';
import type { Skill } from '@/types/skills';

interface SkillAccordionProps {
  skill: Skill;
}

export function SkillAccordion({ skill }: SkillAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      id={`skill-${skill.id}`}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
          <p className="text-sm text-gray-500 truncate">{skill.summary}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
          {/* Source text */}
          <Section icon={Quote} title="Исходная формулировка">
            <blockquote className="pl-4 border-l-4 border-gray-300 text-gray-600 italic">
              {skill.source.text}
            </blockquote>
          </Section>

          {/* Details */}
          <Section icon={Lightbulb} title="Что нужно знать/уметь">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {skill.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </Section>

          {/* Technologies */}
          <Section icon={Wrench} title="Технологии">
            <div className="flex flex-wrap gap-2">
              {skill.coreTechnologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>

          {/* Check questions */}
          <Section icon={HelpCircle} title="Вопросы для самопроверки">
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              {skill.checkQuestions.map((question, i) => (
                <li key={i}>{question}</li>
              ))}
            </ol>
          </Section>

          {/* Project */}
          <Section icon={FolderKanban} title="Проект для проверки скилла">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">{skill.project.title}</h4>
              <p className="text-gray-600">{skill.project.description}</p>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Требования:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {skill.project.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Результаты:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {skill.project.deliverables.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Тренируемые навыки:</h5>
                <div className="flex flex-wrap gap-1">
                  {skill.project.focusSkills.map((fs, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {fs}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        {title}
      </h4>
      {children}
    </div>
  );
}
