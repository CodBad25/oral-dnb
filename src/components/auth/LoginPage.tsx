import { useState } from 'react';
import { Loader2, AlertCircle, Shield, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type QuickAccount = {
  label: string;
  role: 'admin' | 'jury';
  juryNumber?: string;
  email: string;
  password: string;
};

const ACCOUNTS: QuickAccount[] = [
  { label: 'Administration', role: 'admin', email: 'admin@oral-dnb.local', password: 'admin-oral-dnb' },
  { label: 'Jury 1', role: 'jury', juryNumber: '1', email: 'jury1@oral-dnb.local', password: 'jury1-oral-dnb' },
  { label: 'Jury 2', role: 'jury', juryNumber: '2', email: 'jury2@oral-dnb.local', password: 'jury2-oral-dnb' },
  { label: 'Jury 3', role: 'jury', juryNumber: '3', email: 'jury3@oral-dnb.local', password: 'jury3-oral-dnb' },
  { label: 'Jury 4', role: 'jury', juryNumber: '4', email: 'jury4@oral-dnb.local', password: 'jury4-oral-dnb' },
  { label: 'Jury 5', role: 'jury', juryNumber: '5', email: 'jury5@oral-dnb.local', password: 'jury5-oral-dnb' },
];

export const LoginPage = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleQuickLogin = async (account: QuickAccount) => {
    setLoading(account.email);
    setError('');

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (signInError) {
      // Account doesn't exist yet — create it
      const { error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            role: account.role,
            jury_number: account.juryNumber || null,
            display_name: account.label,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(null);
        return;
      }
      // signUp auto-signs in when email confirmation is disabled
    }

    setLoading(null);
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
            Sélectionnez votre profil pour commencer
          </p>
        </div>

        {/* Quick access buttons */}
        <div className="px-8 pb-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Admin */}
          <button
            onClick={() => handleQuickLogin(ACCOUNTS[0])}
            disabled={loading !== null}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors",
              "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700",
              "hover:bg-purple-100 dark:hover:bg-purple-900/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <div className="p-3 bg-purple-600 rounded-xl text-white shrink-0">
              {loading === ACCOUNTS[0].email ? <Loader2 size={22} className="animate-spin" /> : <Shield size={22} />}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Administration</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vue globale, harmonisation, comptes</p>
            </div>
          </button>

          {/* Jury buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACCOUNTS.slice(1).map((account) => (
              <button
                key={account.email}
                onClick={() => handleQuickLogin(account)}
                disabled={loading !== null}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                  "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700",
                  "hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0">
                  {loading === account.email ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {account.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
            Les comptes sont créés automatiquement au premier accès
          </p>
        </div>
      </div>
    </div>
  );
};
