import type { FC } from 'react';
import { grille } from '@/data/grille-2026';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { cn } from '@/lib/utils';
import { fmtPt, getEvaluationTotal, getMasteryColorForCriterion } from '@/lib/analyse-utils';

interface CompareTableProps {
  candidates: EvaluationState[];
  selectedIndices: number[];
  selectedCriteria: Set<string>;
}

const cellBg: Record<string, string> = {
  insufficient: 'bg-red-100 dark:bg-red-900/40',
  fragile: 'bg-orange-100 dark:bg-orange-900/40',
  satisfactory: 'bg-blue-100 dark:bg-blue-900/40',
  excellent: 'bg-green-100 dark:bg-green-900/40',
};

export const CompareTable: FC<CompareTableProps> = ({
  candidates,
  selectedIndices,
  selectedCriteria,
}) => {
  const selected = selectedIndices.map((i) => candidates[i]);
  const allCriteria = grille.sections.flatMap((s) => s.criteria);
  const filteredCriteria = allCriteria.filter((c) => selectedCriteria.has(c.id));

  if (selected.length < 2) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-800 dark:bg-gray-900 text-white">
            <th className="border border-gray-600 p-2 text-left text-xs font-semibold min-w-[180px]">
              Critère
            </th>
            {selected.map((entry, i) => (
              <th
                key={i}
                className="border border-gray-600 p-2 text-center text-xs font-semibold min-w-[100px]"
              >
                <div>{entry.candidate.prenom}</div>
                <div className="font-normal text-gray-300">{entry.candidate.nom}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredCriteria.map((criterion) => (
            <tr key={criterion.id}>
              <td className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium text-gray-900 dark:text-white">
                {criterion.title}
                <span className="text-gray-400 ml-1">/{criterion.maxPoints}</span>
              </td>
              {selected.map((entry, i) => {
                const score = entry.scores[criterion.id] ?? 0;
                const color = getMasteryColorForCriterion(criterion.id, score);
                return (
                  <td
                    key={i}
                    className={cn(
                      'border border-gray-300 dark:border-gray-600 p-2 text-center font-semibold tabular-nums',
                      color && cellBg[color],
                    )}
                  >
                    {fmtPt(score)}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Section subtotals */}
          {grille.sections.map((section) => {
            const sectionCriteria = section.criteria.filter((c) => selectedCriteria.has(c.id));
            if (sectionCriteria.length === 0) return null;
            return (
              <tr key={`sub-${section.id}`} className="bg-gray-100 dark:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-gray-900 dark:text-white">
                  Sous-total {section.title}
                </td>
                {selected.map((entry, i) => {
                  const sub = sectionCriteria.reduce(
                    (sum, c) => sum + (entry.scores[c.id] ?? 0),
                    0,
                  );
                  return (
                    <td
                      key={i}
                      className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold tabular-nums text-indigo-600 dark:text-indigo-400"
                    >
                      {fmtPt(sub)}
                      <span className="text-gray-400 font-normal text-xs">
                        /{section.maxPoints}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Total row */}
          <tr className="bg-indigo-100 dark:bg-indigo-900/40">
            <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm font-bold text-gray-900 dark:text-white">
              Total
            </td>
            {selected.map((entry, i) => {
              const total = getEvaluationTotal(entry.scores);
              return (
                <td
                  key={i}
                  className="border border-gray-300 dark:border-gray-600 p-2 text-center text-lg font-bold tabular-nums text-indigo-700 dark:text-indigo-300"
                >
                  {fmtPt(total)}
                  <span className="text-gray-400 font-normal text-xs">/20</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
