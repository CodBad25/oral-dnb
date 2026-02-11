import { supabase } from './supabase';
import type { EvaluationState } from '@/hooks/useEvaluation';

// ── Types pour la DB ──

export type DbEvaluation = {
  id: string;
  user_id: string;
  jury_number: string;
  jury_info: EvaluationState['jury'];
  candidate_info: EvaluationState['candidate'];
  scores: Record<string, number>;
  comments: string;
  timers: EvaluationState['timers'] | null;
  created_at: string;
  updated_at: string;
};

// ── Conversions DB ↔ EvaluationState ──

const toEvaluationState = (row: DbEvaluation): EvaluationState & { _dbId: string } => ({
  _dbId: row.id,
  currentStep: 6,
  jury: row.jury_info,
  candidate: row.candidate_info,
  scores: row.scores,
  comments: row.comments || '',
  timers: row.timers ?? undefined,
});

// ── Jury CRUD ──

export const dbSaveEvaluation = async (
  userId: string,
  juryNumber: string,
  state: EvaluationState
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      user_id: userId,
      jury_number: juryNumber,
      jury_info: state.jury,
      candidate_info: state.candidate,
      scores: state.scores,
      comments: state.comments || '',
      timers: state.timers ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('dbSaveEvaluation error:', error);
    return null;
  }
  return data.id;
};

export const dbUpdateEvaluation = async (
  dbId: string,
  state: EvaluationState
): Promise<boolean> => {
  const { error } = await supabase
    .from('evaluations')
    .update({
      jury_info: state.jury,
      candidate_info: state.candidate,
      scores: state.scores,
      comments: state.comments || '',
      timers: state.timers ?? null,
    })
    .eq('id', dbId);

  if (error) {
    console.error('dbUpdateEvaluation error:', error);
    return false;
  }
  return true;
};

export const dbDeleteEvaluation = async (dbId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', dbId);

  if (error) {
    console.error('dbDeleteEvaluation error:', error);
    return false;
  }
  return true;
};

export const dbGetHistory = async (
  userId: string
): Promise<(EvaluationState & { _dbId: string })[]> => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('dbGetHistory error:', error);
    return [];
  }
  return (data as DbEvaluation[]).map(toEvaluationState);
};

// ── Brouillon (current_evaluations) ──

export const dbSaveCurrentEvaluation = async (
  userId: string,
  state: EvaluationState
): Promise<void> => {
  const { error } = await supabase
    .from('current_evaluations')
    .upsert({
      user_id: userId,
      state,
    });

  if (error) {
    console.error('dbSaveCurrentEvaluation error:', error);
  }
};

export const dbLoadCurrentEvaluation = async (
  userId: string
): Promise<EvaluationState | null> => {
  const { data, error } = await supabase
    .from('current_evaluations')
    .select('state')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('dbLoadCurrentEvaluation error:', error);
    }
    return null;
  }
  return data.state as EvaluationState;
};

export const dbClearCurrentEvaluation = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('current_evaluations')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('dbClearCurrentEvaluation error:', error);
  }
};

// ── Admin: lecture de tous les jurys ──

export const dbGetAllEvaluations = async (): Promise<(EvaluationState & { _dbId: string })[]> => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('dbGetAllEvaluations error:', error);
    return [];
  }
  return (data as DbEvaluation[]).map(toEvaluationState);
};

export const dbGetEvaluationsByJury = async (
  juryNumber: string
): Promise<(EvaluationState & { _dbId: string })[]> => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('jury_number', juryNumber)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('dbGetEvaluationsByJury error:', error);
    return [];
  }
  return (data as DbEvaluation[]).map(toEvaluationState);
};

export const dbGetAllJuryNumbers = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('jury_number')
    .order('jury_number');

  if (error) {
    console.error('dbGetAllJuryNumbers error:', error);
    return [];
  }
  const unique = [...new Set((data as { jury_number: string }[]).map((r) => r.jury_number))];
  return unique;
};
