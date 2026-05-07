import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  if (isLoading) return null;

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
