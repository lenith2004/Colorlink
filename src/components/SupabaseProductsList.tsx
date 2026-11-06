import React, { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Tag,
  Package,
  Layers,
  Search,
  PlusCircle,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface SupabaseProductoItem {
  [key: string]: any;
}

export const SupabaseProductsList: React.FC = () => {
  const { addToCart, setIsCartOpen } = useApp();
  const [products, setProducts] = useState<SupabaseProductoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    message: string;
    code?: string;
    details?: string;
    hint?: string;
    raw?: any;
  } | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [isInsertingSample, setIsInsertingSample] = useState<boolean>(false);
  const [insertSuccessMsg, setInsertSuccessMsg] = useState<string | null>(null);

  // Fetch products directly from Supabase table PRODUCTO
  const fetchProductsFromSupabase = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInsertSuccessMsg(null);

    try {
      // Direct query to the Supabase table PRODUCTO
      const { data, error: queryError } = await supabase
        .from('PRODUCTO')
        .select('*');

      if (queryError) {
        // Query returned a Supabase error
        setError({
          message: queryError.message || 'Error al consultar la tabla PRODUCTO en Supabase',
          code: queryError.code,
          details: queryError.details,
          hint: queryError.hint,
          raw: queryError,
        });
        setProducts([]);
      } else {
        setProducts(data || []);
        setError(null);
      }
    } catch (err: any) {
      // Unhandled network or client exception
      setError({
        message: err?.message || 'Error inesperado de conexión con Supabase',
        code: err?.code || 'FETCH_EXCEPTION',
        details: err?.stack || String(err),
        hint: 'Verifica la conectividad de red y que la URL y clave anon de Supabase sean válidas.',
        raw: err,
      });
      setProducts([]);
    } finally {
      setLoading(false);
      setLastFetchedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, []);

  useEffect(() => {
    fetchProductsFromSupabase();
  }, [fetchProductsFromSupabase]);

  // Helper to extract Nombre_producto regardless of exact case
  const getNombreProducto = (item: SupabaseProductoItem): string => {
    return (
      item.Nombre_producto ??
      item.NOMBRE_PRODUCTO ??
      item.nombre_producto ??
      item.NombreProducto ??
      item.nombre ??
      item.name ??
      'Sin nombre'
    );
  };

  // Helper to extract Tipo_producto directly from Supabase
  const getTipoProducto = (item: SupabaseProductoItem): string => {
    const val =
      item.Tipo_producto ??
      item.TIPO_PRODUCTO ??
      item.tipo_producto ??
      item.TipoProducto ??
      item['Tipo_producto'] ??
      item.categoria ??
      item.CATEGORIA;

    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
    return '—';
  };

  // Helper to extract Precio_unitario regardless of exact case
  const getPrecioUnitario = (item: SupabaseProductoItem): number | null => {
    const val =
      item.Precio_unitario ??
      item.PRECIO_UNITARIO ??
      item.precio_unitario ??
      item.PrecioUnitario ??
      item.precio ??
      item.price;

    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // Optional: insert a test product into the table PRODUCTO to test writing & reading live
  const handleInsertSampleProduct = async () => {
    setIsInsertingSample(true);
    setInsertSuccessMsg(null);
    try {
      const sampleSKU = `PIN-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // 1. Intento con las columnas exactas solicitadas: Nombre_producto y Precio_unitario
      const primaryPayload = {
        Nombre_producto: 'Viniltex Avanzado Blanco Almendra (Muestra Supabase)',
        Precio_unitario: 94900,
      };

      const res1 = await supabase.from('PRODUCTO').insert([primaryPayload]).select();
      
      if (!res1.error) {
        setInsertSuccessMsg(`¡Producto insertado exitosamente con Nombre_producto y Precio_unitario!`);
        await fetchProductsFromSupabase();
        return;
      }

      // 2. Intento con columnas en mayúsculas: NOMBRE_PRODUCTO y PRECIO_UNITARIO
      const upperPayload = {
        NOMBRE_PRODUCTO: 'Viniltex Avanzado Blanco Almendra (Muestra Supabase)',
        PRECIO_UNITARIO: 94900,
        SKU: sampleSKU,
        TIPO_PRODUCTO: 'Arquitectónica Interior',
        UNIDAD_MEDIDA: 'Galón',
        RENDIMIENTO_M2_GALON: 45,
        MANOS_RECOMENDADAS: 2,
      };

      const res2 = await supabase.from('PRODUCTO').insert([upperPayload]).select();

      if (!res2.error) {
        setInsertSuccessMsg(`¡Producto de prueba "${sampleSKU}" insertado exitosamente en PRODUCTO!`);
        await fetchProductsFromSupabase();
        return;
      }

      // 3. Si ambos fallan, mostrar el error original en pantalla
      setError({
        message: `Error al insertar en PRODUCTO: ${res1.error.message}`,
        code: res1.error.code,
        details: res1.error.details || res2.error.message,
        hint: res1.error.hint || 'Verifica los nombres de columnas y las políticas RLS en la tabla PRODUCTO.',
        raw: res1.error,
      });
    } catch (err: any) {
      setError({
        message: err?.message || 'Error al intentar insertar producto en Supabase',
        code: 'INSERT_ERROR',
        details: String(err),
      });
    } finally {
      setIsInsertingSample(false);
    }
  };

  // Filter products by search term across Nombre_producto, Tipo_producto, SKU
  const filteredProducts = products.filter((p) => {
    const name = getNombreProducto(p).toLowerCase();
    const tipo = getTipoProducto(p).toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return (
      !query ||
      name.includes(query) ||
      tipo.includes(query) ||
      (p.SKU && String(p.SKU).toLowerCase().includes(query))
    );
  });

  return (
    <section id="supabase-products-section" className="bg-white rounded-3xl border-2 border-indigo-200/80 shadow-md p-5 sm:p-6 mb-8 text-left transition-all">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tabla: PRODUCTO</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Supabase Live Query</span>
            </span>
            {lastFetchedAt && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Última consulta: {lastFetchedAt}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <span>Lista de Productos en Supabase</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {products.length} {products.length === 1 ? 'registro' : 'registros'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lectura en vivo de las columnas <strong className="text-slate-800">Nombre_producto</strong>,{' '}
            <strong className="text-slate-800">Precio_unitario</strong> y{' '}
            <strong className="text-indigo-700 font-extrabold">Tipo_producto</strong> directamente desde la base de datos Supabase.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchProductsFromSupabase()}
            disabled={loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
            title="Refrescar datos desde la tabla PRODUCTO"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Consultando...' : 'Refrescar Consulta'}</span>
          </button>

          <button
            onClick={handleInsertSampleProduct}
            disabled={isInsertingSample || loading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
            title="Inserta una fila de prueba en PRODUCTO para verificar escritura y lectura"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isInsertingSample ? 'Guardando...' : 'Insertar Producto de Prueba'}</span>
          </button>

          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
            title="Ver o esconder JSON crudo"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
            {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY IN SCREEN */}
      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                  <span>Error al consultar la tabla PRODUCTO en Supabase</span>
                  {error.code && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-800">
                      Código: {error.code}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => fetchProductsFromSupabase()}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  Reintentar
                </button>
              </div>

              {/* Error Message */}
              <p className="text-xs font-semibold text-rose-900 mt-1 break-words">
                {error.message}
              </p>

              {/* Details & Hint if present */}
              {error.details && (
                <div className="mt-2 text-[11px] font-mono bg-rose-100/70 p-2 rounded-lg text-rose-800 border border-rose-200 break-words">
                  <strong>Detalles:</strong> {error.details}
                </div>
              )}

              {error.hint && (
                <p className="mt-2 text-xs text-rose-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  💡 <strong>Sugerencia:</strong> {error.hint}
                </p>
              )}

              {/* Diagnostic hints */}
              <div className="mt-3 pt-2.5 border-t border-rose-200/80 text-[11px] text-rose-700 space-y-1">
                <p>
                  • Asegúrate de que la tabla <code className="font-mono font-bold bg-white/70 px-1 py-0.5 rounded">PRODUCTO</code> exista en tu proyecto de Supabase (<code className="font-mono text-[10px]">{SUPABASE_URL}</code>).
                </p>
                <p>
                  • Verifica que las políticas de seguridad de fila (RLS) permitan la lectura pública para la tabla <code className="font-mono font-bold bg-white/70 px-1 py-0.5 rounded">PRODUCTO</code> o ejecuta en el Editor SQL de Supabase: <code className="font-mono bg-white/70 px-1 py-0.5 rounded">ALTER TABLE "PRODUCTO" DISABLE ROW LEVEL SECURITY;</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Success Banner */}
      {insertSuccessMsg && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{insertSuccessMsg}</span>
          </div>
          <button
            onClick={() => setInsertSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Raw JSON viewer */}
      {showRawJson && (
        <div className="mt-4 p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-700">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span>JSON Crudo Supabase ({products.length} elementos)</span>
            <button
              onClick={() => setShowRawJson(false)}
              className="hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <pre>{JSON.stringify(products, null, 2)}</pre>
        </div>
      )}

      {/* Search / Filter bar */}
      {products.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nombre_producto o SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
        </div>
      )}

      {/* Content Area */}
      <div className="mt-4">
        {loading && products.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-800">Consultando tabla PRODUCTO en Supabase...</p>
            <p className="text-xs text-slate-400 mt-1">Conectando a {SUPABASE_URL}</p>
          </div>
        ) : products.length === 0 && !error ? (
          <div className="py-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">La tabla PRODUCTO está vacía</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Se conectó exitosamente a Supabase pero no se encontraron filas en la tabla PRODUCTO. Puedes insertar una fila de prueba ahora mismo.
            </p>
            <button
              onClick={handleInsertSampleProduct}
              disabled={isInsertingSample}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isInsertingSample ? 'Insertando...' : 'Insertar Producto de Prueba en Supabase'}</span>
            </button>
          </div>
        ) : (
          /* Table of products highlighting Nombre_producto and Precio_unitario */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3.5 w-12 text-center">#</th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Nombre_producto</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Precio_unitario</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 hidden md:table-cell">SKU / Código</th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5 text-blue-900 font-extrabold">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tipo_producto</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 hidden sm:table-cell">Unidad</th>
                  <th className="py-3 px-3.5 text-right">Comprar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filteredProducts.map((item, idx) => {
                  const nombre = getNombreProducto(item);
                  const precio = getPrecioUnitario(item);
                  const sku = item.SKU || item.sku || item.ID_DE_PRODUCTO || `ID-${idx + 1}`;
                  const tipo = getTipoProducto(item);
                  const unidad = item.Unidad_medida || item.UNIDAD_MEDIDA || item.unidad_medida || 'Galón';

                  return (
                    <tr
                      key={item.ID_DE_PRODUCTO ?? item.id ?? idx}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      {/* Row index */}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Columna: Nombre_producto */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-indigo-950 font-extrabold">{nombre}</span>
                        </div>
                        {item.DESCRIPCION && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 ml-4 mt-0.5">
                            {item.DESCRIPCION}
                          </p>
                        )}
                      </td>

                      {/* Columna: Precio_unitario */}
                      <td className="py-3 px-3.5">
                        {precio !== null ? (
                          <div className="flex flex-col">
                            <span className="font-black text-emerald-700 text-sm">
                              ${precio.toLocaleString('es-CO')} COP
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Valor numérico: {precio}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No especificado</span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3.5 hidden md:table-cell font-mono text-slate-600 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {sku}
                        </span>
                      </td>

                      {/* Columna: Tipo_producto (Valor real desde Supabase) */}
                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 font-bold text-xs">
                          <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{tipo}</span>
                        </span>
                      </td>

                      {/* Unidad */}
                      <td className="py-3 px-3.5 hidden sm:table-cell text-slate-600 text-xs">
                        {unidad}
                      </td>

                      {/* Acción: Añadir al Carrito */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart({
                              sku: String(sku),
                              name: nombre,
                              category: tipo,
                              presentation: unidad,
                              pricePerUnitCOP: precio || 94900,
                              quantity: 1,
                            });
                            setIsCartOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                          title="Añadir producto al carrito"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Al Carrito</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>
          Base de Datos: <strong className="text-slate-600">Supabase PostgreSQL</strong> • Tabla:{' '}
          <code className="text-indigo-600 font-bold">PRODUCTO</code> • Columnas requeridas:{' '}
          <code className="text-indigo-600 font-semibold">Nombre_producto</code>,{' '}
          <code className="text-emerald-600 font-semibold">Precio_unitario</code>,{' '}
          <code className="text-blue-600 font-semibold">Tipo_producto</code>
        </span>
        <button
          onClick={() => fetchProductsFromSupabase()}
          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Volver a verificar</span>
        </button>
      </div>
    </section>
  );
};
