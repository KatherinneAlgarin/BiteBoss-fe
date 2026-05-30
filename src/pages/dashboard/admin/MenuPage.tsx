// pages/dashboard/admin/MenuPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getProductosCatalogo,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  obtenerSucursalesDeProducto,
  obtenerIngredientesDeProducto,
  obtenerComponentesCombo,
  obtenerDependenciasDesactivacionProducto,
  type CrearProductoDto,
  type ActualizarProductoDto,
} from '../../../services/producto.service';
import { listarCategorias } from '../../../services/categoria.service';
import type { CategoriaItem } from '../../../types/categoria.types';
import { listarSucursales } from '../../../services/sucursal.service';
import { listarIngredientes } from '../../../services/ingrediente.service';
import type { Producto, ProductoIngredienteInput, ProductoComboComponenteInput } from '../../../types/producto.types';
import type { IngredienteItem } from '../../../types/ingrediente.types';
import type { SucursalItem } from '../../../types/sucursal.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export function MenuPage() {
  const { id_sucursal, role } = useAuth();
  const isAdmin = role === 'admin';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<IngredienteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(false);
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
  const [selectedSucursal, setSelectedSucursal] = useState<string>('all');
  const [idsSucursalesCrear, setIdsSucursalesCrear] = useState<number[]>(id_sucursal ? [id_sucursal] : []);
  const [ingredientesReceta, setIngredientesReceta] = useState<Array<{ id_ingrediente: number | ''; cantidad: string }>>([]);
  const [esCombo, setEsCombo] = useState(false);
  const [componentesCombo, setComponentesCombo] = useState<Array<{ id_producto_hijo: number | ''; cantidad: string }>>([]);

  useEffect(() => {
    if (!editingId) {
      setIdsSucursalesCrear(id_sucursal ? [id_sucursal] : []);
    }
  }, [id_sucursal, editingId]);

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

    const matchesSucursal =
      selectedSucursal === 'all' ||
      (producto.ids_sucursales ?? []).includes(Number(selectedSucursal));

    return matchesSearch && matchesCategoria && matchesSucursal;
  });

  const loadProductos = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setLoadingProductos(true);

    try {
      const filtroSucursal = isAdmin && selectedSucursal !== 'all'
        ? Number(selectedSucursal)
        : undefined;
      const prods = await getProductosCatalogo(filtroSucursal);
      setProductos(prods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    } finally {
      if (!silent) setLoadingProductos(false);
    }
  };

  // Initial page load (form + catalogs)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, sucursalesActivas] = await Promise.all([
          listarCategorias(),
          isAdmin ? listarSucursales(true) : Promise.resolve([] as SucursalItem[]),
        ]);

        const ingredientes = await listarIngredientes();

        const categoriasUnicas = Array.from(
          cats.reduce((map, categoria) => {
            if (!categoria.activo) return map;
            const key = categoria.nombre.trim().toLowerCase();
            if (!map.has(key)) {
              map.set(key, categoria);
            }
            return map;
          }, new Map<string, CategoriaItem>()).values()
        ).sort((a, b) => a.nombre.localeCompare(b.nombre));

        setCategorias(categoriasUnicas);
        setSucursales(sucursalesActivas);
        setIngredientesDisponibles(ingredientes.filter(item => item.activo));
        await loadProductos({ silent: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isAdmin]);

  // Refresh only product list when branch filter changes
  useEffect(() => {
    if (loading) return;
    void loadProductos();
  }, [selectedSucursal]);

  const handleEdit = (producto: Producto) => {
    setEditingId(producto.id_producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio.toString());
    setId_categoria(producto.id_categoria.toString());
    setActivo(producto.activo ?? true);

    void (async () => {
      try {
        const ingredientesPromise = obtenerIngredientesDeProducto(producto.id_producto);
        const componentesComboPromise = obtenerComponentesCombo(producto.id_producto);

        if (isAdmin) {
          const [sucursalesProducto, ingredientesProducto, componentesProducto] = await Promise.all([
            obtenerSucursalesDeProducto(producto.id_producto),
            ingredientesPromise,
            componentesComboPromise,
          ]);

          const ids = sucursalesProducto
            .filter(sp => sp.activo)
            .map(sp => sp.id_sucursal);
          setIdsSucursalesCrear(ids);

          setIngredientesReceta(
            ingredientesProducto
              .filter(item => item.activo ?? true)
              .map(item => ({
                id_ingrediente: item.id_ingrediente,
                cantidad: String(item.cantidad),
              }))
          );
          const componentesActivos = componentesProducto.filter(item => item.activo ?? true);
          setEsCombo(componentesActivos.length > 0 || !!producto.es_combo);
          setComponentesCombo(
            componentesActivos.map(item => ({
              id_producto_hijo: item.id_producto_hijo,
              cantidad: String(item.cantidad),
            }))
          );
          return;
        }

        const [ingredientesProducto, componentesProducto] = await Promise.all([
          ingredientesPromise,
          componentesComboPromise,
        ]);

        setIngredientesReceta(
          ingredientesProducto
            .filter(item => item.activo ?? true)
            .map(item => ({
              id_ingrediente: item.id_ingrediente,
              cantidad: String(item.cantidad),
            }))
        );
        const componentesActivos = componentesProducto.filter(item => item.activo ?? true);
        setEsCombo(componentesActivos.length > 0 || !!producto.es_combo);
        setComponentesCombo(
          componentesActivos.map(item => ({
            id_producto_hijo: item.id_producto_hijo,
            cantidad: String(item.cantidad),
          }))
        );
      } catch {
        setError('No se pudieron cargar las sucursales, ingredientes o componentes del producto');
      }
    })();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setId_categoria('');
    setActivo(true);
    setIdsSucursalesCrear(id_sucursal ? [id_sucursal] : []);
    setIngredientesReceta([]);
    setEsCombo(false);
    setComponentesCombo([]);
  };

  const buildIngredientesPayload = (): { payload: ProductoIngredienteInput[]; error?: string } => {
    const payload: ProductoIngredienteInput[] = [];
    const ids = new Set<number>();

    for (const item of ingredientesReceta) {
      if (item.id_ingrediente === '' && !item.cantidad.trim()) {
        continue;
      }

      const idIngrediente = Number(item.id_ingrediente);
      const cantidad = Number(item.cantidad);

      if (!Number.isInteger(idIngrediente) || idIngrediente <= 0) {
        return { payload: [], error: 'Selecciona un ingrediente válido en la receta.' };
      }

      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        return { payload: [], error: 'La cantidad de cada ingrediente debe ser mayor a 0.' };
      }

      if (ids.has(idIngrediente)) {
        return { payload: [], error: 'No puedes repetir el mismo ingrediente en la receta.' };
      }

      ids.add(idIngrediente);
      payload.push({ id_ingrediente: idIngrediente, cantidad });
    }

    return { payload };
  };

  const buildComponentesComboPayload = (): { payload: ProductoComboComponenteInput[]; error?: string } => {
    const payload: ProductoComboComponenteInput[] = [];
    const ids = new Set<number>();

    for (const item of componentesCombo) {
      if (item.id_producto_hijo === '' && !item.cantidad.trim()) {
        continue;
      }

      const idProductoHijo = Number(item.id_producto_hijo);
      const cantidad = Number(item.cantidad);

      if (!Number.isInteger(idProductoHijo) || idProductoHijo <= 0) {
        return { payload: [], error: 'Selecciona un producto hijo válido para el combo.' };
      }

      if (editingId && idProductoHijo === editingId) {
        return { payload: [], error: 'Un combo no puede incluirse a sí mismo.' };
      }

      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        return { payload: [], error: 'La cantidad de cada producto del combo debe ser mayor a 0.' };
      }

      if (ids.has(idProductoHijo)) {
        return { payload: [], error: 'No puedes repetir productos dentro del combo.' };
      }

      ids.add(idProductoHijo);
      payload.push({ id_producto_hijo: idProductoHijo, cantidad });
    }

    if (esCombo && payload.length === 0) {
      return { payload: [], error: 'Debes agregar al menos un producto hijo para guardar un combo.' };
    }

    return { payload };
  };

  const handleDesactivar = async (producto: Producto) => {
    setError(null);
    setSuccess(null);

    try {
      const dependencias = await obtenerDependenciasDesactivacionProducto(producto.id_producto);
      if (dependencias.tiene_pedidos_activos) {
        const confirmarForzado = window.confirm(
          `${dependencias.mensaje_advertencia ?? 'El producto tiene pedidos activos.'}\n\n¿Deseas continuar con la desactivación?`
        );

        if (!confirmarForzado) return;
        await desactivarProducto(producto.id_producto, true);
      } else {
        const confirmar = window.confirm('¿Seguro que deseas desactivar este producto?');
        if (!confirmar) return;
        await desactivarProducto(producto.id_producto);
      }

      setSuccess('Producto desactivado correctamente');
      await loadProductos();
      if (editingId === producto.id_producto) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el producto');
    }
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

    const { payload: ingredientesPayload, error: ingredientesError } = buildIngredientesPayload();
    if (ingredientesError) {
      setError(ingredientesError);
      return;
    }

    const { payload: componentesComboPayload, error: componentesComboError } = buildComponentesComboPayload();
    if (componentesComboError) {
      setError(componentesComboError);
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
          ingredientes: ingredientesPayload,
          productos_combo: esCombo ? componentesComboPayload : [],
          ...(isAdmin ? { ids_sucursales: idsSucursalesCrear } : {}),
        };

        if (isAdmin && idsSucursalesCrear.length === 0) {
          setError('Debe seleccionar al menos una sucursal para actualizar el producto');
          setSubmitting(false);
          return;
        }

        await actualizarProducto(editingId, updates);
        await loadProductos({ silent: true });
        setSuccess('Producto actualizado exitosamente');
        handleCancelEdit();
      } else {
        // Create
        const sucursalesDestino = isAdmin
          ? idsSucursalesCrear
          : (id_sucursal ? [id_sucursal] : []);

        if (sucursalesDestino.length === 0) {
          setError('Debe seleccionar al menos una sucursal para crear el producto');
          return;
        }

        const newProd: CrearProductoDto = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: parseFloat(precio),
          id_categoria: parseInt(id_categoria),
          ids_sucursales: sucursalesDestino,
          ingredientes: ingredientesPayload,
          productos_combo: esCombo ? componentesComboPayload : [],
          activo,
        };
        await crearProducto(newProd);
        await loadProductos({ silent: true });
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursales
                </label>
                <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                  {sucursales.map(sucursal => (
                    <label key={sucursal.id_sucursal} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={idsSucursalesCrear.includes(sucursal.id_sucursal)}
                        onChange={e => {
                          setIdsSucursalesCrear(prev => {
                            if (e.target.checked) {
                              return Array.from(new Set([...prev, sucursal.id_sucursal]));
                            }
                            return prev.filter(id => id !== sucursal.id_sucursal);
                          });
                        }}
                        disabled={submitting}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span>{sucursal.nombre}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Selecciona una o más sucursales para este producto.</p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredientes (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setIngredientesReceta(prev => [...prev, { id_ingrediente: '', cantidad: '' }])}
                  disabled={submitting || ingredientesDisponibles.length === 0}
                  className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                >
                  Agregar ingrediente
                </button>
              </div>
              {ingredientesReceta.length === 0 ? (
                <p className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-3">
                  Este producto puede guardarse sin ingredientes. Si agregas receta, se usará para futuros descuentos de inventario.
                </p>
              ) : (
                <div className="space-y-2 border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto">
                  {ingredientesReceta.map((item, idx) => {
                    const ingredienteSeleccionado = ingredientesDisponibles.find(i => i.id_ingrediente === item.id_ingrediente);
                    const idsYaUsados = ingredientesReceta
                      .filter((_, rowIndex) => rowIndex !== idx)
                      .map(row => row.id_ingrediente)
                      .filter((id): id is number => typeof id === 'number');

                    return (
                      <div key={`receta-${idx}`} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          value={item.id_ingrediente}
                          onChange={e => {
                            const value = e.target.value ? Number(e.target.value) : '';
                            setIngredientesReceta(prev => prev.map((row, rowIndex) =>
                              rowIndex === idx ? { ...row, id_ingrediente: value } : row
                            ));
                          }}
                          disabled={submitting}
                          className="col-span-7 input-field"
                        >
                          <option value="">Ingrediente...</option>
                          {ingredientesDisponibles.map(ingrediente => (
                            <option
                              key={ingrediente.id_ingrediente}
                              value={ingrediente.id_ingrediente}
                              disabled={idsYaUsados.includes(ingrediente.id_ingrediente)}
                            >
                              {ingrediente.nombre}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.cantidad}
                          onChange={e => {
                            const value = e.target.value;
                            setIngredientesReceta(prev => prev.map((row, rowIndex) =>
                              rowIndex === idx ? { ...row, cantidad: value } : row
                            ));
                          }}
                          placeholder="Cantidad"
                          disabled={submitting}
                          className="col-span-3 input-field"
                        />
                        <button
                          type="button"
                          onClick={() => setIngredientesReceta(prev => prev.filter((_, rowIndex) => rowIndex !== idx))}
                          disabled={submitting}
                          className="col-span-2 text-xs px-2 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          Quitar
                        </button>
                        <p className="col-span-12 text-[11px] text-gray-500 -mt-1">
                          Unidad: {ingredienteSeleccionado?.unidad_medida ?? '—'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border border-gray-300 rounded-md p-3 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={esCombo}
                  onChange={e => {
                    const checked = e.target.checked;
                    setEsCombo(checked);
                    if (!checked) {
                      setComponentesCombo([]);
                    }
                  }}
                  disabled={submitting}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Este producto es un combo</span>
              </label>

              {esCombo && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-600">
                      Define productos hijos del combo. El precio del combo se maneja de forma independiente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setComponentesCombo(prev => [...prev, { id_producto_hijo: '', cantidad: '' }])}
                      disabled={submitting}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                    >
                      Agregar hijo
                    </button>
                  </div>

                  {componentesCombo.length === 0 ? (
                    <p className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-2">
                      Aun no has agregado productos hijos para este combo.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {componentesCombo.map((item, idx) => {
                        const idsUsados = componentesCombo
                          .filter((_, rowIndex) => rowIndex !== idx)
                          .map(row => row.id_producto_hijo)
                          .filter((id): id is number => typeof id === 'number');

                        return (
                          <div key={`combo-${idx}`} className="grid grid-cols-12 gap-2 items-center">
                            <select
                              value={item.id_producto_hijo}
                              onChange={e => {
                                const value = e.target.value ? Number(e.target.value) : '';
                                setComponentesCombo(prev => prev.map((row, rowIndex) =>
                                  rowIndex === idx ? { ...row, id_producto_hijo: value } : row
                                ));
                              }}
                              disabled={submitting}
                              className="col-span-7 input-field"
                            >
                              <option value="">Producto hijo...</option>
                              {productos
                                .filter(p => p.id_producto !== editingId && p.activo)
                                .map(prod => (
                                  <option
                                    key={prod.id_producto}
                                    value={prod.id_producto}
                                    disabled={idsUsados.includes(prod.id_producto)}
                                  >
                                    {prod.nombre}
                                  </option>
                                ))}
                            </select>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.cantidad}
                              onChange={e => {
                                const value = e.target.value;
                                setComponentesCombo(prev => prev.map((row, rowIndex) =>
                                  rowIndex === idx ? { ...row, cantidad: value } : row
                                ));
                              }}
                              placeholder="Cantidad"
                              disabled={submitting}
                              className="col-span-3 input-field"
                            />
                            <button
                              type="button"
                              onClick={() => setComponentesCombo(prev => prev.filter((_, rowIndex) => rowIndex !== idx))}
                              disabled={submitting}
                              className="col-span-2 text-xs px-2 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >
                              Quitar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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
        <div className="lg:col-span-2 card flex flex-col h-[680px]">
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar sucursal</label>
                <select
                  value={selectedSucursal}
                  onChange={e => setSelectedSucursal(e.target.value)}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="all">Todas las sucursales</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {loadingProductos ? (
            <p className="text-gray-500 text-center py-8">Actualizando productos...</p>
          ) : productos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay productos aún</p>
          ) : (
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
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
                      {producto.es_combo && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          Combo
                        </span>
                      )}
                      {!producto.activo && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    {isAdmin && (producto.ids_sucursales ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(producto.ids_sucursales ?? []).map(idSucursal => {
                          const sucursal = sucursales.find(s => s.id_sucursal === idSucursal);
                          return (
                            <span
                              key={`${producto.id_producto}-sucursal-${idSucursal}`}
                              className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                            >
                              {sucursal?.nombre ?? `Sucursal ${idSucursal}`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(producto)}
                      disabled={submitting}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors disabled:opacity-50"
                    >
                      Editar
                    </button>
                    {producto.activo && (
                      <button
                        onClick={() => void handleDesactivar(producto)}
                        disabled={submitting}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
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
