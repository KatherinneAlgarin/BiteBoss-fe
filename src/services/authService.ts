import { supabase } from './supabaseClient';
import type { LoginCredentials, UserProfile } from '../types/auth';

export async function signIn(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as UserProfile;
}
