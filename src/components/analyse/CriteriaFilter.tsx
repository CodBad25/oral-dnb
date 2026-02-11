import type { FC } from 'react';
import { grille } from '@/data/grille-2026';
import { cn } from '@/lib/utils';

interface CriteriaFilterProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}

export const CriteriaFilter: FC<CriteriaFilterProps> = ({
  selectedIds,
  onToggle,
  onSelectAll,
}) => {
  const allIds = grille.sections.flatMap((s) => s.criteria.map((c) => c.id));
  const allSelected = allIds.every((id) => selectedIds.has(id));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Critères
        </h3>
        <button
          onClick={onSelectAll}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          {allSelected ? 'Aucun' : 'Tous'}
        </button>
      </div>
      {grille.sections.map((section) => (
        <div key={section.id} className="mb-2">
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1 uppercase">
            {section.title}
          </p>
          <div className="flex flex-wrap gap-1">
            {section.criteria.map((criterion) => {
              const isSelected = selectedIds.has(criterion.id);
              return (
                <button
                  key={criterion.id}
                  onClick={() => onToggle(criterion.id)}
                  className={cn(
                    'px-2 py-1 rounded-full text-[11px] font-medium transition-colors leading-tight',
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                  )}
                  title={criterion.title}
                >
                  {criterion.id}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
