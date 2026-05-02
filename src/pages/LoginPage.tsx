import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../components/login/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
