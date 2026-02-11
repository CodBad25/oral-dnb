import type { FC } from "react";
import { cn } from "@/lib/utils";
import { grille } from "@/data/grille-2026";

interface FloatingScoreBarProps {
  scores: Record<string, number>;
}

export const FloatingScoreBar: FC<FloatingScoreBarProps> = ({ scores }) => {
  const section1Total = grille.sections[0].criteria.reduce(
    (sum, c) => sum + (scores[c.id] ?? 0),
    0
  );
  const section2Total = grille.sections[1].criteria.reduce(
    (sum, c) => sum + (scores[c.id] ?? 0),
    0
  );
  const total = section1Total + section2Total;
  const hasScores = Object.keys(scores).length > 0;

  const getTotalColor = () => {
    if (!hasScores) return "text-gray-400";
    if (total < 8) return "text-red-600 dark:text-red-400";
    if (total < 12) return "text-orange-600 dark:text-orange-400";
    if (total < 16) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="hidden md:flex items-center gap-4">
        <div>
          <span className="text-gray-500 dark:text-gray-400">S1 : </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {section1Total > 0 ? section1Total : "—"}/{grille.sections[0].maxPoints}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">S2 : </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {section2Total > 0 ? section2Total : "—"}/{grille.sections[1].maxPoints}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-gray-500 dark:text-gray-400">Total :</span>
        <span className={cn("text-lg font-bold tabular-nums", getTotalColor())}>
          {hasScores ? total : "—"}/{grille.totalPoints}
        </span>
      </div>
    </div>
  );
};
