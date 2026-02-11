import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { grille } from '@/data/grille-2026';
import type { TaggedCandidate } from '@/hooks/useImportedData';
import { cn } from '@/lib/utils';
import {
  fmtPt,
  computeMean,
  computeMedian,
  getEvaluationTotal,
  computeDistribution,
} from '@/lib/analyse-utils';

interface StatsGlobalesProps {
  candidates: TaggedCandidate[];
}

const RANGES: [number, number][] = [
  [0, 4],
  [5, 8],
  [9, 12],
  [13, 16],
  [17, 20],
];
const RANGE_LABELS = ['0-4', '5-8', '9-12', '13-16', '17-20'];
const RANGE_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-blue-500',
  'bg-green-500',
];

export const StatsGlobales: FC<StatsGlobalesProps> = ({ candidates }) => {
  if (candidates.length === 0) return null;

  const allCriteria = grille.sections.flatMap((s) => s.criteria);
  const totals = candidates.map((c) => getEvaluationTotal(c.scores));
  const distribution = computeDistribution(totals, RANGES);
  const maxCount = Math.max(...distribution, 1);

  // Per-jury averages
  const juryNumbers = [...new Set(candidates.map((c) => c.juryNumber))];
  const globalAvg = computeMean(totals);

  return (
    <div className="space-y-6">
      {/* Per-criterion stats */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Statistiques par critère
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-xs font-semibold">
                  Critère
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs font-semibold w-16">
                  Moy
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs font-semibold w-16">
                  Méd
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs font-semibold w-16">
                  Min
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs font-semibold w-16">
                  Max
                </th>
              </tr>
            </thead>
            <tbody>
              {allCriteria.map((criterion) => {
                const scores = candidates.map((c) => c.scores[criterion.id] ?? 0);
                return (
                  <tr key={criterion.id}>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-xs text-gray-900 dark:text-white">
                      {criterion.title}
                      <span className="text-gray-400 ml-1">/{criterion.maxPoints}</span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-semibold tabular-nums text-xs">
                      {fmtPt(Math.round(computeMean(scores) * 10) / 10)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center tabular-nums text-xs">
                      {fmtPt(computeMedian(scores))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center tabular-nums text-xs">
                      {fmtPt(Math.min(...scores))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center tabular-nums text-xs">
                      {fmtPt(Math.max(...scores))}
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-gray-900 dark:text-white">
                  Total /20
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold tabular-nums text-sm text-indigo-600 dark:text-indigo-400">
                  {fmtPt(Math.round(globalAvg * 10) / 10)}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold tabular-nums text-sm">
                  {fmtPt(computeMedian(totals))}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold tabular-nums text-sm">
                  {fmtPt(Math.min(...totals))}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold tabular-nums text-sm">
                  {fmtPt(Math.max(...totals))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-jury average comparison */}
      {juryNumbers.length > 1 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            Comparaison inter-jury
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {juryNumbers.map((jNum) => {
              const juryTotals = candidates
                .filter((c) => c.juryNumber === jNum)
                .map((c) => getEvaluationTotal(c.scores));
              const avg = computeMean(juryTotals);
              const diff = avg - globalAvg;
              const isSignificant = Math.abs(diff) > 2;
              return (
                <div
                  key={jNum}
                  className={cn(
                    'rounded-lg border p-3 text-center',
                    isSignificant && diff < 0
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
                      : isSignificant && diff > 0
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
                        : 'border-gray-200 dark:border-gray-700',
                  )}
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Jury {jNum}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                    {fmtPt(Math.round(avg * 10) / 10)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {juryTotals.length} candidat{juryTotals.length > 1 ? 's' : ''}
                  </p>
                  {isSignificant && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <AlertTriangle size={10} className={diff < 0 ? 'text-red-500' : 'text-green-500'} />
                      <span
                        className={cn(
                          'text-[10px] font-medium',
                          diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
                        )}
                      >
                        {diff > 0 ? '+' : ''}{fmtPt(Math.round(diff * 10) / 10)} vs moy
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Distribution histogram */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Distribution des notes
        </h3>
        <div className="flex items-end gap-2 h-32">
          {distribution.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {count}
              </span>
              <div className="w-full flex justify-center">
                <div
                  className={cn('w-full max-w-[60px] rounded-t transition-all', RANGE_COLORS[i])}
                  style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {RANGE_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
          {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};
