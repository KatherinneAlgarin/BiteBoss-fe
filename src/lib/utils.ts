import type { AuthError } from '../types/auth.types';

export function parseAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    return { message: error.message, code: error.name };
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: 'Ocurrió un error inesperado. Intenta de nuevo.' };
}
