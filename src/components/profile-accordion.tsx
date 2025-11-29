'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Globe, Wallet, Briefcase, MessageCircle, ClipboardList } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SpecialistProfile } from '@/types/skills';

interface ProfileAccordionProps {
  profile: SpecialistProfile;
}

export function ProfileAccordion({ profile }: ProfileAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-2 border-gray-400 rounded-lg overflow-hidden bg-gray-50">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 rounded-lg">
            <User className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Профиль специалиста</h3>
            <p className="text-sm text-gray-500">{profile.title}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-5 border-t border-gray-300">
          {/* Market names */}
          <Section icon={Globe} title="Названия на рынках">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">🇺🇸 США</th>
                    <th className="text-left py-2 font-medium text-gray-700">🇷🇺 Россия</th>
                    <th className="text-left py-2 font-medium text-gray-700">🇩🇪 Германия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 align-top">
                      {profile.marketNames.us.map((name, i) => (
                        <div key={i} className="text-gray-600">{name}</div>
                      ))}
                    </td>
                    <td className="py-2 align-top">
                      {profile.marketNames.ru.map((name, i) => (
                        <div key={i} className="text-gray-600">{name}</div>
                      ))}
                    </td>
                    <td className="py-2 align-top">
                      {profile.marketNames.de.map((name, i) => (
                        <div key={i} className="text-gray-600">{name}</div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Salary */}
          <Section icon={Wallet} title="Примерные зарплаты (middle)">
            <div className="grid grid-cols-3 gap-4">
              <SalaryCard
                region="🇺🇸 США"
                value={formatCurrency(profile.avgSalary.usdYear, 'USD')}
                period="/год"
              />
              <SalaryCard
                region="🇷🇺 Россия"
                value={formatCurrency(profile.avgSalary.rubMonth, 'RUB')}
                period="/мес"
              />
              <SalaryCard
                region="🇩🇪 Германия"
                value={formatCurrency(profile.avgSalary.eurYearDe, 'EUR')}
                period="/год"
              />
            </div>
            {profile.avgSalary.note && (
              <p className="text-xs text-gray-500 mt-2 italic">
                ⚠️ {profile.avgSalary.note}
              </p>
            )}
          </Section>

          {/* Typical projects */}
          <Section icon={Briefcase} title="Типичные проекты и задачи">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {profile.typicalProjects.map((project, i) => (
                <li key={i}>{project}</li>
              ))}
            </ul>
          </Section>

          {/* Must answer questions */}
          <Section icon={MessageCircle} title="Ключевые вопросы для собеседования">
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              {profile.mustAnswerQuestions.map((question, i) => (
                <li key={i}>{question}</li>
              ))}
            </ol>
          </Section>

          {/* Test project */}
          <Section icon={ClipboardList} title="Тестовое задание">
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
              <h4 className="font-medium text-gray-900">{profile.testProject.title}</h4>
              <p className="text-gray-600">{profile.testProject.description}</p>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Требования:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {profile.testProject.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
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

function SalaryCard({
  region,
  value,
  period,
}: {
  region: string;
  value: string;
  period: string;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
      <div className="text-xs text-gray-500 mb-1">{region}</div>
      <div className="font-semibold text-gray-900">
        {value}
        <span className="text-xs font-normal text-gray-500">{period}</span>
      </div>
    </div>
  );
}
