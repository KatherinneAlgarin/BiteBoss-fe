// pages/dashboard/admin/MenuPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getProductosCatalogo,
  crearProducto,
  actualizarProducto,
  listarCategorias,
  type CrearProductoDto,
  type ActualizarProductoDto,
  type Categoria,
} from '../../../services/producto.service';
import type { Producto } from '../../../types/producto.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export function MenuPage() {
  const { id_sucursal } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [id_categoria, setId_categoria] = useState<string>('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');

  const filteredProductos = productos.filter(producto => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      producto.nombre.toLowerCase().includes(search) ||
      (producto.descripcion || '').toLowerCase().includes(search) ||
      (producto.categoria_nombre || '').toLowerCase().includes(search);

    const matchesCategoria =
      selectedCategoria === 'all' ||
      producto.id_categoria === Number(selectedCategoria);

    return matchesSearch && matchesCategoria;
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prods, cats] = await Promise.all([
          getProductosCatalogo(),
          listarCategorias(),
        ]);
        setProductos(prods);
        setCategorias(cats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEdit = (producto: Producto) => {
    setEditingId(producto.id_producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio.toString());
    setId_categoria(producto.id_categoria.toString());
    setActivo(producto.activo ?? true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setId_categoria('');
    setActivo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!precio || parseFloat(precio) < 0) {
      setError('El precio debe ser un número positivo');
      return;
    }
    if (!id_categoria) {
      setError('Debe seleccionar una categoría');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update
        const updates: ActualizarProductoDto = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: parseFloat(precio),
          id_categoria: parseInt(id_categoria),
          activo,
        };
        const updated = await actualizarProducto(editingId, updates);
        setProductos(prods =>
          prods.map(p => (p.id_producto === editingId ? updated : p))
        );
        setSuccess('Producto actualizado exitosamente');
        handleCancelEdit();
      } else {
        // Create
        if (!id_sucursal) {
          setError('No se pudo determinar la sucursal');
          return;
        }
        const newProd: CrearProductoDto = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: parseFloat(precio),
          id_categoria: parseInt(id_categoria),
          id_sucursal,
          activo,
        };
        const created = await crearProducto(newProd);
        setProductos(prods => [...prods, created]);
        setSuccess('Producto creado exitosamente');
        handleCancelEdit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Menú</h1>
        <p className="text-gray-500 mt-1 text-sm">Crea y edita productos del catálogo</p>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Producto' : 'Crear Producto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Hamburguesa Clásica"
              disabled={submitting}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Descripción del producto"
                disabled={submitting}
                className="input-field min-h-24"
              />
            </div>
            <Input
              label="Precio"
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={id_categoria}
                onChange={e => setId_categoria(e.target.value)}
                disabled={submitting}
                className="input-field"
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                disabled={submitting}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" fullWidth isLoading={submitting}>
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Productos ({filteredProductos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input
              label="Buscar productos"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Por nombre, descripción o categoría..."
              disabled={submitting}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar categoría</label>
              <select
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e.target.value)}
                className="input-field"
                disabled={submitting}
              >
                <option value="all">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {productos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay productos aún</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProductos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No se encontraron productos</p>
              ) : (
                filteredProductos.map(producto => (
                <div
                  key={producto.id_producto}
                  className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{producto.nombre}</p>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {producto.descripcion || '—'}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-sm font-semibold text-orange-600">
                        ${producto.precio.toFixed(2)}
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        {producto.categoria_nombre ?? 'Sin categoría'}
                      </span>
                      {!producto.activo && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(producto)}
                    disabled={submitting}
                    className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors disabled:opacity-50"
                  >
                    Editar
                  </button>
                </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
