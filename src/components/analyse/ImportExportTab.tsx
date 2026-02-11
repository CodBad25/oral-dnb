import { type FC, useRef, useState } from 'react';
import { Download, Upload, Trash2, FileJson, AlertCircle, Sparkles, Trash } from 'lucide-react';
import type { ImportedJury, JuryExportPayload } from '@/types';
import { getHistory, loadJuryDefaults, setHistory, clearAllData } from '@/lib/storage';
import { exportJuryJSON } from '@/lib/analyse-export';
import { validateImportPayload } from '@/lib/analyse-utils';
import { generateDemoData } from '@/lib/demo-data';
import { formatDateFR, cn } from '@/lib/utils';

interface ImportExportTabProps {
  importedJuries: ImportedJury[];
  onAddJury: (payload: JuryExportPayload) => { success: boolean; error?: string };
  onRemoveJury: (id: string) => void;
  onDataChanged?: () => void;
}

export const ImportExportTab: FC<ImportExportTabProps> = ({
  importedJuries,
  onAddJury,
  onRemoveJury,
  onDataChanged,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = () => {
    const history = getHistory();
    const juryDefaults = loadJuryDefaults();
    const jury = {
      prof1Nom: juryDefaults?.prof1Nom || '',
      prof1Prenom: juryDefaults?.prof1Prenom || '',
      prof2Nom: juryDefaults?.prof2Nom || '',
      prof2Prenom: juryDefaults?.prof2Prenom || '',
      juryNumber: juryDefaults?.juryNumber || '',
      date: juryDefaults?.date || '',
      salle: juryDefaults?.salle || '',
    };
    if (history.length === 0) {
      setError('Aucun candidat évalué à exporter.');
      return;
    }
    exportJuryJSON(jury, history);
    setSuccess(`${history.length} candidat(s) exporté(s)`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const processFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    if (!file.name.endsWith('.json')) {
      setError('Le fichier doit être au format JSON.');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = validateImportPayload(data);

      if (!result.valid) {
        setError(result.error);
        return;
      }

      const addResult = onAddJury(result.payload);
      if (!addResult.success) {
        setError(addResult.error || 'Erreur lors de l\'import.');
        return;
      }

      setSuccess(
        `Jury ${result.payload.jury.juryNumber} importé (${result.payload.candidates.length} candidats)`,
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Fichier JSON invalide.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Export section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Exporter les données du jury
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Téléchargez un fichier JSON contenant toutes les évaluations de votre jury.
          Partagez-le avec le coordinateur pour la synthèse.
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Download size={16} />
          Exporter en JSON
        </button>
      </div>

      {/* Import section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Importer les données d'un autre jury
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Déposez ou sélectionnez un fichier JSON exporté par un autre jury.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          )}
        >
          <Upload size={24} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Glissez un fichier JSON ici
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            ou cliquez pour sélectionner
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded text-xs font-medium">
            {success}
          </div>
        )}
      </div>

      {/* Demo & Clear */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Données de démonstration
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Générez des candidats fictifs pour tester l'application, ou effacez toutes les données pour repartir à zéro.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const demo = generateDemoData(8);
              setHistory(demo);
              setSuccess('8 candidats de démo générés');
              onDataChanged?.();
              setTimeout(() => setSuccess(null), 3000);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Sparkles size={16} />
            Charger des données de démo
          </button>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors text-sm"
            >
              <Trash size={16} />
              Effacer toutes les données
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Confirmer ?</span>
              <button
                onClick={() => {
                  clearAllData();
                  setConfirmClear(false);
                  setSuccess('Toutes les données ont été effacées');
                  onDataChanged?.();
                  setTimeout(() => setSuccess(null), 3000);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Oui, tout effacer
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Imported juries list */}
      {importedJuries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Jurys importés ({importedJuries.length})
          </h3>
          <div className="space-y-2">
            {importedJuries.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileJson size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Jury {j.payload.jury.juryNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {j.payload.candidates.length} candidat(s) · Exporté le{' '}
                      {formatDateFR(j.payload.exportDate.slice(0, 10))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveJury(j.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
