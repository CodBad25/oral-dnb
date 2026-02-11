import type { FC } from 'react';
import type { Criterion } from '@/data/grille-2025';
import { PointSelector } from './PointSelector';
import { cn } from '@/lib/utils';

interface CriterionCardProps {
  criterion: Criterion;
  selectedPoints: number | null;
  onSelect: (points: number) => void;
}

export const CriterionCard: FC<CriterionCardProps> = ({
  criterion,
  selectedPoints,
  onSelect,
}) => {
  // Find which level contains the selected points
  const selectedLevelIndex = criterion.levels.findIndex((level) =>
    level.points.includes(selectedPoints || -1)
  );

  const colorMap = {
    insufficient: 'border-red-500 bg-red-50 dark:bg-red-900',
    fragile: 'border-orange-500 bg-orange-50 dark:bg-orange-900',
    satisfactory: 'border-blue-500 bg-blue-50 dark:bg-blue-900',
    excellent: 'border-green-500 bg-green-50 dark:bg-green-900',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
          {criterion.title}
        </h3>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {selectedPoints ?? 0} / {criterion.maxPoints}
        </div>
      </div>

      {/* Mastery levels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criterion.levels.map((level, idx) => {
          const isSelected = selectedLevelIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                'border-2 rounded-lg p-4 transition-all',
                isSelected
                  ? `${colorMap[level.color]} border-2`
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              )}
            >
              {/* Level name */}
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm md:text-base">
                {level.name}
              </h4>

              {/* Description */}
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4">
                {level.description}
              </p>

              {/* Point selector */}
              <PointSelector
                points={level.points}
                selectedPoint={selectedPoints ?? null}
                onSelect={onSelect}
                color={level.color}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
