import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export function UnauthorizedPage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card max-w-md w-full text-center space-y-5">
        <div className="text-6xl">🚫</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acceso no autorizado</h1>
          <p className="text-gray-500 mt-2 text-sm">
            No tienes permisos para ver esta página. Contacta a tu administrador si crees que esto es un error.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoBack}>
            Volver al inicio
          </Button>
          {isAuthenticated && (
            <Button variant="secondary" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
