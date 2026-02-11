import { Trophy } from 'lucide-react';
import type { JuryInfo } from '@/types';
import { useHistory } from '@/contexts/HistoryContext';
import { QuickStats } from './QuickStats';
import { ExportSection } from './ExportSection';
import { CriteriaMeanBars } from './CriteriaMeanBars';
import { MasteryPies } from './MasteryPies';
import { CandidateRanking } from './CandidateRanking';

interface ResultatsPageProps {
  jury: JuryInfo;
}

export const ResultatsPage = ({ jury }: ResultatsPageProps) => {
  const { history } = useHistory();

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
        <QuickStats history={history} />
        <ExportSection jury={jury} history={history} />
        <CriteriaMeanBars history={history} />
        <MasteryPies history={history} />
        <CandidateRanking history={history} />
      </div>
    </div>
  );
};
