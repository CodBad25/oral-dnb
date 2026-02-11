import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface PointSelectorProps {
  points: number[];
  selectedPoint: number | null;
  onSelect: (point: number) => void;
  color: 'insufficient' | 'fragile' | 'satisfactory' | 'excellent';
}

export const PointSelector: FC<PointSelectorProps> = ({
  points,
  selectedPoint,
  onSelect,
  color,
}) => {
  const selectedColorMap = {
    insufficient: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
    fragile: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent',
    satisfactory: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
    excellent: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
  };

  const unselectedColorMap = {
    insufficient: 'border-red-300 dark:border-red-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30',
    fragile: 'border-orange-300 dark:border-orange-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/30',
    satisfactory: 'border-blue-300 dark:border-blue-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    excellent: 'border-green-300 dark:border-green-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {points.map((point) => {
        const isSelected = selectedPoint === point;
        return (
          <button
            key={point}
            onClick={() => onSelect(point)}
            className={cn(
              'w-10 h-10 rounded-full font-semibold transition-all flex items-center justify-center border-2 cursor-pointer',
              isSelected ? selectedColorMap[color] : unselectedColorMap[color]
            )}
          >
            {point}
          </button>
        );
      })}
    </div>
  );
};
