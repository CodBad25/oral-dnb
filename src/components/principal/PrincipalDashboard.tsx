import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun, Loader2, RefreshCw, Globe, Users, BarChart3, GitCompare } from 'lucide-react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { dbGetAllEvaluations } from '@/lib/supabase-storage';
import { cn } from '@/lib/utils';
import { QuickStats } from '@/components/resultats/QuickStats';
import { CriteriaMeanBars } from '@/components/resultats/CriteriaMeanBars';
import { MasteryPies } from '@/components/resultats/MasteryPies';
import { CandidateRanking } from '@/components/resultats/CandidateRanking';
import { ExportSection } from '@/components/resultats/ExportSection';
import { HarmonizationView } from '@/components/admin/HarmonizationView';
import { CompareTab } from '@/components/analyse/CompareTab';

type Tab = 'global' | 'jury' | 'harmonisation' | 'comparaisons';

interface PrincipalDashboardProps {
  onSignOut: () => void;
}

export const PrincipalDashboard = ({ onSignOut }: PrincipalDashboardProps) => {
  const [allEvaluations, setAllEvaluations] = useState<(EvaluationState & { _dbId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [selectedJury, setSelectedJury] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const fetchData = async () => {
    setLoading(true);
    const data = await dbGetAllEvaluations();
    setAllEvaluations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const juryNumbers = [...new Set(allEvaluations.map((e) => e.jury.juryNumber).filter(Boolean))].sort();

  const filteredHistory = selectedJury
    ? allEvaluations.filter((e) => e.jury.juryNumber === selectedJury)
    : allEvaluations;

  const tabs: { key: Tab; label: string; shortLabel: string; icon: typeof Globe }[] = [
    { key: 'global', label: 'Vue globale', shortLabel: 'Global', icon: Globe },
    { key: 'jury', label: 'Par jury', shortLabel: 'Jurys', icon: Users },
    { key: 'harmonisation', label: 'Harmonisation', shortLabel: 'Harmo.', icon: BarChart3 },
    { key: 'comparaisons', label: 'Comparaisons', shortLabel: 'Comparer', icon: GitCompare },
  ];

  const defaultJury = {
    prof1Nom: 'Principal', prof1Prenom: '', prof2Nom: '', prof2Prenom: '',
    juryNumber: 'tous', date: '', salle: '',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Principal — Oral DNB 2026
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {allEvaluations.length} candidat{allEvaluations.length > 1 ? 's' : ''} · {juryNumbers.length} jury{juryNumbers.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              title="Actualiser"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Mode sombre"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700" />}
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

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-1">
            {tabs.map(({ key, label, shortLabel, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key !== 'jury') setSelectedJury(null);
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === key
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : allEvaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400 dark:text-gray-500">
          <Users size={48} strokeWidth={1.5} />
          <p className="text-lg font-semibold">Aucune évaluation</p>
          <p className="text-sm">Les jurys n'ont pas encore saisi de candidats.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Vue globale */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              <QuickStats history={allEvaluations} />
              <ExportSection jury={defaultJury} history={allEvaluations} />
              <CriteriaMeanBars history={allEvaluations} />
              <MasteryPies history={allEvaluations} />
              <CandidateRanking history={allEvaluations} showJury />
            </div>
          )}

          {/* Par jury */}
          {activeTab === 'jury' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedJury(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    !selectedJury
                      ? "bg-teal-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  Tous ({allEvaluations.length})
                </button>
                {juryNumbers.map((jn) => {
                  const count = allEvaluations.filter((e) => e.jury.juryNumber === jn).length;
                  return (
                    <button
                      key={jn}
                      onClick={() => setSelectedJury(jn)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        selectedJury === jn
                          ? "bg-teal-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      Jury {jn} ({count})
                    </button>
                  );
                })}
              </div>

              {filteredHistory.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-10">
                  Aucune évaluation pour ce jury.
                </p>
              ) : (
                <div className="space-y-6">
                  <QuickStats history={filteredHistory} />
                  <CriteriaMeanBars history={filteredHistory} />
                  <MasteryPies history={filteredHistory} />
                  <CandidateRanking history={filteredHistory} />
                </div>
              )}
            </div>
          )}

          {/* Harmonisation */}
          {activeTab === 'harmonisation' && (
            <HarmonizationView evaluations={allEvaluations} juryNumbers={juryNumbers} />
          )}

          {/* Comparaisons */}
          {activeTab === 'comparaisons' && (
            <div style={{ height: 'calc(100vh - 200px)' }}>
              <CompareTab candidates={allEvaluations} showJury />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
