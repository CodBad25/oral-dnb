import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { PrincipalDashboard } from '@/components/principal/PrincipalDashboard';
import { HistoryProvider } from '@/contexts/HistoryContext';
import JuryApp from '@/JuryApp';

export default function App() {
  const { profile, loading, signOut, isAdmin, isPrincipal } = useAuth();

  // Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={40} className="text-amber-500" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Configuration manquante</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Les variables d'environnement <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_SUPABASE_URL</code> et <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> ne sont pas configurées.
          </p>
        </div>
      </div>
    );
  }

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

  // Admin (technique)
  if (isAdmin) {
    return <AdminDashboard onSignOut={() => signOut()} />;
  }

  // Principal (chef d'établissement)
  if (isPrincipal) {
    return <PrincipalDashboard onSignOut={() => signOut()} />;
  }

  // Jury
  return (
    <HistoryProvider profile={profile}>
      <JuryApp profile={profile} onSignOut={() => signOut()} />
    </HistoryProvider>
  );
}
