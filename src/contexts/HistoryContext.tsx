import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { dbGetHistory, dbSaveEvaluation, dbUpdateEvaluation, dbDeleteEvaluation } from '@/lib/supabase-storage';
import type { Profile } from '@/lib/supabase';

type HistoryEntry = EvaluationState & { _dbId?: string };

interface HistoryContextValue {
  history: HistoryEntry[];
  loading: boolean;
  addToHistory: (state: EvaluationState) => Promise<string | null>;
  updateEntry: (dbId: string, state: EvaluationState) => Promise<boolean>;
  deleteEntry: (dbId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export const useHistory = (): HistoryContextValue => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
};

interface HistoryProviderProps {
  profile: Profile;
  children: ReactNode;
}

export const HistoryProvider = ({ profile, children }: HistoryProviderProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    const data = await dbGetHistory(profile.id);
    setHistory(data);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = useCallback(async (state: EvaluationState): Promise<string | null> => {
    const dbId = await dbSaveEvaluation(profile.id, profile.jury_number || '', state);
    if (dbId) {
      setHistory((prev) => [...prev, { ...state, _dbId: dbId, currentStep: 6 }]);
    }
    return dbId;
  }, [profile.id, profile.jury_number]);

  const updateEntry = useCallback(async (dbId: string, state: EvaluationState): Promise<boolean> => {
    const ok = await dbUpdateEvaluation(dbId, state);
    if (ok) {
      setHistory((prev) =>
        prev.map((e) => (e._dbId === dbId ? { ...state, _dbId: dbId, currentStep: 6 } : e))
      );
    }
    return ok;
  }, []);

  const deleteEntry = useCallback(async (dbId: string): Promise<boolean> => {
    const ok = await dbDeleteEvaluation(dbId);
    if (ok) {
      setHistory((prev) => prev.filter((e) => e._dbId !== dbId));
    }
    return ok;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchHistory();
  }, [fetchHistory]);

  return (
    <HistoryContext.Provider value={{ history, loading, addToHistory, updateEntry, deleteEntry, refresh }}>
      {children}
    </HistoryContext.Provider>
  );
};
