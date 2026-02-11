import { useEffect, useState } from 'react';
import type { JuryInfo, CandidateInfo } from '@/types';
import { saveCurrentEvaluation, loadCurrentEvaluation, saveToHistory, updateHistoryEntry, saveJuryDefaults, loadJuryDefaults, getHistory } from '@/lib/storage';

export type TimerData = {
  expectedSeconds: number;
  actualSeconds: number;
};

export type EvaluationState = {
  currentStep: number;
  jury: JuryInfo;
  candidate: CandidateInfo;
  scores: Record<string, number>;
  comments: string;
  timers?: {
    expose?: TimerData;
    entretien?: TimerData;
  };
};

const TOTAL_STEPS = 6;

const initialState: EvaluationState = {
  currentStep: 1,
  jury: {
    prof1Nom: '',
    prof1Prenom: '',
    prof2Nom: '',
    prof2Prenom: '',
    juryNumber: '',
    date: '',
    salle: '',
  },
  candidate: {
    nom: '',
    prenom: '',
    classe: '',
    horaire: '',
    sujet: '',
  },
  scores: {},
  comments: '',
};

const loadInitialState = (): EvaluationState => {
  const loaded = loadCurrentEvaluation();
  if (loaded) {
    // Merge with initialState to handle new fields added after save
    return {
      ...initialState,
      ...loaded,
      jury: { ...initialState.jury, ...loaded.jury },
      candidate: { ...initialState.candidate, ...loaded.candidate },
    };
  }
  const savedJury = loadJuryDefaults();
  if (savedJury) {
    return { ...initialState, jury: { ...initialState.jury, ...savedJury } };
  }
  return initialState;
};

export const useEvaluation = () => {
  const [state, setState] = useState<EvaluationState>(loadInitialState);

  useEffect(() => {
    saveCurrentEvaluation(state);
  }, [state]);

  const setJury = (jury: Partial<JuryInfo>) => {
    setState((prev) => {
      const updated = { ...prev.jury, ...jury };
      saveJuryDefaults(updated);
      return { ...prev, jury: updated };
    });
  };

  const setCandidate = (candidate: Partial<CandidateInfo>) => {
    setState((prev) => ({
      ...prev,
      candidate: { ...prev.candidate, ...candidate },
    }));
  };

  const setScore = (criterionId: string, points: number) => {
    setState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [criterionId]: points,
      },
    }));
  };

  const setComments = (comments: string) => {
    setState((prev) => ({
      ...prev,
      comments,
    }));
  };

  const setTimerData = (key: 'expose' | 'entretien', expectedSeconds: number, actualSeconds: number) => {
    setState((prev) => ({
      ...prev,
      timers: {
        ...prev.timers,
        [key]: { expectedSeconds, actualSeconds },
      },
    }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS),
    }));
  };

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
    }));
  };

  const getSectionTotal = (sectionId: string): number => {
    const prefix = `${sectionId}-`;
    return Object.entries(state.scores)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((sum, [, points]) => sum + (points || 0), 0);
  };

  const getTotal = (): number => {
    return Object.values(state.scores).reduce((sum, points) => sum + (points || 0), 0);
  };

  const resetForNextCandidate = () => {
    saveToHistory(state);
    setState((prev) => ({
      ...prev,
      currentStep: 2,
      candidate: {
        nom: '',
        prenom: '',
        classe: '',
        horaire: '',
        sujet: '',
      },
      scores: {},
      comments: '',
      timers: {},
    }));
  };

  const loadFromHistory = (index: number) => {
    const history = getHistory();
    if (index >= 0 && index < history.length) {
      const entry = history[index];
      setState({
        ...initialState,
        ...entry,
        jury: { ...initialState.jury, ...entry.jury },
        candidate: { ...initialState.candidate, ...entry.candidate },
        currentStep: 5,
      });
    }
  };

  const restoreState = (saved: EvaluationState) => {
    setState(saved);
  };

  const saveBackToHistory = (index: number) => {
    updateHistoryEntry(index, state);
  };

  return {
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
  };
};
