import { grille } from '@/data/grille-2026';
import { computeMean, fmtPt } from '@/lib/analyse-utils';
import type { EvaluationState } from '@/hooks/useEvaluation';

const SHORT_LABELS = [
  'Exposé', 'Justification', 'Connaissances', 'Compétences', 'Regard critique',
  'Expression', 'Vocabulaire', 'Langue orale', 'Échanges',
];

const allCriteria = grille.sections.flatMap((s) => s.criteria);

const getBarColor = (pct: number) => {
  if (pct >= 0.75) return 'bg-green-500';
  if (pct >= 0.5) return 'bg-blue-500';
  if (pct >= 0.25) return 'bg-orange-500';
  return 'bg-red-500';
};

interface CriteriaMeanBarsProps {
  history: EvaluationState[];
}

export const CriteriaMeanBars = ({ history }: CriteriaMeanBarsProps) => {
  const data = allCriteria.map((c, i) => {
    const scores = history.map((e) => e.scores[c.id] ?? 0);
    const mean = computeMean(scores);
    const pct = mean / c.maxPoints;
    return { id: c.id, label: SHORT_LABELS[i], mean, max: c.maxPoints, pct };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Moyenne par critère
      </h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-28 shrink-0 text-right">
              {d.label}
            </span>
            <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(d.pct)}`}
                style={{ width: `${Math.max(d.pct * 100, 2)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-200">
                {fmtPt(d.mean)} / {d.max}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
