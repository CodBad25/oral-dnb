import { useState } from 'react';
import type { FormEvent } from 'react';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : authError.message
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Oral DNB 2026
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Système d'évaluation des épreuves orales
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="jury3@etablissement.fr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-6">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Contactez l'administrateur pour obtenir vos identifiants
          </p>
        </div>
      </div>
    </div>
  );
};
