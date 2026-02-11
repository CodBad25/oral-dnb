import type { FC } from "react";
import { Check } from "lucide-react";
import { grille } from "@/data/grille-2026";
import type { Criterion, MasteryLevel } from "@/data/grille-2026";
import { cn } from "@/lib/utils";

interface EvaluationGridProps {
  scores: Record<string, number>;
  onScoreChange: (criterionId: string, points: number) => void;
  sectionIndex: number;
  onSectionChange: (index: number) => void;
  readOnly?: boolean;
}

const levelColorSelected: Record<MasteryLevel["color"], string> = {
  insufficient: "bg-red-200 dark:bg-red-900/60 ring-2 ring-red-500",
  fragile: "bg-orange-200 dark:bg-orange-900/60 ring-2 ring-orange-500",
  satisfactory: "bg-blue-200 dark:bg-blue-900/60 ring-2 ring-blue-500",
  excellent: "bg-green-200 dark:bg-green-900/60 ring-2 ring-green-500",
};

const levelColorHover: Record<MasteryLevel["color"], string> = {
  insufficient: "hover:bg-red-50 dark:hover:bg-red-900/20",
  fragile: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
  satisfactory: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
  excellent: "hover:bg-green-50 dark:hover:bg-green-900/20",
};

const levelButtonSelected: Record<MasteryLevel["color"], string> = {
  insufficient: "bg-red-500 text-white",
  fragile: "bg-orange-500 text-white",
  satisfactory: "bg-blue-500 text-white",
  excellent: "bg-green-500 text-white",
};


const formatPoint = (v: number) =>
  v === 0.5 ? "0,5" : v === 1.5 ? "1,5" : String(v);

const LevelCell: FC<{
  level: MasteryLevel;
  isFirst: boolean;
  criterionId: string;
  selectedPoints: number | undefined;
  onSelect: (criterionId: string, points: number) => void;
  readOnly?: boolean;
}> = ({ level, isFirst, criterionId, selectedPoints, onSelect, readOnly }) => {
  const isSelected = selectedPoints === level.points;
  const isZeroSelected = isFirst && selectedPoints === 0;
  const isActive = isSelected || isZeroSelected;

  return (
    <td
      className={cn(
        "border border-gray-300 dark:border-gray-600 p-2 transition-all align-top",
        isActive ? levelColorSelected[level.color] : readOnly ? "" : levelColorHover[level.color]
      )}
    >
      <p className="text-xs leading-tight text-gray-700 dark:text-gray-300 mb-2">
        {level.description}
      </p>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 justify-center">
          {isFirst && (
            <button
              onClick={() => onSelect(criterionId, 0)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                isZeroSelected
                  ? levelButtonSelected[level.color]
                  : "border border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30"
              )}
            >
              0
            </button>
          )}
          <button
            onClick={() => onSelect(criterionId, level.points)}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer",
              isSelected
                ? levelButtonSelected[level.color]
                : "border border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30"
            )}
          >
            {formatPoint(level.points)}
          </button>
        </div>
      )}
    </td>
  );
};

const CriterionRow: FC<{
  criterion: Criterion;
  selectedPoints: number | undefined;
  onSelect: (criterionId: string, points: number) => void;
  readOnly?: boolean;
}> = ({ criterion, selectedPoints, onSelect, readOnly }) => (
  <tr className={cn(selectedPoints == null && "bg-amber-50/50 dark:bg-amber-900/10")}>
    <td className={cn(
      "border border-gray-300 dark:border-gray-600 p-2 font-medium text-xs text-gray-900 dark:text-white align-top w-[18%]",
      selectedPoints == null && "border-l-4 border-l-amber-400 dark:border-l-amber-500"
    )}>
      {criterion.title}
    </td>
    {criterion.levels.map((level, i) => (
      <LevelCell
        key={i}
        level={level}
        isFirst={i === 0}
        criterionId={criterion.id}
        selectedPoints={selectedPoints}
        onSelect={onSelect}
        readOnly={readOnly}
      />
    ))}
    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold text-sm text-gray-900 dark:text-white align-middle w-[6%]">
      <span className={cn(selectedPoints != null ? "text-indigo-600 dark:text-indigo-400" : "")}>
        {selectedPoints != null ? formatPoint(selectedPoints) : ""}
      </span>
      <span className="text-gray-400"> /{criterion.maxPoints}</span>
    </td>
  </tr>
);

export const EvaluationGrid: FC<EvaluationGridProps> = ({
  scores,
  onScoreChange,
  sectionIndex,
  onSectionChange,
  readOnly,
}) => {
  const section = grille.sections[sectionIndex];
  const sectionTotal = section.criteria.reduce(
    (sum, c) => sum + (scores[c.id] ?? 0),
    0
  );

  const isSectionComplete = (idx: number) =>
    grille.sections[idx].criteria.every((c) => scores[c.id] != null);

  return (
    <div className="w-full">
      {/* Section tabs */}
      <div className="flex gap-2 mb-4">
        {grille.sections.map((s, i) => {
          const locked = i > 0 && !isSectionComplete(i - 1);
          const sTotal = s.criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
          return (
          <button
            key={s.id}
            onClick={() => !locked && onSectionChange(i)}
            disabled={locked}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors",
              locked
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : i === sectionIndex
                  ? "bg-indigo-600 text-white cursor-pointer"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
            )}
          >
            {isSectionComplete(i) && <Check size={14} className="inline mr-1" />}
            {s.title} ({sTotal > 0 ? `${sTotal}/` : ""}{s.maxPoints} pts)
          </button>);
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gray-800 dark:bg-gray-900 text-white">
              <th className="border border-gray-600 p-2 text-left text-xs font-semibold w-[18%]">
                Critères d'évaluation
              </th>
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-[19%]">
                Maîtrise insuffisante
              </th>
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-[19%]">
                Maîtrise fragile
              </th>
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-[19%]">
                Maîtrise satisfaisante
              </th>
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-[19%]">
                Très bonne maîtrise
              </th>
              <th className="border border-gray-600 p-2 text-center text-xs font-semibold w-[6%]">
                Barème
              </th>
            </tr>
          </thead>
          <tbody>
            {section.criteria.map((criterion) => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                selectedPoints={scores[criterion.id]}
                onSelect={onScoreChange}
                readOnly={readOnly}
              />
            ))}
            {/* Subtotal row */}
            <tr className="bg-indigo-100 dark:bg-indigo-900/40">
              <td
                colSpan={5}
                className="border border-gray-300 dark:border-gray-600 p-2 font-bold text-sm text-gray-900 dark:text-white"
              >
                Sous-total : {section.title}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold text-sm text-indigo-700 dark:text-indigo-300">
                {sectionTotal > 0 ? sectionTotal : "—"}/{section.maxPoints}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

