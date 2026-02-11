import { useEffect, useState } from 'react';
import { Moon, Sun, Users, ArrowLeft, Save, Download, Pencil, Trophy, ClipboardCheck, GitCompare, LogOut, Loader2 } from 'lucide-react';
import { useEvaluation } from '@/hooks/useEvaluation';
import { useHistory } from '@/contexts/HistoryContext';
import { grille } from '@/data/grille-2026';
import type { EvaluationState } from '@/hooks/useEvaluation';
import type { Profile } from '@/lib/supabase';
import { StepIndicator } from '@/components/StepIndicator';
import { JuryForm } from '@/components/JuryForm';
import { CandidateForm } from '@/components/CandidateForm';
import { Timer } from '@/components/Timer';
import { EvaluationGrid } from '@/components/EvaluationGrid';
import { FloatingScoreBar } from '@/components/FloatingScoreBar';
import { Summary } from '@/components/Summary';
import { cn } from '@/lib/utils';
import { exportCSV, exportAllPDF } from '@/lib/export';
import { ResultatsPage } from '@/components/resultats/ResultatsPage';
import { CompareTab } from '@/components/analyse/CompareTab';
import { WelcomeModal } from '@/components/WelcomeModal';

type AppView = 'evaluation' | 'resultats' | 'analyse';

const NAV_ITEMS: { key: AppView; label: string; icon: typeof ClipboardCheck }[] = [
  { key: 'evaluation', label: 'Évaluation', icon: ClipboardCheck },
  { key: 'resultats', label: 'Résultats', icon: Trophy },
  { key: 'analyse', label: 'Comparer', icon: GitCompare },
];

interface JuryAppProps {
  profile: Profile;
  onSignOut: () => void;
}

