import { useState, useEffect } from 'react';
import { UserPlus, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export const AccountManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [juryNumber, setJuryNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async () => {
    if (!email || !password || !juryNumber) return;
    setCreating(true);
    setMessage(null);

    // Use the edge function or Supabase signUp with metadata
    // Note: signUp with anon key creates a user but also signs them in.
    // For a proper admin flow, we'd use a server-side function.
    // For now, we use the REST API approach via the admin endpoint.
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({
        email,
        password,
        jury_number: juryNumber,
        display_name: displayName || `Jury ${juryNumber}`,
      }),
    });

    if (res.ok) {
      setMessage({ type: 'success', text: `Compte créé pour ${email}` });
      setEmail('');
      setPassword('');
      setJuryNumber('');
      setDisplayName('');
      // Refresh profiles after a short delay (trigger needs time)
      setTimeout(fetchProfiles, 1000);
    } else {
      const data = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      setMessage({ type: 'error', text: data.error || 'Erreur lors de la création' });
    }

    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Comptes existants
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Aucun compte trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Nom</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Jury</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {p.display_name || '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {p.jury_number || '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        p.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : p.role === 'coordinateur'
                          ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create account form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
          <UserPlus size={16} />
          Créer un compte jury
        </h3>

        {message && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jury1@etablissement.fr"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Mot de passe
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="MotDePasse123"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Numéro de jury
            </label>
            <input
              type="text"
              value={juryNumber}
              onChange={(e) => setJuryNumber(e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jury 1 — Dupont / Martin"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !email || !password || !juryNumber}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Créer le compte
        </button>

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Si la création via l'interface ne fonctionne pas, créez les comptes directement dans le{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:underline"
          >
            dashboard Supabase
          </a>
          {' '}(Authentication {'>'} Users {'>'} Add User).
        </p>
      </div>
    </div>
  );
};
