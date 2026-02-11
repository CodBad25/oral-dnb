import { type FC, useState } from 'react';
import { GitCompare, PieChart, FileUp } from 'lucide-react';
import { useImportedData } from '@/hooks/useImportedData';
import { cn } from '@/lib/utils';
import { CompareTab } from './CompareTab';
import { SyntheseTab } from './SyntheseTab';
import { ImportExportTab } from './ImportExportTab';

type Tab = 'comparer' | 'synthese' | 'import-export';

const tabs: { id: Tab; label: string; icon: FC<{ size?: number }> }[] = [
  { id: 'comparer', label: 'Comparer', icon: GitCompare },
  { id: 'synthese', label: 'Synthèse', icon: PieChart },
  { id: 'import-export', label: 'Import / Export', icon: FileUp },
];

export const AnalysePage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('comparer');
  const [dataVersion, setDataVersion] = useState(0);
  const { importedJuries, addJury, removeJury, getAllCandidates, hasImportedData } =
    useImportedData();

  return (
    <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'synthese' && hasImportedData && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 h-full">
          {activeTab === 'comparer' && <CompareTab key={dataVersion} />}
          {activeTab === 'synthese' && (
            <SyntheseTab
              candidates={getAllCandidates()}
              hasImportedData={hasImportedData}
              onGoToImport={() => setActiveTab('import-export')}
            />
          )}
          {activeTab === 'import-export' && (
            <ImportExportTab
              importedJuries={importedJuries}
              onAddJury={addJury}
              onRemoveJury={removeJury}
              onDataChanged={() => setDataVersion((v) => v + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
