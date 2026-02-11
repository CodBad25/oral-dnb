import { ClipboardCheck, BarChart3, Trophy, ChevronRight } from 'lucide-react';
import { loadJuryDefaults } from '@/lib/storage';
import { useHistory } from '@/contexts/HistoryContext';
import { fmtPt, getEvaluationTotal, computeMean } from '@/lib/analyse-utils';
import { grille } from '@/data/grille-2026';

interface WelcomeModalProps {
  onStartEvaluation: () => void;
  onViewResults: () => void;
  onViewAnalyse: () => void;
}

export const WelcomeModal = ({ onStartEvaluation, onViewResults, onViewAnalyse }: WelcomeModalProps) => {
  const { history } = useHistory();
  const jury = loadJuryDefaults();
  const hasHistory = history.length > 0;

  const totals = history.map((e) => getEvaluationTotal(e.scores));
  const avg = computeMean(totals);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 py-8 text-white">
          <h1 className="text-2xl font-bold">Évaluation Orale DNB</h1>
          <p className="text-indigo-200 mt-1 text-sm">Session 2026</p>

          {hasHistory && (
            <div className="flex gap-4 mt-5">
              <div className="bg-white/15 rounded-lg px-3 py-2 text-center">
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-[11px] text-indigo-200">candidat{history.length > 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-2 text-center">
                <p className="text-2xl font-bold">{fmtPt(avg)}<span className="text-sm font-normal text-indigo-200">/{grille.totalPoints}</span></p>
                <p className="text-[11px] text-indigo-200">moyenne</p>
              </div>
              {jury?.juryNumber && (
                <div className="bg-white/15 rounded-lg px-3 py-2 text-center">
                  <p className="text-2xl font-bold">J{jury.juryNumber}</p>
                  <p className="text-[11px] text-indigo-200">jury</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-5 space-y-3">
          {!hasHistory && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Bienvenue ! Commencez par évaluer vos candidats ou consultez les résultats.
            </p>
          )}

          {/* Évaluation */}
          <button
            onClick={onStartEvaluation}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-2 border-indigo-200 dark:border-indigo-700 transition-colors group"
          >
            <div className="p-3 bg-indigo-600 rounded-xl text-white shrink-0">
              <ClipboardCheck size={22} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {hasHistory ? 'Continuer les évaluations' : 'Démarrer une séance'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {hasHistory
                  ? 'Évaluer le prochain candidat'
                  : 'Configurer le jury et commencer'}
              </p>
            </div>
            <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Résultats */}
          <button
            onClick={onViewResults}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors group"
          >
            <div className="p-3 bg-emerald-600 rounded-xl text-white shrink-0">
              <Trophy size={22} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Résultats du jury
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {hasHistory
                  ? `${history.length} candidat${history.length > 1 ? 's' : ''} · Bilan, exports PDF/CSV`
                  : 'Bilan, exports PDF/CSV, statistiques'}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Analyse */}
          <button
            onClick={onViewAnalyse}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors group"
          >
            <div className="p-3 bg-blue-600 rounded-xl text-white shrink-0">
              <BarChart3 size={22} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Comparer les candidats
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Comparer les candidats, synthèse multi-jury
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
            Les données sont synchronisées avec le serveur
          </p>
        </div>
      </div>
    </div>
  );
};
