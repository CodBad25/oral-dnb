import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // Verify the caller is an admin by checking their auth token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // Verify the token belongs to an admin
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));

  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const { data: profile } = await anonClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  // Create the user with the service role key
  const { email, password, jury_number, display_name } = req.body;

  if (!email || !password || !jury_number) {
    return res.status(400).json({ error: 'Email, mot de passe et numéro de jury requis' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'jury',
      jury_number,
      display_name: display_name || `Jury ${jury_number}`,
    },
  });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  return res.status(200).json({ success: true });
}
