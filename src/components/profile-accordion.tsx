'use client';

import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SpecialistProfile } from '@/types/skills';

interface ProfileAccordionProps {
  profile: SpecialistProfile;
}

export function ProfileAccordion({ profile }: ProfileAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="apple-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
            <User className="w-6 h-6 text-[#1d1d1f]" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Профиль специалиста</h3>
            <p className="text-sm text-[#86868b] mt-0.5">{profile.title}</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[#86868b] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-6 border-t border-[rgba(0,0,0,0.06)]">
          {/* Market names */}
          <div className="pt-5">
            <h4 className="apple-section-title">Названия на рынках</h4>
            <div className="grid grid-cols-3 gap-4">
              <MarketCard 
                flag="🇺🇸" 
                region="США" 
                names={profile.marketNames.us} 
              />
              <MarketCard 
                flag="🇷🇺" 
                region="Россия" 
                names={profile.marketNames.ru} 
              />
              <MarketCard 
                flag="🇩🇪" 
                region="Германия" 
                names={profile.marketNames.de} 
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <h4 className="apple-section-title">Зарплаты (middle)</h4>
            <div className="grid grid-cols-3 gap-4">
              <SalaryCard
                flag="🇺🇸"
                value={formatCurrency(profile.avgSalary.usdYear, 'USD')}
                period="/год"
              />
              <SalaryCard
                flag="🇷🇺"
                value={formatCurrency(profile.avgSalary.rubMonth, 'RUB')}
                period="/мес"
              />
              <SalaryCard
                flag="🇩🇪"
                value={formatCurrency(profile.avgSalary.eurYearDe, 'EUR')}
                period="/год"
              />
            </div>
            {profile.avgSalary.note && (
              <p className="text-xs text-[#86868b] mt-3">
                {profile.avgSalary.note}
              </p>
            )}
          </div>

          {/* Typical projects */}
          <div>
            <h4 className="apple-section-title">Типичные задачи</h4>
            <ul className="space-y-2">
              {profile.typicalProjects.map((project, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-[#1d1d1f]">
                  <span className="text-[#86868b]">•</span>
                  <span>{project}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Must answer questions */}
          <div>
            <h4 className="apple-section-title">Вопросы для собеседования</h4>
            <ol className="space-y-2">
              {profile.mustAnswerQuestions.map((question, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-[#1d1d1f]">
                  <span className="text-[#86868b] font-medium w-5 flex-shrink-0">{i + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Test project */}
          <div>
            <h4 className="apple-section-title">Тестовое задание</h4>
            <div className="bg-[#f5f5f7] rounded-xl p-5 space-y-3">
              <h5 className="text-[17px] font-semibold text-[#1d1d1f]">{profile.testProject.title}</h5>
              <p className="text-[15px] text-[#86868b] leading-relaxed">{profile.testProject.description}</p>
              <div>
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Требования</p>
                <ul className="space-y-1.5">
                  {profile.testProject.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#1d1d1f]">
                      <span className="text-[#86868b]">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCard({ flag, region, names }: { flag: string; region: string; names: string[] }) {
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-4">
      <div className="text-lg mb-2">{flag}</div>
      <div className="text-xs text-[#86868b] font-medium mb-1">{region}</div>
      {names.map((name, i) => (
        <div key={i} className="text-sm text-[#1d1d1f]">{name}</div>
      ))}
    </div>
  );
}

function SalaryCard({ flag, value, period }: { flag: string; value: string; period: string }) {
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-4 text-center">
      <div className="text-lg mb-1">{flag}</div>
      <div className="text-[17px] font-semibold text-[#1d1d1f]">
        {value}
      </div>
      <div className="text-xs text-[#86868b]">{period}</div>
    </div>
  );
}
