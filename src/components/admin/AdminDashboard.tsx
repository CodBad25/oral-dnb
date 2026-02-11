import { useEffect, useState, useRef } from 'react';
import { LogOut, Moon, Sun, Loader2, RefreshCw, UserPlus, Upload, Check, AlertCircle } from 'lucide-react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import type { JuryExportPayload } from '@/types';
import { dbGetAllEvaluations } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AccountManager } from './AccountManager';

type Tab = 'comptes' | 'import';

interface AdminDashboardProps {
  onSignOut: () => void;
}

export const AdminDashboard = ({ onSignOut }: AdminDashboardProps) => {
  const [evalCount, setEvalCount] = useState(0);
  const [juryCount, setJuryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('comptes');
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | undefined>(undefined);

  const fetchCounts = async () => {
    setLoading(true);
    const data = await dbGetAllEvaluations();
    setEvalCount(data.length);
    setJuryCount([...new Set(data.map((e: EvaluationState) => e.jury.juryNumber).filter(Boolean))].length);
    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();
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

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('jury_number', juryNumber)
        .limit(1);

      const { data: { user } } = await supabase.auth.getUser();
      const userId = profiles?.[0]?.id || user?.id;

      if (!userId) {
        setImportMsg({ type: 'error', text: "Impossible de déterminer l'utilisateur." });
        setImporting(false);
        return;
      }

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
        fetchCounts();
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: `Erreur de lecture : ${err instanceof Error ? err.message : 'fichier invalide'}` });
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tabs: { key: Tab; label: string; icon: typeof UserPlus }[] = [
    { key: 'comptes', label: 'Comptes', icon: UserPlus },
    { key: 'import', label: 'Import JSON', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Administration — Oral DNB 2026
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {evalCount} évaluation{evalCount > 1 ? 's' : ''} · {juryCount} jury{juryCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCounts}
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
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-gray-700 text-white"
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Comptes */}
        {activeTab === 'comptes' && <AccountManager />}

        {/* Import JSON */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {importMsg && (
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
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Importer des évaluations
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Sélectionnez un fichier JSON exporté depuis l'application pour importer les évaluations d'un jury.
              </p>

              <input
                ref={fileInputRef as React.RefObject<HTMLInputElement>}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <button
                onClick={() => (fileInputRef.current as HTMLInputElement | undefined)?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                Choisir un fichier JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
