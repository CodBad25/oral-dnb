import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import type { JuryInfo } from '@/types';
import { exportAllPDF, exportCSV } from '@/lib/export';
import { exportJuryJSON } from '@/lib/analyse-export';
import { getHistory } from '@/lib/storage';

interface ExportSectionProps {
  jury: JuryInfo;
}

export const ExportSection = ({ jury }: ExportSectionProps) => {
  const history = getHistory();

  const buttons = [
    {
      label: 'Tous les PDF',
      icon: FileText,
      color: 'bg-red-600 hover:bg-red-700',
      onClick: () => exportAllPDF(history),
    },
    {
      label: 'Export CSV',
      icon: FileSpreadsheet,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => exportCSV(history),
    },
    {
      label: 'Export JSON',
      icon: FileJson,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => exportJuryJSON(jury, history),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <Download size={16} />
        Exports
      </h3>
      <div className="flex flex-wrap gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`flex items-center gap-2 px-4 py-2.5 ${btn.color} text-white rounded-lg font-medium text-sm transition-colors`}
          >
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
