import type { FC } from 'react';
import { grille } from '@/data/grille-2026';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { cn } from '@/lib/utils';
import { fmtPt, getEvaluationTotal, getMasteryColorForCriterion } from '@/lib/analyse-utils';

interface CompareBarsProps {
  candidates: EvaluationState[];
  selectedIndices: number[];
  selectedCriteria: Set<string>;
}

const barColor: Record<string, string> = {
  insufficient: 'bg-red-500',
  fragile: 'bg-orange-500',
  satisfactory: 'bg-blue-500',
  excellent: 'bg-green-500',
};

const CANDIDATE_COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-lime-500',
  'bg-fuchsia-500',
];

export const CompareBars: FC<CompareBarsProps> = ({
  candidates,
  selectedIndices,
  selectedCriteria,
}) => {
  const selected = selectedIndices.map((i) => candidates[i]);
  const allCriteria = grille.sections.flatMap((s) => s.criteria);
  const filteredCriteria = allCriteria.filter((c) => selectedCriteria.has(c.id));

  if (selected.length < 2) return null;

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-2">
        {selected.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded-full', CANDIDATE_COLORS[i % CANDIDATE_COLORS.length])} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {entry.candidate.prenom} {entry.candidate.nom}
            </span>
          </div>
        ))}
      </div>

      {/* Per-criterion bars */}
      {filteredCriteria.map((criterion) => (
        <div key={criterion.id}>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {criterion.title}
            <span className="text-gray-400 font-normal ml-1">/{criterion.maxPoints}</span>
          </p>
          <div className="space-y-1">
            {selected.map((entry, i) => {
              const score = entry.scores[criterion.id] ?? 0;
              const color = getMasteryColorForCriterion(criterion.id, score);
              const pct = criterion.maxPoints > 0 ? (score / criterion.maxPoints) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-[60px] md:w-[90px] text-xs truncate text-gray-600 dark:text-gray-400">
                    {entry.candidate.prenom}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                    <div
                      className={cn(
                        'h-5 rounded-full flex items-center transition-all',
                        color ? barColor[color] : CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
                      )}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-[10px] font-bold text-white px-2 whitespace-nowrap">
                        {fmtPt(score)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Total bars */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Total <span className="text-gray-400 font-normal">/20</span>
        </p>
        <div className="space-y-1.5">
          {selected.map((entry, i) => {
            const total = getEvaluationTotal(entry.scores);
            const pct = (total / 20) * 100;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-[60px] md:w-[90px] text-xs truncate font-medium text-gray-700 dark:text-gray-300">
                  {entry.candidate.prenom} {entry.candidate.nom.charAt(0)}.
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={cn(
                      'h-6 rounded-full flex items-center transition-all',
                      CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
                    )}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    <span className="text-xs font-bold text-white px-2 whitespace-nowrap">
                      {fmtPt(total)}/20
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
