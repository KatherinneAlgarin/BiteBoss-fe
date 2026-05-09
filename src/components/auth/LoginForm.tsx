import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlertMessage } from '../ui/AlertMessage';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido.')
    .email('Ingresa un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    <div className="card w-full">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
      </div>

      {errorMessage && (
        <div className="mb-5">
          <AlertMessage message={errorMessage} type="error" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Contraseña"
            showPasswordToggle
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}
