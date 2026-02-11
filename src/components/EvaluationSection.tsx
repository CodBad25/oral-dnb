import type { FC } from 'react';
import type { Section } from '@/data/grille-2025';
import { CriterionCard } from './CriterionCard';

interface EvaluationSectionProps {
  section: Section;
  scores: Record<string, number>;
  onScoreChange: (criterionId: string, points: number) => void;
  sectionTotal: number;
  candidateInfo?: string;
}

export const EvaluationSection: FC<EvaluationSectionProps> = ({
  section,
  scores,
  onScoreChange,
  sectionTotal,
  candidateInfo,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Candidate info header */}
      {candidateInfo && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            {candidateInfo}
          </p>
        </div>
      )}

      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">
          {section.title}
        </h2>
        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          Total: {sectionTotal} / {section.maxPoints}
        </div>
      </div>

      {/* Criteria cards */}
      <div className="space-y-6">
        {section.criteria.map((criterion) => (
          <CriterionCard
            key={criterion.id}
            criterion={criterion}
            selectedPoints={scores[criterion.id] ?? null}
            onSelect={(points) => onScoreChange(criterion.id, points)}
          />
        ))}
      </div>
    </div>
  );
};
