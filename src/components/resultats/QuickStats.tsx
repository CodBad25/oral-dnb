import { Users, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { fmtPt, getEvaluationTotal, computeMean } from '@/lib/analyse-utils';
import { grille } from '@/data/grille-2026';

interface QuickStatsProps {
  history: EvaluationState[];
}

export const QuickStats = ({ history }: QuickStatsProps) => {
  const totals = history.map((e) => getEvaluationTotal(e.scores));
  const avg = computeMean(totals);
  const minVal = totals.length > 0 ? Math.min(...totals) : 0;
  const maxVal = totals.length > 0 ? Math.max(...totals) : 0;
  const minEntry = history[totals.indexOf(minVal)];
  const maxEntry = history[totals.indexOf(maxVal)];

  const cards = [
    {
      label: 'Candidats',
      value: String(history.length),
      sub: '',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      label: 'Moyenne',
      value: `${fmtPt(avg)}/${grille.totalPoints}`,
      sub: '',
      icon: BarChart3,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Minimum',
      value: `${fmtPt(minVal)}/${grille.totalPoints}`,
      sub: minEntry ? `${minEntry.candidate.prenom} ${minEntry.candidate.nom}` : '',
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
    {
      label: 'Maximum',
      value: `${fmtPt(maxVal)}/${grille.totalPoints}`,
      sub: maxEntry ? `${maxEntry.candidate.prenom} ${maxEntry.candidate.nom}` : '',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-3"
        >
          <div className={`p-2 rounded-lg ${card.bg}`}>
            <card.icon size={18} className={card.color} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            {card.sub && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
