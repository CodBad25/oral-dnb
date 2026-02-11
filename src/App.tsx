import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
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
    return <AdminDashboard onSignOut={() => signOut()} />;
  }

  // Jury
  return (
    <HistoryProvider profile={profile}>
      <JuryApp profile={profile} onSignOut={() => signOut()} />
    </HistoryProvider>
  );
}
