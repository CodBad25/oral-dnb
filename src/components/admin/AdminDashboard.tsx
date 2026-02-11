import { useEffect, useState, useRef } from 'react';
import { LogOut, Moon, Sun, Loader2, RefreshCw, Globe, Users, BarChart3, UserPlus, Upload, Check, AlertCircle } from 'lucide-react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import type { JuryExportPayload } from '@/types';
import { dbGetAllEvaluations } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { QuickStats } from '@/components/resultats/QuickStats';
import { CriteriaMeanBars } from '@/components/resultats/CriteriaMeanBars';
import { MasteryPies } from '@/components/resultats/MasteryPies';
import { CandidateRanking } from '@/components/resultats/CandidateRanking';
import { ExportSection } from '@/components/resultats/ExportSection';
import { HarmonizationView } from './HarmonizationView';
import { AccountManager } from './AccountManager';

type Tab = 'global' | 'jury' | 'harmonisation' | 'comptes';

interface AdminDashboardProps {
  onSignOut: () => void;
}

export const AdminDashboard = ({ onSignOut }: AdminDashboardProps) => {
  const [allEvaluations, setAllEvaluations] = useState<(EvaluationState & { _dbId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [selectedJury, setSelectedJury] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text) as JuryExportPayload;

      if (!data.jury || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        setImportMsg({ type: 'error', text: 'Format JSON invalide : jury ou candidats manquants.' });
        setImporting(false);
        return;
      }

      const juryNumber = data.jury.juryNumber || '1';

      // Find the user_id for this jury number
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('jury_number', juryNumber)
        .limit(1);

      // Fallback: use current user if no matching jury profile
      const { data: { user } } = await supabase.auth.getUser();
      const userId = profiles?.[0]?.id || user?.id;

      if (!userId) {
        setImportMsg({ type: 'error', text: 'Impossible de déterminer l\'utilisateur.' });
        setImporting(false);
        return;
      }

      // Insert all candidates
      const rows = data.candidates.map((c) => ({
        user_id: userId,
        jury_number: juryNumber,
        jury_info: data.jury,
        candidate_info: c.candidate,
        scores: c.scores,
        comments: c.comments || '',
        timers: c.timers ?? null,
      }));

      const { error } = await supabase.from('evaluations').insert(rows);

      if (error) {
        setImportMsg({ type: 'error', text: `Erreur Supabase : ${error.message}` });
      } else {
        setImportMsg({ type: 'success', text: `${rows.length} candidat${rows.length > 1 ? 's' : ''} importé${rows.length > 1 ? 's' : ''} pour le Jury ${juryNumber}` });
        fetchData();
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: `Erreur de lecture : ${err instanceof Error ? err.message : 'fichier invalide'}` });
    }

    setImporting(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const juryNumbers = [...new Set(allEvaluations.map((e) => e.jury.juryNumber).filter(Boolean))].sort();

  const filteredHistory = selectedJury
    ? allEvaluations.filter((e) => e.jury.juryNumber === selectedJury)
    : allEvaluations;

  const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
    { key: 'global', label: 'Vue globale', icon: Globe },
    { key: 'jury', label: 'Par jury', icon: Users },
    { key: 'harmonisation', label: 'Harmonisation', icon: BarChart3 },
    { key: 'comptes', label: 'Comptes', icon: UserPlus },
  ];

  const defaultJury = {
    prof1Nom: 'Admin', prof1Prenom: '', prof2Nom: '', prof2Prenom: '',
    juryNumber: 'tous', date: '', salle: '',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Administration — Oral DNB 2026
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {allEvaluations.length} candidat{allEvaluations.length > 1 ? 's' : ''} · {juryNumbers.length} jury{juryNumbers.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import JSON */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Importer JSON
            </button>
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

        {/* Import message */}
        {importMsg && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
              importMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            )}>
              {importMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {importMsg.text}
              <button onClick={() => setImportMsg(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key !== 'jury') setSelectedJury(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : allEvaluations.length === 0 && activeTab !== 'comptes' ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400 dark:text-gray-500">
          <Users size={48} strokeWidth={1.5} />
          <p className="text-lg font-semibold">Aucune évaluation</p>
          <p className="text-sm">Importez un fichier JSON ou attendez les saisies des jurys.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors mt-2"
          >
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Importer un fichier JSON
          </button>
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
              {/* Jury selector chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedJury(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    !selectedJury
                      ? "bg-indigo-600 text-white"
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
                          ? "bg-indigo-600 text-white"
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

          {/* Comptes */}
          {activeTab === 'comptes' && (
            <AccountManager />
          )}
        </div>
      )}
    </div>
  );
};