export default function JuryApp({ profile, onSignOut }: JuryAppProps) {
  const { history, loading: historyLoading } = useHistory();
  const {
    state,
    setJury,
    setCandidate,
    setScore,
    setComments,
    nextStep,
    prevStep,
    goToStep,
    getSectionTotal,
    getTotal,
    resetForNextCandidate,
    setTimerData,
    loadFromHistory,
    restoreState,
    saveBackToHistory,
  } = useEvaluation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [appView, setAppView] = useState<AppView>('evaluation');
  const [evalSection, setEvalSection] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingDbId, setViewingDbId] = useState<string | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [savedState, setSavedState] = useState<EvaluationState | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (state.currentStep === 5) {
      setEvalSection(0);
    }
  }, [state.currentStep]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const candidateInfo =
    state.candidate.prenom && state.candidate.nom
      ? `${state.candidate.prenom} ${state.candidate.nom} - ${state.candidate.classe}`
      : undefined;

  const section1Total = getSectionTotal('1');
  const section2Total = getSectionTotal('2');
  const total = getTotal();

  const isEvaluationStep = state.currentStep === 5;
  const isViewingHistory = viewingDbId !== null;

  const currentSectionCriteria = isEvaluationStep ? grille.sections[evalSection].criteria : [];
  const allCriteriaScored = currentSectionCriteria.every((c) => state.scores[c.id] != null);

  const handleViewCandidate = (entry: EvaluationState & { _dbId?: string }) => {
    if (!isViewingHistory) {
      setSavedState({ ...state });
    }
    setViewingDbId(entry._dbId || null);
    setIsEditingHistory(false);
    loadFromHistory(entry);
    setShowHistory(false);
  };

  const handleReturnToCurrent = () => {
    if (savedState) {
      restoreState(savedState);
    }
    setViewingDbId(null);
    setIsEditingHistory(false);
    setSavedState(null);
  };

  const handleSaveAndReturn = () => {
    saveBackToHistory();
    handleReturnToCurrent();
  };

  // Whether bottom bar should be hidden (during evaluation scoring/summary to avoid conflict with action bar)
  const hideBottomNav = showWelcome || (appView === 'evaluation' && state.currentStep >= 5);

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 transition-colors ${appView === 'resultats' || appView === 'analyse' || state.currentStep >= 5 ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {showWelcome && (
        <WelcomeModal
          onStartEvaluation={() => {
            setAppView('evaluation');
            setShowWelcome(false);
          }}
          onViewResults={() => {
            setAppView('resultats');
            setShowWelcome(false);
          }}
          onViewAnalyse={() => {
            setAppView('analyse');
            setShowWelcome(false);
          }}
        />
      )}

      {/* Header — simplified, no nav tabs */}
      <header className={cn("bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50", showWelcome && "invisible")}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            Oral DNB 2026
          </h1>
          <div className="flex items-center gap-1.5">
            {candidateInfo && state.currentStep >= 3 && (
              <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mr-2">
                {candidateInfo}
              </span>
            )}
            {appView === 'evaluation' && isViewingHistory && (
              isEditingHistory ? (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-medium">
                  Modification
                </span>
              ) : (
                <button
                  onClick={() => setIsEditingHistory(true)}
                  className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded font-medium hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                >
                  <Pencil size={10} />
                  Modifier
                </button>
              )
            )}
            {appView === 'evaluation' && history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-2 rounded-lg transition-colors relative",
                  showHistory
                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
                title="Candidats précédents"
              >
                <Users size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {history.length}
                </span>
              </button>
            )}
            <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600 pl-2 ml-1">
              Jury {profile.jury_number || '?'}
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Mode sombre"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-gray-700" />
              )}
            </button>
            <button
              onClick={onSignOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* History panel */}
        {appView === 'evaluation' && showHistory && (() => {
          const totals = history.map((e) => Object.values(e.scores).reduce((a, b) => a + b, 0));
          const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
          const min = totals.length > 0 ? Math.min(...totals) : 0;
          const max = totals.length > 0 ? Math.max(...totals) : 0;
          const fmtPt = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');
          return (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Candidats précédents
                </p>
                <div className="flex items-center gap-3">
                  {totals.length > 1 && (
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Moy : <strong className="text-gray-700 dark:text-gray-200">{fmtPt(avg)}</strong></span>
                      <span>Min : <strong className="text-gray-700 dark:text-gray-200">{fmtPt(min)}</strong></span>
                      <span>Max : <strong className="text-gray-700 dark:text-gray-200">{fmtPt(max)}</strong></span>
                    </div>
                  )}
                  <button
                    onClick={() => exportAllPDF(history)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium"
                  >
                    <Download size={12} />
                    Tous PDF
                  </button>
                  <button
                    onClick={() => exportCSV(history)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                  >
                    <Download size={12} />
                    CSV
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((entry) => {
                  const entryTotal = Object.values(entry.scores).reduce((a, b) => a + b, 0);
                  const isViewing = viewingDbId === entry._dbId;
                  return (
                    <button
                      key={entry._dbId || `${entry.candidate.nom}-${entry.candidate.prenom}`}
                      onClick={() => handleViewCandidate(entry)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm transition-colors text-left",
                        isViewing
                          ? "bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {entry.candidate.prenom} {entry.candidate.nom}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {fmtPt(entryTotal)}/{grille.totalPoints}
                      </span>
                    </button>
                  );
                })}
              </div>
              {isViewingHistory && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveAndReturn}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Save size={14} />
                    Sauvegarder et revenir
                  </button>
                  <button
                    onClick={handleReturnToCurrent}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Revenir sans sauvegarder
                  </button>
                </div>
              )}
            </div>
          </div>);
        })()}
      </header>

      {/* Main content */}
      {showWelcome ? null : appView === 'resultats' ? (
        <div style={{ height: 'calc(100vh - 56px - 64px)' }}>
          <ResultatsPage jury={state.jury} />
        </div>
      ) : appView === 'analyse' ? (
        <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 56px - 64px)' }}>
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 py-4 h-full">
              <CompareTab candidates={history} />
            </div>
          </div>
        </div>
      ) : state.currentStep >= 5 ? (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
          <div className="max-w-6xl mx-auto w-full px-4 pt-2">
            <StepIndicator currentStep={state.currentStep} totalSteps={6} onGoToStep={goToStep} compact />
          </div>

          <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full px-4">
            {isEvaluationStep && (
              <EvaluationGrid
                scores={state.scores}
                onScoreChange={setScore}
                sectionIndex={evalSection}
                onSectionChange={setEvalSection}
                readOnly={isViewingHistory && !isEditingHistory}
              />
            )}

            {state.currentStep === 6 && (
              <Summary
                jury={state.jury}
                candidate={state.candidate}
                scores={state.scores}
                section1Total={section1Total}
                section2Total={section2Total}
                total={total}
                comments={state.comments}
                onCommentsChange={setComments}
                onNextCandidate={resetForNextCandidate}
                onCloseSession={() => {
                  resetForNextCandidate();
                  setAppView('resultats');
                }}
                onPrevStep={prevStep}
                timers={state.timers}
                fullState={state}
              />
            )}
          </div>

          {isEvaluationStep && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <button
                  onClick={() => {
                    if (evalSection === 0) prevStep();
                    else setEvalSection(0);
                  }}
                  className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  Précédent
                </button>
                <FloatingScoreBar scores={state.scores} />
                <button
                  onClick={() => {
                    if (!allCriteriaScored) return;
                    if (evalSection < grille.sections.length - 1) setEvalSection(evalSection + 1);
                    else nextStep();
                  }}
                  disabled={!allCriteriaScored}
                  className={cn(
                    "px-5 py-2 font-semibold rounded-lg transition-colors text-sm",
                    allCriteriaScored
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  )}
                >
                  {!allCriteriaScored
                    ? `${currentSectionCriteria.filter((c) => state.scores[c.id] == null).length} critère(s) restant(s)`
                    : evalSection < grille.sections.length - 1 ? "Section suivante" : "Voir le résumé"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
          <StepIndicator currentStep={state.currentStep} totalSteps={6} onGoToStep={goToStep} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
            {state.currentStep === 1 && (
              <JuryForm
                jury={state.jury}
                onChange={setJury}
                onNext={nextStep}
              />
            )}

            {state.currentStep === 2 && (
              <CandidateForm
                candidate={state.candidate}
                onChange={setCandidate}
                onNext={nextStep}
              />
            )}

            {state.currentStep === 3 && (
              <Timer
                title="Exposé du Candidat"
                initialMinutes={5}
                onComplete={(elapsed) => {
                  setTimerData('expose', 5 * 60, elapsed);
                  nextStep();
                }}
                candidateInfo={candidateInfo}
              />
            )}

            {state.currentStep === 4 && (
              <Timer
                title="Entretien avec le Jury"
                initialMinutes={10}
                onComplete={(elapsed) => {
                  setTimerData('entretien', 10 * 60, elapsed);
                  nextStep();
                }}
                candidateInfo={candidateInfo}
              />
            )}
          </div>
        </main>
      )}

      {/* Bottom Navigation Bar */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto flex justify-around items-center h-16">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const isActive = appView === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setAppView(key);
                    setShowHistory(false);
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors min-w-[72px]",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {isActive && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={cn("text-[11px]", isActive ? "font-bold" : "font-medium")}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
