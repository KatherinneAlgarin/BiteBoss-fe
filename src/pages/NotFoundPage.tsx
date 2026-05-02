import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card max-w-md w-full text-center space-y-5">
        <div className="text-6xl font-black text-orange-200">404</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
          <p className="text-gray-500 mt-2 text-sm">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
