import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Log para debugging
const isDev = import.meta.env.DEV;

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = 'Error en la petición';
    try {
      const error = await res.json();
      errorMessage = error.mensaje ?? error.message ?? errorMessage;
    } catch {
      errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const url = `${API_URL}${path}`;
    const headers = await getHeaders();
    
    if (isDev) console.log('[API GET]', url, { headers });
    
    const res = await fetch(url, { 
      headers,
      credentials: 'omit', // Cambiar a 'include' si usas cookies
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido en GET';
    if (isDev) console.error('[API GET ERROR]', message);
    throw error;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const url = `${API_URL}${path}`;
    const headers = await getHeaders();
    
    if (isDev) console.log('[API POST]', url, { body });
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'omit',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido en POST';
    if (isDev) console.error('[API POST ERROR]', message);
    throw error;
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const url = `${API_URL}${path}`;
    const headers = await getHeaders();
    
    if (isDev) console.log('[API PUT]', url, { body });
    
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'omit',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido en PUT';
    if (isDev) console.error('[API PUT ERROR]', message);
    throw error;
  }
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  try {
    const url = `${API_URL}${path}`;
    const headers = await getHeaders();
    
    if (isDev) console.log('[API PATCH]', url, { body });
    
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'omit',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido en PATCH';
    if (isDev) console.error('[API PATCH ERROR]', message);
    throw error;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    const url = `${API_URL}${path}`;
    const headers = await getHeaders();
    
    if (isDev) console.log('[API DELETE]', url);
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'omit',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido en DELETE';
    if (isDev) console.error('[API DELETE ERROR]', message);
    throw error;
  }
}
