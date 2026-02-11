import { type FC, useState, useMemo } from 'react';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { grille } from '@/data/grille-2026';
import type { TaggedCandidate } from '@/hooks/useImportedData';
import { cn } from '@/lib/utils';
import { fmtPt, getEvaluationTotal, getSectionTotalFromScores } from '@/lib/analyse-utils';
import { exportClassementCSV } from '@/lib/analyse-export';

interface ClassementProps {
  candidates: TaggedCandidate[];
}

type SortKey = 'total' | 'nom' | 'classe' | 'jury' | `s${number}`;
type SortDir = 'asc' | 'desc';

export const Classement: FC<ClassementProps> = ({ candidates }) => {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterClasse, setFilterClasse] = useState<string | null>(null);
  const [filterSujet, setFilterSujet] = useState<string | null>(null);

  const classes = useMemo(
    () => [...new Set(candidates.map((c) => c.candidate.classe))].filter(Boolean).sort(),
    [candidates],
  );
  const sujets = useMemo(
    () => [...new Set(candidates.map((c) => c.candidate.sujet))].filter(Boolean).sort(),
    [candidates],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'total' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    let filtered = candidates;
    if (filterClasse) filtered = filtered.filter((c) => c.candidate.classe === filterClasse);
    if (filterSujet) filtered = filtered.filter((c) => c.candidate.sujet === filterSujet);

    return [...filtered].sort((a, b) => {
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
          cmp = a.juryNumber.localeCompare(b.juryNumber);
          break;
        default:
          if (sortKey.startsWith('s')) {
            const sIdx = Number(sortKey.slice(1));
            const sId = String(grille.sections[sIdx]?.id ?? '');
            cmp =
              getSectionTotalFromScores(a.scores, sId) -
              getSectionTotalFromScores(b.scores, sId);
          }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [candidates, sortKey, sortDir, filterClasse, filterSujet]);

  const SortIcon: FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? (
      <ArrowUp size={12} className="inline ml-0.5" />
    ) : (
      <ArrowDown size={12} className="inline ml-0.5" />
    );
  };

  if (candidates.length === 0) return null;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Filtres :
        </span>
        {classes.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterClasse(null)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors',
                filterClasse === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
              )}
            >
              Toutes classes
            </button>
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setFilterClasse(filterClasse === c ? null : c)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors',
                  filterClasse === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {sujets.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {sujets.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSujet(filterSujet === s ? null : s)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors',
                  filterSujet === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                )}
                title={s}
              >
                {s.length > 20 ? s.slice(0, 20) + '…' : s}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => exportClassementCSV(sorted)}
          className="ml-auto flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          <Download size={12} />
          CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 dark:bg-gray-900 text-white">
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-10">
                #
              </th>
              <th
                onClick={() => handleSort('nom')}
                className="border border-gray-600 p-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-700"
              >
                Candidat <SortIcon col="nom" />
              </th>
              <th
                onClick={() => handleSort('classe')}
                className="border border-gray-600 p-2 text-center text-xs font-semibold cursor-pointer hover:bg-gray-700 w-16"
              >
                Classe <SortIcon col="classe" />
              </th>
              <th
                onClick={() => handleSort('jury')}
                className="border border-gray-600 p-2 text-center text-xs font-semibold cursor-pointer hover:bg-gray-700 w-14"
              >
                Jury <SortIcon col="jury" />
              </th>
              {grille.sections.map((s, i) => (
                <th
                  key={s.id}
                  onClick={() => handleSort(`s${i}` as SortKey)}
                  className="border border-gray-600 p-2 text-center text-xs font-semibold cursor-pointer hover:bg-gray-700 w-16"
                >
                  S{s.id} <SortIcon col={`s${i}` as SortKey} />
                </th>
              ))}
              <th
                onClick={() => handleSort('total')}
                className="border border-gray-600 p-2 text-center text-xs font-semibold cursor-pointer hover:bg-gray-700 w-16"
              >
                Total <SortIcon col="total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const total = getEvaluationTotal(entry.scores);
              return (
                <tr
                  key={i}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30',
                  )}
                >
                  <td className="border border-gray-300 dark:border-gray-600 p-1.5 text-center text-xs text-gray-500">
                    {i + 1}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1.5 text-xs font-medium text-gray-900 dark:text-white">
                    {entry.candidate.nom} {entry.candidate.prenom}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1.5 text-center text-xs text-gray-600 dark:text-gray-400">
                    {entry.candidate.classe}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-1.5 text-center text-xs text-gray-600 dark:text-gray-400">
                    {entry.juryNumber}
                  </td>
                  {grille.sections.map((s) => (
                    <td
                      key={s.id}
                      className="border border-gray-300 dark:border-gray-600 p-1.5 text-center tabular-nums text-xs"
                    >
                      {fmtPt(getSectionTotalFromScores(entry.scores, String(s.id)))}
                      <span className="text-gray-400">/{s.maxPoints}</span>
                    </td>
                  ))}
                  <td className="border border-gray-300 dark:border-gray-600 p-1.5 text-center font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {fmtPt(total)}
                    <span className="text-gray-400 font-normal text-xs">/20</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {sorted.length} candidat{sorted.length > 1 ? 's' : ''}
        {filterClasse || filterSujet ? ' (filtré)' : ''}
      </p>
    </div>
  );
};
