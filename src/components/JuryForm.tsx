import type { FC } from 'react';
import type { JuryInfo } from '@/types';

interface JuryFormProps {
  jury: JuryInfo;
  onChange: (jury: JuryInfo) => void;
  onNext: () => void;
}

export const JuryForm: FC<JuryFormProps> = ({ jury, onChange, onNext }) => {
  const handleChange = (field: keyof JuryInfo, value: string) => {
    onChange({
      ...jury,
      [field]: value,
    });
  };

  const isValid =
    jury.prof1Nom &&
    jury.prof1Prenom &&
    jury.prof2Nom &&
    jury.prof2Prenom &&
    jury.juryNumber &&
    jury.date &&
    jury.salle;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Configuration du Jury
      </h2>

      <div className="space-y-6">
        {/* Professeur 1 */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Professeur 1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={jury.prof1Nom}
                onChange={(e) => handleChange('prof1Nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nom du professeur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={jury.prof1Prenom}
                onChange={(e) => handleChange('prof1Prenom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Prénom du professeur"
              />
            </div>
          </div>
        </div>

        {/* Professeur 2 */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Professeur 2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={jury.prof2Nom}
                onChange={(e) => handleChange('prof2Nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nom du professeur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={jury.prof2Prenom}
                onChange={(e) => handleChange('prof2Prenom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Prénom du professeur"
              />
            </div>
          </div>
        </div>

        {/* Jury details */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro du Jury
              </label>
              <input
                type="text"
                value={jury.juryNumber}
                onChange={(e) => handleChange('juryNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 1, 2, 3..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salle
              </label>
              <input
                type="text"
                value={jury.salle}
                onChange={(e) => handleChange('salle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Salle 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={jury.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 md:px-8 md:py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};
