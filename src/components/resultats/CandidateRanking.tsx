import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { fmtPt, getEvaluationTotal } from '@/lib/analyse-utils';
import { grille } from '@/data/grille-2026';

type SortKey = 'total' | 'nom' | 'classe' | 'jury';
type SortDir = 'asc' | 'desc';

interface CandidateRankingProps {
  history: EvaluationState[];
  showJury?: boolean;
}

export const CandidateRanking = ({ history, showJury }: CandidateRankingProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'total' ? 'desc' : 'asc');
    }
  };

  const sorted = [...history].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'total':
        cmp = getEvaluationTotal(a.scores) - getEvaluationTotal(b.scores);
        break;
      case 'nom':
        cmp = `${a.candidate.nom} ${a.candidate.prenom}`.localeCompare(
          `${b.candidate.nom} ${b.candidate.prenom}`,
        );
        break;
      case 'classe':
        cmp = a.candidate.classe.localeCompare(b.candidate.classe);
        break;
      case 'jury':
        cmp = (a.jury?.juryNumber || '').localeCompare(b.jury?.juryNumber || '');
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={12} className="opacity-30" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  };

  const getTotalColor = (total: number) => {
    if (total >= 16) return 'text-green-600 dark:text-green-400';
    if (total >= 12) return 'text-blue-600 dark:text-blue-400';
    if (total >= 8) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Classement des candidats
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 w-10">
                #
              </th>
              <th
                onClick={() => handleSort('nom')}
                className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
              >
                <span className="inline-flex items-center gap-1">
                  Nom Prénom <SortIcon col="nom" />
                </span>
              </th>
              <th
                onClick={() => handleSort('classe')}
                className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
              >
                <span className="inline-flex items-center gap-1">
                  Classe <SortIcon col="classe" />
                </span>
              </th>
              {showJury && (
                <th
                  onClick={() => handleSort('jury')}
                  className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Jury <SortIcon col="jury" />
                  </span>
                </th>
              )}
              <th
                onClick={() => handleSort('total')}
                className="text-right py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Total <SortIcon col="total" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const total = getEvaluationTotal(entry.scores);
              return (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="py-2 px-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {i + 1}
                  </td>
                  <td className="py-2 px-2 font-medium text-gray-800 dark:text-gray-200">
                    {entry.candidate.nom} {entry.candidate.prenom}
                  </td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                    {entry.candidate.classe}
                  </td>
                  {showJury && (
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                      J{entry.jury?.juryNumber || '?'}
                    </td>
                  )}
                  <td className={`py-2 px-2 text-right font-bold ${getTotalColor(total)}`}>
                    {fmtPt(total)}/{grille.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
