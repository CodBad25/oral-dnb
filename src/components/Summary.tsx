import type { FC } from 'react';
import { AlertTriangle, Check, FileDown } from 'lucide-react';
import type { JuryInfo, CandidateInfo } from '@/types';
import type { EvaluationState, TimerData } from '@/hooks/useEvaluation';
import { exportPDF } from '@/lib/export';
import { grille } from '@/data/grille-2026';
import type { MasteryLevel } from '@/data/grille-2026';
import { cn, formatDateFR } from '@/lib/utils';

interface SummaryProps {
  jury: JuryInfo;
  candidate: CandidateInfo;
  scores: Record<string, number>;
  section1Total: number;
  section2Total: number;
  total: number;
  comments: string;
  onCommentsChange: (comments: string) => void;
  onNextCandidate: () => void;
  onPrevStep: () => void;
  timers?: { expose?: TimerData; entretien?: TimerData };
  fullState: EvaluationState;
}

const formatPt = (v: number) => {
  if (Number.isInteger(v)) return String(v);
  return String(v).replace('.', ',');
};

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const getLevelForScore = (levels: MasteryLevel[], score: number): MasteryLevel | null => {
  if (score === 0) return levels[0];
  return levels.find((l) => l.points === score) ?? null;
};

const levelLabelColor: Record<MasteryLevel['color'], string> = {
  insufficient: 'text-red-600 dark:text-red-400',
  fragile: 'text-orange-600 dark:text-orange-400',
  satisfactory: 'text-blue-600 dark:text-blue-400',
  excellent: 'text-green-600 dark:text-green-400',
};

const levelBgColor: Record<MasteryLevel['color'], string> = {
  insufficient: 'bg-red-50 dark:bg-red-950',
  fragile: 'bg-orange-50 dark:bg-orange-950',
  satisfactory: 'bg-blue-50 dark:bg-blue-950',
  excellent: 'bg-green-50 dark:bg-green-950',
};

export const Summary: FC<SummaryProps> = ({
  jury,
  candidate,
  scores,
  section1Total,
  section2Total,
  total,
  comments,
  onCommentsChange,
  onNextCandidate,
  onPrevStep,
  timers,
  fullState,
}) => {
  const getTotalColor = () => {
    if (total < 8) return 'text-red-600 dark:text-red-400';
    if (total < 12) return 'text-orange-600 dark:text-orange-400';
    if (total < 16) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTotalBg = () => {
    if (total < 8) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    if (total < 12) return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
    if (total < 16) return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
  };

  const sectionTotals = [section1Total, section2Total];

  const TimerInfo: FC<{ label: string; data?: TimerData }> = ({ label, data }) => {
    if (!data || data.actualSeconds === 0) return null;
    const isOver = data.actualSeconds > data.expectedSeconds;
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-xs px-2 py-1 rounded",
        isOver ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
      )}>
        {isOver ? <AlertTriangle size={12} /> : <Check size={12} />}
        <span className="font-medium">{label}</span>
        <span>{formatDuration(data.actualSeconds)} / {formatDuration(data.expectedSeconds)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Candidate info + timers */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {candidate.prenom} {candidate.nom}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {candidate.classe} — {candidate.horaire || '—'} — {candidate.sujet}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Jury {jury.juryNumber} · Salle {jury.salle} · {formatDateFR(jury.date)}
        </span>
        <div className="flex gap-2 ml-auto">
          <TimerInfo label="Exposé" data={timers?.expose} />
          <TimerInfo label="Entretien" data={timers?.entretien} />
        </div>
      </div>

      {/* Sections side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {grille.sections.map((section, si) => (
          <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {section.title}
            </h3>
            {section.criteria.map((criterion) => {
              const score = scores[criterion.id] ?? 0;
              const level = getLevelForScore(criterion.levels, score);
              return (
                <div
                  key={criterion.id}
                  className={cn(
                    "flex items-baseline gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0",
                    level && levelBgColor[level.color],
                    "px-2 -mx-2 rounded"
                  )}
                >
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 leading-tight">
                    {criterion.title}
                  </span>
                  {level && (
                    <span className={cn("text-[10px] font-medium whitespace-nowrap", levelLabelColor[level.color])}>
                      {level.name.replace('Maîtrise ', '').replace('Très bonne m', 'Très bonne m')}
                    </span>
                  )}
                  <span className="text-sm font-semibold tabular-nums whitespace-nowrap text-gray-900 dark:text-white">
                    {formatPt(score)}
                    <span className="text-gray-400 font-normal text-xs"> /{criterion.maxPoints}</span>
                  </span>
                </div>
              );
            })}
            <div className="flex justify-between items-baseline pt-2 mt-1.5 border-t-2 border-gray-200 dark:border-gray-600">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Sous-total</span>
              <span className="font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                {formatPt(sectionTotals[si])}
                <span className="text-gray-400 font-normal text-xs"> /{section.maxPoints}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total + Comments row */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 mb-3">
        <div className={cn('rounded-lg border-2 px-8 py-4 flex flex-col items-center justify-center', getTotalBg())}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Note finale
          </p>
          <p className={cn('text-5xl font-bold tabular-nums', getTotalColor())}>
            {formatPt(total)}
          </p>
          <p className="text-lg text-gray-400 dark:text-gray-500 font-medium">
            / {grille.totalPoints}
          </p>
        </div>
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            Remarques
          </label>
          <textarea
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            className="flex-1 min-h-[60px] w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            placeholder="Ajouter des remarques sur le candidat..."
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onPrevStep}
          className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          Précédent
        </button>
        <button
          onClick={() => exportPDF(fullState)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <FileDown size={16} />
          PDF
        </button>
        <button
          onClick={onNextCandidate}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Candidat suivant
        </button>
      </div>
    </div>
  );
};
