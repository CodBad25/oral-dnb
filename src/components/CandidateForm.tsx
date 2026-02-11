import type { FC } from 'react';
import type { CandidateInfo } from '@/types';

interface CandidateFormProps {
  candidate: CandidateInfo;
  onChange: (candidate: CandidateInfo) => void;
  onNext: () => void;
}

export const CandidateForm: FC<CandidateFormProps> = ({
  candidate,
  onChange,
  onNext,
}) => {
  const handleChange = (field: keyof CandidateInfo, value: string) => {
    onChange({
      ...candidate,
      [field]: value,
    });
  };

  const isValid =
    candidate.nom && candidate.prenom && candidate.classe && candidate.sujet;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Information du Candidat
      </h2>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={candidate.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nom du candidat"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prénom
          </label>
          <input
            type="text"
            value={candidate.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Prénom du candidat"
          />
        </div>

        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Classe
          </label>
          <input
            type="text"
            value={candidate.classe}
            onChange={(e) => handleChange('classe', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: 3eA, 3eB..."
          />
        </div>

        {/* Horaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Horaire de passage
          </label>
          <input
            type="time"
            value={candidate.horaire}
            onChange={(e) => handleChange('horaire', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sujet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sujet
          </label>
          <input
            type="text"
            value={candidate.sujet}
            onChange={(e) => handleChange('sujet', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Sujet de l'examen"
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 md:px-8 md:py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Candidat prêt
        </button>
      </div>
    </div>
  );
};
