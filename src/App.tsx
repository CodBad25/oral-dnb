import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { HistoryProvider } from '@/contexts/HistoryContext';
import JuryApp from '@/JuryApp';

export default function App() {
  const { profile, loading, signOut, isAdmin } = useAuth();

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!profile) {
    return <LoginPage />;
  }

  // Admin
  if (isAdmin) {
    // TODO: Phase 4 — AdminDashboard
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Administration</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dashboard admin en cours de développement</p>
          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    );
  }

  // Jury
  return (
    <HistoryProvider profile={profile}>
      <JuryApp profile={profile} onSignOut={() => signOut()} />
    </HistoryProvider>
  );
}
