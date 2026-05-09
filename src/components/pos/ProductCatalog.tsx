// components/pos/ProductCatalog.tsx
import { useState } from 'react';
import type { Producto } from '../../types/producto.types';

interface ProductCatalogProps {
  productos: Producto[];
  onAddToCart: (producto: Producto) => void;
}

export function ProductCatalog({ productos, onAddToCart }: ProductCatalogProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);

  // Build unique categories from products
  const categorias = Array.from(
    new Map(
      productos.map(p => [p.id_categoria, p.categoria_nombre ?? 'Sin categoría'])
    ).entries()
  );

  const productosFiltrados =
    categoriaActiva === null
      ? productos
      : productos.filter(p => p.id_categoria === categoriaActiva);

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setCategoriaActiva(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            categoriaActiva === null
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categorias.map(([id, nombre]) => (
          <button
            key={id}
            onClick={() => setCategoriaActiva(id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoriaActiva === id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {nombre}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {productosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 content-start auto-rows-max">
          {productosFiltrados.map(producto => (
            <button
              key={producto.id_producto}
              onClick={() => onAddToCart(producto)}
              className="self-start bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-orange-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <p className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                {producto.nombre}
              </p>
              <p className="text-orange-600 font-semibold mt-1 text-sm">
                ${producto.precio.toFixed(2)}
              </p>
              {producto.categoria_nombre && (
                <p className="text-xs text-gray-400 mt-0.5">{producto.categoria_nombre}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
