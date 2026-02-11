import type { FC } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fmtPt, getEvaluationTotal } from '@/lib/analyse-utils';
import type { EvaluationState } from '@/hooks/useEvaluation';

interface CandidateSelectorProps {
  candidates: EvaluationState[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const CandidateSelector: FC<CandidateSelectorProps> = ({
  candidates,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  const allSelected = selected.size === candidates.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Candidats
        </h3>
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          {allSelected ? 'Aucun' : 'Tous'}
        </button>
      </div>
      <div className="space-y-1 max-h-[50vh] overflow-y-auto">
        {candidates.map((entry, i) => {
          const isSelected = selected.has(i);
          const total = getEvaluationTotal(entry.scores);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors',
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border',
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300 dark:border-gray-600',
                )}
              >
                {isSelected && <Check size={12} />}
              </span>
              <span className="flex-1 truncate font-medium text-gray-900 dark:text-white">
                {entry.candidate.prenom} {entry.candidate.nom}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {fmtPt(total)}/20
              </span>
            </button>
          );
        })}
      </div>
      {selected.size < 2 && candidates.length >= 2 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Sélectionnez au moins 2 candidats
        </p>
      )}
    </div>
  );
};
