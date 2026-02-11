import type { EvaluationState } from '@/hooks/useEvaluation';

const CURRENT_KEY = 'oral-dnb-current';
const HISTORY_KEY = 'oral-dnb-history';
const JURY_KEY = 'oral-dnb-jury';

export const saveCurrentEvaluation = (state: EvaluationState): void => {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save current evaluation:', error);
  }
};

export const loadCurrentEvaluation = (): EvaluationState | null => {
  try {
    const data = localStorage.getItem(CURRENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load current evaluation:', error);
    return null;
  }
};

export const saveToHistory = (state: EvaluationState): void => {
  try {
    const history = getHistory();
    history.push(state);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = (): EvaluationState[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const updateHistoryEntry = (index: number, state: EvaluationState): void => {
  try {
    const history = getHistory();
    if (index >= 0 && index < history.length) {
      history[index] = state;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to update history entry:', error);
  }
};

export const clearCurrent = (): void => {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch (error) {
    console.error('Failed to clear current evaluation:', error);
  }
};

export const saveJuryDefaults = (jury: Record<string, string>): void => {
  try {
    localStorage.setItem(JURY_KEY, JSON.stringify(jury));
  } catch (error) {
    console.error('Failed to save jury defaults:', error);
  }
};

export const setHistory = (history: EvaluationState[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to set history:', error);
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(CURRENT_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(JURY_KEY);
  localStorage.removeItem('oral-dnb-imported-juries');
};

export const loadJuryDefaults = (): Record<string, string> | null => {
  try {
    const data = localStorage.getItem(JURY_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load jury defaults:', error);
    return null;
  }
};
