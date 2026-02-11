import { useState, useEffect } from 'react';
import type { ImportedJury, JuryExportPayload } from '@/types';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { getHistory } from '@/lib/storage';
import { loadJuryDefaults } from '@/lib/storage';

const STORAGE_KEY = 'oral-dnb-imported-juries';

export type TaggedCandidate = EvaluationState & { juryNumber: string };

const loadFromStorage = (): ImportedJury[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToStorage = (juries: ImportedJury[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(juries));
};

export const useImportedData = () => {
  const [importedJuries, setImportedJuries] = useState<ImportedJury[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(importedJuries);
  }, [importedJuries]);

  const addJury = (payload: JuryExportPayload): { success: boolean; error?: string } => {
    // Check for duplicate jury number
    const existing = importedJuries.find(
      (j) => j.payload.jury.juryNumber === payload.jury.juryNumber,
    );
    if (existing) {
      return {
        success: false,
        error: `Le jury ${payload.jury.juryNumber} a déjà été importé.`,
      };
    }

    const entry: ImportedJury = {
      id: crypto.randomUUID(),
      importDate: new Date().toISOString(),
      payload,
    };

    setImportedJuries((prev) => [...prev, entry]);
    return { success: true };
  };

  const removeJury = (id: string) => {
    setImportedJuries((prev) => prev.filter((j) => j.id !== id));
  };

  const getAllCandidates = (): TaggedCandidate[] => {
    const result: TaggedCandidate[] = [];

    // Local jury candidates
    const history = getHistory();
    const juryDefaults = loadJuryDefaults();
    const localJuryNumber = juryDefaults?.juryNumber || 'Local';
    for (const entry of history) {
      result.push({ ...entry, juryNumber: entry.jury?.juryNumber || localJuryNumber });
    }

    // Imported juries
    for (const imported of importedJuries) {
      const jNum = imported.payload.jury.juryNumber;
      for (const candidate of imported.payload.candidates) {
        result.push({ ...candidate, juryNumber: jNum });
      }
    }

    return result;
  };

  const hasImportedData = importedJuries.length > 0;

  return { importedJuries, addJury, removeJury, getAllCandidates, hasImportedData };
};
