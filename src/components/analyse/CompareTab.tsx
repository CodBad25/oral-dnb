import { type FC, useState, useMemo } from 'react';
import { Table, BarChart3, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { grille } from '@/data/grille-2026';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { cn } from '@/lib/utils';
import { CandidateSelector } from './CandidateSelector';
import { CriteriaFilter } from './CriteriaFilter';
import { CompareTable } from './CompareTable';
import { CompareBars } from './CompareBars';

interface CompareTabProps {
  candidates: EvaluationState[];
  showJury?: boolean;
}

export const CompareTab: FC<CompareTabProps> = ({ candidates, showJury }) => {
  const allCriteriaIds = useMemo(
    () => new Set(grille.sections.flatMap((s) => s.criteria.map((c) => c.id))),
    [],
  );

  const [selected, setSelected] = useState<Set<number>>(() => {
    // Auto-select all if <= 5 candidates
    if (candidates.length <= 5) {
      return new Set(candidates.map((_, i) => i));
    }
    return new Set<number>();
  });

  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(
    () => new Set(allCriteriaIds),
  );

  const [viewMode, setViewMode] = useState<'tableau' | 'barres'>('tableau');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleCandidate = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSelectAll = () => setSelected(new Set(candidates.map((_, i) => i)));
  const handleDeselectAll = () => setSelected(new Set());

  const handleToggleCriterion = (id: string) => {
    setSelectedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAllCriteria = () => {
    const allSelected = allCriteriaIds.size === selectedCriteria.size;
    setSelectedCriteria(allSelected ? new Set() : new Set(allCriteriaIds));
  };

  const selectedIndices = [...selected].sort((a, b) => a - b);

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p>Aucun candidat évalué. Évaluez des candidats pour utiliser la comparaison.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Sidebar */}
      <div className="md:w-[220px] md:flex-shrink-0 md:overflow-y-auto">
        {/* Mobile collapse toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden"
        >
          <span className="flex items-center gap-2">
            <Users size={14} />
            {selected.size} candidat{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
          </span>
          {sidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Sidebar content: always visible on md+, toggled on mobile */}
        <div className={cn(
          'space-y-4 overflow-y-auto',
          sidebarOpen ? 'block mt-2' : 'hidden',
          'md:block md:mt-0',
        )}>
          <CandidateSelector
            candidates={candidates}
            selected={selected}
            onToggle={handleToggleCandidate}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            showJury={showJury}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <CriteriaFilter
              selectedIds={selectedCriteria}
              onToggle={handleToggleCriterion}
              onSelectAll={handleToggleAllCriteria}
            />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 min-w-0">
        {/* View toggle */}
        <div className="flex items-center gap-1 mb-3">
          <button
            onClick={() => setViewMode('tableau')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              viewMode === 'tableau'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            )}
          >
            <Table size={14} />
            Tableau
          </button>
          <button
            onClick={() => setViewMode('barres')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              viewMode === 'barres'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            )}
          >
            <BarChart3 size={14} />
            Barres
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-200px)]">
          {viewMode === 'tableau' ? (
            <CompareTable
              candidates={candidates}
              selectedIndices={selectedIndices}
              selectedCriteria={selectedCriteria}
            />
          ) : (
            <CompareBars
              candidates={candidates}
              selectedIndices={selectedIndices}
              selectedCriteria={selectedCriteria}
            />
          )}
        </div>
      </div>
    </div>
  );
};
