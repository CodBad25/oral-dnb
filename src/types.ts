export type JuryInfo = {
  prof1Nom: string;
  prof1Prenom: string;
  prof2Nom: string;
  prof2Prenom: string;
  juryNumber: string;
  date: string;
  salle: string;
};

export type CandidateInfo = {
  nom: string;
  prenom: string;
  classe: string;
  horaire: string;
  sujet: string;
};

// ── Import / Export types ──

export type JuryExportPayload = {
  version: 1;
  exportDate: string;
  jury: JuryInfo;
  candidates: import('@/hooks/useEvaluation').EvaluationState[];
};

export type ImportedJury = {
  id: string;
  importDate: string;
  payload: JuryExportPayload;
};
