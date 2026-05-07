import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordChangeFields } from '../../components/auth/PasswordChangeFields';
import { Button } from '../../components/ui/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { supabase } from '../../lib/supabase';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [recoveryMode, setRecoveryMode] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    // Si en 2 segundos no llega PASSWORD_RECOVERY, el link no es válido
    const timer = setTimeout(() => {
      setRecoveryMode(prev => prev === true ? true : false);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_REGEX.test(newPassword)) {
      setError('La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.updateUser({ password: newPassword });
      if (supabaseError) throw supabaseError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al cambiar la contraseña.';
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
        setError('El enlace de recuperación expiró o no es válido.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (recoveryMode === null) {
    return (
      <AuthLayout>
        <div className="card w-full flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </AuthLayout>
    );
  }

  if (!recoveryMode) {
    return (
      <AuthLayout>
        <div className="card w-full space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Enlace inválido</h2>
          <AlertMessage type="error" message="El enlace de recuperación es inválido o ha expirado." />
          <Link
            to="/forgot-password"
            className="block text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
          >
            Solicitar un nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="card w-full">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-900">Nueva contraseña</h2>
          <p className="text-sm text-gray-500 mt-1">Ingresa una contraseña segura para tu cuenta.</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <AlertMessage
              type="success"
              message="Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión..."
            />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 space-y-3">
                <AlertMessage message={error} type="error" />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <PasswordChangeFields
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
              </Button>
            </form>

            <div className="mt-5">
              <Link
                to="/login"
                className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                Cancelar y volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
