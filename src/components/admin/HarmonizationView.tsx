import type { EvaluationState } from '@/hooks/useEvaluation';
import { grille } from '@/data/grille-2026';
import { fmtPt, getEvaluationTotal, computeMean } from '@/lib/analyse-utils';

interface HarmonizationViewProps {
  evaluations: EvaluationState[];
  juryNumbers: string[];
}

const COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500',
];

export const HarmonizationView = ({ evaluations, juryNumbers }: HarmonizationViewProps) => {
  if (juryNumbers.length < 2) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-10">
        <p className="text-lg font-semibold">Pas assez de jurys</p>
        <p className="text-sm mt-1">Il faut au moins 2 jurys pour comparer les résultats.</p>
      </div>
    );
  }

  const juryStats = juryNumbers.map((jn) => {
    const juryEvals = evaluations.filter((e) => e.jury.juryNumber === jn);
    const totals = juryEvals.map((e) => getEvaluationTotal(e.scores));
    const mean = computeMean(totals);
    const min = totals.length > 0 ? Math.min(...totals) : 0;
    const max = totals.length > 0 ? Math.max(...totals) : 0;
    const stdDev = totals.length > 1
      ? Math.sqrt(totals.reduce((sum, t) => sum + (t - mean) ** 2, 0) / totals.length)
      : 0;
    return { juryNumber: jn, count: juryEvals.length, mean, min, max, stdDev, evaluations: juryEvals };
  });

  const allCriteria = grille.sections.flatMap((s) => s.criteria);

  const criteriaByJury = allCriteria.map((criterion) => ({
    criterion,
    juryMeans: juryNumbers.map((jn) => {
      const juryEvals = evaluations.filter((e) => e.jury.juryNumber === jn);
      const scores = juryEvals.map((e) => e.scores[criterion.id] ?? 0);
      return { juryNumber: jn, mean: computeMean(scores) };
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Summary table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Comparaison des jurys
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Jury</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Candidats</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Moyenne</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Min</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Max</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Écart-type</th>
              </tr>
            </thead>
            <tbody>
              {juryStats.map((js, i) => (
                <tr key={js.juryNumber} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">
                    <span className="inline-flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${COLORS[i % COLORS.length]}`} />
                      Jury {js.juryNumber}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">{js.count}</td>
                  <td className="py-2 px-3 text-center font-bold text-gray-800 dark:text-gray-200">
                    {fmtPt(js.mean)}/{grille.totalPoints}
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">{fmtPt(js.min)}</td>
                  <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">{fmtPt(js.max)}</td>
                  <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">{fmtPt(js.stdDev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative bars by criterion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Moyennes par critère et par jury
        </h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {juryNumbers.map((jn, i) => (
            <span key={jn} className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className={`w-3 h-3 rounded-full ${COLORS[i % COLORS.length]}`} />
              Jury {jn}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {criteriaByJury.map(({ criterion, juryMeans }) => {
            const maxPts = criterion.levels[criterion.levels.length - 1].points;
            return (
              <div key={criterion.id}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {criterion.title}
                  <span className="text-gray-400 dark:text-gray-500 ml-1">/ {maxPts}</span>
                </p>
                <div className="space-y-1">
                  {juryMeans.map((jm, i) => {
                    const pct = maxPts > 0 ? (jm.mean / maxPts) * 100 : 0;
                    return (
                      <div key={jm.juryNumber} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">J{jm.juryNumber}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-10 text-right">
                          {fmtPt(jm.mean)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
