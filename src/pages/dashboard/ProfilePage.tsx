import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { PasswordChangeFields } from '../../components/auth/PasswordChangeFields';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function ProfilePage() {
  const { session, logout, role } = useAuth();
  const meta = session?.user?.app_metadata;
  const userMeta = session?.user?.user_metadata;

  const currentName = meta?.nombre ?? userMeta?.nombre ?? '';
  const userEmail = session?.user?.email ?? '';

  const [nombre, setNombre] = useState<string>(currentName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!session || !role) return null;

  const passwordFieldsFilled = currentPassword || newPassword || confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwordFieldsFilled) {
      if (!currentPassword) {
        setError('Ingresa tu contraseña actual para poder cambiarla.');
        return;
      }
      if (!newPassword) {
        setError('Ingresa la nueva contraseña.');
        return;
      }
      if (!confirmPassword) {
        setError('Confirma la nueva contraseña.');
        return;
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        setError('La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (currentPassword === newPassword) {
        setError('La nueva contraseña debe ser diferente a la actual.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (passwordFieldsFilled) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword,
        });
        if (signInError) {
          setError('La contraseña actual es incorrecta.');
          return;
        }
      }

      const body: { nombre?: string; nuevaContrasena?: string } = {};
      if (nombre.trim() !== currentName) body.nombre = nombre.trim();
      if (passwordFieldsFilled) body.nuevaContrasena = newPassword;

      if (Object.keys(body).length === 0) {
        setSuccess(true);
        return;
      }

      const accessToken = session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/perfil`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json() as { mensaje?: string };
        throw new Error(data.mensaje ?? 'Error al guardar los cambios.');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      user={{ name: currentName, email: userEmail, role }}
      data={{ navMain: [] }}
      onLogout={() => { void logout(); }}
    >
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
          >
            ← Volver al panel
          </Link>
        </div>

        <div className="card">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Mi perfil</h2>
            <p className="text-sm text-gray-500 mt-1">
              Actualiza tu nombre o cambia tu contraseña.
            </p>
          </div>

          {error && (
            <div className="mb-5">
              <AlertMessage message={error} type="error" />
            </div>
          )}

          {success && (
            <div className="mb-5">
              <AlertMessage message="Cambios guardados correctamente." type="success" />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Información personal
              </h3>
              <Input
                label="Nombre"
                type="text"
                placeholder="Tu nombre"
                autoComplete="name"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Cambiar contraseña
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Deja estos campos vacíos si solo quieres actualizar tu nombre.
              </p>

              <div className="space-y-4">
                <Input
                  label="Contraseña actual"
                  showPasswordToggle
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />

                <PasswordChangeFields
                  newPassword={newPassword}
                  confirmPassword={confirmPassword}
                  onNewPasswordChange={setNewPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Link to="/dashboard">
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
