import { useEffect, useState } from 'react';
import { Moon, Sun, Users, ArrowLeft, Save, Download, BarChart3, Pencil, Trophy, ClipboardCheck } from 'lucide-react';
import { useEvaluation } from '@/hooks/useEvaluation';
import { grille } from '@/data/grille-2026';
import { getHistory } from '@/lib/storage';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { StepIndicator } from '@/components/StepIndicator';
import { JuryForm } from '@/components/JuryForm';
import { CandidateForm } from '@/components/CandidateForm';
import { Timer } from '@/components/Timer';
import { EvaluationGrid } from '@/components/EvaluationGrid';
import { FloatingScoreBar } from '@/components/FloatingScoreBar';
import { Summary } from '@/components/Summary';
import { cn } from '@/lib/utils';
import { exportCSV, exportAllPDF } from '@/lib/export';
import { AnalysePage } from '@/components/analyse/AnalysePage';
import { ResultatsPage } from '@/components/resultats/ResultatsPage';
import { WelcomeModal } from '@/components/WelcomeModal';

export default function App() {
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
  const [appView, setAppView] = useState<'evaluation' | 'resultats' | 'analyse'>('evaluation');
  const [evalSection, setEvalSection] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [savedState, setSavedState] = useState<EvaluationState | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Reset to Section 1 when entering the evaluation step
  useEffect(() => {
    if (state.currentStep === 5) {
      setEvalSection(0);
    }
  }, [state.currentStep]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const candidateInfo =
    state.candidate.prenom && state.candidate.nom
      ? `${state.candidate.prenom} ${state.candidate.nom} - ${state.candidate.classe}`
      : undefined;

  const section1Total = getSectionTotal('1');
  const section2Total = getSectionTotal('2');
  const total = getTotal();

  const isEvaluationStep = state.currentStep === 5;
  const isViewingHistory = viewingHistoryIndex !== null;

  const currentSectionCriteria = isEvaluationStep ? grille.sections[evalSection].criteria : [];
  const allCriteriaScored = currentSectionCriteria.every((c) => state.scores[c.id] != null);

  const history = getHistory();

  const handleViewCandidate = (index: number) => {
    if (!isViewingHistory) {
      // Save current work before switching
      setSavedState({ ...state });
    }
    setViewingHistoryIndex(index);
    setIsEditingHistory(false);
    loadFromHistory(index);
    setShowHistory(false);
  };

  const handleReturnToCurrent = () => {
    if (savedState) {
      restoreState(savedState);
    }
    setViewingHistoryIndex(null);
    setIsEditingHistory(false);
    setSavedState(null);
  };

  const handleSaveAndReturn = () => {
    if (viewingHistoryIndex !== null) {
      saveBackToHistory(viewingHistoryIndex);
    }
    handleReturnToCurrent();
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 transition-colors ${appView !== 'evaluation' || state.currentStep >= 5 ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
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

      {/* Header */}
      <header className={cn("bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50", showWelcome && "invisible")}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Évaluation Orale DNB 2026
          </h1>
          <div className="flex items-center gap-2">
            {candidateInfo && state.currentStep >= 3 && (
              <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mr-2">
                {candidateInfo}
              </span>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
                {([
                  { key: 'evaluation' as const, label: 'Évaluation', icon: ClipboardCheck },
                  { key: 'resultats' as const, label: 'Résultats', icon: Trophy },
                  { key: 'analyse' as const, label: 'Analyse', icon: BarChart3 },
                ]).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAppView(key);
                      setShowHistory(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      appView === key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
            </div>
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
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Mode sombre"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
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
                {history.map((entry, i) => {
                  const isViewing = viewingHistoryIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleViewCandidate(i)}
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
                        {fmtPt(totals[i])}/{grille.totalPoints}
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
      {showWelcome ? null : appView === 'analyse' ? (
        <AnalysePage />
      ) : appView === 'resultats' ? (
        <ResultatsPage jury={state.jury} />
      ) : state.currentStep >= 5 ? (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
          {/* Compact step indicator */}
          <div className="max-w-6xl mx-auto w-full px-4 pt-2">
            <StepIndicator currentStep={state.currentStep} totalSteps={6} onGoToStep={goToStep} compact />
          </div>

          {/* Content - fills remaining space */}
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

          {/* Navigation bar - evaluation step only */}
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
        <main className="max-w-6xl mx-auto px-4 py-8">
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

    </div>
  );
}
