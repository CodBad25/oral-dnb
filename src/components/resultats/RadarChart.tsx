import { useState } from 'react';
import { grille } from '@/data/grille-2026';
import { fmtPt } from '@/lib/analyse-utils';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { cn } from '@/lib/utils';

const allCriteria = grille.sections.flatMap((s) => s.criteria);
const N = allCriteria.length; // 9

const SHORT_LABELS = [
  'Exposé',
  'Justification',
  'Connaissances',
  'Compétences',
  'Regard critique',
  'Expression',
  'Vocabulaire',
  'Langue orale',
  'Échanges',
];

const COLORS = [
  { stroke: '#6366f1', fill: 'rgba(99,102,241,0.18)' },
  { stroke: '#10b981', fill: 'rgba(16,185,129,0.18)' },
  { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.18)' },
  { stroke: '#f43f5e', fill: 'rgba(244,63,94,0.18)' },
  { stroke: '#06b6d4', fill: 'rgba(6,182,212,0.18)' },
];

const getAngle = (i: number) => (2 * Math.PI * i) / N - Math.PI / 2;

interface RadarChartProps {
  history: EvaluationState[];
}

export const RadarChart = ({ history }: RadarChartProps) => {
  const maxSelect = Math.min(5, history.length);
  const [selected, setSelected] = useState<Set<number>>(() => {
    const s = new Set<number>();
    for (let i = 0; i < maxSelect; i++) s.add(i);
    return s;
  });

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else if (next.size < 5) {
        next.add(idx);
      }
      return next;
    });
  };

  const SIZE = 380;
  const PADDING = 52;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const maxR = SIZE / 2 - PADDING;

  // Build polygon points for a set of normalized values (0-1)
  const polyPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const a = getAngle(i);
        return `${cx + v * maxR * Math.cos(a)},${cy + v * maxR * Math.sin(a)}`;
      })
      .join(' ');

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1];

  // Selected candidates
  const selectedEntries = [...selected].sort().map((i) => ({ index: i, entry: history[i] }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Profil des candidats (radar)
      </h3>

      {/* SVG radar */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-md text-gray-500 dark:text-gray-400"
        >
          {/* Grid rings */}
          {rings.map((pct) => (
            <polygon
              key={pct}
              points={Array.from({ length: N }, (_, i) => {
                const a = getAngle(i);
                return `${cx + pct * maxR * Math.cos(a)},${cy + pct * maxR * Math.sin(a)}`;
              }).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {Array.from({ length: N }, (_, i) => {
            const a = getAngle(i);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + maxR * Math.cos(a)}
                y2={cy + maxR * Math.sin(a)}
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth={1}
              />
            );
          })}

          {/* Candidate polygons */}
          {selectedEntries.map(({ index, entry }, ci) => {
            const colorIdx = ci % COLORS.length;
            const values = allCriteria.map((c) => {
              const score = entry.scores[c.id] ?? 0;
              return score / c.maxPoints;
            });
            return (
              <polygon
                key={index}
                points={polyPoints(values)}
                fill={COLORS[colorIdx].fill}
                stroke={COLORS[colorIdx].stroke}
                strokeWidth={2}
              />
            );
          })}

          {/* Data points */}
          {selectedEntries.map(({ index, entry }, ci) => {
            const colorIdx = ci % COLORS.length;
            return allCriteria.map((c, i) => {
              const score = entry.scores[c.id] ?? 0;
              const v = score / c.maxPoints;
              const a = getAngle(i);
              return (
                <circle
                  key={`${index}-${i}`}
                  cx={cx + v * maxR * Math.cos(a)}
                  cy={cy + v * maxR * Math.sin(a)}
                  r={3}
                  fill={COLORS[colorIdx].stroke}
                />
              );
            });
          })}

          {/* Axis labels */}
          {SHORT_LABELS.map((label, i) => {
            const a = getAngle(i);
            const lx = cx + (maxR + 22) * Math.cos(a);
            const ly = cy + (maxR + 22) * Math.sin(a);
            const dx = Math.cos(a);
            const anchor = dx > 0.1 ? 'start' : dx < -0.1 ? 'end' : 'middle';
            return (
              <text
                key={i}
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="currentColor"
                fontSize={10}
                fontWeight={500}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Candidate chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {history.map((entry, i) => {
          const isSelected = selected.has(i);
          const colorIdx = isSelected ? [...selected].sort().indexOf(i) % COLORS.length : -1;
          const total = Object.values(entry.scores).reduce((a, b) => a + b, 0);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border',
                isSelected
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600',
              )}
              style={isSelected ? { backgroundColor: COLORS[colorIdx].stroke } : undefined}
            >
              {entry.candidate.prenom} {entry.candidate.nom}
              <span className="ml-1 opacity-80">{fmtPt(total)}/{grille.totalPoints}</span>
            </button>
          );
        })}
      </div>
      {history.length > 5 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">
          5 candidats max affichés simultanément
        </p>
      )}
    </div>
  );
};
