import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${width} ${className}`}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
