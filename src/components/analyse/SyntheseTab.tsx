import type { FC } from 'react';
import { FileUp } from 'lucide-react';
import type { TaggedCandidate } from '@/hooks/useImportedData';
import { StatsGlobales } from './StatsGlobales';
import { Classement } from './Classement';

interface SyntheseTabProps {
  candidates: TaggedCandidate[];
  hasImportedData: boolean;
  onGoToImport: () => void;
}

export const SyntheseTab: FC<SyntheseTabProps> = ({
  candidates,
  hasImportedData,
  onGoToImport,
}) => {
  if (!hasImportedData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileUp size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          Aucune donnée de jury importée
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Importez les fichiers JSON des autres jurys pour voir la synthèse globale.
        </p>
        <button
          onClick={onGoToImport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Aller à Import/Export
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <StatsGlobales candidates={candidates} />
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Classement général
        </h3>
        <Classement candidates={candidates} />
      </div>
    </div>
  );
};
