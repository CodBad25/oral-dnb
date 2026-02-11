import { Trophy, Link2 } from 'lucide-react';
import type { JuryInfo } from '@/types';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { getHistory } from '@/lib/storage';
import { formatDateFR } from '@/lib/utils';
import { QuickStats } from './QuickStats';
import { ExportSection } from './ExportSection';
import { CriteriaMeanBars } from './CriteriaMeanBars';
import { MasteryPies } from './MasteryPies';
import { CandidateRanking } from './CandidateRanking';

interface ResultatsPageProps {
  jury: JuryInfo;
  sharedData?: { jury: JuryInfo; candidates: EvaluationState[] } | null;
}

export const ResultatsPage = ({ jury, sharedData }: ResultatsPageProps) => {
  const isShared = !!sharedData;
  const displayJury = isShared ? sharedData.jury : jury;
  const history = isShared ? sharedData.candidates : getHistory();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400 dark:text-gray-500">
        <Trophy size={48} strokeWidth={1.5} />
        <div className="text-center">
          <p className="text-lg font-semibold">Aucun candidat évalué</p>
          <p className="text-sm mt-1">
            Évaluez des candidats pour voir les résultats du jury.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {isShared && (
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-3">
            <Link2 size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                Résultats partagés — Jury {displayJury.juryNumber || '?'}
                {displayJury.date && ` · ${formatDateFR(displayJury.date)}`}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {displayJury.prof1Prenom} {displayJury.prof1Nom}
                {displayJury.prof2Nom && ` & ${displayJury.prof2Prenom} ${displayJury.prof2Nom}`}
                {' · '}{history.length} candidat{history.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
        <QuickStats history={history} />
        {!isShared && <ExportSection jury={displayJury} />}
        <CriteriaMeanBars history={history} />
        <MasteryPies history={history} />
        <CandidateRanking history={history} />
      </div>
    </div>
  );
};
