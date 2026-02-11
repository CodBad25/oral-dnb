import type { JuryInfo } from '@/types';
import type { EvaluationState } from '@/hooks/useEvaluation';
import type { TaggedCandidate } from '@/hooks/useImportedData';
import type { JuryExportPayload } from '@/types';
import { grille } from '@/data/grille-2026';
import { fmtPt, getEvaluationTotal, getSectionTotalFromScores } from '@/lib/analyse-utils';

// ── JSON Export ──

export const exportJuryJSON = (jury: JuryInfo, candidates: EvaluationState[]) => {
  const payload: JuryExportPayload = {
    version: 1,
    exportDate: new Date().toISOString(),
    jury,
    candidates,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `jury_${jury.juryNumber || 'x'}_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── CSV Classement Export ──

export const exportClassementCSV = (candidates: TaggedCandidate[]) => {
  const headers = [
    'Rang',
    'Nom',
    'Prenom',
    'Classe',
    'Sujet',
    'Jury',
    ...grille.sections.map((s) => `Total ${s.title}`),
    'Total',
  ];

  const escape = (v: string) => {
    if (v.includes(';') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  // Sort by total descending
  const sorted = [...candidates].sort(
    (a, b) => getEvaluationTotal(b.scores) - getEvaluationTotal(a.scores),
  );

  const rows = sorted.map((entry, i) => {
    const sectionTotals = grille.sections.map((s) =>
      fmtPt(getSectionTotalFromScores(entry.scores, String(s.id))),
    );
    const total = fmtPt(getEvaluationTotal(entry.scores));

    return [
      String(i + 1),
      entry.candidate.nom,
      entry.candidate.prenom,
      entry.candidate.classe,
      entry.candidate.sujet,
      entry.juryNumber,
      ...sectionTotals,
      total,
    ]
      .map(escape)
      .join(';');
  });

  const csv = [headers.map(escape).join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `classement_oral_dnb_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
