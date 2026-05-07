import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('El correo es requerido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/olvidar-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) throw new Error('Error al procesar la solicitud');
      setSent(true);
    } catch {
      setError('Ocurrió un error al procesar la solicitud. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card w-full">
        {sent ? (
          <div className="space-y-5">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Revisa tu correo</h2>
              <p className="text-sm text-gray-500 mt-1">Enlace de recuperación enviado</p>
            </div>

            <AlertMessage
              type="success"
              message="Si el correo está registrado, recibirás un enlace de recuperación en los próximos minutos."
            />

            <p className="text-sm text-gray-500">
              El enlace es válido por <strong>10 minutos</strong>. Si no lo ves, revisa tu carpeta de spam.
            </p>

            <Link
              to="/login"
              className="block text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ingresa tu correo y te enviaremos un enlace para recuperar tu acceso.
              </p>
            </div>

            {error && (
              <div className="mb-5">
                <AlertMessage message={error} type="error" />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </form>

            <div className="mt-5">
              <Link
                to="/login"
                className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
