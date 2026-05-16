import type { UserRole } from '../types/auth.types';

const ROLE_ALIAS: Record<string, UserRole> = {
  admin: 'admin',
  cajero: 'cajero',
  mesero: 'mesero',
  gerente: 'gerente',
  encargado: 'gerente',
};

function capitalizeWord(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null;

  const normalized = role.trim().toLowerCase();
  if (!normalized) return null;

  return ROLE_ALIAS[normalized] ?? null;
}

export function formatRoleLabel(role: string | null | undefined): string {
  if (!role) return '';

  const normalized = role.trim().toLowerCase();
  if (!normalized) return '';

  const canonical = ROLE_ALIAS[normalized] ?? normalized;

  return canonical
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(capitalizeWord)
    .join(' ');
}
