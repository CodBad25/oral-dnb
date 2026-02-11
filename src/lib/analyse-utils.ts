import { grille } from '@/data/grille-2026';
import type { MasteryLevel } from '@/data/grille-2026';
import type { JuryExportPayload } from '@/types';

// ── Formatting ──

export const fmtPt = (v: number): string => {
  if (Number.isInteger(v)) return String(v);
  return String(v).replace('.', ',');
};

// ── Stats ──

export const computeMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const computeMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const computeDistribution = (
  totals: number[],
  ranges: [number, number][],
): number[] => {
  return ranges.map(([min, max]) =>
    totals.filter((t) => t >= min && t <= max).length,
  );
};

// ── Score helpers ──

export const getEvaluationTotal = (scores: Record<string, number>): number =>
  Object.values(scores).reduce((sum, pts) => sum + (pts || 0), 0);

export const getSectionTotalFromScores = (
  scores: Record<string, number>,
  sectionId: string,
): number => {
  const prefix = `${sectionId}-`;
  return Object.entries(scores)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((sum, [, pts]) => sum + (pts || 0), 0);
};

// ── Mastery level helpers ──

export const getLevelForScore = (
  levels: MasteryLevel[],
  score: number,
): MasteryLevel | null => {
  if (score === 0) return levels[0];
  return levels.find((l) => l.points === score) ?? null;
};

export const getMasteryColorForCriterion = (
  criterionId: string,
  score: number,
): MasteryLevel['color'] | null => {
  for (const section of grille.sections) {
    const criterion = section.criteria.find((c) => c.id === criterionId);
    if (criterion) {
      const level = getLevelForScore(criterion.levels, score);
      return level?.color ?? null;
    }
  }
  return null;
};

// ── Validation ──

export const validateImportPayload = (
  data: unknown,
): { valid: true; payload: JuryExportPayload } | { valid: false; error: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Le fichier ne contient pas de données valides.' };
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) {
    return { valid: false, error: 'Version du fichier non supportée.' };
  }

  if (!obj.jury || typeof obj.jury !== 'object') {
    return { valid: false, error: 'Informations du jury manquantes.' };
  }

  if (!Array.isArray(obj.candidates) || obj.candidates.length === 0) {
    return { valid: false, error: 'Aucun candidat trouvé dans le fichier.' };
  }

  // Basic validation of each candidate
  for (const c of obj.candidates) {
    if (!c.candidate || !c.scores || typeof c.scores !== 'object') {
      return { valid: false, error: 'Format de candidat invalide.' };
    }
  }

  return { valid: true, payload: data as JuryExportPayload };
};
