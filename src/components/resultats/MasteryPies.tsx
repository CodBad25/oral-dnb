import { useState } from 'react';
import { grille } from '@/data/grille-2026';
import { getMasteryColorForCriterion } from '@/lib/analyse-utils';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { PieChart } from './PieChart';
import { cn } from '@/lib/utils';

const MASTERY_COLORS: Record<string, string> = {
  insufficient: '#ef4444',
  fragile: '#f97316',
  satisfactory: '#3b82f6',
  excellent: '#22c55e',
};

const MASTERY_LABELS: Record<string, string> = {
  insufficient: 'Insuffisant',
  fragile: 'Fragile',
  satisfactory: 'Satisfaisant',
  excellent: 'Très bon',
};

const allCriteria = grille.sections.flatMap((s) => s.criteria);

interface MasteryPiesProps {
  history: EvaluationState[];
}

export const MasteryPies = ({ history }: MasteryPiesProps) => {
  const [view, setView] = useState<'criteria' | 'global'>('criteria');

  // Compute mastery distribution for a single criterion
  const getCriterionDistribution = (criterionId: string) => {
    const counts: Record<string, number> = {
      insufficient: 0,
      fragile: 0,
      satisfactory: 0,
      excellent: 0,
    };
    for (const entry of history) {
      const score = entry.scores[criterionId] ?? 0;
      const color = getMasteryColorForCriterion(criterionId, score);
      if (color) counts[color]++;
    }
    return Object.entries(counts).map(([key, value]) => ({
      label: MASTERY_LABELS[key],
      value,
      color: MASTERY_COLORS[key],
    }));
  };

  // Compute global distribution across all criteria
  const getGlobalDistribution = () => {
    const counts: Record<string, number> = {
      insufficient: 0,
      fragile: 0,
      satisfactory: 0,
      excellent: 0,
    };
    for (const entry of history) {
      for (const c of allCriteria) {
        const score = entry.scores[c.id] ?? 0;
        const color = getMasteryColorForCriterion(c.id, score);
        if (color) counts[color]++;
      }
    }
    return Object.entries(counts).map(([key, value]) => ({
      label: MASTERY_LABELS[key],
      value,
      color: MASTERY_COLORS[key],
    }));
  };

  // Short titles for criterion pies
  const shortTitles = [
    'Exposé', 'Justification', 'Connaissances', 'Compétences', 'Regard critique',
    'Expression', 'Vocabulaire', 'Langue orale', 'Échanges',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Répartition des niveaux de maîtrise
        </h3>
        <div className="flex gap-1">
          {(['criteria', 'global'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                view === v
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              )}
            >
              {v === 'criteria' ? 'Par critère' : 'Global'}
            </button>
          ))}
        </div>
      </div>

      {view === 'criteria' ? (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
          {allCriteria.map((c, i) => (
            <PieChart key={c.id} data={getCriterionDistribution(c.id)} size={100} title={shortTitles[i]} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <PieChart data={getGlobalDistribution()} size={180} showLegend />
        </div>
      )}

      {/* Legend for criteria view */}
      {view === 'criteria' && (
        <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          {Object.entries(MASTERY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: MASTERY_COLORS[key] }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
