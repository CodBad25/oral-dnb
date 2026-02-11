import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { JuryInfo } from '@/types';
import type { EvaluationState } from '@/hooks/useEvaluation';

export type SharedData = {
  jury: JuryInfo;
  candidates: EvaluationState[];
};

export function encodeShareURL(jury: JuryInfo, history: EvaluationState[]): string {
  const payload: SharedData = { jury, candidates: history };
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload));
  return `${window.location.origin}${window.location.pathname}#share=${compressed}`;
}

export function decodeShareURL(): SharedData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;
  try {
    const compressed = hash.slice('#share='.length);
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const data = JSON.parse(json) as SharedData;
    if (!data.jury || !Array.isArray(data.candidates)) return null;
    return data;
  } catch {
    return null;
  }
}
